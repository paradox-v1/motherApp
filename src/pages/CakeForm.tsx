import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate, useParams } from "react-router-dom";
import { db, type RecipeItem } from "../db";
import { money, unitLabel } from "../lib/format";
import { Button, Card, Field, PageTitle, inputClass } from "../components/ui";

const EMOJI_CHOICES = ["🎂", "🍰", "🧁", "🍫", "🍓", "🥮", "🎉", "🍋", "🥕"];

export default function CakeForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const cakeId = Number(id);
  const navigate = useNavigate();

  const ingredients = useLiveQuery(() => db.ingredients.toArray(), [], []);
  const existing = useLiveQuery(
    () => (editing ? db.cakes.get(cakeId) : undefined),
    [cakeId]
  );

  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎂");
  const [basePrice, setBasePrice] = useState<number | "">("");
  const [recipe, setRecipe] = useState<RecipeItem[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setEmoji(existing.emoji);
      setBasePrice(existing.basePrice);
      setRecipe(existing.recipe);
      setNotes(existing.notes ?? "");
    }
  }, [existing]);

  const ingById = new Map(ingredients.map((i) => [i.id, i]));
  const cost = recipe.reduce((sum, item) => {
    const ing = ingById.get(item.ingredientId);
    return ing ? sum + ing.costPerUnit * item.quantity : sum;
  }, 0);

  function addLine() {
    const firstUnused = ingredients.find(
      (i) => !recipe.some((r) => r.ingredientId === i.id)
    );
    if (!firstUnused) return;
    setRecipe([...recipe, { ingredientId: firstUnused.id, quantity: 1 }]);
  }

  function updateLine(index: number, patch: Partial<RecipeItem>) {
    setRecipe(recipe.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function removeLine(index: number) {
    setRecipe(recipe.filter((_, i) => i !== index));
  }

  async function save() {
    if (!name.trim()) {
      alert("Please give the cake a name.");
      return;
    }
    const payload = {
      name: name.trim(),
      emoji,
      basePrice: Number(basePrice) || 0,
      recipe,
      notes: notes.trim() || undefined,
    };
    if (editing) {
      await db.cakes.update(cakeId, payload);
    } else {
      await db.cakes.add(payload as never);
    }
    navigate("/cakes");
  }

  async function remove() {
    if (confirm(`Delete "${name}"? Past orders keep their saved details.`)) {
      await db.cakes.delete(cakeId);
      navigate("/cakes");
    }
  }

  return (
    <div className="space-y-4">
      <PageTitle title={editing ? "Edit Cake" : "New Cake"} back />

      <Field label="Cake name">
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Carrot Cake"
        />
      </Field>

      <Field label="Picture">
        <div className="flex flex-wrap gap-2">
          {EMOJI_CHOICES.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`rounded-xl px-3 py-2 text-2xl ${
                emoji === e ? "bg-amber-200" : "bg-amber-50"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Selling price" hint="What you usually charge for one.">
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          className={inputClass}
          value={basePrice}
          onChange={(e) =>
            setBasePrice(e.target.value === "" ? "" : Number(e.target.value))
          }
        />
      </Field>

      {/* Recipe builder */}
      <div>
        <h2 className="mb-2 text-xl font-bold text-stone-800">Recipe</h2>
        <div className="space-y-2">
          {recipe.map((item, index) => {
            const ing = ingById.get(item.ingredientId);
            return (
              <Card key={index} className="!p-3">
                <div className="flex items-center gap-2">
                  <select
                    className={`${inputClass} flex-1 !py-2`}
                    value={item.ingredientId}
                    onChange={(e) =>
                      updateLine(index, {
                        ingredientId: Number(e.target.value),
                      })
                    }
                  >
                    {ingredients.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeLine(index)}
                    className="px-2 text-2xl text-red-400"
                    aria-label="Remove ingredient"
                  >
                    ✕
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="any"
                    className={`${inputClass} !py-2`}
                    value={item.quantity}
                    onChange={(e) =>
                      updateLine(index, { quantity: Number(e.target.value) || 0 })
                    }
                  />
                  <span className="w-16 text-stone-500">
                    {ing ? unitLabel(ing.unit) : ""}
                  </span>
                  <span className="ml-auto text-sm text-stone-400">
                    {ing ? money(ing.costPerUnit * item.quantity) : ""}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>

        <button
          onClick={addLine}
          className="mt-2 w-full rounded-xl border-2 border-dashed border-amber-300 py-3 font-semibold text-amber-700"
        >
          + Add ingredient
        </button>
      </div>

      <div className="rounded-2xl bg-amber-50 p-4 text-stone-700">
        <div className="flex justify-between">
          <span>Cost to make one</span>
          <span className="font-semibold">{money(cost)}</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span>Profit each</span>
          <span className="text-lg font-bold text-green-700">
            {money((Number(basePrice) || 0) - cost)}
          </span>
        </div>
      </div>

      <Field label="Notes (optional)">
        <textarea
          className={inputClass}
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Size, frosting, special steps…"
        />
      </Field>

      <Button onClick={save}>{editing ? "Save changes" : "Save cake"}</Button>
      {editing && (
        <Button variant="danger" onClick={remove}>
          🗑 Delete cake
        </Button>
      )}
    </div>
  );
}
