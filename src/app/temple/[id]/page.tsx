"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Map from "../../../components/Map";
import { db } from "../../../services/db";
import { 
  ArrowLeft, MapPin, Phone, Clock, Landmark, ShieldCheck, Compass, HelpCircle,
  Home, Utensils, Car, Wind, Users, ArrowUpDown, Accessibility, Droplet, PhoneCall, Check, X
} from "lucide-react";

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

export default function TempleDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [temple, setTemple] = useState<Temple | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTemple() {
      if (!id) return;
      const data = await db.getTempleById(id);
      setTemple(data);
      setLoading(false);
    }
    loadTemple();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center bg-cream-50 dark:bg-cream-50/20">
          <div className="flex flex-col items-center gap-2 animate-pulse">
            <div className="h-10 w-10 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold text-cream-800 uppercase tracking-widest">Loading Temple Details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!temple) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center bg-cream-50 dark:bg-cream-50/20 px-4 text-center">
          <HelpCircle className="h-14 w-14 text-saffron-500 mb-4 animate-bounce" />
          <h2 className="font-serif text-2xl font-black text-foreground mb-2 uppercase">Temple Not Found</h2>
          <p className="text-xs sm:text-sm text-cream-800 max-w-sm mb-6">
            The temple profile you are trying to view does not exist or may have been removed.
          </p>
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-saffron-500 text-white font-bold text-xs uppercase tracking-wider hover:bg-saffron-600 transition-all shadow"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Discovery
          </Link>
        </div>
      </div>
    );
  }

  // Facility Definitions
  const facilityItems = [
    { key: "dharamshala_available", label: "Dharamshala Available", icon: Home },
    { key: "bhojanshala_available", label: "Bhojanshala Available", icon: Utensils },
    { key: "parking_available", label: "Parking Available", icon: Car },
    { key: "ac_rooms_available", label: "AC Rooms Available", icon: Wind },
    { key: "family_rooms_available", label: "Family Rooms Available", icon: Users },
    { key: "lift_available", label: "Lift Available", icon: ArrowUpDown },
    { key: "wheelchair_accessible", label: "Wheelchair Accessible", icon: Accessibility },
    { key: "drinking_water_available", label: "Drinking Water Available", icon: Droplet },
    { key: "online_contact_available", label: "Online Contact Available", icon: PhoneCall },
  ];

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${temple.latitude},${temple.longitude}`;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Parallax Hero Banner */}
      <section className="relative h-[320px] md:h-[450px] w-full bg-cream-950 overflow-hidden">
        <img 
          src={temple.image_url} 
          alt={temple.temple_name}
          className="h-full w-full object-cover opacity-60"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1200&q=80";
          }}
        />
        
        {/* Saffron Spiritual Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-cream-950 via-cream-950/40 to-transparent"></div>

        {/* Floating Back CTA */}
        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black/40 backdrop-blur border border-white/20 text-white text-xs font-bold uppercase tracking-wider hover:bg-black/60 transition-all shadow-md"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>

        {/* Temple Name Banner Overlay */}
        <div className="absolute bottom-6 left-0 w-full z-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest text-white ${
                temple.temple_type === "Digambar" 
                  ? "bg-amber-600" 
                  : temple.temple_type === "Shwetambar" 
                    ? "bg-emerald-600" 
                    : "bg-orange-600"
              }`}>
                {temple.temple_type} Tradition
              </span>
              
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest bg-white/20 text-white border border-white/10 backdrop-blur flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-saffron-500 fill-current" />
                Verified Profile
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-wide drop-shadow-md">
              {temple.temple_name}
            </h1>

            <p className="flex items-center gap-1.5 text-xs sm:text-sm text-cream-100 font-semibold drop-shadow">
              <MapPin className="h-4 w-4 text-saffron-500 shrink-0" />
              <span>{temple.address}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Layout splits */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Split: Details & Facilities (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Facilities Verification Checklist Grid */}
            <div className="rounded-2xl border border-glass-border bg-background p-6 md:p-8 shadow-sm space-y-6">
              <div className="border-b border-glass-border pb-4 space-y-1">
                <h3 className="font-serif text-lg font-bold text-foreground uppercase tracking-wider">
                  Verified Facilities Checklist
                </h3>
                <p className="text-[11px] text-cream-800 font-semibold">
                  ✓ Yes / ✗ No direct status report from temple trust office.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {facilityItems.map((f) => {
                  const isAvailable = temple.facilities[f.key as keyof Facilities];
                  const Icon = f.icon;
                  return (
                    <div 
                      key={f.key}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                        isAvailable 
                          ? "bg-emerald-50/20 border-emerald-200 dark:bg-emerald-950/10 dark:border-emerald-800" 
                          : "bg-cream-100/30 border-glass-border dark:bg-cream-200/5 opacity-80"
                      }`}
                    >
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg shadow-sm border ${
                        isAvailable 
                          ? "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 text-emerald-600 dark:text-emerald-500" 
                          : "bg-cream-100 dark:bg-cream-200 border-glass-border text-cream-800"
                      }`}>
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-foreground">
                          {f.label.split(" ")[0]}
                        </span>
                        <span className={`text-[10px] font-extrabold flex items-center gap-0.5 ${
                          isAvailable ? "text-emerald-600 dark:text-emerald-500" : "text-cream-800"
                        }`}>
                          {isAvailable ? (
                            <>
                              <Check className="h-3 w-3 stroke-[3]" />
                              Available
                            </>
                          ) : (
                            <>
                              <X className="h-3 w-3 stroke-[3]" />
                              Unavailable
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Strict disclaimer as specified */}
              <div className="rounded-xl bg-cream-100 dark:bg-cream-200 p-4 text-[10px] leading-relaxed text-cream-800 font-semibold flex gap-2">
                <ShieldCheck className="h-5 w-5 text-saffron-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Important Notice:</strong> Room counts and live room availability are NOT supported. Online reservation/bookings are NOT provided. Yatris must directly call or reach out to the trust office using the contact coordinates on the right panel to secure stays or enquire about food timings.
                </span>
              </div>
            </div>

            {/* History and spiritual background block */}
            <div className="rounded-2xl border border-glass-border bg-background p-6 md:p-8 shadow-sm space-y-4">
              <h3 className="font-serif text-lg font-bold text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-glass-border pb-3">
                <Landmark className="h-5 w-5 text-saffron-500" />
                History & Spiritual Heritage
              </h3>
              <p className="text-xs sm:text-sm text-cream-900 leading-relaxed font-medium whitespace-pre-line">
                {temple.history}
              </p>
            </div>

            {/* Additional details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Deity/Moolnayak card */}
              <div className="rounded-2xl border border-glass-border bg-background p-6 shadow-sm space-y-3">
                <h4 className="font-serif text-sm font-bold text-foreground uppercase tracking-wider border-b border-glass-border pb-2">
                  Moolnayak Information
                </h4>
                <div className="space-y-1">
                  <p className="text-xs text-cream-800">Presiding Deity (Moolnayak):</p>
                  <p className="text-sm font-bold text-foreground">{temple.moolnayak}</p>
                </div>
              </div>

              {/* Trust block */}
              <div className="rounded-2xl border border-glass-border bg-background p-6 shadow-sm space-y-3">
                <h4 className="font-serif text-sm font-bold text-foreground uppercase tracking-wider border-b border-glass-border pb-2">
                  Managing Trust Name
                </h4>
                <div className="space-y-1">
                  <p className="text-xs text-cream-800">Official Register:</p>
                  <p className="text-sm font-bold text-foreground">{temple.trust_name}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Split: Directions & Contacts & MiniMap (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick Contact & Action Card */}
            <div className="rounded-2xl border border-glass-border bg-background p-6 shadow-sm space-y-6">
              <h3 className="font-serif text-base font-bold text-foreground uppercase tracking-wider border-b border-glass-border pb-3">
                Temple Office
              </h3>
              
              <div className="space-y-4">
                {/* Timings */}
                <div className="flex items-start gap-3">
                  <Clock className="h-4.5 w-4.5 text-saffron-500 mt-0.5 shrink-0" />
                  <div className="space-y-0.5">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-cream-800">
                      Worship Timings
                    </h5>
                    <p className="text-xs font-semibold text-foreground">
                      {temple.timings}
                    </p>
                  </div>
                </div>

                {/* Contact Phone */}
                <div className="flex items-start gap-3">
                  <Phone className="h-4.5 w-4.5 text-saffron-500 mt-0.5 shrink-0" />
                  <div className="space-y-0.5">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-cream-800">
                      Office Numbers
                    </h5>
                    {temple.phone ? (
                      <p className="text-xs font-bold text-saffron-600 dark:text-saffron-500">
                        {temple.phone}
                      </p>
                    ) : (
                      <p className="text-xs font-semibold text-cream-800 italic">
                        No phone number registered.
                      </p>
                    )}
                  </div>
                </div>

                {/* Address block */}
                <div className="flex items-start gap-3">
                  <MapPin className="h-4.5 w-4.5 text-saffron-500 mt-0.5 shrink-0" />
                  <div className="space-y-0.5">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-cream-800">
                      Postal Address
                    </h5>
                    <p className="text-xs font-medium text-foreground">
                      {temple.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Directions Button CTAs */}
              <div className="space-y-3 pt-2">
                <a
                  href={googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 py-3 rounded-xl bg-saffron-500 text-white text-xs font-bold hover:bg-saffron-600 shadow-md active:scale-95 transition-all uppercase tracking-wider"
                >
                  <Compass className="h-4 w-4" />
                  Navigate with Google Maps
                </a>

                {temple.phone && (
                  <a
                    href={`tel:${temple.phone.replace(/\s+/g, '')}`}
                    className="flex w-full items-center justify-center gap-2 py-3 rounded-xl border border-glass-border bg-background hover:bg-cream-100 text-foreground text-xs font-bold active:scale-95 transition-all uppercase tracking-wider"
                  >
                    <Phone className="h-4 w-4 text-saffron-500" />
                    Call Trust Office
                  </a>
                )}

                <Link
                  href={`/contribute?temple_id=${temple.id}`}
                  className="flex w-full items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-glass-border bg-cream-50/50 hover:bg-cream-50 text-cream-800 text-[10px] font-bold active:scale-95 transition-all uppercase tracking-wider"
                >
                  Suggest Profile Corrections
                </Link>
              </div>
            </div>

            {/* Interactive mini-map zoomed on temple */}
            <div className="rounded-2xl border border-glass-border bg-background overflow-hidden p-4 shadow-sm space-y-3">
              <h4 className="font-serif text-xs font-bold text-foreground uppercase tracking-wider">
                Geographic Proximity Map
              </h4>
              <div className="h-[240px] w-full relative">
                <Map
                  temples={[temple]}
                  center={[temple.latitude, temple.longitude]}
                  zoom={14}
                  selectedTempleId={temple.id}
                />
              </div>
              <div className="flex justify-between text-[10px] text-cream-800 font-semibold">
                <span>Lat: {temple.latitude.toFixed(5)}</span>
                <span>Lng: {temple.longitude.toFixed(5)}</span>
              </div>
            </div>

          </div>

        </div>
      </section>
    </div>
  );
}
