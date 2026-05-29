# Technology Stack

This document explains **what** the app is built with and, more importantly,
**why** each choice was made given the goals:

> A dashboard for a home cake baker, used on a **Samsung phone**, by someone
> who is **not technically inclined**. Simple UI. Tracks order history,
> ingredients per order, cost-to-make, and sale price/profit.

## The big decision: a PWA, not a native app

The app is a **Progressive Web App (PWA)** — a website that can be "installed"
to the phone's home screen, runs full-screen with its own icon, and works
offline. From mom's point of view, it *is* an app: she taps the cupcake icon
and it opens, no browser bar, no internet needed.

**Why a PWA instead of a native Android app?**

| Concern | PWA (chosen) | Native Android (Kotlin/Java) |
| --- | --- | --- |
| Install for a non-technical user | Open a link → "Add to Home screen" | Play Store account, store listing, signing, review |
| Updates | Automatic, silent on next open | Manual publish + user updates |
| Cost | Free hosting (static files) | Play Store fee + build tooling |
| Maintenance | One codebase, plain web tech | Android SDK, emulators, releases |
| Works offline | Yes (service worker) | Yes |

For a single-user, single-purpose tool, a PWA delivers a native-feeling result
with a fraction of the setup and zero ongoing app-store overhead. It also runs
perfectly in **Samsung Internet** and Chrome, both standard on Samsung phones.

## The other big decision: data lives on the phone

All data (orders, cakes, ingredients) is stored **locally on the device** using
the browser's **IndexedDB** database. There is **no server, no account, no
login, no monthly bill, and no internet requirement**.

**Why local-first?**

- **Simplest for a non-technical user** — nothing to sign into, nothing to
  configure, works the moment it opens.
- **Free and zero-maintenance** — no database to host, patch, or pay for.
- **Private** — her customer list never leaves her phone.
- **Fast and offline** — works in the kitchen with no signal.

**The trade-off** is that data lives on one device. We mitigate this with a
one-tap **Backup/Restore** (export everything to a `.json` file she can email to
herself or drop in Google Drive, and reload on a new phone). If multi-device
sync ever becomes a need, see "Future options" below.

---

## The stack, layer by layer

### Language & framework
- **TypeScript** — typed JavaScript. Catches mistakes (like a misspelled field
  or wrong number type) at build time, which keeps a money-tracking app honest.
- **React 18** — the most widely used UI library; huge ecosystem and easy to
  hire help for or hand off later.

### Build tool
- **Vite 6** — extremely fast dev server and optimized production builds.
  Outputs a plain static site (HTML/CSS/JS) that can be hosted anywhere for free.

### Styling
- **Tailwind CSS v4** — utility classes for styling. Used here to enforce a
  **large-touch-target, high-contrast, mobile-first** design: big buttons,
  readable text, a warm bakery palette, and a simple bottom tab bar.

### Routing
- **React Router v6** (HashRouter) — moves between Home / Orders / Cakes /
  Pantry / Settings. HashRouter is used so deep links work even on the simplest
  static hosting with no server configuration.

### Local database
- **Dexie.js** — a friendly wrapper over **IndexedDB** (the browser's built-in
  on-device database). Handles storing/querying orders, cakes, and ingredients.
- **dexie-react-hooks** (`useLiveQuery`) — screens update **automatically** the
  moment data changes (e.g. marking an order done instantly updates the
  dashboard totals). No manual refresh logic.

### Offline / installable
- **vite-plugin-pwa** (Workbox under the hood) — generates the **service
  worker** (for offline caching) and the **web app manifest** (icons, name,
  colors) that make "Add to Home screen" work.

---

## How the pieces fit together

```
                ┌─────────────────────────────────────────┐
   Samsung      │  Home screen icon  →  PWA (full screen)  │
   phone        └─────────────────────────────────────────┘
                                │
        React + React Router (the screens & navigation)
                                │
        Tailwind CSS (big, simple, readable UI)
                                │
        Dexie + useLiveQuery  ←→  IndexedDB (data on the phone)
                                │
        vite-plugin-pwa  →  service worker (offline) + manifest (install)
```

## Data model (in `src/db.ts`)

- **Ingredient** — `name`, `unit` (each/gram/ml/tsp…), `costPerUnit`,
  optional `priceNote`.
- **Cake** — `name`, `emoji`, `basePrice`, and a `recipe` (list of
  ingredient + quantity).
- **Order** — `customerName`, the cake ordered, `quantity`, `orderDate`,
  `dueDate`, `status`, `salePrice`, `costSnapshot`, `paid`, `notes`.

**Cost & profit math:** an order's *cost to make* = the cake's recipe priced
out with current ingredient costs, times the quantity. *Profit* = sale price −
cost. The order stores a `costSnapshot` at save time so past history stays
accurate even if ingredient prices change later.

## Why not [X]?

- **Spreadsheets (Excel/Sheets):** powerful but fiddly on a phone and easy to
  break a formula. A purpose-built app with big buttons is friendlier.
- **No-code app builders:** usually require a paid account and a login, and
  lock the data in someone else's platform.
- **A cloud database + backend (Firebase/Supabase):** great for multi-device
  sync, but adds accounts, internet dependence, and (potentially) cost — extra
  weight this single-user tool doesn't need yet.

## Future options (if needs grow)

- **Cloud sync / multi-device:** swap the Dexie data layer for **Supabase** or
  **Firebase** (with simple email login). The UI and data model stay the same;
  only `src/db.ts` and the data-access calls change.
- **Photos of cakes:** store images in IndexedDB or a cloud bucket instead of
  the current emoji picture.
- **Printable shopping lists / invoices:** generate a PDF from an order's
  ingredient list.

## Dependency summary

| Package | Role |
| --- | --- |
| `react`, `react-dom` | UI framework |
| `react-router-dom` | Screen navigation |
| `dexie`, `dexie-react-hooks` | On-device database + live updates |
| `tailwindcss`, `@tailwindcss/vite` | Styling |
| `vite`, `@vitejs/plugin-react` | Build tooling |
| `vite-plugin-pwa` | Offline + installable (service worker, manifest) |
| `typescript` | Type safety |
