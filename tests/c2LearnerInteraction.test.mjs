import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { componentHarness, nodes, textOf, button } from './helpers/componentHarness.mjs';
import { lessonHarness } from './helpers/lessonHarness.mjs';
import * as scenarioHelp from '../src/utils/scenarioHelp.js';
import * as scenarioAudio from '../src/utils/scenarioAudio.js';
import { getChoiceAnswerAudio } from '../src/lib/trainingScoring.js';
const leaf = () => null;
const imports = {
  '../../components/audio/InteractivePhraseText': leaf,
  '../../utils/scenarioAudio.js': scenarioAudio,
  '../../utils/scenarioHelp.js': scenarioHelp,
};
const scenario = name => componentHarness('src/views/training/ScenarioV2Block.jsx', name, imports);
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return {promise, resolve}; };
const tick = async () => { for (let i=0;i<8;i++) await Promise.resolve(); };
const pointer = (extra={}) => ({pointerType:'touch',pointerId:1,clientX:0,clientY:0,button:0,currentTarget:{setPointerCapture(){},releasePointerCapture(){},blur(){}},stopPropagation(){},preventDefault(){},...extra});

for (const name of ['ChoiceBlock','ContextGapSelect','ChooseCorrectForm','ConversationTurnFill']) {
  test(`${name}: best/acceptable/awkward/wrong preserve scoring, chosen text and correction`, async () => {
    for (const result of ['best','acceptable','awkward','wrong']) {
      const view = await lessonHarness(name);
      let completed=0, wrong=0;
      const options = [
        {id:'best',text:'Taip',result:'best',feedback:'Correct meaning.'},
        {id:'acceptable',text:'Gerai',result:'acceptable',feedback:'A natural alternative.'},
        {id:'awkward',text:'Ačiū',result:'awkward',feedback:'Understandable, but less direct.'},
        {id:'wrong',text:'Ne',result:'wrong',feedback:'This means no.'},
      ];
      const block={type:name==='ChoiceBlock'?'best_response':'choose_correct_form',options,sentence:'Atsakymas: ___',lines:[{text:'Atsakymas: ___',hasGap:true}]};
      const props={block,onComplete:()=>completed++,onWrongAnswer:()=>wrong++};
      let tree=view.render(props);
      const selected=options.find(o=>o.result===result);
      if(name==='ChoiceBlock') nodes(tree,n=>n.props?.option?.id===result)[0].props.onClick();
      else button(tree,selected.text).props.onClick();
      tree=view.render(props);
      assert.equal(completed,1);
      assert.equal(wrong,result==='wrong'?1:0);
      const feedback=nodes(tree,n=>n.props?.onContinue!==undefined || n.type?.name==='ChoiceFeedbackAction' || n.type?.name==='FeedbackPanel').find(n=>n.props?.correctText!==undefined);
      assert.ok(feedback);
      assert.equal(feedback.props.feedbackNote,selected.feedback);
      assert.equal(feedback.props.isSoftPass,['acceptable','awkward'].includes(result));
      const panel=await lessonHarness(name==='ChoiceBlock'?'ChoiceFeedbackAction':'FeedbackPanel');
      const panelTree=panel.render(feedback.props);
      if(['acceptable','awkward'].includes(result)) {
        assert.match(textOf(panelTree),/Better here:/);
        assert.ok(nodes(panelTree,n=>n.props?.className?.includes('z-correct-answer') && textOf(n)==='Taip').length);
      }
      if(name!=='ChoiceBlock') {
        const colour=result==='best'?'emerald':['acceptable','awkward'].includes(result)?'amber':'rose';
        assert.ok(nodes(tree,n=>n.type==='span' && textOf(n)===selected.text && n.props.className?.includes(colour)).length);
        if(result==='wrong') assert.match(textOf(panelTree),/Correct answer: Taip/);
      }
    }
  });
}

test('Choice cards keep selected soft-pass amber and authored best green, with no strike-through', async()=>{
  for (const result of ['acceptable','awkward']) {
    const view=await lessonHarness('ChoiceOption');
    const tree=view.render({option:{text:'Gerai',result},selected:true,revealState:'revealed'});
    assert.match(tree.props.className,/amber/); assert.doesNotMatch(tree.props.className,/line-through/);
    const best=view.render({option:{text:'Taip',result:'best'},selected:false,revealState:'revealed'});
    assert.match(best.props.className,/emerald/);
  }
});

