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
  const [catalog, setCatalog] = useState<Extra[]>([]);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(value)); } catch { /* ignore */ } }, [value]);
  useEffect(() => { fetch("/api/items").then((r) => r.json()).then((d) => Array.isArray(d) && setCatalog(d)).catch(() => {}); }, []);
  const pick = (l: string) => { const f = catalog.find((c) => c.label === l); if (f) setPrice(String(f.price)); };
  const add = () => {
    const p = Number(price);
    if (!label.trim() || !(p > 0) || value.length >= 20) return;
    const item = norm({ label, price: p, qty });
    onChange([...value, item]);
    fetch("/api/items", { body: JSON.stringify({ label: item.label, price: item.price }), headers: { "Content-Type": "application/json" }, method: "POST" }).catch(() => {});
    setLabel("");
    setPrice("");
    setQty(1);
  };
  const set = (i: number, patch: Partial<Extra>) => onChange(value.map((e, j) => (j === i ? norm({ ...e, ...patch }) : e)));
  return (
    <div>
      {value.map((e, i) => (
        <div className="item-row" key={i}>
          <span className="grow">{e.label}</span>
          <span>{inr(e.price)} ×</span>
          <span className="stepper"><button onClick={() => set(i, { qty: e.qty - 1 })} aria-label="Decrease quantity">−</button>{e.qty}<button onClick={() => set(i, { qty: e.qty + 1 })} aria-label="Increase quantity">+</button></span>
          <span className="amt">{inr(e.price * e.qty)}</span>
          <button className="x" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Remove ${e.label}`}>✕</button>
        </div>
      ))}
      <div className="add-row">
        <input name="label" list="catalog" placeholder="Item (e.g. Crockery unit)" value={label} onChange={(e) => { setLabel(e.target.value); pick(e.target.value); }} />
        <datalist id="catalog">{catalog.map((c) => <option key={c.label} value={c.label} />)}</datalist>
        <input name="price" placeholder="₹ price" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, "").slice(0, 9))} />
        <span className="stepper">× <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>{qty}<button onClick={() => setQty(qty + 1)}>+</button></span>
        <button className="btn" onClick={add} disabled={!label.trim() || !(Number(price) > 0)}>Add</button>
      </div>
    </div>
  );
}
