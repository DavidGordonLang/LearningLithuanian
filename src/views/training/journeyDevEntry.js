// Only Vercel's unique dev previews and localhost expose the Journey editor.
// Never show editor entry points on zodis.app or stable production aliases.
const DEV_PREVIEW_HOST=/^learning-lithuanian-(?:git-dev|[a-z0-9]{9})-davids-projects-25f8617a\.vercel\.app$/;
export function canShowDevJourneyEntry(hostname){
  const host=String(hostname||'').toLowerCase();
  return host==='localhost'||host==='127.0.0.1'||DEV_PREVIEW_HOST.test(host);
}
export function wantsDevJourneyFromUrl(search){
  const params=new URLSearchParams(search||'');
  return params.get('journeyDev')==='1' && params.get('legacyEditor')!=='1';
}
