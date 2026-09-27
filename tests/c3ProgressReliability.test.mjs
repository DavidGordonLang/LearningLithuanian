import test from 'node:test';
import assert from 'node:assert/strict';
import { createGameStore, memoryStorage, database, deferred, tick } from './helpers/gameHarness.mjs';
import { CURRICULUM_ID, curriculumLessons, curriculumSections, emptyGameData, validAttempt, resumeAttempt, sanitiseGameData, mergeGameData } from '../src/lib/curriculumProgress.js';
import { cloudGameData, gameCacheKey } from '../src/lib/gamePersistence.js';
import { findLatestInProgressLesson } from '../src/views/training/learningProgress.js';
import { createLearningUpdateGuard } from '../src/lib/learningUpdateGuard.js';
import { lessonHarness } from './helpers/lessonHarness.mjs';
import { componentHarness, nodes, button, textOf } from './helpers/componentHarness.mjs';
const lessons=Object.values(curriculumLessons), lesson=lessons[0], other=lessons[1];
const attempt=(l=lesson,index=2,wrong=[])=>({curriculumId:CURRICULUM_ID,blockId:l.blocks[index].id,updatedAt:100,completedBlockIds:l.blocks.slice(0,index).map(b=>b.id),wrongBlockIds:wrong});
const row=game=>({data:{learningCurricula:{[CURRICULUM_ID]:game}},updated_at:'2026-09-26T12:00:00.000Z'});
async function setup(db=database(),storage=memoryStorage(),user='A') { const store=createGameStore({client:db.client,storage});await store.getState().ensureLoadedForUser(user);return {db,storage,store}; }
function saveAttempt(store,l=lesson,index=2,wrong=[]) {const a=attempt(l,index,wrong);store.getState().setLessonProgress(l.id,a.blockId,index,'A',{completedBlockIds:Object.fromEntries(a.completedBlockIds.map(id=>[id,true])),wrongBlockIds:Object.fromEntries(wrong.map(id=>[id,true]))});}

