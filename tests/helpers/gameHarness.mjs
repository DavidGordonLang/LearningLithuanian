import { readFile } from 'node:fs/promises';
import { transformWithEsbuild } from 'vite';
import * as zustand from 'zustand';
import * as curriculum from '../../src/lib/curriculumProgress.js';
import * as persistence from '../../src/lib/gamePersistence.js';
import * as guard from '../../src/lib/learningUpdateGuard.js';
const {code}=await transformWithEsbuild(await readFile(new URL('../../src/stores/gameStore.js',import.meta.url),'utf8'),'gameStore.js',{format:'cjs'});
const module={exports:{}};
new Function('require','module','exports',code)(id=>({zustand,'../supabaseClient':{supabase:{}},'../lib/curriculumProgress.js':curriculum,'../lib/gamePersistence.js':persistence,'../lib/learningUpdateGuard.js':guard})[id],module,module.exports);
export const createGameStore=module.exports.createGameStore;
export const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {resolve,promise};};
export const tick=async()=>{for(let n=0;n<30;n++)await Promise.resolve();};
export function memoryStorage() { const map=new Map();return {getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),map}; }
export function database() {
  const db={rows:new Map(),writes:[],reads:[],readError:null,writeError:null,beforeRead:null,beforeWrite:null};
  db.client={from(table){if(table!=='user_game')throw Error('Unexpected table');let op='read',payload,filters={};
    const query={abortSignal(){return query;},select(){return query;},eq(k,v){filters[k]=v;return query;},is(k,v){filters[k]=v;return query;},
      insert(v){op='insert';payload=v;return query;},update(v){op='update';payload=v;return query;},
      async maybeSingle(){
        const uid=filters.user_id||payload?.user_id;
        if(op==='read') {db.reads.push(uid); const row=structuredClone(db.rows.get(uid)||null);await db.beforeRead?.(uid);
          return db.readError?{data:null,error:db.readError}:{data:row,error:null};}
        await db.beforeWrite?.({uid,op,payload,filters});
        if(db.writeError)return {data:null,error:db.writeError};
        const current=db.rows.get(uid);
        if(op==='insert'&&current)return {data:null,error:{code:'23505'}};
        if(op==='update'&&(!current||current.updated_at!==filters.updated_at))return {data:null,error:null};
        db.rows.set(uid,structuredClone({user_id:uid,...payload}));db.writes.push({uid,op,payload});return {data:{updated_at:payload.updated_at},error:null};
      }};return query;
  }};return db;
}

export async function authHarness(gameStore) {
  const {code}=await transformWithEsbuild(await readFile(new URL('../../src/stores/authStore.js',import.meta.url),'utf8'),'authStore.js',{format:'cjs'});
  const module={exports:{}}, accounts=[];
  const settings={getState:()=>({reset(){},ensureLoadedForUser(){}})};
  new Function('require','module','exports',code)(id=>({zustand,'../supabaseClient':{supabase:{auth:{signOut:async()=>{}}}},'./settingsStore':{useSettingsStore:settings},'./gameStore':{useGameStore:gameStore},
    './phraseStore':{selectPhraseAccount:id=>accounts.push(['library',id])},'./scenarioStore':{selectScenarioAccount:id=>accounts.push(['scenarios',id])}})[id],module,module.exports);
  return {auth:module.exports.useAuthStore,accounts};
}
