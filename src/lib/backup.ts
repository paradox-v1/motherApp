import { db, type Ingredient, type Cake, type Order } from "../db";

interface BackupFile {
  app: "mothers-cakes";
  version: 1;
  exportedAt: string;
  ingredients: Ingredient[];
  cakes: Cake[];
  orders: Order[];
}

/** Save everything to a .json file the user can keep in their phone / email / Drive. */
export async function downloadBackup(): Promise<void> {
  const [ingredients, cakes, orders] = await Promise.all([
    db.ingredients.toArray(),
    db.cakes.toArray(),
    db.orders.toArray(),
  ]);

  const data: BackupFile = {
    app: "mothers-cakes",
    version: 1,
    exportedAt: new Date().toISOString(),
    ingredients,
    cakes,
    orders,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mothers-cakes-backup-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Replace all current data with the contents of a backup file. */
export async function restoreBackup(file: File): Promise<void> {
  const text = await file.text();
  const data = JSON.parse(text) as Partial<BackupFile>;

  if (data.app !== "mothers-cakes" || !Array.isArray(data.ingredients)) {
    throw new Error("That file is not a Mother's Cakes backup.");
  }

  await db.transaction("rw", db.ingredients, db.cakes, db.orders, async () => {
    await Promise.all([
      db.ingredients.clear(),
      db.cakes.clear(),
      db.orders.clear(),
    ]);
    await db.ingredients.bulkAdd(data.ingredients as Ingredient[]);
    await db.cakes.bulkAdd((data.cakes ?? []) as Cake[]);
    await db.orders.bulkAdd((data.orders ?? []) as Order[]);
  });
}
