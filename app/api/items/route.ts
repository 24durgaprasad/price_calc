import { NextResponse } from "next/server";
import db from "../../../lib/db";
import Item from "../../../models/Item";

export async function GET() {
  await db();
  const items = await Item.find({}).sort({ updatedAt: -1 }).limit(100).lean();
  return NextResponse.json(items.map((i) => ({ label: i.label, price: i.price })));
}

export async function POST(req: Request) {
  const { label, price } = await req.json();
  if (!String(label ?? "").trim() || !(Number(price) > 0)) return NextResponse.json({ error: "label + price required" }, { status: 400 });
  await db();
  // ponytail: last price wins per label, no price-history table until needed
  const item = await Item.findOneAndUpdate({ label: label.trim() }, { price: Math.round(Number(price)) }, { new: true, upsert: true });
  return NextResponse.json({ label: item.label, price: item.price });
}
