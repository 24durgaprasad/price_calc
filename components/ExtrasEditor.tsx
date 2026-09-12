"use client";
import { useEffect, useState } from "react";
import { inr, type Extra } from "../lib/pricing";

const KEY = "price_calc_extras";
const norm = (e: Extra): Extra => ({ label: String(e?.label ?? "").trim(), price: Math.max(0, Math.round(Number(e?.price) || 0)), qty: Math.max(1, Math.round(Number(e?.qty) || 1)) });

export function loadExtras(fallback: Extra[] = []): Extra[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw && fallback.length) return fallback.map(norm);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Extra[];
    const clean = (Array.isArray(arr) ? arr : []).map(norm).filter((e) => e.label && e.price > 0).slice(0, 20);
    return clean.length ? clean : fallback.map(norm);
  } catch { return fallback.map(norm); }
}

export default function ExtrasEditor({ value, onChange }: { value: Extra[]; onChange: (e: Extra[]) => void }) {
  const [label, setLabel] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState(1);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(value)); } catch { /* ignore */ } }, [value]);
  const add = () => {
    const p = Number(price);
    if (!label.trim() || !(p > 0) || value.length >= 20) return;
    onChange([...value, norm({ label, price: p, qty })]);
    setLabel("");
    setPrice("");
    setQty(1);
  };
  const set = (i: number, patch: Partial<Extra>) => onChange(value.map((e, j) => (j === i ? norm({ ...e, ...patch }) : e)));
  return (
    <div>
      {value.map((e, i) => (
        <p key={i}>
          {e.label}: {inr(e.price)} × <button onClick={() => set(i, { qty: e.qty - 1 })} aria-label="Decrease quantity">-</button> {e.qty} <button onClick={() => set(i, { qty: e.qty + 1 })} aria-label="Increase quantity">+</button> = {inr(e.price * e.qty)}{" "}
          <button onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Remove ${e.label}`}>✕</button>
        </p>
      ))}
      <div style={{ display: "flex", gap: 8 }}>
        <input placeholder="Item (e.g. LED lighting)" value={label} onChange={(e) => setLabel(e.target.value)} style={{ flex: 2, padding: 10 }} />
        <input placeholder="₹ price" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, "").slice(0, 9))} style={{ flex: 1, padding: 10 }} />
        <span>× <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button> {qty} <button onClick={() => setQty(qty + 1)}>+</button></span>
        <button onClick={add} disabled={!label.trim() || !(Number(price) > 0)}>Add</button>
      </div>
    </div>
  );
}
