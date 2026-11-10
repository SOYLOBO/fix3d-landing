/**
 * POST /api/repair — receives a repair request and stores it in D1.
 *
 * The page posts multipart/form-data. Everything is re-validated here: the
 * browser checks are for the customer's benefit, not ours.
 *
 * Binding: DB (d1_databases in wrangler.toml)
 */

const ISSUES = new Set([
  'spaghetti', 'blob', 'adhesion', 'layer-shift',
  'no-extrusion', 'no-power', 'maintenance', 'unknown',
]);
const SERVICES = new Set(['Drop-off', 'On-site', 'Not sure']);

const MAX = {
  name: 120, phone: 40, email: 200, zip: 10,
  make: 80, model: 80, issue: 40, details: 4000, service: 20,
  utm: 200, referrer: 500, landing_page: 500, user_agent: 400,
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

const clean = (v, max) =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';

export async function onRequestPost({ request, env }) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: 'Expected form data.' }, 400);
  }

  // Honeypot: bots fill every field, the real form keeps this empty and hidden.
  // Answer 200 so the bot believes it succeeded, but store nothing.
  if (clean(form.get('company'), 100) !== '') return json({ ok: true, accepted: false });

  const f = {
    name:    clean(form.get('name'), MAX.name),
    phone:   clean(form.get('phone'), MAX.phone),
    email:   clean(form.get('email'), MAX.email),
    zip:     clean(form.get('zip'), MAX.zip),
    make:    clean(form.get('make'), MAX.make),
    model:   clean(form.get('model'), MAX.model),
    issue:   clean(form.get('issue'), MAX.issue),
    details: clean(form.get('details'), MAX.details),
    service: clean(form.get('service'), MAX.service),
  };

  const errors = [];
  if (f.name.length < 2) errors.push('name');
  if (f.phone.replace(/\D/g, '').length < 10) errors.push('phone');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email)) errors.push('email');
  if (!/^\d{5}$/.test(f.zip)) errors.push('zip');
  if (!ISSUES.has(f.issue)) errors.push('issue');
  if (f.details.length < 5) errors.push('details');
  if (errors.length) return json({ ok: false, error: 'Invalid fields.', fields: errors }, 422);

  if (!SERVICES.has(f.service)) f.service = 'Not sure';

  if (!env.DB) {
    console.error('[FIX3D] D1 binding "DB" is missing — check wrangler.toml.');
    return json({ ok: false, error: 'Storage is not configured.' }, 500);
  }

  const eventId = clean(form.get('submission_id'), 80);
  if (!/^[0-9a-f-]{36}$/i.test(eventId)) return json({ ok: false, error: 'Invalid submission ID.' }, 422);
  try {
    await env.DB.prepare(
      `INSERT INTO repair_requests
         (submission_id, name, phone, email, zip, make, model, issue, details, service,
          utm_source, utm_medium, utm_campaign, utm_content, utm_term,
          fbclid, referrer, landing_page, country, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(submission_id) DO NOTHING`
    ).bind(
      eventId, f.name, f.phone, f.email, f.zip, f.make, f.model, f.issue, f.details, f.service,
      clean(form.get('utm_source'), MAX.utm),
      clean(form.get('utm_medium'), MAX.utm),
      clean(form.get('utm_campaign'), MAX.utm),
      clean(form.get('utm_content'), MAX.utm),
      clean(form.get('utm_term'), MAX.utm),
      clean(form.get('fbclid'), MAX.utm),
      clean(form.get('referrer'), MAX.referrer),
      clean(form.get('landing_page'), MAX.landing_page),
      request.headers.get('cf-ipcountry') || '',
      clean(request.headers.get('user-agent'), MAX.user_agent)
    ).run();
  } catch (err) {
    // Never log customer details or raw database errors.
    console.error('[FIX3D] Repair storage failed.');
    return json({ ok: false, error: 'Could not save the request.' }, 500);
  }

  return json({ ok: true, accepted: true, event_id: eventId });
}

// Method-specific handlers don't shadow each other, so these are safe alongside
// onRequestPost. Without them an unmatched method falls through to the static
// site and someone opening /api/repair in a browser just gets the landing page.
// Note: do NOT export onRequest — that becomes the catch-all and swallows POST.
const methodNotAllowed = () =>
  new Response('Method not allowed. POST a repair request here.', {
    status: 405,
    headers: { allow: 'POST', 'content-type': 'text/plain; charset=utf-8' },
  });

export const onRequestGet = methodNotAllowed;
export const onRequestPut = methodNotAllowed;
export const onRequestPatch = methodNotAllowed;
export const onRequestDelete = methodNotAllowed;
