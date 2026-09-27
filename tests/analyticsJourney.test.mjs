import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { transformWithEsbuild } from "vite";
import { componentHarness, nodes, textOf } from "./helpers/componentHarness.mjs";
import { lessonHarness } from "./helpers/lessonHarness.mjs";
import { curriculumSections } from "../src/lib/curriculumProgress.js";
import { betaCohort, lessonProgressMarker, safeProductProps, scenarioSummary } from "../src/lib/productTelemetry.js";

test("one analytics session emits once across navigation and starts anew after inactivity or account switch", async () => {
  const source = await readFile(new URL("../src/services/analytics.js", import.meta.url), "utf8");
  const { code } = await transformWithEsbuild(source, "analytics.js", { format: "cjs" });
  const values = new Map(), writes = []; let user = { id: "A", email: "a@example.test" };
  const before = globalThis.localStorage;
  globalThis.localStorage = { getItem: k => values.get(k) ?? null, setItem: (k,v) => values.set(k,String(v)) };
  try {
    const supabase = { from: () => ({ insert: async rows => { writes.push(...rows); return { error: null }; } }) };
    const module = { exports: {} };
    new Function("require", "module", "exports", code)(id => {
      if (id === "../supabaseClient") return { supabase };
      if (id === "../stores/authStore") return { useAuthStore: { getState: () => ({ user }) } };
      if (id === "../lib/productTelemetry") return requireProduct;
      throw Error(id);
    }, module, module.exports);
    const analytics = module.exports;
    await analytics.trackSessionStart(); await analytics.trackSessionStart();
    await analytics.trackProductEvent("training_viewed");
    assert.equal(writes.filter(e => e.event_name === "session_start").length, 1);
    values.set("zodis_session_last_v1", String(Date.now() - 31*60*1000));
    await analytics.trackProductEvent("training_viewed");
    assert.equal(writes.filter(e => e.event_name === "session_start").length, 2);
    user = { id: "B", email: "b@example.test" };
    await analytics.trackSessionStart();
    assert.equal(writes.filter(e => e.event_name === "session_start").length, 3);
    assert.notEqual(writes[1].session_id, writes.at(-1).session_id);
  } finally { globalThis.localStorage = before; }
});
const requireProduct = { BETA3_VERSION: "3.0.0-beta", safeProductProps };

test("lesson emits start once, an incomplete deliberate exit with stable marker, and no exit on completion", async () => {
  const lesson = curriculumSections[0].modules[0].lessons[0];
  const events = [], state = { lessonProgress: {}, completedLessonIds: [],
    completeLesson(id) { state.completedLessonIds.push(id); },
    earnLessonXP() { return { xpGained: 30 }; },
    setLessonProgress(id, blockId, blockIndex, uid, attempt) {
      state.lessonProgress[id] = { curriculumId: "beta3-2-62733640", blockId, blockIndex,
        completedBlockIds: Object.keys(attempt.completedBlockIds), wrongBlockIds: Object.keys(attempt.wrongBlockIds), updatedAt: Date.now() };
    } };
  const overrides = { "../../stores/gameStore": { useGameStore: selector => selector(state) },
    "../../services/analytics": { trackProductEvent: (name,props) => events.push({name,props}) } };
  const props = { lesson, module: {id:"module_1_1"}, section: {id:"section_1"}, userId:"A", onBack() {} };
  let h = await lessonHarness("default", overrides);
  let tree = h.render(props); nodes(tree,n => n.type?.name === "LessonLoadingScreen")[0].props.onReady();
  tree = h.render(props); h.render(props);
  assert.equal(events.filter(e => e.name === "lesson_started").length,1);
  let block = nodes(tree,n => n.type?.name === "BlockRenderer")[0];
  block.props.onComplete(); block.props.onAdvance(); tree = h.render(props);
  nodes(tree,n => n.type?.name === "BlockRenderer")[0].props.onExit();
  assert.equal(events.filter(e => e.name === "lesson_exited").length,1);
  assert.equal(events.find(e => e.name === "lesson_exited").props.block_id, lesson.blocks[1].id);
  h.unmount(); events.length = 0;
  h = await lessonHarness("default", overrides);
  tree = h.render(props); nodes(tree,n => n.type?.name === "LessonLoadingScreen")[0].props.onReady(); tree = h.render(props);
  assert.equal(events.filter(e => e.name === "lesson_resumed").length,1);
  for (let i=1; i<lesson.blocks.length; i++) {
    block = nodes(tree,n => n.type?.name === "BlockRenderer")[0];
    block.props.onComplete(); block.props.onAdvance(); tree = h.render(props);
  }
  tree = h.render(props);
  assert.equal(events.filter(e => e.name === "lesson_completed").length,1);
  assert.equal(events.filter(e => e.name === "lesson_exited").length,0);
  h.unmount();
});

test("scenario outcome summary and product props contain no learner text or transcript", () => {
  assert.deepEqual(scenarioSummary(["wrong","best","acceptable","awkward","repair"],2),
    {best:1,acceptable:1,awkward:1,repair:1,wrong:1,help_count:2,decisions:5});
  assert.deepEqual(safeProductProps({lesson_id:"lesson_1",scenario_id:"s1_b1",passed:false,
    phrase_text:"Labas rytas",transcript:"personal words",title:"My private title",dateOfBirth:"1981-04-04"}),
    {lesson_id:"lesson_1",scenario_id:"s1_b1",passed:false});
  assert.deepEqual(lessonProgressMarker([{id:"a"},{id:"b"}],{blockIndex:1,completedBlockIds:{a:true}}),
    {block_id:"b",block_index:1,progress_pct:50});
});

