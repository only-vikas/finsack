import mongoose, { Schema, type Document } from "mongoose";

export interface INoteCache extends Document {
  strategyId: string;
  content: string;
  generatedAt: Date;
}

const NoteCacheSchema = new Schema<INoteCache>({
  strategyId: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now },
});

// TTL index — auto-delete notes older than 7 days so they stay fresh
NoteCacheSchema.index({ generatedAt: 1 }, { expireAfterSeconds: 604800 });

export default mongoose.models.NoteCache ||
  mongoose.model<INoteCache>("NoteCache", NoteCacheSchema);