test('new authenticated learner: no row means clean current curriculum, not a write on hydration',async()=>{
 const {db,store}=await setup();assert.equal(store.getState()._loadedForUserId,'A');assert.equal(store.getState().curriculumId,CURRICULUM_ID);assert.deepEqual(store.getState().completedLessonIds,[]);assert.equal(db.writes.length,0);
 assert.equal(findLatestInProgressLesson(curriculumSections,[],{}),null);
});
test('legacy renumbered lesson_5, XP and unknown versions remain stored but confer no current credit',async()=>{
 const db=database();const legacy={completedLessonIds:['section_3_module_4_lesson_5'],totalXP:900,lessonProgress:{[lesson.id]:{blockIndex:4}},learningCurricula:{old:{curriculumId:'old',completedLessonIds:[lesson.id]}}};db.rows.set('A',{data:legacy,updated_at:null});
 const {store}=await setup(db);assert.deepEqual(store.getState().completedLessonIds,[]);assert.equal(store.getState().totalXP,0);assert.equal(db.writes.length,0);
 saveAttempt(store);await store.getState().retrySync();assert.deepEqual(db.rows.get('A').data.completedLessonIds,legacy.completedLessonIds);assert.equal(db.rows.get('A').data.totalXP,900);assert.deepEqual(db.rows.get('A').data.learningCurricula.old,legacy.learningCurricula.old);
});
test('valid current Not Enough completion survives hydration; incompatible namespace does not',async()=>{
 const db=database(),id='section_3_module_4_lesson_5';db.rows.set('A',row({...emptyGameData(),completedLessonIds:[id]}));const {store}=await setup(db);assert.deepEqual(store.getState().completedLessonIds,[id]);
 assert.deepEqual(sanitiseGameData({...emptyGameData(),curriculumId:'old',completedLessonIds:[id]}).completedLessonIds,[]);
});
test('failed initial read never marks account loaded, never writes defaults; retry recovers',async()=>{
 const db=database();db.rows.set('A',row({...emptyGameData(),completedLessonIds:[other.id]}));db.readError=Error('offline');const {store}=await setup(db);
 assert.equal(store.getState()._loadedForUserId,null);assert.equal(store.getState().syncStatus,'load-error');saveAttempt(store);store.getState().completeLesson(lesson.id,'A');assert.equal(db.writes.length,0);
 db.readError=null;await store.getState().retrySync();assert.deepEqual(store.getState().completedLessonIds,[other.id]);
});
test('duplicate initial hydration shares one read; delayed account A load cannot hydrate B',async()=>{
 const db=database(),wait=deferred();db.beforeRead=uid=>uid==='A'?wait.promise:undefined;
 db.rows.set('A',row({...emptyGameData(),completedLessonIds:[lesson.id]}));db.rows.set('B',row({...emptyGameData(),completedLessonIds:[other.id]}));
 const store=createGameStore({client:db.client,storage:memoryStorage()});const a=store.getState().ensureLoadedForUser('A');const duplicate=store.getState().ensureLoadedForUser('A');
 store.getState().reset();await store.getState().ensureLoadedForUser('B');wait.resolve();await Promise.all([a,duplicate]);
 assert.deepEqual(db.reads,['A','B']);assert.equal(store.getState()._loadedForUserId,'B');assert.deepEqual(store.getState().completedLessonIds,[other.id]);
});
test('partial progress and mistakes survive offline close/reopen via account journal and retry',async()=>{
 const {db,storage,store}=await setup();db.writeError=Error('offline');const wrong=lesson.blocks.find(b=>['recognise_mcq','listen_mcq','best_response'].includes(b.type)).id;
 saveAttempt(store,lesson,2,[wrong]);await store.getState().retrySync();assert.equal(store.getState().syncStatus,'offline');
 const saved=JSON.parse(storage.getItem(gameCacheKey('A')));assert.equal(saved.dirty,true);
 db.readError=Error('offline');const reopened=createGameStore({client:db.client,storage});await reopened.getState().ensureLoadedForUser('A');
 assert.equal(reopened.getState()._loadedForUserId,'A');const resumed=resumeAttempt(lesson,reopened.getState().lessonProgress[lesson.id]);assert.equal(resumed.blockIndex,2);assert.equal(resumed.wrongBlockIds[wrong],true);
 db.readError=null;db.writeError=null;await reopened.getState().retrySync();assert.equal(reopened.getState().syncStatus,'saved');assert.equal(JSON.parse(storage.getItem(gameCacheKey('A'))).dirty,false);assert.deepEqual(cloudGameData(db.rows.get('A')).lessonProgress[lesson.id].wrongBlockIds,[wrong]);
});
test('local hydration plus delayed cloud hydration merges new local state, not last-write-wins',async()=>{
 const {db,storage,store}=await setup();saveAttempt(store);await store.getState().retrySync();
 const wait=deferred();db.beforeRead=()=>wait.promise;
 const reopened=createGameStore({client:db.client,storage});const loading=reopened.getState().ensureLoadedForUser('A');
 saveAttempt(reopened,lesson,3);wait.resolve();await loading;await reopened.getState().retrySync();assert.equal(resumeAttempt(lesson,reopened.getState().lessonProgress[lesson.id]).blockIndex,3);
});
test('A logout B login isolates journals, dirty writes and anonymous state; A can recover later',async()=>{
 const {db,storage,store}=await setup();db.writeError=Error('offline');saveAttempt(store);await store.getState().retrySync();
 store.getState().reset();assert.deepEqual(store.getState().lessonProgress,{});store.getState().completeLesson(lesson.id,null);assert.deepEqual(store.getState().completedLessonIds,[]);
 await store.getState().ensureLoadedForUser('B');assert.deepEqual(store.getState().lessonProgress,{});assert.equal(store.getState()._loadedForUserId,'B');assert.ok(storage.getItem(gameCacheKey('A')));
 db.writeError=null;store.getState().reset();await store.getState().ensureLoadedForUser('A');assert.ok(store.getState().lessonProgress[lesson.id]);assert.equal(db.rows.has('B'),false);
});
test('an in-flight A write may finish only for A and cannot publish status or data into B',async()=>{
 const {db,store}=await setup();const wait=deferred(),entered=deferred();db.beforeWrite=async()=>{entered.resolve();await wait.promise;};saveAttempt(store);await entered.promise;
 store.getState().reset();await store.getState().ensureLoadedForUser('B');wait.resolve();await tick();assert.equal(store.getState()._loadedForUserId,'B');assert.deepEqual(store.getState().lessonProgress,{});assert.equal(db.rows.has('B'),false);assert.equal(db.writes[0].uid,'A');
});
test('rapid saves during a delayed write flush the newest cursor and wrong set without false saved state',async()=>{
 const {db,store}=await setup();const wait=deferred(),entered=deferred();let first=true;db.beforeWrite=async()=>{if(first){first=false;entered.resolve();await wait.promise;}};
 saveAttempt(store);await entered.promise;saveAttempt(store,lesson,3);assert.equal(store.getState().syncStatus,'saving');wait.resolve();await store.getState().retrySync();
 assert.equal(resumeAttempt(lesson,cloudGameData(db.rows.get('A')).lessonProgress[lesson.id]).blockIndex,3);assert.equal(store.getState().syncStatus,'saved');
});
test('two devices concurrent first insert merges completions and best XP instead of overwriting',async()=>{
 const db=database();const a=(await setup(db)).store,b=(await setup(db)).store;const gate=deferred(),entered=deferred();let waiting=0;
 db.beforeWrite=async({op})=>{if(op==='insert'){waiting++;if(waiting===2)entered.resolve();await gate.promise;}};
 a.getState().completeLesson(lesson.id,'A');a.getState().earnLessonXP(lesson.id,28,'A');b.getState().completeLesson(other.id,'A');b.getState().earnLessonXP(other.id,30,'A');
 await entered.promise;gate.resolve();await Promise.all([a.getState().retrySync(),b.getState().retrySync()]);const final=cloudGameData(db.rows.get('A'));assert.deepEqual(new Set(final.completedLessonIds),new Set([lesson.id,other.id]));assert.equal(final.totalXP,58);
});
test('stale second-device update retries a conditional conflict and retains newer progress',async()=>{
 const db=database();db.rows.set('A',row(emptyGameData()));const a=(await setup(db)).store,b=(await setup(db)).store;
 const gate=deferred(),entered=deferred();let held=false;
 db.beforeWrite=async({payload})=>{if(!held && payload.data.learningCurricula[CURRICULUM_ID].completedLessonIds.includes(lesson.id)){held=true;entered.resolve();await gate.promise;}};
 a.getState().completeLesson(lesson.id,'A');await entered.promise;b.getState().completeLesson(other.id,'A');await b.getState().retrySync();gate.resolve();await a.getState().retrySync();
 assert.deepEqual(new Set(cloudGameData(db.rows.get('A')).completedLessonIds),new Set([lesson.id,other.id]));
});
test('same attempt merges wrong sets, furthest cursor and completion dominates stale partial state',()=>{
 const wrong=lesson.blocks.filter(b=>['recognise_mcq','listen_mcq','best_response'].includes(b.type)).map(b=>b.id);
 const a={...emptyGameData(),lessonProgress:{[lesson.id]:attempt(lesson,2,wrong.slice(0,1))}},b={...emptyGameData(),lessonProgress:{[lesson.id]:attempt(lesson,3,wrong.slice(1,2))}};
 const merged=mergeGameData(a,b);assert.equal(resumeAttempt(lesson,merged.lessonProgress[lesson.id]).blockIndex,3);assert.deepEqual(new Set(merged.lessonProgress[lesson.id].wrongBlockIds),new Set(wrong.slice(0,2)));
 assert.equal(mergeGameData(merged,{...emptyGameData(),completedLessonIds:[lesson.id]}).lessonProgress[lesson.id],undefined);
});
for(const defect of ['lesson','block','version','missing-evidence','wrong-block','timestamp']) test(`invalid ${defect} progress cannot be a resume target`,()=>{
 const record=attempt();if(defect==='block')record.blockId='deleted';if(defect==='version')record.curriculumId='old';if(defect==='missing-evidence')delete record.completedBlockIds;if(defect==='wrong-block')record.wrongBlockIds=['removed'];if(defect==='timestamp')record.updatedAt='100';
 const id=defect==='lesson'?'removed':lesson.id;assert.equal(findLatestInProgressLesson(curriculumSections,[],{[id]:record}),null);
});
test('multiple unfinished candidates use latest activity with stable tie-break and ignore completed/stale',()=>{
 const a={...attempt(),updatedAt:200},b={...attempt(other),updatedAt:300};const progress={[lesson.id]:a,[other.id]:b,missing:{...b,updatedAt:900}};
 assert.equal(findLatestInProgressLesson(curriculumSections,[],progress).lesson.id,other.id);
 assert.equal(findLatestInProgressLesson(curriculumSections,[other.id],progress).lesson.id,lesson.id);
 b.updatedAt=200;assert.equal(findLatestInProgressLesson(curriculumSections,[],progress).lesson.id,[lesson.id,other.id].sort()[0]);
});
test('completed review cannot create resume state, clear completion or overwrite first metrics',async()=>{
 const {store,db}=await setup();const count=lesson.blocks.filter(b=>['recognise_mcq','listen_mcq','best_response','word_match','build_phrase','scenario_v2'].includes(b.type)).length;
 store.getState().completeLesson(lesson.id,'A',{wrongBlocks:1,scoreableBlocks:count});saveAttempt(store);assert.equal(store.getState().lessonProgress[lesson.id],undefined);
 const first=store.getState().lessonMetrics[lesson.id];store.getState().completeLesson(lesson.id,'A',{wrongBlocks:0,scoreableBlocks:count});await store.getState().retrySync();assert.deepEqual(store.getState().lessonMetrics[lesson.id],first);assert.equal(resumeAttempt(lesson,attempt(),true).blockIndex,0);assert.equal(findLatestInProgressLesson(curriculumSections,store.getState().completedLessonIds,{[lesson.id]:attempt()}),null);
 assert.ok(cloudGameData(db.rows.get('A')).completedLessonIds.includes(lesson.id));
});
test('explicit application reset generation defeats stale offline progress while preserving reset-specific XP policy',async()=>{
 const {store,db}=await setup();store.getState().completeLesson(lesson.id,'A');store.getState().earnLessonXP(lesson.id,30,'A');await store.getState().retrySync();const old=cloudGameData(db.rows.get('A'));
 await store.getState().resetLessonProgress('A');const reset=cloudGameData(db.rows.get('A'));assert.deepEqual(reset.completedLessonIds,[]);assert.equal(reset.totalXP,30);assert.deepEqual(mergeGameData(old,reset).completedLessonIds,[]);
 await store.getState().resetAllProgress('A');assert.equal(store.getState().totalXP,0);
});
test('blocked device storage never claims local durability on a failed cloud write',async()=>{
 const db=database(),storage={getItem(){return null;},setItem(){throw Error('quota');}};const {store}=await setup(db,storage);db.writeError=Error('offline');saveAttempt(store);await store.getState().retrySync();assert.equal(store.getState().localSaveFailed,true);assert.equal(store.getState().syncStatus,'offline');
});

