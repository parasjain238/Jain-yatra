"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

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

interface MapProps {
  temples: Temple[];
  center: [number, number];
  zoom: number;
  selectedTempleId?: string | null;
  onSelectTemple?: (temple: Temple) => void;
  userLocation?: [number, number] | null;
  routePoints?: [number, number][];
}

// Dynamically import MapClient to prevent Next.js SSR error with window/document
const MapClient = dynamic(() => import("./MapClient"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl bg-cream-100 dark:bg-cream-100 border border-glass-border animate-pulse">
      <Loader2 className="h-8 w-8 animate-spin text-saffron-500 mb-2" />
      <span className="text-xs font-semibold text-cream-800 tracking-wider uppercase">Loading Interactive Map...</span>
    </div>
  ),
});

export default function Map(props: MapProps) {
  return <MapClient {...props} />;
}