test('English Choice answers are silent before evaluation and play only authored Lithuanian afterwards', async()=>{
  for (const type of ['listen_mcq','recognise_mcq','best_response']) for(const isCorrect of [true,false]) {
    const calls=[], view=await lessonHarness('ChoiceBlock');
    const block={type,noOptionAudio:true,prompt:{text:'Choose the meaning',audioText:'Eikite tiesiai.'},options:[
      {id:'a',text:'Go straight.',isCorrect:true},{id:'b',text:'Turn left.',isCorrect:false},
    ]};
    const props={block,playText:t=>calls.push(t)};
    const tree=view.render(props);assert.deepEqual(calls,[]);
    nodes(tree,n=>n.props?.option?.id===(isCorrect?'a':'b'))[0].props.onClick();
    assert.deepEqual(calls,['Eikite tiesiai.']);
  }
  assert.equal(getChoiceAnswerAudio({noOptionAudio:true},{text:'English',isCorrect:true},null),null);
  assert.equal(getChoiceAnswerAudio({noOptionAudio:true},{text:'English',learnerText:'Suprantu.',isCorrect:true},null),'Suprantu.');
});

test('phrase control normal tap and hold use shared audio once; keyboard and cancellation work',async()=>{
  const view=await componentHarness('src/components/audio/AudioPlayButton.jsx','default',{'../../hooks/useWordAudio':{source:'src/hooks/useWordAudio.js'}});
  const calls=[], props={text:'Man dvidešimt metų',playText:(...x)=>calls.push(x)};
  let tree=view.render(props);
  tree.props.onPointerDown(pointer());view.advanceTime(419);tree.props.onPointerUp(pointer());
  tree.props.onClick({detail:1,stopPropagation(){}});
  assert.deepEqual(calls,[['Man dvidešimt metų',undefined]]);
  tree=view.render(props);tree.props.onPointerDown(pointer());view.advanceTime(420);
  tree.props.onPointerUp(pointer());tree.props.onClick({detail:1,stopPropagation(){}});
  assert.deepEqual(calls.at(-1),['Man dvidešimt metų',{slow:true}]); assert.equal(calls.length,2);
  tree=view.render(props);tree.props.onClick({detail:0,stopPropagation(){}});
  assert.equal(calls.length,3);
  tree.props.onKeyDown({key:'Enter',shiftKey:true,preventDefault(){}});
  assert.equal(calls.length,4);assert.equal(calls.at(-1)[1].slow,true);
  tree=view.render(props);tree.props.onPointerDown(pointer());tree.props.onPointerMove(pointer({clientX:30}));view.advanceTime(500);tree.props.onPointerUp(pointer());
  tree.props.onClick({detail:1,stopPropagation(){}});assert.equal(calls.length,4);
  tree.props.onPointerDown(pointer());tree.props.onPointerCancel(pointer());view.advanceTime(500);tree.props.onClick({detail:1,stopPropagation(){}});assert.equal(calls.length,4);
  tree.props.onPointerDown(pointer());view.unmount();view.advanceTime(500);assert.equal(calls.length,4);
});

test('word highlight stays active through 999ms, clears at 1000ms, and restarts on repeated playback',async()=>{
  const view=await componentHarness('src/hooks/useWordAudio.js','default');
  const props={word:'Ačiū',playText:()=>Promise.resolve()};
  let hook=view.render(props);void hook.play(false);await tick();
  view.advanceTime(999);assert.equal(view.render(props).playing,'normal');
  view.advanceTime(1);assert.equal(view.render(props).playing,null);
  void hook.play(false);view.advanceTime(800);void hook.play(false);view.advanceTime(999);
  assert.equal(view.render(props).playing,'normal');view.advanceTime(1);assert.equal(view.render(props).playing,null);
  void hook.play(true);view.advanceTime(999);assert.equal(view.render(props).playing,'slow');view.advanceTime(1);assert.equal(view.render(props).playing,null);
});

