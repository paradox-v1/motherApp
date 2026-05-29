import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Unit } from "../db";
import { ALL_UNITS, unitLabel } from "../lib/format";
import { Button, Card, Field, inputClass } from "../components/ui";

export default function Ingredients() {
  const ingredients = useLiveQuery(
    () => db.ingredients.orderBy("name").toArray(),
    [],
    []
  );
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState<Unit>("each");
  const [cost, setCost] = useState<number | "">("");
  const [note, setNote] = useState("");

  async function addIngredient() {
    if (!name.trim()) return;
    await db.ingredients.add({
      name: name.trim(),
      unit,
      costPerUnit: Number(cost) || 0,
      priceNote: note.trim() || undefined,
    } as never);
    setName("");
    setCost("");
    setNote("");
    setUnit("each");
    setAdding(false);
  }

  async function updateCost(id: number, value: number) {
    await db.ingredients.update(id, { costPerUnit: value });
  }

  async function remove(id: number, ingName: string) {
    if (confirm(`Delete "${ingName}"?`)) {
      await db.ingredients.delete(id);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-stone-800">Pantry</h1>
      <p className="text-stone-500">
        Prices are typical Walmart prices to get you started — tap any price to
        change it. Cake costs update automatically.
      </p>

      <div className="space-y-2">
        {ingredients.map((ing) => (
          <Card key={ing.id} className="!py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-stone-800">
                  {ing.name}
                </p>
                {ing.priceNote && (
                  <p className="truncate text-sm text-stone-400">
                    {ing.priceNote}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-stone-400">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={0}
                  className="w-24 rounded-lg border border-stone-300 px-2 py-2 text-right text-stone-800 outline-none focus:border-amber-500"
                  value={ing.costPerUnit}
                  onChange={(e) =>
                    updateCost(ing.id, Number(e.target.value) || 0)
                  }
                />
                <span className="w-10 text-sm text-stone-500">
                  /{unitLabel(ing.unit)}
                </span>
                <button
                  onClick={() => remove(ing.id, ing.name)}
                  className="px-1 text-xl text-red-300"
                  aria-label={`Delete ${ing.name}`}
                >
                  ✕
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {adding ? (
        <Card className="space-y-3">
          <Field label="Ingredient name">
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Strawberries"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Measured in">
              <select
                className={inputClass}
                value={unit}
                onChange={(e) => setUnit(e.target.value as Unit)}
              >
                {ALL_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {unitLabel(u)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Cost per unit">
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min={0}
                className={inputClass}
                value={cost}
                onChange={(e) =>
                  setCost(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
            </Field>
          </div>
          <Field label="Price note (optional)">
            <input
              className={inputClass}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. $4 / lb at Walmart"
            />
          </Field>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button onClick={addIngredient}>Add</Button>
          </div>
          <p className="text-sm text-stone-400">
            Tip: enter the cost of <strong>one</strong> unit. For a $3.48 dozen
            eggs, that's $0.29 each.
          </p>
        </Card>
      ) : (
        <Button onClick={() => setAdding(true)}>➕ Add ingredient</Button>
      )}
    </div>
  );
}