test('PWA refresh waits across active lesson/recording/scenario and applies once after safe exit',()=>{
 const pending=new Map();let id=0,reloads=0;const guard=createLearningUpdateGuard({schedule:fn=>{pending.set(++id,fn);return id;},cancel:id=>pending.delete(id)});
 const flush=()=>{for(const [id,fn]of [...pending]){pending.delete(id);fn();}};
 const release=guard.hold();guard.request(()=>reloads++);assert.equal(reloads,0);guard.request(()=>reloads++);release();const next=guard.hold();flush();assert.equal(reloads,0);next();flush();assert.equal(reloads,1);
 guard.setUnsafe(true);guard.request(()=>reloads++);flush();assert.equal(reloads,1);guard.setUnsafe(false);flush();assert.equal(reloads,2);guard.request(()=>reloads++);assert.equal(reloads,3);
});

test('actual lesson view persists wrong/completed blocks synchronously, resumes and scores like uninterrupted play',async()=>{
 const run=async(resume)=>{
   const {store,db,storage}=await setup();let activeStore=store;
   const view=()=>lessonHarness('default',{'../../stores/gameStore':{useGameStore:selector=>selector(activeStore.getState())}});
   const props={lesson,module:{},section:{},userId:'A'};let h=await view();let tree=h.render(props);nodes(tree,n=>n.type?.name==='LessonLoadingScreen')[0].props.onReady();tree=h.render(props);
   let wrongMarked=false;
   for(let i=0;i<lesson.blocks.length;i++){
     let renderer=nodes(tree,n=>n.type?.name==='BlockRenderer')[0];assert.equal(renderer.props.block.id,lesson.blocks[i].id);
     if(!wrongMarked && ['recognise_mcq','listen_mcq','best_response'].includes(lesson.blocks[i].type)){renderer.props.onWrongAnswer();wrongMarked=true;}
     renderer.props.onComplete();renderer.props.onAdvance();tree=h.render(props);
     if(resume && i===2){
       await activeStore.getState().retrySync();h.unmount();activeStore=createGameStore({client:db.client,storage});await activeStore.getState().ensureLoadedForUser('A');h=await view();tree=h.render(props);nodes(tree,n=>n.type?.name==='LessonLoadingScreen')[0].props.onReady();tree=h.render(props);
     }
   }
   h.render(props);await activeStore.getState().retrySync();h.unmount();return {metrics:activeStore.getState().lessonMetrics[lesson.id],xp:activeStore.getState().lessonXP[lesson.id],completed:activeStore.getState().completedLessonIds};
 };
 const uninterrupted=await run(false),resumed=await run(true);assert.equal(resumed.metrics.wrongBlocks,1);assert.equal(resumed.metrics.accuracyPct,uninterrupted.metrics.accuracyPct);assert.equal(resumed.xp,uninterrupted.xp);assert.ok(resumed.completed.includes(lesson.id));
});

