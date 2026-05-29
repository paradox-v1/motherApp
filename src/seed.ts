import { db, type Ingredient, type Cake, type Order } from "./db";

/**
 * Starter data so the app is useful the moment it opens.
 *
 * Prices below are TYPICAL Walmart grocery prices (US, early 2026), converted to a
 * per-unit cost. They are estimates to get mom started — she can edit any price on the
 * Ingredients screen and the cost-to-make / profit numbers update automatically.
 *
 * NOTE: There is no public/legal way to pull live Walmart or Walgreens prices into an
 * app (no public price API, and scraping their sites is against their terms and breaks
 * constantly). So we pre-fill sensible defaults and make them easy to adjust.
 */
const INGREDIENTS: Omit<Ingredient, "id">[] = [
  { name: "Eggs", unit: "each", costPerUnit: 0.29, priceNote: "~$3.48 / dozen at Walmart" },
  { name: "All-purpose flour", unit: "gram", costPerUnit: 0.0011, priceNote: "~$2.50 / 5 lb bag" },
  { name: "Granulated sugar", unit: "gram", costPerUnit: 0.00165, priceNote: "~$3.00 / 4 lb bag" },
  { name: "Butter", unit: "gram", costPerUnit: 0.0099, priceNote: "~$4.50 / lb" },
  { name: "Whole milk", unit: "ml", costPerUnit: 0.00085, priceNote: "~$3.20 / gallon" },
  { name: "Vanilla extract", unit: "tsp", costPerUnit: 0.5, priceNote: "~$4.00 / 2 oz" },
  { name: "Baking powder", unit: "tsp", costPerUnit: 0.05, priceNote: "~$2.00 / 8 oz" },
  { name: "Baking soda", unit: "tsp", costPerUnit: 0.02, priceNote: "~$1.00 / 1 lb box" },
  { name: "Salt", unit: "tsp", costPerUnit: 0.01, priceNote: "~$1.00 / 26 oz" },
  { name: "Cocoa powder", unit: "gram", costPerUnit: 0.0155, priceNote: "~$3.50 / 8 oz" },
  { name: "Powdered sugar", unit: "gram", costPerUnit: 0.0022, priceNote: "~$2.00 / 2 lb bag" },
  { name: "Cream cheese", unit: "gram", costPerUnit: 0.011, priceNote: "~$2.50 / 8 oz" },
  { name: "Heavy cream", unit: "ml", costPerUnit: 0.0074, priceNote: "~$3.50 / pint" },
  { name: "Vegetable oil", unit: "ml", costPerUnit: 0.00246, priceNote: "~$3.50 / 48 oz" },
];

function todayPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Populate the database the first time the app is ever opened. */
export async function seedIfEmpty(): Promise<void> {
  const existing = await db.ingredients.count();
  if (existing > 0) return;

  await db.ingredients.bulkAdd(INGREDIENTS as Ingredient[]);
  const all = await db.ingredients.toArray();
  const id = (name: string): number => {
    const found = all.find((i) => i.name === name);
    if (!found) throw new Error(`Seed ingredient not found: ${name}`);
    return found.id;
  };

  const cakes: Omit<Cake, "id">[] = [
    {
      name: "Classic Vanilla Cake",
      emoji: "🎂",
      basePrice: 35,
      notes: "Two 8-inch layers with vanilla buttercream.",
      recipe: [
        { ingredientId: id("All-purpose flour"), quantity: 300 },
        { ingredientId: id("Granulated sugar"), quantity: 300 },
        { ingredientId: id("Butter"), quantity: 226 },
        { ingredientId: id("Eggs"), quantity: 4 },
        { ingredientId: id("Whole milk"), quantity: 240 },
        { ingredientId: id("Vanilla extract"), quantity: 2 },
        { ingredientId: id("Baking powder"), quantity: 3 },
        { ingredientId: id("Salt"), quantity: 1 },
      ],
    },
    {
      name: "Chocolate Cake",
      emoji: "🍫",
      basePrice: 40,
      notes: "Rich chocolate layers, great with cream cheese frosting.",
      recipe: [
        { ingredientId: id("All-purpose flour"), quantity: 250 },
        { ingredientId: id("Granulated sugar"), quantity: 350 },
        { ingredientId: id("Cocoa powder"), quantity: 90 },
        { ingredientId: id("Eggs"), quantity: 3 },
        { ingredientId: id("Whole milk"), quantity: 240 },
        { ingredientId: id("Vegetable oil"), quantity: 120 },
        { ingredientId: id("Baking soda"), quantity: 2 },
        { ingredientId: id("Vanilla extract"), quantity: 2 },
        { ingredientId: id("Salt"), quantity: 1 },
      ],
    },
  ];

  await db.cakes.bulkAdd(cakes as Cake[]);
  const cakeRows = await db.cakes.toArray();
  const vanilla = cakeRows.find((c) => c.name === "Classic Vanilla Cake")!;
  const chocolate = cakeRows.find((c) => c.name === "Chocolate Cake")!;

  const orders: Omit<Order, "id">[] = [
    {
      customerName: "Maria G.",
      cakeId: vanilla.id,
      cakeName: vanilla.name,
      quantity: 1,
      orderDate: todayPlus(-12),
      dueDate: todayPlus(-7),
      status: "completed",
      salePrice: 35,
      costSnapshot: 5.59,
      paid: true,
      notes: "Birthday — wrote 'Happy 30th' on top.",
    },
    {
      customerName: "Tom's Office",
      cakeId: chocolate.id,
      cakeName: chocolate.name,
      quantity: 2,
      orderDate: todayPlus(-5),
      dueDate: todayPlus(-2),
      status: "completed",
      salePrice: 80,
      costSnapshot: 9.32,
      paid: true,
      notes: "Two cakes for a retirement party.",
    },
    {
      customerName: "Jenny R.",
      cakeId: vanilla.id,
      cakeName: vanilla.name,
      quantity: 1,
      orderDate: todayPlus(-1),
      dueDate: todayPlus(3),
      status: "pending",
      salePrice: 40,
      costSnapshot: 5.59,
      paid: false,
      notes: "Pickup Saturday morning.",
    },
  ];

  await db.orders.bulkAdd(orders as Order[]);
}
