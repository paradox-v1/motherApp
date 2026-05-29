import { useLiveQuery } from "dexie-react-hooks";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../db";
import { money, prettyDate } from "../lib/format";
import { Card, EmptyState, StatusBadge } from "../components/ui";

export default function Dashboard() {
  const navigate = useNavigate();
  const orders = useLiveQuery(() => db.orders.toArray(), [], []);

  const now = new Date();
  const monthKey = now.toISOString().slice(0, 7); // YYYY-MM

  const completed = orders.filter((o) => o.status === "completed");
  const monthOrders = completed.filter((o) =>
    o.orderDate.startsWith(monthKey)
  );
  const monthRevenue = monthOrders.reduce((s, o) => s + o.salePrice, 0);
  const monthProfit = monthOrders.reduce(
    (s, o) => s + (o.salePrice - o.costSnapshot),
    0
  );

  const pending = orders
    .filter((o) => o.status === "pending")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return (
    <div className="space-y-5">
      <header>
        <p className="text-stone-500">
          {now.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1 className="text-3xl font-bold text-stone-800">Mother's Cakes 🧁</h1>
      </header>

      {/* This month summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-sm text-stone-500">This month sold</p>
          <p className="mt-1 text-2xl font-bold text-stone-800">
            {money(monthRevenue)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-stone-500">This month profit</p>
          <p className="mt-1 text-2xl font-bold text-green-700">
            {money(monthProfit)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-stone-500">Cakes to make</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">
            {pending.length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-stone-500">Orders all-time</p>
          <p className="mt-1 text-2xl font-bold text-stone-800">
            {orders.length}
          </p>
        </Card>
      </div>

      <button
        onClick={() => navigate("/orders/new")}
        className="w-full rounded-2xl bg-amber-600 px-5 py-5 text-xl font-bold text-white shadow-sm active:bg-amber-700"
      >
        ➕ New Order
      </button>

      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-xl font-bold text-stone-800">Coming up</h2>
          <Link to="/orders" className="font-medium text-amber-700">
            See all
          </Link>
        </div>

        {pending.length === 0 ? (
          <EmptyState
            icon="✅"
            title="No cakes to make right now"
            hint="Tap New Order when one comes in."
          />
        ) : (
          <div className="space-y-3">
            {pending.map((o) => (
              <Card key={o.id} onClick={() => navigate(`/orders/${o.id}`)}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-stone-800">
                      {o.cakeName}
                      {o.quantity > 1 && (
                        <span className="text-stone-400"> ×{o.quantity}</span>
                      )}
                    </p>
                    <p className="text-stone-500">for {o.customerName}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={o.status} />
                    <p className="mt-1 text-sm text-stone-500">
                      due {prettyDate(o.dueDate)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
