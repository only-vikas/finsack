import { NextRequest, NextResponse } from "next/server";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY!;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");

  if (!q) {
    return NextResponse.json(
      { error: "Missing search query parameter 'q'" },
      { status: 400 }
    );
  }

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", q);
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "1");
    url.searchParams.set("order", "relevance");
    url.searchParams.set("key", YOUTUBE_API_KEY);

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errText = await response.text();
      console.error("YouTube API error:", errText);
      return NextResponse.json(
        { error: "YouTube API error" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const item = data.items?.[0];

    if (!item) {
      return NextResponse.json(
        { error: "No results found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail:
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.default?.url,
    });
  } catch (error) {
    console.error("YouTube search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
