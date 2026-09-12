"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import ExtrasEditor from "../../components/ExtrasEditor";
import { cfg, estimate, inr, type Extra, type Tier } from "../../lib/pricing";

const dec = (s: string | null): Extra[] => {
  if (!s) return [];
  try {
    const arr = JSON.parse(decodeURIComponent(atob(s))) as Extra[];
    return Array.isArray(arr) ? arr.filter((e) => e?.label && Number(e.price) > 0).slice(0, 10) : [];
  } catch { return []; }
};

function Page() {
  const q = useSearchParams();
  const bhk = q.get("bhk") ?? "3 BHK";
  const city = q.get("city") ?? "bengaluru";
  const kitchen = q.get("kitchen") !== "false";
  const other = Number(q.get("other") ?? 1);
  const wardrobes = Number(q.get("wardrobes") ?? 2);
  const [extras, setExtras] = useState<Extra[]>(() => dec(q.get("extras")));
  const res = useMemo(() => estimate({ bhk, city, extras, kitchen, other, wardrobes }), [bhk, city, extras, kitchen, other, wardrobes]);
  const [open, setOpen] = useState<Tier | null>(null);

  return (
    <main style={{ margin: "0 auto", maxWidth: 1100, padding: 24 }}>
      <h1>Your Estimate for 3 Lifestyle Options</h1>
      <p>Get 3D designs, personalized estimates &amp; avail exciting discounts</p>
      <p>
        Wardrobes ({wardrobes} Units) · Other Interiors ({other} Unit{other === 1 ? "" : "s"}) · {bhk} · {city}{" "}
        <Link href="/quotes/estimate-flow">EDIT / Modify Requirements</Link>
      </p>
      <h3>Your added items</h3>
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
                <p>Kitchen {inr(v.kitchen)} · Wardrobes {inr(v.wardrobes)} · Other {inr(v.other)}{v.extras > 0 && <> · Extras {inr(v.extras)}</>}</p>
                <button onClick={() => setOpen(open === t ? null : t)}>View details</button>
                {open === t && (
                  <ul>
                    <li>Kitchen: {inr(v.kitchen)}</li>
                    <li>Wardrobes ({wardrobes}): {inr(v.wardrobes)}</li>
                    <li>Other ({other}): {inr(v.other)}</li>
                    {extras.map((e, i) => <li key={i}>{e.label}: {inr(e.price)}</li>)}
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
