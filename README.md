# FIX3D.CO — landing page

Static site on **Cloudflare Pages**. No build step, no dependencies, no framework —
`index.html` is the whole page (inline CSS + inline JS). The one dynamic piece is
`functions/api/repair.js`, which stores repair requests in a **D1** database.

Campaign: **PRINT HAPPENS.** The marketing is funny; the repair work is not a joke.

```
index.html            the landing page
social.html           7 ready-to-export ad frames (1080×1350 / 1080 / 1920)
ad-copy.md            Facebook/Instagram ad copy
ASSETS.md             what each photo is, and what still needs shooting
tools/build-images.sh regenerates every WebP + JPEG derivative from masters
tools/og.html         source for the 1200×630 share card
tools/parked-before-after.html  the before/after component, removed from the page for now
images/               failed-prints/ · before-after/ · repairs/ · social/

functions/api/repair.js  POST endpoint — validates, then inserts into D1
schema.sql               the repair_requests table
wrangler.toml            Pages project + D1 binding
_headers                 cache policy, noindex on working files
```

Local preview (static only):

```bash
python3 -m http.server 8000
```

Local preview **with the form working** — runs the function against a local D1:

```bash
npx wrangler d1 execute fix3d-leads --local --file=schema.sql
npx wrangler pages dev .
```

Deploy:

```bash
npx wrangler pages deploy .
```

---

## The repair form

Submissions POST as `multipart/form-data` to `/api/repair`
(`functions/api/repair.js`) and land in the **fix3d-leads** D1 database.

Everything is re-validated server-side — the browser checks are for the customer's
benefit, not ours. Invalid submissions get a 422 naming the bad fields. A hidden
honeypot (`company`) is answered with `200 {ok:true}` so bots think they succeeded,
but nothing is stored. Queries are parameterised and `issue` / `service` are checked
against allowlists.

Every row carries its campaign attribution — `utm_source`, `utm_medium`,
`utm_campaign`, `utm_content`, `utm_term`, `fbclid`, `referrer`, `landing_page`,
plus `cf-ipcountry` — so the table tells you which ad produced the lead.

### Reading the leads

```bash
npx wrangler d1 execute fix3d-leads --remote \
  --command "SELECT created_at, name, phone, email, zip, issue, service, utm_campaign FROM repair_requests WHERE status='new' ORDER BY id DESC"
```

`status` is `new` on insert; move it through `contacted` / `scheduled` / `done` / `junk`:

```bash
npx wrangler d1 execute fix3d-leads --remote --command "UPDATE repair_requests SET status='contacted' WHERE id=1"
```

Schema changes: edit `schema.sql`, then run it with `--remote`.

## Still to connect

### `metaPixelId` — needed for ad optimisation

Get it from Meta Events Manager (a 15–16 digit number) and set it in the
`FIX3D_CONFIG` block at the bottom of `index.html`. The pixel then loads itself;
leave it `null` and no pixel code runs at all. Events already wired:

| Event | Type | Fires when |
|---|---|---|
| `PageView` | standard | page load |
| `RepairFormStart` | custom | first keystroke in the repair form |
| `Lead` | **standard** | successful submission — *optimise the campaign for this* |
| `RepairFormSubmit` | custom | same moment, for reporting |
| `CTAClick` | custom | any "Fix my printer" button |
| `FailureCardClick` | custom | a failure card in "What did it do?" |

Every call goes through a wrapper that no-ops when the pixel is absent.

### Photo uploads

`uploadsEnabled` is `false`. The file input is visible and usable, but files are
stripped before the POST, because D1 stores rows and not blobs. Turning this on
means adding an **R2** bucket, uploading each file in the function, and storing the
object keys against the request. Until then, customers describe the fault in words.

## Also still placeholder

- **F-06 "Won't turn on"** uses a candid workshop frame rather than a studio shot, so it
  reads darker than the other five cards. See `ASSETS.md`.

The before/after repair log has been **removed from the page for now** — it had no real
case to show, and a fabricated one is not an option. The component is parked intact in
`tools/parked-before-after.html` with instructions for putting it back once there's a
documented repair to put in it.

Every image on the page is now real photography. Nothing on it is a placeholder.
- **Contact details.** No phone number, address, price, turnaround time, warranty or
  testimonial appears anywhere, because none were supplied. Structured data deliberately
  omits `telephone`, `address` and `aggregateRating` for the same reason — add them only
  when they're real.

---

## Design system, briefly

Chaos → order. The failed prints carry all the colour and complexity; the interface stays
black, off-white and one safety yellow (`#F5C518`), with a hard grid and technical labels.
Campaign sections are black with full-bleed photography; the sections that build technical
credibility invert to off-white "service manual" pages.

Type: Archivo Black (display), Archivo (UI), JetBrains Mono (labels and annotations).

Because the masters are 4:5 portrait, the hero, both meme interrupts and the service-area
band are **split layouts** (copy panel beside the photo) rather than full-bleed banners —
a wide crop of a 4:5 frame would discard most of the picture. The meme interrupts come in
two treatments so both lighting worlds work: dark candid photos keep reversed type, studio
shots on white flip to black type on an off-white ground (`.meme-light`).

Accessibility: semantic landmarks, skip link, visible focus rings, real form labels with
`aria-invalid` + `aria-describedby` errors, `role="status"` submission messages, keyboard
reachable everything, and a full `prefers-reduced-motion` path that disables the ticker,
reveals and transitions.

## Conversion capture update (pending production approval)

The hero now links to a consultation request form. Visitors provide email and a
preferred time in Eastern Time; this is a request, not an automatically booked
appointment. A separate email-only form requests a repair follow-up, not marketing
subscription. Both POST to `/api/contact`, with attribution stored in
`contact_requests`. Read these requests in D1 and follow up manually; no outgoing
email notification or calendar integration is configured.

Repair Leads require a JSON acceptance receipt matching the submission ID.
Honeypots never generate conversion events. Retry IDs are unique in D1.
EmailCapture and ConsultationRequest are separate custom events, not repair Leads.
Meta remains disabled until the verified account Pixel ID is supplied.

### Proposed deployment sequence — do not run without approval

1. Back up the existing D1 schema. On a separate local/test database, apply
   `migrations/0001_conversion_capture.sql` once for an existing installation.
   For a fresh database use `schema.sql` instead; do not run both.
2. Run `node tests/conversions.mjs`. These tests use synthetic in-memory mocks,
   never production storage or Meta. Preview desktop/mobile UI and exercise
   the full forms against an isolated test D1 before publishing.
3. With approval, apply the migration once to the production database, then
   deploy this branch to the existing Cloudflare Pages project. No live test
   leads are needed. Confirm deployed source and inspect aggregate results.
4. Configure the verified Meta Pixel ID separately, with appropriate tracking
   permissions, and validate event receipt in an isolated test dataset first.

The additive migration preserves existing repair rows. Roll back frontend/functions
together if necessary; keep the added table and column to preserve captured data.

### Privacy-preserving source check

Use the same dates as Cloudflare's milestone and inspect referrers, countries,
landing paths, and available bot/human classifications in Analytics. D1 only has
attribution for submissions, not all visits. Run aggregate queries, not SELECT *:

```sql
SELECT utm_source, utm_medium, utm_campaign, COUNT(*) AS requests
FROM repair_requests
GROUP BY utm_source, utm_medium, utm_campaign
ORDER BY requests DESC;

SELECT kind, status, COUNT(*) AS requests
FROM contact_requests GROUP BY kind, status;
```

Do not publish small-cell or personally identifying results. No revenue or paid
customer tracking, CAPI delivery, or automatic appointment confirmation is added.
