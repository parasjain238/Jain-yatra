import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  const fallback = searchParams.get("fallback") || "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80";

  if (!name) {
    return NextResponse.redirect(fallback);
  }

  // Get the Google Maps API Key from the server environment
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // If no API key is configured, gracefully redirect to the pre-seeded fallback image (Wikimedia/Unsplash)
  if (!apiKey) {
    return NextResponse.redirect(fallback);
  }

  try {
    // 1. Search for the place by name using Google Places Text Search or Find Place API
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(name)}&inputtype=textquery&fields=photos,place_id&key=${apiKey}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (
      searchData.candidates &&
      searchData.candidates.length > 0 &&
      searchData.candidates[0].photos &&
      searchData.candidates[0].photos.length > 0
    ) {
      const photoReference = searchData.candidates[0].photos[0].photo_reference;

      // 2. Construct the Google Place Photo API URL
      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoReference}&key=${apiKey}`;
      
      // Redirect browser directly to the live Google Maps photo asset
      return NextResponse.redirect(photoUrl);
    }
  } catch (error) {
    console.error("Google Places Photo API lookup failed:", error);
  }

  // Gracefully fallback if Place search fails or has no photos
  return NextResponse.redirect(fallback);
}
