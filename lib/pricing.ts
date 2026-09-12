import cfg from "./estimate-config.json";

export type Tier = keyof typeof cfg.tiers;
export interface Extra { label: string; price: number; qty: number; }
export interface Input { bhk: string; city: string; extras: Extra[]; kitchen: boolean; other: number; wardrobes: number; }
export interface TierOut { extras: number; kitchen: number; other: number; total: number; wardrobes: number; }

const round = (n: number) => Math.round(n / 1000) * 1000;
const f = (m: Record<string, number>, k: string) => m[k] ?? m.default ?? 1;

// ponytail: flat multipliers, per-material rate card if pricing falls short
export function estimate(i: Input): Record<Tier, TierOut> {
  const cf = f(cfg.cityFactor as Record<string, number>, i.city);
  const ff = f(cfg.floorplanFactor as Record<string, number>, i.bhk);
  const ex = (i.extras ?? []).reduce((s, e) => s + (Number(e.price) || 0) * (Number((e as Extra).qty) || 1), 0);
  const out = {} as Record<Tier, TierOut>;
  for (const [t, d] of Object.entries(cfg.tiers)) {
    const m = (d as { multiplier: number }).multiplier * cf * ff;
    const kitchen = i.kitchen ? round(cfg.base.kitchen * m) : 0;
    const wardrobes = round(cfg.base.wardrobe_per_unit * i.wardrobes * m);
    const other = round(cfg.base.other_per_unit * i.other * m);
    out[t as Tier] = { extras: ex, kitchen, wardrobes, other, total: kitchen + wardrobes + other + ex };
  }
  return out;
}

export const inr = (n: number) => "₹" + new Intl.NumberFormat("en-IN").format(n);
export { cfg };