test('Admin Sequence Walker Review opens the completed target without priming or clearing completion',async()=>{
 const h=await componentHarness('src/views/training/SequenceDebugView.jsx','default',{'./TrainingBackButton':()=>null});let completions=0,jump=null;
 const tree=h.render({allSections:curriculumSections,completedLessonIds:[lesson.id],completeLesson:()=>completions++,onJumpTo:item=>jump=item,userId:'A'});
 button(tree,'Review').props.onClick();h.flushTimers();assert.equal(completions,0);assert.equal(jump.lesson.id,lesson.id);
});

test('two tabs sharing device storage cannot erase each other’s dirty offline journal',async()=>{
 const db=database(),storage=memoryStorage();const a=(await setup(db,storage)).store,b=(await setup(db,storage)).store;
 db.readError=Error('offline');a.getState().completeLesson(lesson.id,'A');await a.getState().retrySync();b.getState().completeLesson(other.id,'A');await b.getState().retrySync();
 const journal=JSON.parse(storage.getItem(gameCacheKey('A')));assert.deepEqual(new Set(journal.game.completedLessonIds),new Set([lesson.id,other.id]));
 db.readError=null;const c=(await setup(db,storage)).store;assert.deepEqual(new Set(c.getState().completedLessonIds),new Set([lesson.id,other.id]));
});

