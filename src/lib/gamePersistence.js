import { CURRICULUM_ID, emptyGameData, sanitiseGameData, mergeGameData } from './curriculumProgress.js';

export const gameCacheKey = userId => `zodis:game:${CURRICULUM_ID}:${userId}`;
export const cloudGameData = row => sanitiseGameData(row?.data?.learningCurricula?.[CURRICULUM_ID]);
// A stalled request is a retryable failure, never an endless loading screen.
export async function gameRequest(query, { schedule = setTimeout, cancel = clearTimeout } = {}) {
  const controller = new AbortController();
  const timer = schedule(() => controller.abort(), 10000);
  try { return await query.abortSignal(controller.signal).maybeSingle(); }
  finally { cancel(timer); }
}
export async function readGameRow(client, userId) {
  const { data, error } = await gameRequest(client.from('user_game').select('data,updated_at').eq('user_id',userId));
  if (error) throw error; // no-row is null, never a failed request disguised as defaults
  return data;
}
export async function writeGameRow(client, userId, row, game, now = Date.now()) {
  const data = { ...(row?.data || {}), learningCurricula: { ...(row?.data?.learningCurricula || {}), [CURRICULUM_ID]: game } };
  const updated_at = new Date(Math.max(now, (Date.parse(row?.updated_at) || 0) + 1)).toISOString();
  if (!row) {
    const result = await gameRequest(client.from('user_game').insert({user_id:userId,data,updated_at}).select('updated_at'));
    if (result.error?.code === '23505') return false; // concurrent first writer; re-read/merge
    if (result.error) throw result.error;
    return !!result.data;
  }
  let query = client.from('user_game').update({data,updated_at}).eq('user_id',userId);
  query = row.updated_at == null ? query.is('updated_at',null) : query.eq('updated_at',row.updated_at);
  const result = await gameRequest(query.select('updated_at'));
  if (result.error) throw result.error;
  return !!result.data; // zero rows = conflict, not success
}

// One controller per store. Local writes are synchronous, cloud work is serialized
// and conditional; stale account tasks cannot publish into the new account state.
export function createGamePersistence({client, storage, getData, applyData, onStatus}) {
  let scope = null;
  const current = s => scope === s;
  function cache(s) {
    try {
      // Another tab may have journalled offline work since this scope hydrated.
      const cachedText = storage?.getItem(gameCacheKey(s.userId));
      let cached = null;
      try { cached = JSON.parse(cachedText || 'null'); } catch { /* replace corrupt cache after a trusted cloud read */ }
      if (cached?.userId === s.userId && cached.dirty && cached.game?.curriculumId === CURRICULUM_ID) {
        const merged = mergeGameData(s.game, cached.game);
        if (JSON.stringify(merged) !== JSON.stringify(s.game)) { s.game=merged;s.dirty=true;s.revision++; }
      }
      storage?.setItem(gameCacheKey(s.userId),JSON.stringify({userId:s.userId,game:s.game,dirty:s.dirty,baselineKnown:s.baselineKnown}));
      s.localSafe = !!storage; }
    catch { s.localSafe=false; }
  }
  function status(s, state) { s.status=state; if(current(s)) onStatus({syncStatus:state,localSaveFailed:!s.localSafe}); }
  async function flush(s) {
    if (!current(s) || !s.dirty) return;
    if (s.job) return s.job;
    s.job = (async()=>{
      status(s,'saving');
      try {
        let conflicts=0;
        while(current(s) && s.dirty) {
          const row=await readGameRow(client,s.userId);
          if(!current(s))return;
          s.baselineKnown=true;
          const revision=s.revision;
          const game=mergeGameData(s.game,cloudGameData(row));
          if(!await writeGameRow(client,s.userId,row,game)) {
            if(++conflicts>=3) throw new Error('Progress changed elsewhere. Retry to sync.');
            continue;
          }
          if(!current(s))return;
          s.game=mergeGameData(s.game,game);
          s.dirty=s.revision!==revision;
          cache(s); applyData(s.game,s.userId);
        }
        status(s,'saved');
      } catch { status(s,'offline'); } // journal remains dirty; retry is safe
      finally { s.job=null; }
    })();
    return s.job;
  }
  return {
    reset() { scope=null; },
    async load(userId) {
      if(!userId)return;
      if(scope?.userId===userId) return scope.loadJob;
      const s={userId,game:emptyGameData(),dirty:false,revision:0,baselineKnown:false,localSafe:!!storage,job:null}; scope=s;
      try {
        const local=JSON.parse(storage?.getItem(gameCacheKey(userId)) || 'null');
        if(local?.userId===userId && local.game?.curriculumId===CURRICULUM_ID && local.baselineKnown===true) {
          s.game=sanitiseGameData(local.game);s.dirty=local.dirty===true;s.baselineKnown=true;
          applyData(s.game,userId);
        }
      } catch { s.localSafe=false; }
      status(s,'loading');
      s.loadJob=(async()=>{
        try {
          const row=await readGameRow(client,userId);if(!current(s))return;
          s.game=s.dirty?mergeGameData(s.game,cloudGameData(row)):cloudGameData(row);
          s.baselineKnown=true;cache(s);applyData(s.game,userId);
          status(s,s.dirty?'offline':'saved');
          if(s.dirty) await flush(s);
        } catch { status(s,s.baselineKnown?'offline':'load-error'); }
      })();
      return s.loadJob;
    },
    save(userId) {
      const s=scope;if(!s || s.userId!==userId || !s.baselineKnown)return Promise.resolve(false);
      s.game=sanitiseGameData(getData());s.dirty=true;s.revision++;cache(s);applyData(s.game,userId);
      // Don't race initial hydration. A mutation against cached state joins its merge.
      return Promise.resolve(s.loadJob).then(()=>flush(s));
    },
    async retry() {
      const s=scope;if(!s)return;
      if(s.status==='saved' && !s.dirty)return;
      if(!s.baselineKnown){ scope=null;return this.load(s.userId); }
      if(s.loadJob) await s.loadJob;
      if(s.dirty)return flush(s);
      // A cached offline read also needs a fresh baseline even if nothing was edited.
      scope=null;return this.load(s.userId);
    },
  };
}
