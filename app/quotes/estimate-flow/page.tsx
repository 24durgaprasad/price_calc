"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ExtrasEditor from "../../../components/ExtrasEditor";
import cities from "../../../lib/cities.json";
import type { Extra } from "../../../lib/pricing";

const BHK = ["1 BHK", "2 BHK", "3 BHK", "3+ BHK"];
const PURPOSE = ["Move In", "Rent Out", "Renovate"];
const btn = (on: boolean): React.CSSProperties => ({ border: on ? "2px solid #e71c24" : "1px solid #ccc", borderRadius: 8, cursor: "pointer", padding: "12px 18px" });
const enc = (e: Extra[]) => btoa(encodeURIComponent(JSON.stringify(e)));

export default function Flow() {
  const r = useRouter();
  const [step, setStep] = useState(1);
  const [bhk, setBhk] = useState("3 BHK");
  const [purpose, setPurpose] = useState("Move In");
  const [kitchen, setKitchen] = useState(true);
  const [wardrobes, setW] = useState(2);
  const [other, setO] = useState(1);
  const [city, setCity] = useState("bengaluru");
  const [extras, setExtras] = useState<Extra[]>([]);

  const go = () => {
    const q = new URLSearchParams({ bhk, purpose, kitchen: String(kitchen), wardrobes: String(wardrobes), other: String(other), city, extras: enc(extras) });
    (window as unknown as { dataLayer?: object[] }).dataLayer?.push({ event: "estimate_viewed", bhk, city });
    r.push(`/estimate?${q}`);
  };

  return (
    <main style={{ margin: "0 auto", maxWidth: 640, padding: 24 }}>
      <p>Get your free estimate in under 30 seconds! STEP {step} OF 2</p>
      {step === 1 && (
        <>
          <h2>Your floorplan</h2>
          <div style={{ display: "flex", gap: 8 }}>{BHK.map((b) => <button key={b} style={btn(b === bhk)} onClick={() => setBhk(b)}>{b}</button>)}</div>
          <h2>Purpose</h2>
          <div style={{ display: "flex", gap: 8 }}>{PURPOSE.map((p) => <button key={p} style={btn(p === purpose)} onClick={() => setPurpose(p)}>{p}</button>)}</div>
          <br /><button onClick={() => setStep(2)} style={{ background: "#e71c24", border: 0, borderRadius: 8, color: "#fff", padding: "12px 24px" }}>Continue</button>
        </>
      )}
      {step === 2 && (
        <>
          <h2>Home Configuration</h2>
          <label><input type="checkbox" checked={kitchen} onChange={(e) => setKitchen(e.target.checked)} /> Modular Kitchen</label>
          <p>Wardrobes: <button onClick={() => setW(Math.max(0, wardrobes - 1))}>-</button> {wardrobes} <button onClick={() => setW(wardrobes + 1)}>+</button></p>
          <p>Other Interiors: <button onClick={() => setO(Math.max(0, other - 1))}>-</button> {other} <button onClick={() => setO(other + 1)}>+</button></p>
          <select value={city} onChange={(e) => setCity(e.target.value)} style={{ display: "block", marginBottom: 8, padding: 10, width: "100%" }}>
            {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <h3>Add your own items</h3>
          <ExtrasEditor value={extras} onChange={setExtras} />
          <p><button onClick={() => setStep(1)}>Back</button>{" "}
          <button onClick={go} style={{ background: "#e71c24", border: 0, borderRadius: 8, color: "#fff", padding: "12px 24px" }}>See My Estimate</button></p>
        </>
      )}
    </main>
  );
}
