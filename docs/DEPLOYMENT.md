# Deployment Guide

The app builds to a folder of plain static files (`dist/`). You can host it for
**free** on any static host. Below are the two easiest options, plus how your
mom installs it afterward.

## Build the app

```bash
npm install
npm run build
```

This produces a `dist/` folder containing everything: HTML, CSS, JS, the service
worker, and the app icons.

> **Important for PWA:** the site must be served over **HTTPS** for offline
> install to work. All the hosts below give you HTTPS automatically.

---

## Option A — Netlify (drag & drop, no command line)

1. Go to <https://app.netlify.com/drop>.
2. Drag the `dist/` folder onto the page.
3. Netlify gives you a public HTTPS link (e.g. `https://mothers-cakes.netlify.app`).
4. Send that link to your mom's phone.

To update later, run `npm run build` again and re-drag the new `dist/` folder
(or connect the GitHub repo for automatic builds).

## Option B — Vercel (connect the GitHub repo)

1. Push this repo to GitHub.
2. At <https://vercel.com/new>, import the repository.
3. Vercel auto-detects Vite. Confirm:
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
4. Deploy. You get an HTTPS link, and every push rebuilds automatically.

## Option C — GitHub Pages

GitHub Pages serves from a subpath, so set Vite's `base` first.

1. In `vite.config.ts`, add `base: "/motherApp/"` (use your repo name).
2. `npm run build`.
3. Publish the `dist/` folder to the `gh-pages` branch (e.g. with the
   `gh-pages` npm package or a GitHub Action).

> The app already uses **HashRouter**, so navigation works on GitHub Pages
> without any extra redirect/404 configuration.

---

## Installing it on the Samsung phone

Once you have the HTTPS link, on the phone:

1. Open the link in **Samsung Internet** or **Chrome**.
2. Menu (⋮ / ≡) → **Add page to → Home screen** (or **Install app**).
3. Tap **Add**. The cupcake icon appears on the home screen.

See [`USER_GUIDE.md`](USER_GUIDE.md) for the full walkthrough aimed at the user.

## Updating the app later

- Rebuild (`npm run build`) and redeploy with your chosen host.
- The service worker is set to **auto-update**: next time mom opens the app
  with internet, it quietly fetches the new version. Her data is untouched —
  it lives in the phone's database, separate from the app code.

## Backups vs. deployment (don't confuse them)

- **Deploying** updates the *app* (the screens and features).
- **Backups** (Settings → Save a backup file) protect the *data* (orders,
  recipes). Redeploying never touches her data, but losing/resetting the phone
  would — so keep backups regardless of how you host.
