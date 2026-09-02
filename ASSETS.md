# FIX3D — image assets

All site photography is **real** — there is no placeholder imagery left on the page.
The before/after repair log was removed for now (component parked in
`tools/parked-before-after.html`); its two placeholder frames stay in
`images/before-after/` so it can be restored.

Masters are 4:5 portrait (1664×2080). That ratio drives the layout: the hero, the meme
interrupts and the service-area band are all **split** rather than full-bleed, because
cropping a 4:5 master into a 2:1 banner throws away most of the frame. It is also the
native Instagram/Facebook feed ratio, so the same masters feed the ads unmodified.

## Regenerating derivatives

Every photo ships as a `<picture>` with a WebP source and a JPEG fallback, both built by:

```bash
./tools/build-images.sh /path/to/masters
```

Requires `brew install webp imagemagick`. To swap a photo: replace the master, re-run.
Masters are **not** committed — keep them wherever the originals live.

## What's on the page

| Slot | File | Shot |
|---|---|---|
| Hero | `failed-prints/hero-dragon` | Yellow dragon, perfect except its head printed as a spaghetti nest. The headline is a caption, not a joke — and the filament is the brand yellow. |
| F-01 Spaghetti | `failed-prints/f01-spaghetti` | Electric blue nest on the bed |
| F-02 Blob of death | `failed-prints/f02-blob` | Hotend encased in an orange blob |
| F-03 Won't stick | `failed-prints/f03-adhesion` | Red first layer lifting off a black bed |
| F-04 It shifted | `failed-prints/f04-layer-shift` | Green bust with a hard lateral shift |
| F-05 Nothing comes out | `failed-prints/f05-no-extrusion` | Nozzle producing nothing but a wisp while the print starves out |
| F-06 Won't turn on | `failed-prints/f06-no-power` | Printer opened up, electronics exposed |
| Meme 01 | `failed-prints/m01-half-a-face` | Blue David bust: one half flawless, one half collapsed into stringing. Pairs with "It was fine when I went to bed" — the picture *is* the before and after. |
| Meme 02 | `failed-prints/m02-benchy` | Three wrecked Benchys on a bed |
| Service area | `repairs/print-farm` | Printer rack with one machine full of pink spaghetti |
| Share card | `social/og-image.jpg` | 1200×630, generated from `tools/og.html` |

Held for ads, not on the page: `failed-prints/m01-overnight` (morning light, coffee in hand,
overnight spaghetti volcano — used by AD-02 and AD-07), `social/ad-one-sad-strand`,
`social/ad-youtube-tutorial`. The David is shared between the site and AD-03, so it lives in
`failed-prints/` and there is only one copy of it.

**Retired:** the F-07 "I have no idea" card was removed from the grid, leaving a clean 3×2.
The *option* still exists in the repair form (and the FAQ still points at it), so a customer
who can't name the fault still has a path — it just no longer needs a photo of its own.

### Focal points

Masters whose subject isn't centred carry a focal class so the square / landscape crops
don't cut them: **m02-benchy** uses `fp-b` (boats sit low), **f05-no-extrusion** uses `fp-t`
(the nozzle sits at the top and is the whole point of the shot). If you swap a photo whose
subject isn't centred, add `fp-b` or `fp-t`.

## Still to shoot

1. **A real before/after case** — `before-after/case-01-before` and `-after`, 1:1, identical
   framing and lighting. The section is off the page until one exists; never publish a
   fabricated case.
2. **F-06 "Won't turn on"** — the one card using a candid workshop frame rather than a studio
   shot, so it reads slightly darker than its six neighbours. A studio shot of a dead screen
   or an opened electronics bay, lit like batch 1, would make the row uniform.
3. **Bench / process photography** for `repairs/` — hands on the machine, parts out, diagnosis.
   Needed before any real case study.

Shooting rules that keep the set coherent: hard single key, deep shadow, the failure is the
only colour in frame, and leave one side of the frame quiet — headlines sit beside the
subject, never on top of it.

## Lines

On the site: *This was supposed to be a dragon.* · *It was fine when I went to bed.* ·
*The boat has sunk.* · *You've leveled the bed fourteen times. Maybe it isn't the bed.*

In `social.html`: *We've seen worse.* · *Nothing comes out.* ·
*You don't need another YouTube tutorial.* · *Spaghetti belongs on a plate.*

Banked, unused: *New hotend just dropped.* ·
*Estimated print time: 6 hours. Estimated emotional recovery: 3–5 business days.*