test("actual speaking results report failed and passed attempts without transcripts", async () => {
  const events = []; let callbacks;
  const h = await lessonHarness("SpeakSelfCheckBlock", {
    "../../hooks/useSpeechToTextHold": options => { callbacks = options; return {
      sttState:"idle", sttSupported:()=>true, startRecording(){}, stopRecording(){}, cancelStt(){} }; },
    "../../services/analytics": { trackProductEvent: (name,props) => events.push({name,props}) },
  });
  h.render({block:{id:"speak_1",targetText:"Labas"},lessonId:"lesson_1",onComplete() {}});
  callbacks.setInput("Viso gero"); callbacks.onNoSpeech(); callbacks.setInput("Labas");
  assert.deepEqual(events.map(e => [e.name,e.props.passed,e.props.attempt_number]),
    [["pronunciation_attempt",false,1],["pronunciation_attempt",false,2],["pronunciation_attempt",true,3]]);
  assert.ok(events.every(e => !JSON.stringify(e.props).includes("Labas") && !JSON.stringify(e.props).includes("Viso gero")));
  h.unmount();
});

test("Scenario V2 completion callback carries the selected outcome counts", async () => {
  const recorded = [];
  const h = await componentHarness("src/views/training/ScenarioV2Block.jsx", "ScenarioV2FocusedMode", {
    "../../components/audio/InteractivePhraseText": () => null,
    "../../utils/scenarioAudio.js": { isScenarioTurnAudioEnabled: () => false },
    "../../utils/scenarioHelp.js": await import("../src/utils/scenarioHelp.js"),
    "../../services/analytics": { trackProductEvent: (name,props) => recorded.push({name,props}) },
  });
  const block = {id:"scenario_one",steps:[{id:"step1",speakerText:"Labas",audio:false,
    options:[{id:"no",text:"Ne",result:"wrong"},{id:"yes",text:"Taip",result:"best",progresses:true}]}]};
  let result;
  const props = {block,lessonId:"lesson_one",onComplete:summary => {result=summary},onWrongAnswer() {}};
  let tree = h.render(props); h.advanceTime(2500); tree = h.render(props);
  const choose = value => nodes(tree,n => n.props?.["aria-label"] === `Choose reply: ${value}`)[0].props.onClick();
  choose("Ne"); tree = h.render(props);
  nodes(tree,n => n.props?.onRetry)[0].props.onRetry(); tree = h.render(props);
  choose("Taip"); tree = h.render(props);
  nodes(tree,n => n.type?.name === "ScenarioV2CompleteAction")[0].props.onComplete();
  assert.deepEqual(result,{best:1,acceptable:0,awkward:0,repair:0,wrong:1,help_count:0,decisions:2});
  h.unmount();
});

test("incomplete funnels and UTC D1/D3/D7 are safe; old audio does not count", () => {
  const e = (day,sid,name,props={}) => ({user_id:"A",session_id:sid,event_name:name,event_props:props,created_at:`2026-09-${day}T10:00:00Z`});
  const { users, funnel, retention } = betaCohort([e("27","s1","session_start"),e("27","s1","tts_preload"),
    e("28","s2","session_start"),e("30","s3","session_start"),e("30","s3","lesson_exited",{lesson_id:"one",block_id:"b2",progress_pct:30}),
    e("30","s3","pronunciation_attempt",{passed:false}),e("30","s3","phrase_saved",{count:3})]);
  assert.equal(funnel.firstSession,1); assert.equal(funnel.lesson1Completed,0);
  assert.deepEqual(retention,{d1:1,d3:1,d7:0});
  assert.equal(users[0].savedPhrases,3); assert.equal(users[0].lastIncomplete.block_id,"b2");
  assert.equal(users[0].counts.tts_preload,undefined);
  assert.equal(betaCohort().users.length,0);
});

test("preloading still invokes the player while per-preload telemetry is absent", async () => {
  const source = await readFile(new URL("../src/App.jsx",import.meta.url),"utf8");
  const lesson = await readFile(new URL("../src/views/training/LearningLessonView.jsx",import.meta.url),"utf8");
  assert.match(source,/const preloadTextTracked = useCallback\(\(text, opts\) => \{\s*return preloadText\(text, opts\)/);
  assert.match(lesson,/preloadText\(text\)\.catch/);
  assert.doesNotMatch(source,/trackEvent\(\s*"tts_preload"/);
  const loaded = [], events = [];
  const state = { lessonProgress:{}, completedLessonIds:[], setLessonProgress() {} };
  const h = await lessonHarness("default", {
    "../../stores/gameStore": { useGameStore: selector => selector(state) },
    "../../services/analytics": { trackProductEvent: (name,props) => events.push({name,props}) },
  });
  h.render({lesson:curriculumSections[0].modules[0].lessons[0],userId:"A",
    preloadText:text => {loaded.push(text); return Promise.resolve();}});
  h.flushTimers();
  assert.ok(loaded.length > 0);
  assert.equal(events.filter(e => e.name === "tts_preload").length,0);
  h.unmount();
});

test("admin analytics renders an empty, incomplete cohort without a crash", async () => {
  const query = { select(){return this}, gte(){return this}, order(){return this}, range(){return this}, eq(){return this}, neq(){return this}, then(resolve){resolve({data:[],error:null})} };
  const view = await componentHarness("src/views/AnalyticsView.jsx","default",{
    "../supabaseClient": {supabase:{from:()=>query}},
    "../services/analytics": {trackError() {}},
    "../lib/productTelemetry": {betaCohort,BETA3_VERSION:"3.0.0-beta"},
  });
  const tree = view.render({appVersion:"3.0.0-beta",onBack() {}});
  assert.match(textOf(tree),/Fresh cohort funnel/);
  assert.match(textOf(tree),/Beta admitted/);
  view.unmount();
});
