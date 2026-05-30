"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Map from "../components/Map";
import TempleCard from "../components/TempleCard";
import Filters from "../components/Filters";
import { db } from "../services/db";
import { calculateDistance } from "../utils/distance";
import { Compass, Sparkles, Navigation, AlertCircle, MapPin, Landmark, Heart } from "lucide-react";

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

interface FiltersState {
  searchQuery: string;
  sect: {
    Digambar: boolean;
    Shwetambar: boolean;
    Both: boolean;
  };
  distanceLimit: number;
  state: string;
  city: string;
  facilities: {
    dharamshala_available: boolean;
    bhojanshala_available: boolean;
    parking_available: boolean;
    ac_rooms_available: boolean;
    family_rooms_available: boolean;
    lift_available: boolean;
    wheelchair_accessible: boolean;
    drinking_water_available: boolean;
    online_contact_available: boolean;
  };
}

export default function Home() {
  const [temples, setTemples] = useState<Temple[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Map and Selection State
  const [mapCenter, setMapCenter] = useState<[number, number]>([22.7196, 75.8480]); // Default Indore
  const [mapZoom, setMapZoom] = useState(6);
  const [selectedTempleId, setSelectedTempleId] = useState<string | null>(null);

  // Active filters state
  const [activeFilters, setActiveFilters] = useState<FiltersState | null>(null);

  // Load Temples from DB client
  useEffect(() => {
    async function loadData() {
      const data = await db.getTemples();
      setTemples(data);
    }
    loadData();
  }, []);

  // Request browser geolocation
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coords: [number, number] = [latitude, longitude];
        setUserLocation(coords);
        setMapCenter(coords);
        setMapZoom(11);
        setLocationLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMsg = "Unable to retrieve your location.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Location access denied. Please enable GPS permissions in your browser.";
        }
        setLocationError(errorMsg);
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Auto detect location on initial visit (non-blocking)
  useEffect(() => {
    detectLocation();
  }, []);

  // Extract unique states and cities for filter lists
  const { states, cities } = useMemo(() => {
    const statesSet = new Set<string>();
    const citiesSet = new Set<string>();
    
    temples.forEach((t) => {
      statesSet.add(t.state);
      if (activeFilters?.state && t.state === activeFilters.state) {
        citiesSet.add(t.city);
      } else if (!activeFilters?.state) {
        citiesSet.add(t.city);
      }
    });

    return {
      states: Array.from(statesSet).sort(),
      cities: Array.from(citiesSet).sort(),
    };
  }, [temples, activeFilters?.state]);

  // Compute temple distances and apply comprehensive filters
  const filteredAndSortedTemples = useMemo(() => {
    // 1. Calculate distances first
    const templesWithDistance = temples.map((t) => {
      let distanceKm: number | null = null;
      if (userLocation) {
        distanceKm = calculateDistance(
          userLocation[0],
          userLocation[1],
          t.latitude,
          t.longitude
        );
      }
      return { ...t, distanceKm };
    });

    // 2. Apply filters
    let result = templesWithDistance;

    if (activeFilters) {
      const { searchQuery, sect, distanceLimit, state, city, facilities } = activeFilters;

      // Filter by Keyword Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        result = result.filter(
          (t) =>
            t.temple_name.toLowerCase().includes(query) ||
            t.moolnayak.toLowerCase().includes(query) ||
            t.city.toLowerCase().includes(query) ||
            t.state.toLowerCase().includes(query) ||
            t.history.toLowerCase().includes(query)
        );
      }

      // Filter by Sect
      result = result.filter((t) => {
        if (t.temple_type === "Digambar" && sect.Digambar) return true;
        if (t.temple_type === "Shwetambar" && sect.Shwetambar) return true;
        if (t.temple_type === "Both" && sect.Both) return true;
        return false;
      });

      // Filter by Distance Radius (only if location is available)
      if (userLocation && distanceLimit < 500) {
        result = result.filter((t) => t.distanceKm !== null && t.distanceKm <= distanceLimit);
      }

      // Filter by State
      if (state) {
        result = result.filter((t) => t.state === state);
      }

      // Filter by City
      if (city) {
        result = result.filter((t) => t.city === city);
      }

      // Filter by Facilities checklist (all selected facilities must be true)
      const requiredFacilities = Object.entries(facilities)
        .filter(([_, value]) => value)
        .map(([key]) => key);

      if (requiredFacilities.length > 0) {
        result = result.filter((t) =>
          requiredFacilities.every((fac) => t.facilities[fac as keyof Facilities])
        );
      }
    }

    // 3. Sort temples: Nearest distance first if location available, else alphabetical
    return result.sort((a, b) => {
      if (a.distanceKm !== null && b.distanceKm !== null) {
        return a.distanceKm - b.distanceKm;
      }
      return a.temple_name.localeCompare(b.temple_name);
    });
  }, [temples, userLocation, activeFilters]);

  // Handle direct state directory clicks
  const selectStateFilter = (stateName: string) => {
    setActiveFilters((prev) => {
      const base = prev || {
        searchQuery: "",
        sect: { Digambar: true, Shwetambar: true, Both: true },
        distanceLimit: 500,
        state: "",
        city: "",
        facilities: {
          dharamshala_available: false,
          bhojanshala_available: false,
          parking_available: false,
          ac_rooms_available: false,
          family_rooms_available: false,
          lift_available: false,
          wheelchair_accessible: false,
          drinking_water_available: false,
          online_contact_available: false,
        },
      };
      return { ...base, state: stateName, city: "" };
    });

    // Smooth scroll down to discover splitscreen section
    const discoverSection = document.getElementById("discover-section");
    if (discoverSection) {
      discoverSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleTempleSelect = (temple: Temple) => {
    setSelectedTempleId(temple.id);
  };

  // Predefined Popular Pilgrimage Destinations
  const popularPilgrimages = [
    {
      id: "t-palitana",
      name: "Palitana Shatrunjaya",
      state: "Gujarat",
      desc: "Sacred mountain containing 860+ pristine marble temples.",
      image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=350&q=80",
    },
    {
      id: "t-shikharji",
      name: "Sammed Shikharji",
      state: "Jharkhand",
      desc: "Crown jewel of Nirvana peaks where 20 Tirthankaras attained Moksha.",
      image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=350&q=80",
    },
    {
      id: "t-ranakpur",
      name: "Ranakpur Chaumukha",
      state: "Rajasthan",
      desc: "Stunning marble structure supported by 1,444 uniquely hand-carved pillars.",
      image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=350&q=80",
    },
    {
      id: "t-shravanabelagola",
      name: "Shravanabelagola",
      state: "Karnataka",
      desc: "Home to the historic 57-foot monolithic granite statue of Lord Bahubali.",
      image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=350&q=80",
    },
  ];

  // Predefined State counts for directory grid
  const stateShortcuts = [
    { name: "Madhya Pradesh", temples: 5, color: "from-amber-500/10 to-orange-500/10 border-amber-200" },
    { name: "Rajasthan", temples: 4, color: "from-red-500/10 to-rose-500/10 border-rose-200" },
    { name: "Gujarat", temples: 3, color: "from-emerald-500/10 to-teal-500/10 border-teal-200" },
    { name: "Karnataka", temples: 2, color: "from-blue-500/10 to-indigo-500/10 border-blue-200" },
    { name: "Delhi", temples: 1, color: "from-cyan-500/10 to-sky-500/10 border-cyan-200" },
    { name: "Uttar Pradesh", temples: 1, color: "from-purple-500/10 to-fuchsia-500/10 border-purple-200" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-cream-50 dark:bg-cream-50/20 py-16 md:py-24 border-b border-glass-border spiritual-gradient">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-saffron-100 dark:bg-saffron-900/30 text-saffron-600 dark:text-saffron-500 text-xs font-bold uppercase tracking-wider glow-spiritual">
            <Sparkles className="h-4 w-4" />
            Discover Jain Heritage In India
          </div>
          
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground max-w-4xl mx-auto leading-[1.15]">
            Locate Nearby <span className="text-saffron-500 bg-clip-text">Jain Temples</span> & Travel Facilities Instantly
          </h1>
          
          <p className="text-base sm:text-lg text-cream-800 max-w-2xl mx-auto font-medium">
            Find verified information about Dharamshala, Bhojanshala, Parking, AC Rooms, and contact management while on highways and pilgrimage yatras.
          </p>

          {/* Active location locator panel */}
          <div className="flex flex-col items-center gap-3 pt-4">
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={detectLocation}
                disabled={locationLoading}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-saffron-500 text-white font-bold text-sm hover:bg-saffron-600 shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 tracking-wider uppercase"
              >
                <Navigation className={`h-4.5 w-4.5 ${locationLoading ? "animate-spin" : ""}`} />
                {locationLoading ? "Detecting Live Coordinates..." : "Use My Live Location"}
              </button>
            </div>

            {userLocation ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-500 text-xs font-semibold">
                <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>GPS Connected: [{userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}] • Temples sorted by nearest</span>
              </div>
            ) : locationError ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-500 text-xs font-semibold max-w-md">
                <AlertCircle className="h-3.5 w-3.5 text-red-600 shrink-0" />
                <span>{locationError}</span>
              </div>
            ) : (
              <div className="text-xs text-cream-800 font-medium">
                Waiting for GPS coordinates... (Indore coordinates loaded as center fallback)
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Splitscreen Interactive discovery dashboard */}
      <section id="discover-section" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-auto lg:h-[750px]">
          
          {/* Left panel: Filters (1/3 cols on desktop) and List */}
          <div className="lg:col-span-4 flex flex-col space-y-6 h-full overflow-y-auto pr-1">
            <Filters
              onFilterChange={setActiveFilters}
              availableStates={states}
              availableCities={cities}
              onReset={() => setSelectedTempleId(null)}
            />

            {/* Total Results Summary */}
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-cream-800 dark:text-cream-800/80 uppercase tracking-wider">
                Discoveries Available ({filteredAndSortedTemples.length})
              </span>
              <span className="text-xs font-bold text-saffron-600 dark:text-saffron-500 uppercase">
                {userLocation ? "Nearest First" : "Alphabetical"}
              </span>
            </div>

            {/* Discoveries list scrollable box */}
            <div className="flex flex-col gap-4 overflow-y-auto pr-1 flex-grow pb-12 lg:pb-0 min-h-[400px]">
              {filteredAndSortedTemples.map((temple) => (
                <TempleCard
                  key={temple.id}
                  temple={temple}
                  distanceKm={temple.distanceKm}
                  isSelected={selectedTempleId === temple.id}
                  onSelect={() => handleTempleSelect(temple)}
                />
              ))}

              {filteredAndSortedTemples.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-glass-border bg-cream-50/50">
                  <Landmark className="h-10 w-10 text-cream-800/40 mb-3" />
                  <h4 className="text-sm font-bold text-foreground mb-1">No Jain Temples Match</h4>
                  <p className="text-xs text-cream-800 max-w-xs">
                    Try adjusting your filters, widening the distance radius, or resetting to explore all Indian states.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Sticky map layout (2/3 cols on desktop) */}
          <div className="lg:col-span-8 h-[400px] lg:h-full sticky top-20 z-10">
            <Map
              temples={filteredAndSortedTemples}
              center={mapCenter}
              zoom={mapZoom}
              selectedTempleId={selectedTempleId}
              onSelectTemple={handleTempleSelect}
              userLocation={userLocation}
            />
          </div>
        </div>
      </section>

      {/* State-wise Temple Directory Grid */}
      <section className="bg-cream-100 dark:bg-cream-100/50 py-16 border-y border-glass-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-foreground uppercase tracking-wider">
              State-wise Directory
            </h2>
            <p className="text-xs sm:text-sm text-cream-800 font-medium max-w-xl mx-auto">
              Quick search shortcuts to discover historic Jain temples and Dharamshalas located inside key spiritual states.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stateShortcuts.map((state) => (
              <div
                key={state.name}
                onClick={() => selectStateFilter(state.name)}
                className={`cursor-pointer rounded-2xl border p-5 flex flex-col items-center justify-center text-center transition-all hover:shadow-md hover:-translate-y-1 bg-gradient-to-br ${state.color}`}
              >
                <div className="h-9 w-9 rounded-xl bg-white dark:bg-cream-100 flex items-center justify-center shadow-sm text-saffron-500 mb-3">
                  <Landmark className="h-4.5 w-4.5" />
                </div>
                <h4 className="text-xs font-bold text-foreground mb-0.5 line-clamp-1">
                  {state.name}
                </h4>
                <p className="text-[10px] font-bold text-cream-800 uppercase tracking-wider">
                  {state.temples} Registered
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Pilgrimage Hotspots Section */}
      <section className="py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-foreground uppercase tracking-wider">
              Major Pilgrimage Destinations
            </h2>
            <p className="text-xs sm:text-sm text-cream-800 font-medium max-w-xl mx-auto">
              Revered pilgrimage hotspots (Maha-tirths) visited by thousands of Jain yatris every year.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularPilgrimages.map((p) => (
              <div
                key={p.name}
                onClick={() => {
                  setSelectedTempleId(p.id);
                  const discoverSection = document.getElementById("discover-section");
                  if (discoverSection) discoverSection.scrollIntoView({ behavior: "smooth" });
                }}
                className="group cursor-pointer rounded-2xl overflow-hidden border border-glass-border shadow-sm hover:shadow transition-all bg-background"
              >
                <div className="h-40 overflow-hidden bg-cream-100 relative">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <span className="px-2 py-0.5 rounded bg-saffron-500 text-white font-bold text-[9px] uppercase tracking-wider">
                      {p.state}
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <h4 className="font-serif text-sm font-bold text-foreground line-clamp-1 group-hover:text-saffron-500 transition-colors">
                    {p.name}
                  </h4>
                  <p className="text-[11px] text-cream-800 font-medium line-clamp-2">
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community updates board */}
      <section className="bg-cream-50 dark:bg-cream-50/20 py-12 border-t border-glass-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h3 className="font-serif text-lg font-bold text-foreground uppercase tracking-wider flex items-center justify-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-saffron-500" />
            Empower the Jain Yatra Community
          </h3>
          <p className="text-xs text-cream-800 max-w-md mx-auto font-medium">
            Help fellow travelers discover pure facilities. Registered contributors can suggest temple updates, correct timings, or add missing structures.
          </p>
          <div className="pt-2">
            <Link
              href="/contribute"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-saffron-500 text-saffron-600 dark:text-saffron-500 text-xs font-bold uppercase tracking-wider hover:bg-saffron-500 hover:text-white transition-all shadow-sm active:scale-95"
            >
              Add Missing Temple Details
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-cream-900 dark:bg-black/90 text-white py-12 border-t border-glass-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Landmark className="h-5 w-5 text-saffron-500" />
            <span className="font-serif text-base font-bold tracking-widest text-saffron-500">
              JAIN YATRA INDIA
            </span>
          </div>
          <p className="text-xs text-cream-300 max-w-xl mx-auto font-medium leading-relaxed">
            JainYatra India is an open directory discovery platform built to assist travelers across India. We strictly do not provide booking portals. Please contact trust offices directly for rooms or Bhojanshala availability.
          </p>
          <div className="border-t border-cream-800 dark:border-cream-900 pt-6 mt-6 flex flex-col sm:flex-row justify-between items-center text-[10px] text-cream-300 font-bold uppercase tracking-wider gap-4">
            <div>© {new Date().getFullYear()} JainYatra India. All Rights Reserved.</div>
            <div className="flex gap-4">
              <span className="hover:text-saffron-500 transition-colors">Privacy Policy</span>
              <span>•</span>
              <span className="hover:text-saffron-500 transition-colors">Terms of Service</span>
            </div>
            <div className="flex items-center gap-1">
              Made with <Heart className="h-3 w-3 text-red-500 fill-current" /> for pilgrims
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