test('word feedback uses a steady visible colour in both themes, including coarse-pointer hover',()=>{
  const source=readFileSync(new URL('../src/components/audio/InteractivePhraseText.jsx',import.meta.url),'utf8');
  const css=readFileSync(new URL('../src/index.css',import.meta.url),'utf8');
  assert.match(source,/\.z-word-glow, \.z-word-glow-slow \{[\s\S]*?color: rgb\(110,231,183\) !important/);
  assert.match(source,/:not\(\.z-word-glow\):not\(\.z-word-glow-slow\):hover/);
  assert.match(css,/html\[data-theme="light"\] \.z-word-glow-slow \{\s*animation: none;\s*color: #047857 !important/);
});

test('STT success and retry screens contain no learner transcript diagnostics; Speechmatics stays wired',async()=>{
  for(const text of ['Ačiū','wrong transcript']) {
    let config;
    const view=await lessonHarness('SpeakSelfCheckBlock',{'../../hooks/useSpeechToTextHold':c=>{config=c;return {sttState:'idle',sttSupported:()=>true};}});
    const props={block:{targetText:'Ačiū'},onComplete:()=>{}};
    view.render(props);assert.equal(config.transcriptionUrl,'/api/stt-speechmatics');config.setInput(text);
    const tree=view.render(props);
    assert.doesNotMatch(textOf(tree),/STT heard|Normalised|Matcher|wrong transcript/);
    assert.match(textOf(tree),text==='Ačiū'?/spoken/i:/Try again|Try once more|Hold/);
  }
});

test('Scenario intro is full-screen, readable, and contains no mounted dialogue/audio before Start',async()=>{
  const view=await scenario('default');const played=[];
  const props={block:{title:'At the hotel',description:'You have arrived.',userRole:'guest',participants:[{name:'Rasa',role:'receptionist'}],steps:[{speakerText:'Labas'}]},playText:t=>played.push(t)};
  let tree=view.render(props);view.flushTimers();
  assert.deepEqual(played,[]);assert.equal(nodes(tree,n=>n.type?.name==='ScenarioV2FocusedMode').length,0);
  assert.match(textOf(tree),/At the hotel/);assert.match(textOf(tree),/You have arrived/);
  assert.ok(nodes(tree,n=>n.type==='section' && n.props.className.includes('fixed inset-0') && n.props.className.includes('overflow-y-auto')).length);
  assert.ok(nodes(tree,n=>n.type==='h1').length);assert.doesNotMatch(textOf(tree),/Labas/);
  button(tree,'Start scenario').props.onClick();tree=view.render(props);
  assert.equal(nodes(tree,n=>n.type?.name==='ScenarioV2FocusedMode').length,1);
});

async function readyScenario(block, playText) {
  const view=await scenario('ScenarioV2FocusedMode');const props={block,playText};
  view.render(props);view.flushTimers();await tick();
  return {view,props,tree:view.render(props)};
}
const findCard=(tree,text)=>nodes(tree,n=>n.props?.role==='button' && n.props['aria-label']?.endsWith(`: ${text}`))[0];
const baseStep={id:'s1',speakerText:'Eikite tiesiai.',interactionMode:'comprehension',options:[
  {id:'a',text:'Go straight.',learnerText:'Suprantu. Ačiū.',result:'best'},
  {id:'b',text:'Turn left.',result:'wrong',feedback:'Tiesiai means straight.'},
]};

for(const path of ['next','branch','followUp','final']) test(`comprehension learner audio finishes before ${path} speaker; no duplicate submission`,async()=>{
  const learner=deferred(), calls=[];
  const step=structuredClone(baseStep);
  if(path==='branch') step.options[0].nextStepId='s3';
  if(path==='followUp') step.options[0].followUp={speakerText:'Prašom.'};
  if(path==='final') step.finalSystemLine={speakerText:'Viso gero.'};
  const block={steps:[step,{id:'s2',speakerText:'Gerai.',options:[]},{id:'s3',speakerText:'Puiku.',options:[]}]};
  const {view,props,tree}=await readyScenario(block,(text)=>{calls.push(text);return text==='Suprantu. Ačiū.'?learner.promise:Promise.resolve();});
  const card=findCard(tree,'Go straight.');card.props.onClick();card.props.onClick();
  let pending=view.render(props);view.flushTimers();await tick();
  assert.deepEqual(calls,['Eikite tiesiai.','Suprantu. Ačiū.']);
  const history=nodes(pending,n=>n.props?.item?.role==='learner');
  assert.equal(history.length,1);assert.equal(history[0].props.item.text,'Suprantu. Ačiū.');
  assert.ok(findCard(pending,'Go straight.').props['aria-disabled']);
  learner.resolve();await tick();view.render(props);view.flushTimers();await tick();view.render(props);
  assert.equal(calls[2],{next:'Gerai.',branch:'Puiku.',followUp:'Prašom.',final:'Viso gero.'}[path]);
  assert.equal(calls.includes('Go straight.'),false);
});

test('wrong comprehension is plain assessment feedback, counts once and never adds learner dialogue/audio',async()=>{
  const calls=[], block={steps:[baseStep]}, view=await scenario('ScenarioV2FocusedMode');let wrong=0;
  const props={block,playText:t=>calls.push(t),onWrongAnswer:()=>wrong++};
  view.render(props);view.flushTimers();let tree=view.render(props);findCard(tree,'Turn left.').props.onClick();tree=view.render(props);
  assert.equal(wrong,1);assert.deepEqual(calls,['Eikite tiesiai.']);
  assert.equal(nodes(tree,n=>n.props?.item?.role==='learner').length,0);
  const sheet=nodes(tree,n=>n.type?.name==='ScenarioV2FeedbackSheet')[0];assert.equal(sheet.props.plainText,true);
});

test('Scenario soft passes stay amber with green best answer, progress without penalty and retain branching',async()=>{
  for(const result of ['acceptable','awkward']) {
    const block={steps:[{id:'s1',speakerText:'Labas',options:[{id:'a',text:'Labas!',result:'best'},{id:'b',text:'Sveiki!',result,feedback:'This works too.'}]}]};
    let wrong=0;const view=await scenario('ScenarioV2FocusedMode');const props={block,onWrongAnswer:()=>wrong++};
    view.render(props);view.flushTimers();let tree=view.render(props);findCard(tree,'Sveiki!').props.onClick();tree=view.render(props);
    assert.equal(wrong,0);const sheet=nodes(tree,n=>n.type?.name==='ScenarioV2FeedbackSheet')[0];
    const renderSheet=await scenario('ScenarioV2FeedbackSheet');const feedback=renderSheet.render(sheet.props);
    assert.ok(nodes(feedback,n=>n.props?.className?.includes('scenario-v2-soft-answer')).length);
    assert.equal(sheet.props.option.betterAnswer,'Labas!');assert.ok(nodes(feedback,n=>n.props?.className?.includes('z-correct-answer')).length);
    sheet.props.onContinue();await tick();tree=view.render(props);
    assert.equal(nodes(tree,n=>n.props?.item?.role==='learner')[0].props.item.result,result);
    assert.ok(nodes(tree,n=>n.type?.name==='ScenarioV2CompleteAction').length);
  }
});

test('exiting during learner playback cancels its scope and prevents a late next turn',async()=>{
  const learner=deferred();let signal;const calls=[];
  const {view,props,tree}=await readyScenario({steps:[baseStep,{id:'s2',speakerText:'Late line',options:[]}]},(text,options)=>{
    calls.push(text);if(text==='Suprantu. Ačiū.'){signal=options.signal;return learner.promise;}
  });
  findCard(tree,'Go straight.').props.onClick();view.render(props);view.unmount();assert.equal(signal.aborted,true);
  learner.resolve();await tick();view.flushTimers();assert.equal(calls.includes('Late line'),false);
});

test('Nesuprantu help waits for spoken help completion, preserves the current step and keeps English help silent',async()=>{
  const spoken=deferred(), calls=[];
  const step={...structuredClone(baseStep),help:{levels:[
    {speakerText:'Eikite tiesiai.',spokenLanguage:'lt'},
    {speakerText:'Go straight.',spokenLanguage:'en',audio:false},
  ]}};
  let helpPlayback=false;
  const {view,props,tree}=await readyScenario({steps:[step]},text=>{
    calls.push(text);return helpPlayback ? spoken.promise : Promise.resolve();
  });
  helpPlayback=true;findCard(tree,'Nesuprantu.').props.onClick();
  view.render(props);view.flushTimers();await tick();
  let pending=view.render(props);
  assert.equal(findCard(pending,'Go straight.').props['aria-disabled'],true);
  assert.equal(nodes(pending,n=>n.props?.item?.helpLevel).length,0);
  spoken.resolve();await tick();pending=view.render(props);
  assert.ok(findCard(pending,'Go straight.'));
  assert.equal(nodes(pending,n=>n.props?.item?.id==='s1_help_response_1').length,1);
  findCard(pending,'Nesuprantu.').props.onClick();view.render(props);view.flushTimers();await tick();
  pending=view.render(props);
  assert.ok(findCard(pending,'Go straight.'));
  assert.equal(nodes(pending,n=>n.props?.item?.id==='s1_help_response_2')[0].props.item.speakerText,'Go straight.');
  assert.deepEqual(calls,['Eikite tiesiai.','Eikite tiesiai.']);
});

test('word keyboard playback shares the full highlight timer and rejects repeated keydown',async()=>{
  const view=await componentHarness('src/components/audio/InteractivePhraseText.jsx','WordToken',{
    '../../hooks/useWordAudio':{source:'src/hooks/useWordAudio.js'},'../../utils/tokenizePhrase':()=>[],
  });
  const calls=[], props={token:{text:'Ačiū'},playText:(...args)=>calls.push(args)};
  const event={key:'Enter',shiftKey:false,preventDefault(){},stopPropagation(){}};
  let tree=view.render(props);await tree.props.onKeyDown(event);
  view.advanceTime(999);assert.match(view.render(props).props.className,/z-word-glow/);
  view.advanceTime(1);assert.doesNotMatch(view.render(props).props.className,/z-word-glow/);
  tree=view.render(props);await tree.props.onKeyDown({...event,key:' ',shiftKey:true});
  await tree.props.onKeyDown({...event,repeat:true});
  assert.deepEqual(calls,[['Ačiū',undefined],['Ačiū',{slow:true}]]);
});

test('explicit Lithuanian option metadata overrides the conservative legacy silence flag',()=>{
  assert.equal(getChoiceAnswerAudio({optionsLanguage:'lt',noOptionAudio:true},{text:'Ačiū',result:'best'},null),'Ačiū');
});
