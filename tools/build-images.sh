#!/usr/bin/env bash
# FIX3D image pipeline.
# Takes full-resolution masters and produces the WebP + JPEG derivatives the site uses.
#
#   ./tools/build-images.sh /path/to/masters
#
# Expects masters named exactly like the outputs below (any extension). Every photo on
# the site is a <picture> with a WebP source and a JPEG fallback, both generated here —
# so to swap a photo, replace the master and re-run this. Requires cwebp + ImageMagick:
#   brew install webp imagemagick
set -euo pipefail

SRC="${1:?usage: build-images.sh <masters-dir>}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# name|master|width|quality
JOBS="
failed-prints/hero-dragon|99_percent_failure|1100|82
failed-prints/f01-spaghetti|01_spaghetti_electric_blue|760|80
failed-prints/f02-blob|02_blob_of_death_safety_orange|760|80
failed-prints/f03-adhesion|05_bad_first_layer_red|760|80
failed-prints/f04-layer-shift|03_layer_shift_acid_green|760|80
failed-prints/f05-no-extrusion|07_extrusion_failure_yellow|760|80
failed-prints/f06-no-power|11_workshop_crime_scene|760|80
failed-prints/m01-half-a-face|14_half_a_face|1100|82
failed-prints/m01-overnight|09_the_morning_coffee_reaction|1100|82
failed-prints/m02-benchy|08_benchy_shipwreck|1100|82
repairs/print-farm|05_print_farm_problem_child|1100|82
social/ad-one-sad-strand|04_one_sad_strand|1080|84
social/ad-youtube-tutorial|06_ill_fix_it_myself|1080|84
"

echo "$JOBS" | while IFS='|' read -r out master w q; do
  [ -z "$out" ] && continue
  file="$(find "$SRC" -type f -iname "*${master}*" | head -1)"
  if [ -z "$file" ]; then echo "  MISSING master for $out ($master)"; continue; fi
  mkdir -p "$ROOT/images/$(dirname "$out")"
  magick "$file" -resize "${w}x>" -strip -quality "$q" "$ROOT/images/$out.jpg"
  cwebp -quiet -q "$q" -resize "$w" 0 "$file" -o "$ROOT/images/$out.webp"
  printf "  %-38s %6sk jpg  %6sk webp\n" "$out" \
    "$(( $(wc -c < "$ROOT/images/$out.jpg") / 1024 ))" \
    "$(( $(wc -c < "$ROOT/images/$out.webp") / 1024 ))"
done
echo "done"
