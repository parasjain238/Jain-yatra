"use client";

import Link from "next/link";
import { 
  MapPin, Phone, Compass, ArrowRight, Check,
  Home, Utensils, Car, Wind, Users, ArrowUpDown, Accessibility, Droplet, PhoneCall
} from "lucide-react";
import { formatDistance, formatTravelTime, estimateTravelTime } from "../utils/distance";

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

interface TempleCardProps {
  temple: Temple;
  distanceKm?: number | null;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function TempleCard({
  temple,
  distanceKm,
  isSelected = false,
  onSelect,
}: TempleCardProps) {
  const travelTimeMinutes = distanceKm ? estimateTravelTime(distanceKm) : null;
  const searchName = `${temple.temple_name}, ${temple.city}, ${temple.state}`;
  const imageSource = `/api/places-photo?name=${encodeURIComponent(searchName)}&fallback=${encodeURIComponent(temple.image_url)}`;

  // Compile list of facility icons to display on card (only showing active ones)
  const activeFacilities = [
    { key: "dharamshala_available", label: "Dharamshala", icon: Home },
    { key: "bhojanshala_available", label: "Bhojanshala", icon: Utensils },
    { key: "parking_available", label: "Parking", icon: Car },
    { key: "ac_rooms_available", label: "AC Rooms", icon: Wind },
    { key: "family_rooms_available", label: "Family Stay", icon: Users },
    { key: "lift_available", label: "Lift", icon: ArrowUpDown },
    { key: "wheelchair_accessible", label: "Wheelchair", icon: Accessibility },
    { key: "drinking_water_available", label: "Water", icon: Droplet },
    { key: "online_contact_available", label: "Online Contact", icon: PhoneCall },
  ].filter(f => temple.facilities[f.key as keyof Facilities]);

  // Google Maps Directions link
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${temple.latitude},${temple.longitude}`;

  return (
    <div 
      onClick={onSelect}
      className={`group relative flex flex-col rounded-2xl border bg-background overflow-hidden transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-1 ${
        isSelected 
          ? "border-saffron-500 ring-2 ring-saffron-500/20" 
          : "border-glass-border"
      }`}
    >
      {/* Temple Banner Image */}
      <div className="relative h-48 w-full overflow-hidden bg-cream-100">
        <img 
          src={imageSource} 
          alt={temple.temple_name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            // Fallback image if unsplash link fails
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80";
          }}
        />
        
        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-white ${
            temple.temple_type === "Digambar" 
              ? "bg-amber-600" 
              : temple.temple_type === "Shwetambar" 
                ? "bg-emerald-600" 
                : "bg-orange-600"
          }`}>
            {temple.temple_type}
          </span>
          
          {distanceKm !== undefined && distanceKm !== null && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-saffron-600 shadow-sm flex items-center gap-1">
              <Compass className="h-3 w-3" />
              {formatDistance(distanceKm)}
            </span>
          )}
        </div>
      </div>

      {/* Card Details */}
      <div className="flex flex-col flex-grow p-5">
        <div className="mb-2">
          <div className="flex items-start justify-between">
            <h3 className="font-serif text-base font-bold text-foreground line-clamp-1 group-hover:text-saffron-500 transition-colors">
              {temple.temple_name}
            </h3>
          </div>
          <p className="flex items-center gap-1 text-xs text-cream-800 font-medium">
            <MapPin className="h-3.5 w-3.5 text-saffron-500 shrink-0" />
            <span>{temple.city}, {temple.state}</span>
          </p>
        </div>

        {/* Travel stats overlay */}
        {distanceKm !== undefined && distanceKm !== null && travelTimeMinutes && (
          <div className="mb-3 px-3 py-1.5 rounded-lg bg-saffron-50 dark:bg-saffron-900/10 text-[11px] font-semibold text-saffron-600 dark:text-saffron-500 flex justify-between items-center">
            <span>Travel Time:</span>
            <span>{formatTravelTime(travelTimeMinutes)} (via Car)</span>
          </div>
        )}

        {/* Moolnayak preview */}
        <div className="text-[11px] text-cream-800 dark:text-cream-800/80 mb-4 line-clamp-2">
          <span className="font-bold text-foreground">Moolnayak:</span> {temple.moolnayak}
        </div>

        {/* Facilities Grid */}
        <div className="border-t border-glass-border pt-3 mb-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-cream-800 dark:text-cream-800/80 mb-2">
            Available Facilities
          </p>
          <div className="flex flex-wrap gap-2.5">
            {activeFacilities.slice(0, 5).map((f) => {
              const Icon = f.icon;
              return (
                <div 
                  key={f.key}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-cream-100 dark:bg-cream-200 text-cream-800 dark:text-cream-800/80 hover:bg-saffron-100 hover:text-saffron-600 transition-colors"
                  title={f.label}
                >
                  <Icon className="h-4 w-4" />
                </div>
              );
            })}
            {activeFacilities.length > 5 && (
              <div 
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-cream-100 dark:bg-cream-200 text-[10px] font-bold text-cream-800"
                title={`+${activeFacilities.length - 5} more facilities`}
              >
                +{activeFacilities.length - 5}
              </div>
            )}
            {activeFacilities.length === 0 && (
              <span className="text-[10px] text-cream-800 italic">No facilities declared.</span>
            )}
          </div>
        </div>

        {/* Actions Button panel */}
        <div className="mt-auto flex gap-2 border-t border-glass-border pt-4">
          {/* Navigate with Google Maps */}
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()} // Stop triggering card select
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-saffron-500 text-white text-xs font-bold hover:bg-saffron-600 transition-all shadow-sm hover:shadow active:scale-95 uppercase tracking-wider"
          >
            <Compass className="h-3.5 w-3.5" />
            Navigate
          </a>
          
          {/* Quick Contact Button */}
          {temple.phone ? (
            <a
              href={`tel:${temple.phone.replace(/\s+/g, '')}`}
              onClick={(e) => e.stopPropagation()}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-glass-border bg-background hover:bg-cream-100 dark:hover:bg-cream-200 text-foreground transition-colors"
              title={`Call Temple: ${temple.phone}`}
            >
              <Phone className="h-4 w-4 text-saffron-500" />
            </a>
          ) : (
            <button
              disabled
              onClick={(e) => e.stopPropagation()}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-glass-border bg-cream-100 text-cream-800 opacity-40 cursor-not-allowed"
              title="No phone number declared"
            >
              <Phone className="h-4 w-4" />
            </button>
          )}

          {/* Deep-dive Details Button */}
          <Link
            href={`/temple/${temple.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-cream-100 dark:bg-cream-200 text-cream-800 dark:text-cream-800/80 hover:bg-saffron-100 hover:text-saffron-600 transition-colors"
            title="View Detailed Information"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
