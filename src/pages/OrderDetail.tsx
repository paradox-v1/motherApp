import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate, useParams } from "react-router-dom";
import { db, type OrderStatus } from "../db";
import { money, prettyDate, unitLabel } from "../lib/format";
import { Button, Card, PageTitle, StatusBadge } from "../components/ui";

export default function OrderDetail() {
  const { id } = useParams();
  const orderId = Number(id);
  const navigate = useNavigate();

  const order = useLiveQuery(() => db.orders.get(orderId), [orderId]);
  const cake = useLiveQuery(
    () => (order ? db.cakes.get(order.cakeId) : undefined),
    [order?.cakeId]
  );
  const ingredients = useLiveQuery(() => db.ingredients.toArray(), [], []);

  if (!order) {
    return <PageTitle title="Order" back />;
  }

  const profit = order.salePrice - order.costSnapshot;
  const ingById = new Map(ingredients.map((i) => [i.id, i]));

  async function setStatus(status: OrderStatus) {
    await db.orders.update(orderId, { status });
  }
  async function togglePaid() {
    await db.orders.update(orderId, { paid: !order!.paid });
  }
  async function remove() {
    if (confirm("Delete this order? This cannot be undone.")) {
      await db.orders.delete(orderId);
      navigate("/orders");
    }
  }

  return (
    <div className="space-y-5">
      <PageTitle title={order.cakeName} subtitle={`for ${order.customerName}`} back />

      <Card>
        <div className="flex items-center justify-between">
          <StatusBadge status={order.status} />
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              order.paid
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {order.paid ? "Paid" : "Not paid"}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-y-2 text-stone-700">
          <span className="text-stone-500">Quantity</span>
          <span className="text-right font-semibold">{order.quantity}</span>
          <span className="text-stone-500">Order date</span>
          <span className="text-right font-semibold">
            {prettyDate(order.orderDate)}
          </span>
          <span className="text-stone-500">Due date</span>
          <span className="text-right font-semibold">
            {prettyDate(order.dueDate)}
          </span>
        </div>
      </Card>

      {/* Money */}
      <Card>
        <h2 className="mb-3 text-lg font-bold text-stone-800">Money</h2>
        <div className="grid grid-cols-2 gap-y-2 text-stone-700">
          <span className="text-stone-500">Sold for</span>
          <span className="text-right font-semibold">{money(order.salePrice)}</span>
          <span className="text-stone-500">Cost to make</span>
          <span className="text-right font-semibold">
            {money(order.costSnapshot)}
          </span>
          <span className="border-t border-amber-100 pt-2 text-stone-500">
            Profit
          </span>
          <span className="border-t border-amber-100 pt-2 text-right text-lg font-bold text-green-700">
            {money(profit)}
          </span>
        </div>
      </Card>

      {/* Shopping / ingredients needed */}
      <Card>
        <h2 className="mb-1 text-lg font-bold text-stone-800">
          What you'll need
        </h2>
        <p className="mb-3 text-sm text-stone-400">
          For {order.quantity} {order.quantity === 1 ? "cake" : "cakes"}
        </p>
        {cake && cake.recipe.length > 0 ? (
          <ul className="divide-y divide-amber-50">
            {cake.recipe.map((item) => {
              const ing = ingById.get(item.ingredientId);
              if (!ing) return null;
              const total = item.quantity * order.quantity;
              return (
                <li
                  key={item.ingredientId}
                  className="flex items-center justify-between py-2"
                >
                  <span className="text-stone-700">{ing.name}</span>
                  <span className="font-semibold text-stone-800">
                    {total} {unitLabel(ing.unit)}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-stone-400">
            This cake has no recipe yet. Add one on the Cakes screen.
          </p>
        )}
      </Card>

      {order.notes && (
        <Card>
          <h2 className="mb-1 text-lg font-bold text-stone-800">Notes</h2>
          <p className="whitespace-pre-wrap text-stone-700">{order.notes}</p>
        </Card>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {order.status === "pending" && (
          <Button onClick={() => setStatus("completed")}>
            ✅ Mark as done
          </Button>
        )}
        {order.status === "completed" && (
          <Button variant="secondary" onClick={() => setStatus("pending")}>
            ↩︎ Move back to "to make"
          </Button>
        )}
        <Button variant="secondary" onClick={togglePaid}>
          {order.paid ? "Mark as not paid" : "💵 Mark as paid"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate(`/orders/${orderId}/edit`)}
        >
          ✏️ Edit order
        </Button>
        <Button variant="danger" onClick={remove}>
          🗑 Delete order
        </Button>
      </div>
    </div>
  );
}
