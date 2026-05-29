import Dexie, { type EntityTable } from "dexie";

/**
 * Data model
 * ----------
 * Everything is stored locally on the phone using IndexedDB (via Dexie).
 * Nothing leaves the device unless mom taps "Backup".
 */

export type Unit =
  | "each"
  | "gram"
  | "kg"
  | "ounce"
  | "pound"
  | "cup"
  | "tbsp"
  | "tsp"
  | "ml"
  | "liter";

export interface Ingredient {
  id: number;
  name: string;
  /** The unit a recipe measures this ingredient in (e.g. "each" for eggs). */
  unit: Unit;
  /** Cost for ONE unit (e.g. cost of one egg, cost of one gram of flour). */
  costPerUnit: number;
  /** Friendly reminder of where the price came from, e.g. "$3.48 / 12 at Walmart". */
  priceNote?: string;
}

/** One line of a cake's recipe: how much of an ingredient it needs. */
export interface RecipeItem {
  ingredientId: number;
  quantity: number;
}

export interface Cake {
  id: number;
  name: string;
  /** A simple emoji used as the cake's picture (keeps things light, no uploads needed). */
  emoji: string;
  /** Suggested price to sell one cake for. */
  basePrice: number;
  recipe: RecipeItem[];
  notes?: string;
}

export type OrderStatus = "pending" | "completed" | "cancelled";

export interface Order {
  id: number;
  customerName: string;
  cakeId: number;
  /** Cake name copied at order time so history stays correct if a cake is renamed/deleted. */
  cakeName: string;
  quantity: number;
  /** ISO date strings (YYYY-MM-DD). */
  orderDate: string;
  dueDate: string;
  status: OrderStatus;
  /** Total amount the customer pays for the whole order. */
  salePrice: number;
  /** Total cost to make the whole order, captured when the order was saved. */
  costSnapshot: number;
  paid: boolean;
  notes?: string;
}

export const db = new Dexie("MothersCakesDB") as Dexie & {
  ingredients: EntityTable<Ingredient, "id">;
  cakes: EntityTable<Cake, "id">;
  orders: EntityTable<Order, "id">;
};

db.version(1).stores({
  ingredients: "++id, name",
  cakes: "++id, name",
  orders: "++id, status, dueDate, orderDate, customerName",
});

/** Total cost to make ONE of the given cake, based on current ingredient prices. */
export function cakeUnitCost(cake: Cake, ingredients: Ingredient[]): number {
  const byId = new Map(ingredients.map((i) => [i.id, i]));
  return cake.recipe.reduce((sum, item) => {
    const ing = byId.get(item.ingredientId);
    if (!ing) return sum;
    return sum + ing.costPerUnit * item.quantity;
  }, 0);
}
