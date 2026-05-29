import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router-dom";
import { db, type OrderStatus } from "../db";
import { money, prettyDate } from "../lib/format";
import { Card, EmptyState, StatusBadge, Button } from "../components/ui";

type Filter = "all" | OrderStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "pending", label: "To make" },
  { key: "completed", label: "Done" },
  { key: "all", label: "All" },
];

export default function Orders() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("pending");
  const orders = useLiveQuery(() => db.orders.toArray(), [], []);

  const shown = orders
    .filter((o) => (filter === "all" ? true : o.status === filter))
    .sort((a, b) => b.dueDate.localeCompare(a.dueDate));

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-stone-800">Orders</h1>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-1 rounded-full py-2 text-base font-semibold ${
              filter === f.key
                ? "bg-amber-600 text-white"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <EmptyState icon="📋" title="No orders here yet" />
      ) : (
        <div className="space-y-3">
          {shown.map((o) => {
            const profit = o.salePrice - o.costSnapshot;
            return (
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
                    <p className="mt-1 text-sm text-stone-400">
                      due {prettyDate(o.dueDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={o.status} />
                    <p className="mt-2 font-semibold text-stone-800">
                      {money(o.salePrice)}
                    </p>
                    {o.status !== "cancelled" && (
                      <p className="text-sm text-green-700">
                        +{money(profit)} profit
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Button onClick={() => navigate("/orders/new")}>➕ New Order</Button>
    </div>
  );
}
