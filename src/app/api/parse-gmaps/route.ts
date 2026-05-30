import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Invalid URL provided." }, { status: 400 });
    }

    console.log("Parsing Google Maps URL:", url);

    let targetUrl = url;

    // 1. Resolve short URLs on the server side
    if (url.includes("maps.app.goo.gl") || url.includes("goo.gl")) {
      try {
        const response = await fetch(url, { redirect: "follow" });
        targetUrl = response.url;
        console.log("Resolved short URL to long URL:", targetUrl);
      } catch (err) {
        console.error("Failed to follow redirect on short URL:", err);
      }
    }

    let detectedName = "";
    let detectedLat = 0;
    let detectedLng = 0;
    let detectedAddress = "";
    let detectedPhone = "";
    let detectedTimings = "";

    // 2. Parse coordinates from long URL
    // Pattern A: /@22.7196,75.8480
    const atPattern = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const atMatch = targetUrl.match(atPattern);
    if (atMatch) {
      detectedLat = parseFloat(atMatch[1]);
      detectedLng = parseFloat(atMatch[2]);
    } else {
      // Pattern B: q=22.7196,75.8480
      const qPattern = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/;
      const qMatch = targetUrl.match(qPattern);
      if (qMatch) {
        detectedLat = parseFloat(qMatch[1]);
        detectedLng = parseFloat(qMatch[2]);
      }
    }

    // 3. Parse place name from URL path
    // Example: google.com/maps/place/Kanch+Mandir/@22.7196,75.8480
    // Look for "/place/([^/]+)"
    const placePattern = /\/maps\/place\/([^/@?]+)/;
    const placeMatch = targetUrl.match(placePattern);
    if (placeMatch) {
      detectedName = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
    }

    console.log("Parsed from URL path:", { name: detectedName, lat: detectedLat, lng: detectedLng });

    // 4. Query Google Places API if API Key is available
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (apiKey && (detectedName || (detectedLat && detectedLng))) {
      try {
        let searchQuery = detectedName;
        // If we don't have a name but have coordinates, we can reverse geocode or do nearby search
        if (searchQuery) {
          console.log("Querying Google Places API for place name:", searchQuery);
          const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${apiKey}`;
          const searchResponse = await fetch(searchUrl);
          const searchData = await searchResponse.json();

          if (searchData.results && searchData.results.length > 0) {
            const place = searchData.results[0];
            detectedName = place.name || detectedName;
            detectedAddress = place.formatted_address || detectedAddress;
            if (place.geometry && place.geometry.location) {
              detectedLat = place.geometry.location.lat;
              detectedLng = place.geometry.location.lng;
            }

            // We can do a second query for Place Details to get phone number and opening hours!
            if (place.place_id) {
              console.log("Querying Place Details for Place ID:", place.place_id);
              const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number,opening_hours,formatted_address&key=${apiKey}`;
              const detailsResponse = await fetch(detailsUrl);
              const detailsData = await detailsResponse.json();

              if (detailsData.result) {
                detectedPhone = detailsData.result.formatted_phone_number || "";
                if (detailsData.result.opening_hours && detailsData.result.opening_hours.weekday_text) {
                  detectedTimings = detailsData.result.opening_hours.weekday_text.join(", ");
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to query Google Places API:", err);
      }
    }

    // 5. Try to extract city and state from formatted address
    let detectedCity = "";
    let detectedState = "";
    if (detectedAddress) {
      const addressParts = detectedAddress.split(",");
      if (addressParts.length >= 2) {
        const stateZipPart = addressParts[addressParts.length - 2]?.trim();
        const cityPart = addressParts[addressParts.length - 3]?.trim();

        if (stateZipPart) {
          detectedState = stateZipPart.replace(/\d+/g, "").trim();
        }
        if (cityPart) {
          detectedCity = cityPart.trim();
        }
      }
    }

    // Standardize states to match our dropdown options if they match
    const validStates = ["Madhya Pradesh", "Rajasthan", "Gujarat", "Karnataka", "Delhi", "Uttar Pradesh", "Bihar", "Maharashtra", "Jharkhand", "Tamil Nadu", "Telangana"];
    const matchedState = validStates.find(s => detectedState.toLowerCase().includes(s.toLowerCase()));
    if (matchedState) {
      detectedState = matchedState;
    }

    return NextResponse.json({
      success: true,
      temple_name: detectedName,
      latitude: detectedLat,
      longitude: detectedLng,
      address: detectedAddress || (detectedName ? `${detectedName}, India` : ""),
      city: detectedCity,
      state: detectedState,
      phone: detectedPhone,
      timings: detectedTimings,
      image_url: detectedName 
        ? `/api/places-photo?name=${encodeURIComponent(detectedName)}&fallback=https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80`
        : ""
    });
  } catch (error) {
    console.error("Error parsing Google Maps URL:", error);
    return NextResponse.json({ error: "Failed to parse URL." }, { status: 500 });
  }
}
