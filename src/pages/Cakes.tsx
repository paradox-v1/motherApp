import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router-dom";
import { db, cakeUnitCost } from "../db";
import { money } from "../lib/format";
import { Button, Card, EmptyState } from "../components/ui";

export default function Cakes() {
  const navigate = useNavigate();
  const cakes = useLiveQuery(() => db.cakes.toArray(), [], []);
  const ingredients = useLiveQuery(() => db.ingredients.toArray(), [], []);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-stone-800">Cakes</h1>
      <p className="text-stone-500">
        Each cake has a recipe and a price, so orders fill in cost and profit
        for you.
      </p>

      {cakes.length === 0 ? (
        <EmptyState
          icon="🎂"
          title="No cakes yet"
          hint="Add your first cake recipe below."
        />
      ) : (
        <div className="space-y-3">
          {cakes.map((c) => {
            const cost = cakeUnitCost(c, ingredients);
            return (
              <Card key={c.id} onClick={() => navigate(`/cakes/${c.id}/edit`)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{c.emoji}</span>
                    <div>
                      <p className="text-lg font-semibold text-stone-800">
                        {c.name}
                      </p>
                      <p className="text-sm text-stone-500">
                        {c.recipe.length} ingredients
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-stone-800">
                      {money(c.basePrice)}
                    </p>
                    <p className="text-sm text-green-700">
                      +{money(c.basePrice - cost)} profit
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Button onClick={() => navigate("/cakes/new")}>➕ Add a cake</Button>
    </div>
  );
}
