import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { seedIfEmpty } from "./seed";
import BottomNav from "./components/BottomNav";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import OrderForm from "./pages/OrderForm";
import OrderDetail from "./pages/OrderDetail";
import Cakes from "./pages/Cakes";
import CakeForm from "./pages/CakeForm";
import Ingredients from "./pages/Ingredients";
import Settings from "./pages/Settings";

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedIfEmpty().finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center text-stone-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col">
      <main className="safe-bottom flex-1 px-4 pt-5">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/new" element={<OrderForm />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/orders/:id/edit" element={<OrderForm />} />
          <Route path="/cakes" element={<Cakes />} />
          <Route path="/cakes/new" element={<CakeForm />} />
          <Route path="/cakes/:id/edit" element={<CakeForm />} />
          <Route path="/ingredients" element={<Ingredients />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}
