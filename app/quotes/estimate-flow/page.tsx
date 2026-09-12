"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ExtrasEditor, { loadExtras } from "../../../components/ExtrasEditor";
import type { Extra } from "../../../lib/pricing";

const BHK = ["1 BHK", "2 BHK", "3 BHK", "3+ BHK"];
const PURPOSE = ["Move In", "Rent Out", "Renovate"];
const enc = (e: Extra[]) => btoa(encodeURIComponent(JSON.stringify(e)));

export default function Flow() {
  const r = useRouter();
  const [step, setStep] = useState(1);
  const [bhk, setBhk] = useState("3 BHK");
  const [purpose, setPurpose] = useState("Move In");
  const [city] = useState("vizag");
  const [extras, setExtras] = useState<Extra[]>(() => (typeof window === "undefined" ? [] : loadExtras()));

  const go = () => {
    const q = new URLSearchParams({ bhk, purpose, city, extras: enc(extras) });
    (window as unknown as { dataLayer?: object[] }).dataLayer?.push({ event: "estimate_viewed", bhk, city });
    r.push(`/estimate?${q}`);
  };

  return (
    <main className="wrap">
      <p className="eyebrow">Free estimate · Step {step} of 2</p>
      <h1>{step === 1 ? "Tell us about your home" : "Add your items"}</h1>
      {step === 1 && (
        <div className="card">
          <p className="sub">Your floorplan</p>
          <div className="chips">{BHK.map((b) => <button key={b} className={`chip${b === bhk ? " on" : ""}`} onClick={() => setBhk(b)}>{b}</button>)}</div>
          <p className="sub">Purpose</p>
          <div className="chips">{PURPOSE.map((p) => <button key={p} className={`chip${p === purpose ? " on" : ""}`} onClick={() => setPurpose(p)}>{p}</button>)}</div>
          <br /><button className="btn" onClick={() => setStep(2)}>Continue →</button>
        </div>
      )}
      {step === 2 && (
        <div className="card">
          <p className="loc">📍 Visakhapatnam (Vizag)</p>
          <ExtrasEditor value={extras} onChange={setExtras} />
          <p style={{ marginTop: 16 }}><button className="btn-ghost" onClick={() => setStep(1)}>← Back</button>{" "}
          <button className="btn" onClick={go} disabled={extras.length === 0}>See My Estimate →</button></p>
        </div>
      )}
    </main>
  );
}
