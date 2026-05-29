import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate, useParams } from "react-router-dom";
import { db, cakeUnitCost, type OrderStatus } from "../db";
import { money, todayISO } from "../lib/format";
import { Button, Field, PageTitle, inputClass } from "../components/ui";

export default function OrderForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const orderId = Number(id);
  const navigate = useNavigate();

  const cakes = useLiveQuery(() => db.cakes.toArray(), [], []);
  const ingredients = useLiveQuery(() => db.ingredients.toArray(), [], []);
  const existing = useLiveQuery(
    () => (editing ? db.orders.get(orderId) : undefined),
    [orderId]
  );

  const [customerName, setCustomerName] = useState("");
  const [cakeId, setCakeId] = useState<number | "">("");
  const [quantity, setQuantity] = useState(1);
  const [orderDate, setOrderDate] = useState(todayISO());
  const [dueDate, setDueDate] = useState(todayISO());
  const [salePrice, setSalePrice] = useState<number | "">("");
  const [status, setStatus] = useState<OrderStatus>("pending");
  const [paid, setPaid] = useState(false);
  const [notes, setNotes] = useState("");
  const [touchedPrice, setTouchedPrice] = useState(false);

  // Load existing order into the form when editing.
  useEffect(() => {
    if (existing) {
      setCustomerName(existing.customerName);
      setCakeId(existing.cakeId);
      setQuantity(existing.quantity);
      setOrderDate(existing.orderDate);
      setDueDate(existing.dueDate);
      setSalePrice(existing.salePrice);
      setStatus(existing.status);
      setPaid(existing.paid);
      setNotes(existing.notes ?? "");
      setTouchedPrice(true);
    }
  }, [existing]);

  const selectedCake = cakes.find((c) => c.id === cakeId);
  const unitCost = selectedCake
    ? cakeUnitCost(selectedCake, ingredients)
    : 0;
  const totalCost = unitCost * quantity;

  // Suggest a sale price from the cake's base price until mom edits it herself.
  useEffect(() => {
    if (!touchedPrice && selectedCake) {
      setSalePrice(selectedCake.basePrice * quantity);
    }
  }, [selectedCake, quantity, touchedPrice]);

  async function save() {
    if (!selectedCake || cakeId === "") {
      alert("Please pick a cake.");
      return;
    }
    const payload = {
      customerName: customerName.trim() || "Customer",
      cakeId: selectedCake.id,
      cakeName: selectedCake.name,
      quantity,
      orderDate,
      dueDate,
      status,
      salePrice: Number(salePrice) || 0,
      costSnapshot: Number(totalCost.toFixed(2)),
      paid,
      notes: notes.trim() || undefined,
    };

    if (editing) {
      await db.orders.update(orderId, payload);
      navigate(`/orders/${orderId}`);
    } else {
      const newId = await db.orders.add(payload as never);
      navigate(`/orders/${newId}`);
    }
  }

  if (cakes.length === 0) {
    return (
      <div>
        <PageTitle title="New Order" back />
        <p className="text-stone-500">
          You need to add a cake first so the app knows the recipe and cost.
        </p>
        <div className="mt-4">
          <Button onClick={() => navigate("/cakes/new")}>
            🎂 Add a cake first
          </Button>
        </div>
      </div>
    );
  }

  const profit = (Number(salePrice) || 0) - totalCost;

  return (
    <div className="space-y-4">
      <PageTitle title={editing ? "Edit Order" : "New Order"} back />

      <Field label="Customer name">
        <input
          className={inputClass}
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="e.g. Maria"
        />
      </Field>

      <Field label="Which cake?">
        <select
          className={inputClass}
          value={cakeId}
          onChange={(e) => {
            setCakeId(e.target.value ? Number(e.target.value) : "");
            setTouchedPrice(false);
          }}
        >
          <option value="">Choose a cake…</option>
          {cakes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="How many?">
        <input
          type="number"
          min={1}
          inputMode="numeric"
          className={inputClass}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Order date">
          <input
            type="date"
            className={inputClass}
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
          />
        </Field>
        <Field label="Due date">
          <input
            type="date"
            className={inputClass}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </Field>
      </div>

      <Field label="Sale price (total)" hint="What the customer pays in total.">
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          className={inputClass}
          value={salePrice}
          onChange={(e) => {
            setTouchedPrice(true);
            setSalePrice(e.target.value === "" ? "" : Number(e.target.value));
          }}
        />
      </Field>

      {/* Live money preview */}
      {selectedCake && (
        <div className="rounded-2xl bg-amber-50 p-4 text-stone-700">
          <div className="flex justify-between">
            <span>Cost to make</span>
            <span className="font-semibold">{money(totalCost)}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span>Profit</span>
            <span className="text-lg font-bold text-green-700">
              {money(profit)}
            </span>
          </div>
        </div>
      )}

      <Field label="Status">
        <select
          className={inputClass}
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
        >
          <option value="pending">To make</option>
          <option value="completed">Done</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </Field>

      <label className="flex items-center gap-3 rounded-xl bg-white p-4">
        <input
          type="checkbox"
          className="h-6 w-6 accent-amber-600"
          checked={paid}
          onChange={(e) => setPaid(e.target.checked)}
        />
        <span className="text-lg font-medium text-stone-700">
          Customer has paid
        </span>
      </label>

      <Field label="Notes (optional)">
        <textarea
          className={inputClass}
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Flavors, message on cake, pickup time…"
        />
      </Field>

      <Button onClick={save}>{editing ? "Save changes" : "Save order"}</Button>
    </div>
  );
}
