"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
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
  const id = q.get("id");
  const [bhk, setBhk] = useState(q.get("bhk") ?? "3 BHK");
  const [city, setCity] = useState(q.get("city") ?? "bengaluru");
  const [purpose, setPurpose] = useState(q.get("purpose") ?? "Move In");
  const [extras, setExtras] = useState<Extra[]>(() => loadExtras(dec(q.get("extras"))));
  const [share, setShare] = useState("");
  useEffect(() => {
    if (!id) return;
    fetch(`/api/estimates?id=${id}`).then((r) => r.json()).then((d) => {
      if (d.items) { setExtras(d.items); setBhk(d.bhk ?? bhk); setCity(d.city ?? city); setPurpose(d.purpose ?? purpose); }
    }).catch(() => {});
  }, [id]);
  const res = useMemo(() => estimate({ bhk, city, extras, kitchen: false, other: 0, wardrobes: 0 }), [bhk, city, extras]);
  const [open, setOpen] = useState<Tier | null>(null);
  const save = async () => {
    const r = await fetch("/api/estimates", { body: JSON.stringify({ bhk, city, items: extras, purpose }), headers: { "Content-Type": "application/json" }, method: "POST" });
    const d = await r.json();
    if (d.id) setShare(`${location.origin}/estimate?id=${d.id}`);
  };

  return (
    <main className="wrap-wide">
      <p className="eyebrow">Your estimate · 3 lifestyle options</p>
      <h1>What your home could cost</h1>
      <p className="sub">{extras.length} item{extras.length === 1 ? "" : "s"} · {bhk} · {city} · <Link className="link" href="/quotes/estimate-flow">Modify →</Link></p>
      <div className="card">
        <ExtrasEditor value={extras} onChange={setExtras} />
        <div className="share"><button className="btn-ghost" onClick={save} disabled={!extras.length}>Save & share</button>{share && <input readOnly value={share} onFocus={(e) => e.target.select()} />}</div>
      </div>
      <div className="tiers">
        {(Object.keys(cfg.tiers) as Tier[]).map((t) => {
          const d = cfg.tiers[t] as { label: string; sub: string; badge?: string; images: string[] };
          const v = res[t];
          return (
            <section className="tier" key={t}>
              <img src={d.images[0]} alt={`${t} living room`} loading="lazy" />
              <div className="tier-body">
                <h2>{d.label} {d.badge && <span className="badge">{d.badge}</span>}</h2>
                <p className="sub">{d.sub}</p>
                <p className="price">{inr(v.total)}</p>
                <button className="btn-ghost" onClick={() => setOpen(open === t ? null : t)}>{open === t ? "Hide details" : "View details"}</button>
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
      <p className="note"><b>Note:</b> <i>This is an approximate estimate as per the selections made by you and is subject to change based on the dimensions of your space, design, non-standard product selection/customisation or additional scope of work.</i></p>
      <div className="trust">
        {["Flat 10 year warranty", "45-days delivery*", "600+ design experts", "Post-installation service"].map((x) => <span key={x}>{x}</span>)}
      </div>
    </main>
  );
}

export default function EstimatePage() {
  return <Suspense><Page /></Suspense>;
}
