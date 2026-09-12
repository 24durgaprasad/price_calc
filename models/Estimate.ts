import { model, models, Schema } from "mongoose";

const Line = new Schema({ label: String, price: Number, qty: Number }, { _id: false });
const EstimateSchema = new Schema(
  { bhk: String, city: String, purpose: String, items: [Line], totals: Schema.Types.Mixed },
  { timestamps: true }
);

export default models.Estimate ?? model("Estimate", EstimateSchema);
