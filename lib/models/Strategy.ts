import mongoose, { Schema, type Document } from "mongoose";

export interface IStrategy extends Document {
  strategyId: string;
  category: string;
  title: string;
  difficulty: string;
  xpReward: number;
  ytSearchTag: string;
  aiPrompt: string;
  description: string;
}

const StrategySchema = new Schema<IStrategy>(
  {
    strategyId: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    difficulty: { type: String, required: true },
    xpReward: { type: Number, required: true },
    ytSearchTag: { type: String, required: true },
    aiPrompt: { type: String, required: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Strategy ||
  mongoose.model<IStrategy>("Strategy", StrategySchema);
