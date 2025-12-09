# PWA Icon Generation Instructions

To complete PWA setup, generate icons from the base SVG:

## Option 1: Online Tool (Easiest)
1. Go to https://realfavicongenerator.net/
2. Upload `icon-base.svg`
3. Download and extract icons to this folder

## Option 2: Using ImageMagick (Command Line)
```bash
# Install ImageMagick first
# Then run:
for size in 72 96 128 144 152 192 384 512; do
  convert icon-base.svg -resize ${size}x${size} icon-${size}x${size}.png
done
```

## Option 3: Use Your Logo
Replace `icon-base.svg` with your actual logo and regenerate.

## Required Sizes
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png