test('actual auth login/logout/account-switch path resets game state and preserves Library account selection',async()=>{
 const {authHarness}=await import('./helpers/gameHarness.mjs');const db=database(),storage=memoryStorage();
 db.rows.set('A',row({...emptyGameData(),completedLessonIds:[lesson.id]}));db.rows.set('B',row({...emptyGameData(),completedLessonIds:[other.id]}));
 const game=createGameStore({client:db.client,storage});const {auth,accounts}=await authHarness(game);
 auth.getState()._setSession({user:{id:'A'}});await game.getState().ensureLoadedForUser('A');assert.deepEqual(game.getState().completedLessonIds,[lesson.id]);
 await auth.getState().signOut();assert.deepEqual(game.getState().completedLessonIds,[]);assert.equal(game.getState()._loadedForUserId,null);
 auth.getState()._setSession({user:{id:'B'}});await game.getState().ensureLoadedForUser('B');assert.deepEqual(game.getState().completedLessonIds,[other.id]);
 assert.deepEqual(accounts.filter(([kind])=>kind==='library').map(([,id])=>id),['A',null,'B']);
});

test('network deadline aborts the query and clears its timer on settlement',async()=>{
 const {gameRequest}=await import('../src/lib/gamePersistence.js');let timeout,cleared=false,signal;
 const query={abortSignal(s){signal=s;return this;},maybeSingle(){return new Promise(resolve=>signal.addEventListener('abort',()=>resolve({error:Error('timeout')}),{once:true}));}};
 const work=gameRequest(query,{schedule:(fn,ms)=>{assert.equal(ms,10000);timeout=fn;return 1;},cancel:()=>cleared=true});
 timeout();const result=await work;assert.ok(result.error);assert.equal(signal.aborted,true);assert.equal(cleared,true);
});

