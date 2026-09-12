import { model, models, Schema } from "mongoose";

const ItemSchema = new Schema(
  { label: { type: String, required: true, unique: true, trim: true }, price: { type: Number, required: true, min: 1 } },
  { timestamps: true }
);

export default models.Item ?? model("Item", ItemSchema);
