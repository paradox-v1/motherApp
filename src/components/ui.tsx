import type { ReactNode, ButtonHTMLAttributes } from "react";
import { useNavigate } from "react-router-dom";

/** Large page heading with an optional back button. */
export function PageTitle({
  title,
  subtitle,
  back,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <header className="mb-5">
      {back && (
        <button
          onClick={() => navigate(-1)}
          className="mb-3 -ml-1 flex items-center gap-1 text-base font-medium text-amber-700"
        >
          ‹ Back
        </button>
      )}
      <h1 className="text-3xl font-bold text-stone-800">{title}</h1>
      {subtitle && <p className="mt-1 text-stone-500">{subtitle}</p>}
    </header>
  );
}

type ButtonVariant = "primary" | "secondary" | "danger";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-amber-600 text-white active:bg-amber-700",
  secondary: "bg-amber-100 text-amber-800 active:bg-amber-200",
  danger: "bg-red-100 text-red-700 active:bg-red-200",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      {...rest}
      className={`w-full rounded-2xl px-5 py-4 text-lg font-semibold shadow-sm transition-colors disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

/** Rounded white card used everywhere for a soft, friendly look. */
export function Card({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-amber-100 bg-white p-4 shadow-sm ${
        onClick ? "active:bg-amber-50" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

/** Labelled form field wrapper. */
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-semibold text-stone-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-sm text-stone-400">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-lg text-stone-800 outline-none focus:border-amber-500";

export function EmptyState({
  icon,
  title,
  hint,
}: {
  icon: string;
  title: string;
  hint?: string;
}) {
  return (
    <div className="mt-10 flex flex-col items-center text-center text-stone-400">
      <span className="text-5xl">{icon}</span>
      <p className="mt-3 text-lg font-medium text-stone-500">{title}</p>
      {hint && <p className="mt-1 text-sm">{hint}</p>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-stone-200 text-stone-500",
  };
  const labels: Record<string, string> = {
    pending: "To make",
    completed: "Done",
    cancelled: "Cancelled",
  };
  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-semibold ${
        styles[status] ?? "bg-stone-100 text-stone-600"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}
