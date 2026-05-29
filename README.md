# Mother's Cakes 🧁

A simple, phone-friendly dashboard for a home cake baker to track **orders**,
**recipes**, **ingredient costs**, and **profit**.

Built to be used by someone who is **not technically inclined**, on a **Samsung
phone**, with large buttons, plain language, and no logins. It installs to the
home screen like a normal app and works **offline**.

> Looking for the why-behind-the-tech? See [`docs/STACK.md`](docs/STACK.md).
> Setting it up for your mom? See [`docs/USER_GUIDE.md`](docs/USER_GUIDE.md) and
> [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

---

## What it does

- **Home dashboard** — money sold and profit this month, how many cakes are
  still to make, and what's coming up.
- **Orders** — full history with customer, cake, due date, price, and profit.
  Mark orders *to make → done* and *paid / not paid*.
- **What you'll need** — every order lists the exact ingredients and amounts
  ("4 eggs, 300 g flour…") scaled to the quantity ordered.
- **Cakes (recipes)** — define a cake once with its recipe and selling price;
  cost-to-make and profit are calculated automatically.
- **Pantry (ingredients)** — a price list pre-filled with typical Walmart
  grocery prices. Change any price and every cake's cost updates instantly.
- **Backup / Restore** — one tap saves all data to a file (email it to
  yourself or save to Google Drive); restore it on a new phone.

## A note on "live Walmart / Walgreens prices"

There is **no public, legal way** to pull live Walmart or Walgreens prices into
an app — neither store offers a public price API, and scraping their websites
violates their terms and breaks constantly. So instead the app ships with
**realistic typical Walmart grocery prices already filled in**, and makes every
price a single tap to edit. This is reliable and keeps the math accurate without
depending on a brittle, unauthorized scraper.

---

## Run it locally (for a developer)

Requires Node.js 18+.

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check + build into dist/
npm run preview  # preview the production build
```

The build output in `dist/` is a plain static site — host it anywhere
(see [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)).

## Project layout

```
src/
  db.ts                 Local database (Dexie / IndexedDB) + types + cost helper
  seed.ts               Starter ingredients (Walmart prices), cakes, sample orders
  lib/format.ts         Money, date, and unit formatting helpers
  lib/backup.ts         Export / import all data as a JSON backup file
  components/           BottomNav + shared UI (buttons, cards, fields)
  pages/                Dashboard, Orders, OrderForm, OrderDetail,
                        Cakes, CakeForm, Ingredients, Settings
public/                 App icons (PWA)
docs/                   Stack, user guide, and deployment docs
```
