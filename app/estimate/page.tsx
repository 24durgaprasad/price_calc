"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import ExtrasEditor, { loadExtras } from "../../components/ExtrasEditor";
import { cfg, estimate, inr, type Extra, type Tier } from "../../lib/pricing";

const dec = (s: string | null): Extra[] => {
  if (!s) return [];
  try {
    const arr = JSON.parse(decodeURIComponent(atob(s))) as Extra[];
    return Array.isArray(arr)
      ? arr.map((e) => ({ label: String(e?.label ?? ""), price: Math.round(Number(e?.price) || 0), qty: Math.max(1, Math.round(Number(e?.qty) || 1)) })).filter((e) => e.label && e.price > 0).slice(0, 20)
      : [];
  } catch { return []; }
};

function Page() {
  const q = useSearchParams();
  const bhk = q.get("bhk") ?? "3 BHK";
  const city = q.get("city") ?? "bengaluru";
  const [extras, setExtras] = useState<Extra[]>(() => loadExtras(dec(q.get("extras"))));
  const res = useMemo(() => estimate({ bhk, city, extras, kitchen: false, other: 0, wardrobes: 0 }), [bhk, city, extras]);
  const [open, setOpen] = useState<Tier | null>(null);

  return (
    <main style={{ margin: "0 auto", maxWidth: 1100, padding: 24 }}>
      <h1>Your Estimate for 3 Lifestyle Options</h1>
      <p>Get 3D designs, personalized estimates &amp; avail exciting discounts</p>
      <p>
        {extras.length} item{extras.length === 1 ? "" : "s"} · {bhk} · {city}{" "}
        <Link href="/quotes/estimate-flow">EDIT / Modify Requirements</Link>
      </p>
      <h3>Your items</h3>
      <ExtrasEditor value={extras} onChange={setExtras} />
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", marginTop: 16 }}>
        {(Object.keys(cfg.tiers) as Tier[]).map((t) => {
          const d = cfg.tiers[t] as { label: string; sub: string; badge?: string; images: string[] };
          const v = res[t];
          return (
            <section key={t} style={{ border: "1px solid #e4e4e4", borderRadius: 12, overflow: "hidden" }}>
              <img src={d.images[0]} alt={`${t}_livingroom_4`} loading="lazy" style={{ width: "100%" }} />
              <div style={{ padding: 16 }}>
                <h2>{d.label} {d.badge && <span style={{ background: "#e71c24", borderRadius: 4, color: "#fff", fontSize: 12, padding: "2px 6px" }}>{d.badge}</span>}</h2>
                <p>{d.sub}</p>
                <p style={{ fontSize: 28, fontWeight: 700 }}>{inr(v.total)}</p>
                <button onClick={() => setOpen(open === t ? null : t)}>View details</button>
                {open === t && (
                  <ul>
                    {extras.map((e, i) => <li key={i}>{e.label}: {inr(e.price)} × {e.qty} = {inr(e.price * e.qty)}</li>)}
                  </ul>
                )}
              </div>
            </section>
          );
        })}
      </div>
      <p><small><b>Note:</b> <i>This is an approximate estimate as per the selections made by you and is subject to change based on the dimensions of your space, design, non-standard product selection/customisation or additional scope of work.</i></small></p>
      <section style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 24 }}>
        {["Flat 10 year warranty", "45-days delivery*", "600+ design experts", "Post-installation service"].map((x) => <span key={x} style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>{x}</span>)}
      </section>
    </main>
  );
}

export default function EstimatePage() {
  return <Suspense><Page /></Suspense>;
}
