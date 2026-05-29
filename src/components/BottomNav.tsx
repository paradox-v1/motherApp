import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/", label: "Home", icon: "🏠", end: true },
  { to: "/orders", label: "Orders", icon: "📋", end: false },
  { to: "/cakes", label: "Cakes", icon: "🎂", end: false },
  { to: "/ingredients", label: "Pantry", icon: "🧺", end: false },
  { to: "/settings", label: "Settings", icon: "⚙️", end: false },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-amber-200 bg-white/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
                isActive ? "text-amber-700" : "text-stone-400"
              }`
            }
          >
            <span className="text-2xl leading-none">{t.icon}</span>
            <span>{t.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
