# monis workspace builder

Build your remote-work setup inside a 3D Bali villa, watch it come together, and rent it.

A prototype configurator for [monis.rent](https://monis.rent), who rent desks, chairs, screens and everything else a workspace needs to nomads and startups in Bali. Instead of scrolling a catalog, you pick a desk, a chair and your gear, and each piece drops into the room as you choose it.

## What you can do

- **Pick a desk and a chair.** Three real desks (the 3D desk changes with the size you pick) and three real chairs.
- **Add up to three screens.** They line up on the desk and the side screens angle in toward you, from a 24" office monitor to a curved 34" ultrawide or the Studio Display.
- **Add desk gear and room extras.** Keyboards, mice, a MacBook in four colours, lamps, a light bar, webcam, podcast mic, coffee machine, fan, dehumidifier, walking pad, whiteboard, Starlink and a few plants.
- **Sit or stand.** The desk rises, the walking pad slides underneath and the chair rolls out of the way.
- **See it at any hour.** The villa's light follows the current time in Bali. Drag the clock to preview your setup at sunrise or at night, when the lamps and screens light up the room. A dark room without a lamp gets a gentle hint.
- **Start fast.** Load one of monis's four real bundles, or press Surprise me.
- **Click anything in the room** to jump straight to it in the panel. The "+" pins in the room open the matching category.
- **Rent it.** Choose a rental period (weekly or monthly rates), then review everything on one page: a postcard of your room, every item with its price and a link to its monis.rent page, delivery area, date and time window, and your contact details.
- **Share it.** The address bar always holds your exact setup, so a link opens the same room for anyone.

## About the product data

- Names, weekly and monthly prices and photos come from the public monis.rent catalog (September 2026). Monthly plans are shown per week as the monthly price divided by four, which is how monis.rent quotes them.
- The Bali catalog lists one chair, so the Furradec Haru Plus and Modena Anya come from monis's Chiang Mai catalog.
- Plants are marked as a concept in the app because monis doesn't rent them yet. Their thumbnails are renders of the 3D models.
- Checkout is a demo. No payment is taken and no order is sent.

## How it's built

- React 19, TypeScript and Vite
- three.js through React Three Fiber and drei, with a bloom pass from postprocessing
- zustand for state, with the setup mirrored into the URL
- Every 3D model is built from primitives in code, and surfaces like terrazzo, rattan, teak, screen content and keyboards are painted onto canvases at runtime, so the scene ships with no model or texture files
- The 3D engine loads in its own chunks, so the panel is usable before the villa finishes loading
- Respects `prefers-reduced-motion`, works with a keyboard, and falls back to a message if WebGL isn't available

## Run it locally

Requires Node 18.18 or newer.

```bash
npm install
npm run dev
```

`npm run build` type-checks and writes a static site to `dist/`. `npm run preview` serves that build.

## Deploy your own copy

The build is a plain static site with no environment variables or server code, so it runs on any static host.

**Vercel:** in your Vercel dashboard choose Add New, then Project, import this repository and press Deploy. `vercel.json` already sets the Vite preset. With the Vercel CLI, run `vercel` inside the project folder instead. The CLI creates a `.vercel/` link for your own account, and that folder is git-ignored.

**Netlify, Cloudflare Pages and others:** build command `npm run build`, output directory `dist`.

## Project layout

```
src/
  data/catalog.ts      products, variants, prices and the four bundles
  state/store.ts       setup state, pricing totals and share links
  lib/                 pricing, Bali time, UI sounds
  scene/               the 3D villa
    Scene.tsx          canvas, sun and sky driven by the hour, camera, bloom, postcard capture
    Room.tsx           floor, walls, shelf, credenza, floor lamp
    Garden.tsx         terrace, pool, palms and planting
    Workspace.tsx      places each chosen product on or around the desk
    models/            desks, chairs, monitors, desk gear, room gear, plants
  ui/                  panel, dock, top bar, checkout, confirmation
public/products/       product photos
```