test('course UI gates account/cloud hydration and offers retry without presenting false empty-course state',async()=>{
 const {readFile}=await import('node:fs/promises');const source=await readFile(new URL('../src/views/TrainingView.jsx',import.meta.url),'utf8');
 const imports=Object.fromEntries([...source.matchAll(/from "([^"]+)"/g)].map(m=>m[1]).filter(id=>id!=='react').map(id=>[id,()=>null]));
 let game={_loadedForUserId:null,loading:true,syncStatus:'loading',localSaveFailed:false,resetEpoch:'0',retrySync:()=>{}},settings={loading:false,_loadedForUserId:'A'};
 imports['../stores/gameStore']={useGameStore:f=>f(game)};imports['../stores/authStore']={useAuthStore:f=>f({user:{id:'A'}})};imports['../stores/settingsStore']={useSettingsStore:f=>f(settings)};
 const view=await componentHarness('src/views/TrainingView.jsx','default',imports);let tree=view.render({});assert.match(textOf(tree),/Loading your progress/);assert.equal(nodes(tree,n=>n.type?.name==='TrainingContent').length,0);
 game={...game,loading:false,syncStatus:'load-error'};tree=view.render({});assert.ok(button(tree,'Retry'));assert.equal(nodes(tree,n=>n.type?.name==='TrainingContent').length,0);
 game={...game,_loadedForUserId:'A',syncStatus:'offline'};tree=view.render({});assert.equal(nodes(tree,n=>n.type?.name==='TrainingContent').length,1);assert.match(textOf(tree),/saved on this device/);
 game={...game,localSaveFailed:true};assert.match(textOf(view.render({})),/not safely saved/);
 game={...game,syncStatus:'saved'};assert.match(textOf(view.render({})),/Saved online/);
});

test('corrupt local cache is replaced only after trusted hydration; healthy retry does not remount Training',async()=>{
 const storage=memoryStorage();storage.setItem(gameCacheKey('A'),'{broken');const {store,db}=await setup(database(),storage);
 assert.equal(store.getState().localSaveFailed,false);assert.equal(JSON.parse(storage.getItem(gameCacheKey('A'))).baselineKnown,true);
 const reads=db.reads.length;await store.getState().retrySync();assert.equal(db.reads.length,reads);assert.equal(store.getState().loading,false);
});

test('curriculum has unique stable lesson/block identities across representative personalised profiles',async()=>{
 const factories=await Promise.all([1,2,3,4,5].map(n=>import(`../src/content/learning/section${n}/index.js`).then(m=>m.default)));
 const structure=sections=>sections.flatMap(s=>s.modules.flatMap(m=>m.isSectionCheckpoint?[m]:m.lessons||[])).map(l=>[l.id,l.blocks.map(b=>[b.id,b.type])]);
 const baseline=structure(curriculumSections);assert.equal(new Set(baseline.map(x=>x[0])).size,baseline.length);
 for(const [,blocks] of baseline)assert.equal(new Set(blocks.map(x=>x[0])).size,blocks.length);
 for(const profile of [{name:'David',gender:'male',age:45},{name:'Barbora',gender:'female',age:21}])assert.deepEqual(structure(factories.map(f=>f(profile))),baseline);
});

test('actual PWA freshness event defers a changed build until the active lesson safely exits',async()=>{
 const {readFileSync}=await import('node:fs');const {runInNewContext}=await import('node:vm');
 const scheduled=new Map();let sequence=0,reloads=0;const schedule=fn=>{scheduled.set(++sequence,fn);return sequence;};
 const guard=createLearningUpdateGuard({schedule,cancel:id=>scheduled.delete(id)});const release=guard.hold();
 const events={};const script=src=>({getAttribute:()=>src});
 const window={navigator:{userAgent:'Android'},location:{origin:'https://example.test',reload:()=>reloads++},addEventListener:(type,fn)=>{events[type]=fn;}};
 const document={visibilityState:'visible',querySelectorAll:()=>[script('/assets/index-old.js')],addEventListener(){}};
 const source=readFileSync(new URL('../src/pwa.js',import.meta.url),'utf8').replace(/^import .*;\n/,'');
 runInNewContext(source,{window,document,navigator:window.navigator,learningUpdateGuard:guard,URL,console,setTimeout:schedule,
   fetch:async()=>({ok:true,text:async()=>'<html/>'}),DOMParser:class{parseFromString(){return {querySelectorAll:()=>[script('/assets/index-new.js')]};}}});
 await events.focus();assert.equal(reloads,0);release();for(const fn of scheduled.values())fn();assert.equal(reloads,1);
});
