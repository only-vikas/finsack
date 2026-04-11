import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import NoteCache from "@/lib/models/NoteCache";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;
const MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, strategyId } = body;

    if (!prompt || !strategyId) {
      return NextResponse.json(
        { error: "Missing prompt or strategyId" },
        { status: 400 }
      );
    }

    // ── Check cache first ─────────────────────────────────────────────
    try {
      await dbConnect();
      const cached = await NoteCache.findOne({ strategyId });
      if (cached) {
        return NextResponse.json({ content: cached.content, cached: true });
      }
    } catch (dbErr) {
      // MongoDB might not be available; continue without cache
      console.warn("MongoDB cache check failed:", dbErr);
    }

    // ── Generate via OpenRouter ───────────────────────────────────────
    const systemPrompt = `You are a financial education content writer. Generate clear, well-structured markdown notes for a trading strategy lesson. 

Format requirements:
- Start with a ## Overview section
- Use ## headings for: Entry Rules, Exit Rules, Risk Management, Pros, Cons
- Use bullet points extensively
- Include practical examples where relevant
- Keep the content between 300-500 words
- Use **bold** for key terms
- Be educational and clear, suitable for intermediate traders`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
          max_tokens: 1500,
          temperature: 0.6,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter notes error:", errText);
      return NextResponse.json(
        { error: "AI provider error" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content =
      data.choices?.[0]?.message?.content || "Notes generation failed.";

    // ── Cache to MongoDB ──────────────────────────────────────────────
    try {
      await dbConnect();
      await NoteCache.findOneAndUpdate(
        { strategyId },
        { strategyId, content, generatedAt: new Date() },
        { upsert: true, new: true }
      );
    } catch (dbErr) {
      console.warn("Failed to cache notes:", dbErr);
    }

    return NextResponse.json({ content, cached: false });
  } catch (error) {
    console.error("Notes API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
