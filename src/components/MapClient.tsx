"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

interface Facilities {
  dharamshala_available: boolean;
  bhojanshala_available: boolean;
  parking_available: boolean;
  ac_rooms_available: boolean;
  family_rooms_available: boolean;
  lift_available: boolean;
  wheelchair_accessible: boolean;
  drinking_water_available: boolean;
  online_contact_available: boolean;
}

interface Temple {
  id: string;
  temple_name: string;
  temple_type: "Digambar" | "Shwetambar" | "Both";
  state: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  history: string;
  timings: string;
  moolnayak: string;
  trust_name: string;
  image_url: string;
  facilities: Facilities;
}

interface MapClientProps {
  temples: Temple[];
  center: [number, number];
  zoom: number;
  selectedTempleId?: string | null;
  onSelectTemple?: (temple: Temple) => void;
  userLocation?: [number, number] | null;
  routePoints?: [number, number][]; // For travel mode routing
}

export default function MapClient({
  temples,
  center,
  zoom,
  selectedTempleId,
  onSelectTemple,
  userLocation,
  routePoints,
}: MapClientProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  // Dynamically load leaflet css
  useEffect(() => {
    const linkId = "leaflet-style";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    // Create Map
    const map = L.map(mapRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: false,
    });

    // Elegant Sandstone Tile Theme (CartoDB Positron for light, CartoDB Dark Matter for dark)
    const isDarkMode = document.documentElement.classList.contains("dark");
    const tileUrl = isDarkMode
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

    L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20,
    }).addTo(map);

    // Zoom Controls at bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    leafletMap.current = map;

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Sync dark/light tiles on theme toggles
  useEffect(() => {
    const map = leafletMap.current;
    if (!map) return;

    // We can redetect theme class changes
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      const tileUrl = isDark
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
      
      // Remove existing tile layer and load new one
      map.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          map.removeLayer(layer);
        }
      });

      L.tileLayer(tileUrl, {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 20,
      }).addTo(map);
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Update Markers when temples change
  useEffect(() => {
    const map = leafletMap.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((m) => map.removeLayer(m));
    markersRef.current = {};

    // Render Temple Markers
    temples.forEach((temple) => {
      const isSelected = selectedTempleId === temple.id;
      
      // Styled Saffron and Emerald HTML markers using L.divIcon
      const markerColor = temple.temple_type === "Digambar"
        ? "bg-amber-600 dark:bg-amber-500"
        : temple.temple_type === "Shwetambar"
          ? "bg-emerald-600 dark:bg-emerald-500"
          : "bg-orange-600 dark:bg-orange-500";

      const scaleClass = isSelected ? "scale-125 ring-4 ring-saffron-500/50" : "hover:scale-110";

      const markerHtml = `
        <div class="relative flex h-8 w-8 items-center justify-center rounded-full text-white shadow-md border-2 border-white transition-all duration-300 ${markerColor} ${scaleClass}">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 3-10 9h3v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8h3L12 3z"/>
            <path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6"/>
          </svg>
          ${isSelected ? `<span class="absolute -top-1 -right-1 flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-saffron-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-saffron-500"></span></span>` : ""}
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: "custom-temple-marker",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([temple.latitude, temple.longitude], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div class="p-1 min-w-[200px]">
            <h4 class="font-serif font-bold text-sm text-foreground mb-0.5">${temple.temple_name}</h4>
            <p class="text-[10px] text-cream-800 dark:text-cream-800/80 mb-1.5 font-medium">${temple.city}, ${temple.state}</p>
            <div class="flex items-center gap-1.5 mb-2">
              <span class="px-1.5 py-0.5 rounded bg-saffron-100 dark:bg-saffron-900/30 text-[9px] font-bold text-saffron-600 dark:text-saffron-500 uppercase">
                ${temple.temple_type}
              </span>
              <span class="text-[9px] text-cream-800">${temple.facilities.dharamshala_available ? "✓ Dharamshala" : ""}</span>
            </div>
            <a href="/temple/${temple.id}" class="inline-flex items-center justify-center w-full px-2 py-1 rounded bg-saffron-500 text-white text-[10px] font-bold hover:bg-saffron-600 transition-colors uppercase tracking-wider text-center no-underline">
              View Details
            </a>
          </div>
        `);

      marker.on("click", () => {
        if (onSelectTemple) onSelectTemple(temple);
      });

      markersRef.current[temple.id] = marker;
    });
  }, [temples, selectedTempleId]);

  // Sync Pan to Selected Temple
  useEffect(() => {
    const map = leafletMap.current;
    if (!map || !selectedTempleId) return;

    const selectedMarker = markersRef.current[selectedTempleId];
    if (selectedMarker) {
      const position = selectedMarker.getLatLng();
      map.setView(position, 14, { animate: true, duration: 0.8 });
      selectedMarker.openPopup();
    }
  }, [selectedTempleId]);

  // Sync User Location
  useEffect(() => {
    const map = leafletMap.current;
    if (!map) return;

    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }

    if (userLocation) {
      // Create custom pulsing blue dot for GPS
      const userHtml = `
        <div class="relative flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white border-2 border-white shadow-md">
          <span class="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping"></span>
          <div class="h-2 w-2 rounded-full bg-blue-600"></div>
        </div>
      `;

      const userIcon = L.divIcon({
        html: userHtml,
        className: "custom-user-marker",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      userMarkerRef.current = L.marker(userLocation, { icon: userIcon })
        .addTo(map)
        .bindPopup('<span class="text-xs font-semibold">Your Location</span>');

      // Auto pan to user location on initial set
      map.setView(userLocation, map.getZoom(), { animate: true });
    }
  }, [userLocation]);

  // Render Routes (Smart Travel Mode)
  useEffect(() => {
    const map = leafletMap.current;
    if (!map) return;

    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    if (routePoints && routePoints.length > 0) {
      const polyline = L.polyline(routePoints, {
        color: "#d97706",
        weight: 4,
        opacity: 0.8,
        dashArray: "8, 8",
        lineCap: "round",
      }).addTo(map);

      routeLineRef.current = polyline;

      // Fit map to show the entire route path
      const bounds = L.latLngBounds(routePoints);
      map.fitBounds(bounds, { padding: [50, 50], animate: true });
    }
  }, [routePoints]);

  return <div ref={mapRef} className="h-full w-full rounded-2xl shadow-inner border border-glass-border overflow-hidden" />;
}
