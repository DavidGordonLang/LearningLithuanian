// One owner for pending and active playback. Preloading stays outside this owner.
export function createAudioPlayback({ createAudio = (url) => new Audio(url), urls = URL } = {}) {
  let generation = 0;
  let active = null;
  const stop = () => {
    generation += 1;
    active?.finish();
  };
  const play = async (load, onError) => {
    stop();
    const request = generation;
    try {
      const blob = await load();
      if (!blob || request !== generation) return;
      const url = urls.createObjectURL(blob);
      let audio;
      try { audio = createAudio(url); } catch (error) { urls.revokeObjectURL(url); throw error; }
      await new Promise((resolve, reject) => {
        let finished = false;
        const entry = { finish(error) {
          if (finished) return;
          finished = true;
          audio.onended = null;
          audio.onerror = null;
          try { audio.pause(); } catch {}
          urls.revokeObjectURL(url);
          if (active === entry) active = null;
          error ? reject(error) : resolve();
        } };
        active = entry;
        audio.onended = () => entry.finish();
        audio.onerror = () => entry.finish(new Error("Audio playback failed"));
        try { Promise.resolve(audio.play()).catch((error) => entry.finish(error)); }
        catch (error) { entry.finish(error); }
      });
    } catch (error) {
      if (request === generation) onError?.(error);
    }
  };
  return { play, stop };
}
