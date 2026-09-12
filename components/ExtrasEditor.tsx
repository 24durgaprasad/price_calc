"use client";
import { useState } from "react";
import { inr, type Extra } from "../lib/pricing";

// ponytail: no persistence, localStorage if users complain
export default function ExtrasEditor({ value, onChange }: { value: Extra[]; onChange: (e: Extra[]) => void }) {
  const [label, setLabel] = useState("");
  const [price, setPrice] = useState("");
  const add = () => {
    const p = Number(price);
    if (!label.trim() || !(p > 0) || value.length >= 10) return;
    onChange([...value, { label: label.trim(), price: Math.round(p) }]);
    setLabel("");
    setPrice("");
  };
  return (
    <div>
      {value.map((e, i) => (
        <p key={i}>{e.label}: {inr(e.price)} <button onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Remove ${e.label}`}>✕</button></p>
      ))}
      <div style={{ display: "flex", gap: 8 }}>
        <input placeholder="Item (e.g. LED lighting)" value={label} onChange={(e) => setLabel(e.target.value)} style={{ flex: 2, padding: 10 }} />
        <input placeholder="₹ price" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, "").slice(0, 9))} style={{ flex: 1, padding: 10 }} />
        <button onClick={add} disabled={!label.trim() || !(Number(price) > 0)}>Add</button>
      </div>
    </div>
  );
}
