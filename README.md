# FIX3D.CO — landing page

Static site. No build step, no dependencies, no framework. `index.html` is the whole page
(inline CSS + inline JS). Drop the folder on any host — Netlify, Vercel, Cloudflare Pages,
GitHub Pages, S3 — and it works.

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
```

Local preview:

```bash
python3 -m http.server 8000
```

---

## Before this goes live — 3 things to connect

All three live in **one config block** at the bottom of `index.html`. Nothing is
hardcoded anywhere else, and no fake IDs, endpoints or credentials exist in this repo.

```js
window.FIX3D_CONFIG = {
  formEndpoint: null,   // form backend
  metaPixelId:  null,   // Meta pixel
  uploadsEnabled: false // photo uploads
};
```

### 1. `formEndpoint` — required, the site cannot take leads without it

The old `mailto:` form is **gone on purpose**: it dropped leads whenever the visitor had
no mail client configured, which on Facebook mobile traffic is most of them.

Until you set an endpoint the form validates normally, then refuses to submit and says so
on screen. It never fails silently.

Pick any backend that accepts a POST of `multipart/form-data` and set the URL:

| Service | Endpoint looks like | Free-tier file uploads |
|---|---|---|
| Formspree | `https://formspree.io/f/xxxxxxxx` | paid plans |
| Netlify Forms | your own `/` path + `data-netlify` | yes |
| Getform | `https://getform.io/f/xxxxxxxx` | yes |
| Basin | `https://usebasin.com/f/xxxxxxxx` | yes |
| Web3Forms | `https://api.web3forms.com/submit` (+ `access_key` field) | yes |

The form posts every field plus campaign attribution: `utm_source`, `utm_medium`,
`utm_campaign`, `utm_content`, `utm_term`, `fbclid`, `referrer`, `landing_page`.
So the inbox tells you which ad produced the lead. A hidden honeypot field (`company`)
silently absorbs bots.

### 2. `metaPixelId` — needed for ad optimisation

Get it from Meta Events Manager (a 15–16 digit number). Paste it in and the pixel loads
itself; leave it `null` and no pixel code runs at all. Events already wired:

| Event | Type | Fires when |
|---|---|---|
| `PageView` | standard | page load |
| `RepairFormStart` | custom | first keystroke in the repair form |
| `Lead` | **standard** | successful submission — *optimise the campaign for this* |
| `RepairFormSubmit` | custom | same moment, for reporting |
| `CTAClick` | custom | any "Fix my printer" button (`header`/`hero`/`meme-1`/`meme-2`/`final`/`sticky`) |
| `FailureCardClick` | custom | a failure card in "What did it do?" |

Every call goes through a wrapper that no-ops when the pixel is absent, so nothing throws.

### 3. `uploadsEnabled` — photo uploads

Left `false` because whether photos survive depends entirely on the backend you choose.
The file input is visible and usable, but files are stripped from the POST until you flip
this to `true` on a plan that stores them. Turn it on and re-test with a real photo.

---

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
