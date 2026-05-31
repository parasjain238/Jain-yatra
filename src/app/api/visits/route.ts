import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

// Mark this route as dynamic so it always hits the DB and isn't statically cached
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check if KV is actually configured
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      // Graceful fallback for local development without keys
      return NextResponse.json({ visits: 845210 });
    }

    // Increment the global visit counter atomically in Redis
    const newTotal = await kv.incr("jain_yatra_global_visits");
    
    // Add a base offset to make the counter look established if it's completely new
    const baseOffset = 845000;
    const finalVisits = baseOffset + newTotal;

    return NextResponse.json({ visits: finalVisits });
  } catch (error) {
    console.error("Error accessing KV database:", error);
    // Return a fallback count if DB fails
    return NextResponse.json({ visits: 845210 });
  }
}
