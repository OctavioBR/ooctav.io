# 0003 — Hobby archive: a static photo gallery built from folders

- **Status:** Accepted
- **Date:** 2026-11-10

## Context

We want a `/hobby/` page that shows board game night photos. The layout follows the "Table Night" gallery at <https://meeple-gallery-shelf.lovable.app/>: a masonry grid of cards, each with a photo, the game name and a `#NN` number.

Requirements:

- One card per game.
- Hovering a card cycles through that game's photos.
- Clicking a card opens a modal with a short, funny blurb and the current photo's metadata (date and location when known).
- Clicking the photo in the modal shows the next one.

The site is static, and ships as little JS as possible (ADR-0001). The photos come straight from iPhones as JPEG, HEIC and one MOV video.

## Decision

### Folders are the data

- Each folder in `src/assets/photos/Boardgames/<Game name>/` is one game. The folder name is the card title.
- `src/lib/boardgames.ts` collects the images with `import.meta.glob`, at build time. Adding a game means adding a folder. There is no list to update.
- Blurbs are kept by hand in the `BLURBS` map in the same file, keyed by folder name. Games without one get a generic line.
- Games are ordered by their newest photo, and photos within a game newest first. Undated items go last.

### Metadata comes from EXIF, at build time

- The `exifr` devDependency reads each image at build time. It gets a `Buffer`, because its own file reader crashes on Node 26.
- `reviveValues: false` keeps `DateTimeOriginal` as the camera's local wall time, with no timezone shift. That time is what the page shows.
- The modal also shows the camera model, the exposure and the file name.
- **Location is city level only.** Coordinates go through `place()`, which turns anything near Florianópolis into "Florianópolis, Brazil". We never publish the exact coordinates or the suburb.
- Most iPhone exports here have no GPS. Only the HEIC originals had it, so most photos show "Location: Unknown". Six images have no EXIF at all and show "Date unknown".

### Formats

- **HEIC:** sharp can't decode it. Each HEIC was converted once to a `.jpg` that keeps its EXIF (`magick in.HEIC -quality 90 out.jpg`). The glob ignores `.HEIC`, so keeping or deleting the originals makes no difference to the build.
- **Video:** iPhone `.MOV` is HEVC, which Chrome and Firefox often can't play. Convert each clip once to H.264 MP4, and save a cover frame:

  ```sh
  ffmpeg -i IMG.MOV -vf "scale=-2:'min(720,ih)'" -c:v libx264 -crf 26 -preset slow \
    -pix_fmt yuv420p -an -movflags +faststart IMG.mp4      # 10 MB → 1.4 MB
  ffmpeg -ss 1 -i IMG.MOV -frames:v 1 -q:v 3 IMG.jpg        # cover frame
  ```

  - A clip is an `.mp4` next to a cover `.jpg` with the same name. Vite copies the MP4 to `/_astro/` under a hashed name (`?url` glob).
  - The conversion drops Apple's QuickTime date and GPS tags. To keep them, add a sidecar `IMG.json` with `{ "date": "YYYY:MM:DD HH:MM:SS", "latitude", "longitude" }`. Read them with `ffprobe -show_entries format_tags` before deleting the original.

### Page and interaction (`src/pages/hobby.astro`)

- **Grid:** CSS grid of **square** cards (`repeat(auto-fill, minmax(16rem, 1fr))`), newest first, read left to right. It breaks out of the 42rem body column to the full viewport width (1rem gutters), so the column count grows with the screen. Photos are cropped to the square with `object-fit: cover`. On hover, `object-position` pans from one edge to the other to reveal the cropped parts. This is off under `prefers-reduced-motion`.
- **Images:** `<Image>` from `astro:assets`. Cards use 320/480/720 px widths and the modal uses 640/1024/1600. Only the first two covers are `eager`. Modal images sit in a closed `<dialog>`, so they don't load until it opens.
- **Clips:** `<video muted loop playsinline preload="none">` with a WebP poster from `getImage`. Nothing downloads until hover or opening the modal.
- **Script:** one small inline script, the page's only JS besides analytics (ADR-0002).
  - Hovering pans the photo and cycles to the next every 3 s (one pan each), or plays the clip. Leaving resets to the first one.
  - Clicking opens the native `<dialog>` on the item that was showing.
  - In the modal, clicking the image or pressing ←/→ pages through. Clicks on a video go to its controls.
  - Esc or a click on the backdrop closes it, and closing pauses any video.
  - Without JS, the grid still shows every card.
- "Hobby" is added to `NAV` in `src/site.ts`.

## Consequences

- **Good:**
  - Adding photos means dropping files into a folder and rebuilding.
  - No runtime services, no external requests, and image sizes are optimized at build time.
  - Exact locations are never published.
- **Bad:**
  - HEIC and MOV need a manual conversion step (ImageMagick and ffmpeg, installed with `sudo apt install ffmpeg`). They don't run in the build.
  - Blurbs live in code, so a new game needs an edit to `BLURBS` to get a custom one.
  - `place()` only knows Florianópolis. Photos taken elsewhere with GPS would show rounded coordinates until a name is added.
  - The page ships a small inline script, which goes against ADR-0001's "no client JS" default.
  - The page has no Markdown twin (`/hobby.md`) yet, so `llms.txt` doesn't list it.
