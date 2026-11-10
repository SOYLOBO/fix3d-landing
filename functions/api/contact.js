const json = (body, status = 200) => new Response(JSON.stringify(body), {status, headers: {'content-type':'application/json', 'cache-control':'no-store'}});
const clean = (v, n = 200) => typeof v === 'string' ? v.trim().slice(0,n) : '';
export async function onRequestPost({request, env}) {
  let f;
  try { f = await request.formData(); } catch { return json({ok:false},400); }
  if (clean(f.get('company'))) return json({ok:true,accepted:false});
  const kind = clean(f.get('kind')), email = clean(f.get('email'));
  const id = clean(f.get('submission_id'),80), time = clean(f.get('preferred_time'),300);
  if (!['email','consultation'].includes(kind) || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !/^[0-9a-f-]{36}$/i.test(id) || (kind === 'consultation' && time.length < 3)) return json({ok:false},422);
  if (!env.DB) return json({ok:false},500);
  const keys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid','referrer','landing_page'];
  try {
    await env.DB.prepare(`INSERT INTO contact_requests (event_id,kind,email,preferred_time,${keys.join(',')}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(event_id) DO NOTHING`).bind(id,kind,email,time,...keys.map(k=>clean(f.get(k),k==='landing_page'?500:200))).run();
  } catch { console.error('[FIX3D] Contact storage failed.'); return json({ok:false},500); }
  return json({ok:true,accepted:true,event_id:id});
}
export const onRequestGet = () => new Response('Method not allowed',{status:405,headers:{allow:'POST'}});
