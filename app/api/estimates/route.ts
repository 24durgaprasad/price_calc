import { NextResponse } from "next/server";
import db from "../../../lib/db";
import { estimate } from "../../../lib/pricing";
import Estimate from "../../../models/Estimate";

export async function POST(req: Request) {
  const { bhk, city, items, purpose } = await req.json();
  const clean = (Array.isArray(items) ? items : []).map((e) => ({ label: String(e?.label ?? ""), price: Math.round(Number(e?.price) || 0), qty: Math.max(1, Math.round(Number(e?.qty) || 1)) })).filter((e) => e.label && e.price > 0).slice(0, 20);
  if (!clean.length) return NextResponse.json({ error: "at least one item required" }, { status: 400 });
  await db();
  const totals = estimate({ bhk: bhk ?? "3 BHK", city: city ?? "bengaluru", extras: clean, kitchen: false, other: 0, wardrobes: 0 });
  const doc = await Estimate.create({ bhk, city, items: clean, purpose, totals });
  return NextResponse.json({ id: String(doc._id) });
}

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db();
  const doc = await Estimate.findById(id).lean();
  if (!doc) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ bhk: doc.bhk, city: doc.city, items: doc.items, purpose: doc.purpose, totals: doc.totals });
}
