import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
  try {
    const headersList = await headers();
    
    // Parse Vercel-specific geolocation edge headers
    const latitude = headersList.get("x-vercel-ip-latitude");
    const longitude = headersList.get("x-vercel-ip-longitude");
    const city = headersList.get("x-vercel-ip-city");
    const region = headersList.get("x-vercel-ip-country-region");

    console.log("Vercel Geo Headers:", { latitude, longitude, city, region });

    return NextResponse.json({
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      city: city ? decodeURIComponent(city) : null,
      region: region ? decodeURIComponent(region) : null,
    });
  } catch (error) {
    console.error("Failed to parse Vercel edge headers:", error);
    return NextResponse.json({
      latitude: null,
      longitude: null,
      city: null,
      region: null,
    });
  }
}
