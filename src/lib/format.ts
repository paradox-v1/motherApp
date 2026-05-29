import type { Unit } from "../db";

export function money(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(isFinite(n) ? n : 0);
}

/** Turns "2026-05-29" into "Fri, May 29" for easy reading. */
export function prettyDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

const UNIT_LABELS: Record<Unit, string> = {
  each: "ea",
  gram: "g",
  kg: "kg",
  ounce: "oz",
  pound: "lb",
  cup: "cup",
  tbsp: "tbsp",
  tsp: "tsp",
  ml: "ml",
  liter: "L",
};

export function unitLabel(unit: Unit): string {
  return UNIT_LABELS[unit] ?? unit;
}

export const ALL_UNITS: Unit[] = [
  "each",
  "gram",
  "kg",
  "ounce",
  "pound",
  "cup",
  "tbsp",
  "tsp",
  "ml",
  "liter",
];

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
