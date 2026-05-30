"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import Navbar from "../../components/Navbar";
import { db } from "../../services/db";
import { 
  ShieldCheck, ShieldAlert, Sparkles, Plus, Edit3, Trash2, Check, X, 
  Database, Info, AlertTriangle, Eye, Compass, Users, Home, Utensils
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

interface CommunityUpdate {
  id: string;
  temple_id?: string;
  update_type: "new_temple" | "correction" | "photo_upload";
  details: any;
  contributor_email: string;
  contributor_name: string;
  status: "pending" | "approved" | "rejected";
  admin_feedback?: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [temples, setTemples] = useState<Temple[]>([]);
  const [suggestions, setSuggestions] = useState<CommunityUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if current user is an Admin
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  const isAdmin = isUserLoaded && userEmail && adminEmails.includes(userEmail);

  // CRUD Modal States
  const [crudModalOpen, setCrudModalOpen] = useState(false);
  const [crudMode, setCrudMode] = useState<"add" | "edit">("add");
  const [activeTempleId, setActiveTempleId] = useState<string | null>(null);

  // Form Fields
  const [templeName, setTempleName] = useState("");
  const [templeType, setTempleType] = useState<"Digambar" | "Shwetambar" | "Both">("Digambar");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [phone, setPhone] = useState("");
  const [history, setHistory] = useState("");
  const [timings, setTimings] = useState("");
  const [moolnayak, setMoolnayak] = useState("");
  const [trustName, setTrustName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [googleMapsLink, setGoogleMapsLink] = useState("");
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [facilities, setFacilities] = useState<Facilities>({
    dharamshala_available: false,
    bhojanshala_available: false,
    parking_available: false,
    ac_rooms_available: false,
    family_rooms_available: false,
    lift_available: false,
    wheelchair_accessible: false,
    drinking_water_available: true,
    online_contact_available: false
  });

  // Suggestion comparison viewer modal states
  const [selectedSugId, setSelectedSugId] = useState<string | null>(null);

  // Fetch admin stats and collections
  async function reloadAdminData() {
    if (isAdmin) {
      const allTemples = await db.getTemples();
      const allSugs = await db.getSuggestions();
      setTemples([...allTemples]);
      setSuggestions([...allSugs]);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (isUserLoaded) {
      reloadAdminData();
    }
  }, [isUserLoaded, isAdmin]);

  const handleFacilityToggle = (key: keyof Facilities) => {
    setFacilities(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSmartImport = async () => {
    if (!googleMapsLink.trim()) {
      alert("Please paste a Google Maps link first.");
      return;
    }

    setIsFetchingDetails(true);
    try {
      console.log("Fetching temple details from Google Maps Link...");
      const response = await fetch("/api/parse-gmaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: googleMapsLink }),
      });

      if (!response.ok) {
        throw new Error("API call failed.");
      }

      const data = await response.json();
      if (data.success) {
        if (data.latitude) setLat(data.latitude.toFixed(5));
        if (data.longitude) setLng(data.longitude.toFixed(5));
        if (data.temple_name) setTempleName(data.temple_name);
        if (data.address) setAddress(data.address);
        if (data.city) setCity(data.city);
        if (data.state) setState(data.state);
        if (data.phone) setPhone(data.phone);
        if (data.timings) setTimings(data.timings);
        
        // Use Google Places photo or fallback satellite view if no places photo is parsed
        if (data.image_url) {
          setImageUrl(data.image_url);
        } else if (data.latitude && data.longitude) {
          const generatedImg = `https://static-maps.yandex.ru/1.x/?ll=${data.longitude},${data.latitude}&z=17&l=sat&size=600,450`;
          setImageUrl(generatedImg);
        }

        alert(`Successfully auto-fetched temple details!\n\nName: ${data.temple_name || "Detected"}\nLocation: [${data.latitude || ""}, ${data.longitude || ""}]\nAddress: ${data.address || ""}`);
      } else {
        alert("Could not automatically resolve temple details. Prefilling location coordinates only.");
        parseLocalCoordinates();
      }
    } catch (err) {
      console.error("Failed to auto-fetch details from URL:", err);
      alert("Network error. Falling back to local coordinates parsing...");
      parseLocalCoordinates();
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const parseLocalCoordinates = () => {
    let detectedLat = "";
    let detectedLng = "";

    const atPattern = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const atMatch = googleMapsLink.match(atPattern);
    if (atMatch) {
      detectedLat = atMatch[1];
      detectedLng = atMatch[2];
    } else {
      const qPattern = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/;
      const qMatch = googleMapsLink.match(qPattern);
      if (qMatch) {
        detectedLat = qMatch[1];
        detectedLng = qMatch[2];
      } else {
        const numberPattern = /(-?\d+\.\d+),\s*(-?\d+\.\d+)/;
        const numMatch = googleMapsLink.match(numberPattern);
        if (numMatch) {
          detectedLat = numMatch[1];
          detectedLng = numMatch[2];
        }
      }
    }

    if (detectedLat && detectedLng) {
      setLat(parseFloat(detectedLat).toFixed(5));
      setLng(parseFloat(detectedLng).toFixed(5));
      const generatedImg = `https://static-maps.yandex.ru/1.x/?ll=${detectedLng},${detectedLat}&z=17&l=sat&size=600,450`;
      setImageUrl(generatedImg);
      alert(`Coordinates parsed locally!\nLatitude: ${detectedLat}\nLongitude: ${detectedLng}`);
    } else {
      alert("Could not extract coordinates from link. Please input coordinates manually.");
    }
  };

  const generateImageFromCoords = () => {
    if (!lat || !lng) {
      alert("Please input Latitude and Longitude coordinates first.");
      return;
    }
    
    const generatedImg = `https://static-maps.yandex.ru/1.x/?ll=${lng},${lat}&z=17&l=sat&size=600,450`;
    setImageUrl(generatedImg);
    alert("Real satellite image generated and loaded from Google Maps coordinates!");
  };

  // Open CRUD Form
  const openAddForm = () => {
    setCrudMode("add");
    setActiveTempleId(null);
    setTempleName("");
    setTempleType("Digambar");
    setState("");
    setCity("");
    setAddress("");
    setLat("");
    setLng("");
    setPhone("");
    setHistory("");
    setTimings("");
    setMoolnayak("");
    setTrustName("");
    setImageUrl("");
    setGoogleMapsLink("");
    setFacilities({
      dharamshala_available: false,
      bhojanshala_available: false,
      parking_available: false,
      ac_rooms_available: false,
      family_rooms_available: false,
      lift_available: false,
      wheelchair_accessible: false,
      drinking_water_available: true,
      online_contact_available: false
    });
    setCrudModalOpen(true);
  };

  const openEditForm = (t: Temple) => {
    setCrudMode("edit");
    setActiveTempleId(t.id);
    setTempleName(t.temple_name);
    setTempleType(t.temple_type);
    setState(t.state);
    setCity(t.city);
    setAddress(t.address);
    setLat(t.latitude.toString());
    setLng(t.longitude.toString());
    setPhone(t.phone);
    setHistory(t.history);
    setTimings(t.timings);
    setMoolnayak(t.moolnayak);
    setTrustName(t.trust_name);
    setImageUrl(t.image_url);
    setGoogleMapsLink("");
    setFacilities(t.facilities);
    setCrudModalOpen(true);
  };

  // CRUD Actions
  const handleCrudSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      temple_name: templeName,
      temple_type: templeType,
      state,
      city,
      address,
      latitude: parseFloat(lat) || 22.0,
      longitude: parseFloat(lng) || 75.0,
      phone,
      history,
      timings,
      moolnayak,
      trust_name: trustName,
      image_url: imageUrl || "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80",
      facilities
    };

    if (crudMode === "add") {
      await db.addTemple(data);
    } else if (crudMode === "edit" && activeTempleId) {
      await db.updateTemple(activeTempleId, data);
    }

    setCrudModalOpen(false);
    reloadAdminData();
  };

  const handleDeleteTemple = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this temple profile?")) {
      await db.deleteTemple(id);
      reloadAdminData();
    }
  };

  // Moderation Queue actions
  const handleApproveSug = async (id: string) => {
    await db.approveSuggestion(id);
    setSelectedSugId(null);
    reloadAdminData();
  };

  const handleRejectSug = async (id: string) => {
    const feedback = prompt("Provide moderator feedback for rejection:", "Incorrect details or unable to verify with temple office.");
    if (feedback !== null) {
      await db.rejectSuggestion(id, feedback);
      setSelectedSugId(null);
      reloadAdminData();
    }
  };

  // Compute Analytics
  const stats = useMemo(() => {
    const total = temples.length;
    const pending = suggestions.filter(s => s.status === "pending").length;
    const dharamshala = temples.filter(t => t.facilities.dharamshala_available).length;
    const bhojanshala = temples.filter(t => t.facilities.bhojanshala_available).length;

    return { total, pending, dharamshala, bhojanshala };
  }, [temples, suggestions]);

  const activeSug = useMemo(() => {
    return suggestions.find(s => s.id === selectedSugId) || null;
  }, [suggestions, selectedSugId]);

  const originalTempleForSug = useMemo(() => {
    if (!activeSug || !activeSug.temple_id) return null;
    return temples.find(t => t.id === activeSug.temple_id) || null;
  }, [activeSug, temples]);

  // Loading screen
  if (!isUserLoaded || loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center bg-cream-50 dark:bg-cream-50/20">
          <div className="flex flex-col items-center gap-2 animate-pulse">
            <div className="h-10 w-10 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold text-cream-800 uppercase tracking-widest">Verifying Moderator Access...</span>
          </div>
        </div>
      </div>
    );
  }

  // 1. Authorization Lockout Wrapper
  if (!isAdmin) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center bg-cream-50 dark:bg-cream-50/20 py-16 px-4">
          <div className="max-w-md w-full bg-background border border-glass-border rounded-2xl p-8 shadow-md text-center space-y-6 animate-fade-in">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-500">
              <ShieldAlert className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-lg font-black text-foreground uppercase tracking-wider">
                Moderator Access Denied
              </h2>
              <p className="text-xs text-cream-800 font-semibold leading-relaxed">
                Moderator and Admin credentials are required to view suggestions, analytics, and manage database records.
              </p>
            </div>

            <div className="rounded-xl border border-glass-border p-4 bg-saffron-50/30 text-xs text-cream-800 font-semibold leading-relaxed">
              <strong>Account Unauthorized:</strong> Your email address ({userEmail || "Unknown"}) is not authorized to access the Admin Panel. If you believe this is an error, please contact the platform administrator.
            </div>

            <div>
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center py-2.5 rounded-xl bg-saffron-500 text-white text-xs font-bold hover:bg-saffron-600 shadow transition-colors uppercase tracking-wider"
              >
                Back to Discovery
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Admin Panel Header */}
      <section className="bg-cream-50 dark:bg-cream-50/20 py-8 border-b border-glass-border spiritual-gradient">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-saffron-100 dark:bg-saffron-900/30 text-saffron-600 dark:text-saffron-500 text-[10px] font-bold uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secured Administration Dashboard
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-black text-foreground uppercase tracking-wide">
              Admin Board
            </h1>
            <p className="text-xs text-cream-800 font-semibold">
              Manage pre-seeded Jain temple catalog, evaluate community contribution suggestion proposals, and view analytics.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-saffron-500 text-white text-xs font-bold hover:bg-saffron-600 shadow active:scale-95 transition-all uppercase tracking-wider"
          >
            <Plus className="h-4 w-4" />
            Add New Temple
          </button>
        </div>
      </section>

      {/* 2. Visual Analytics Widgets */}
      <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="rounded-2xl border border-glass-border bg-background p-5 shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500 flex items-center justify-center shadow-sm">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-cream-800">Total Temples</p>
              <h4 className="text-xl font-black text-foreground">{stats.total}</h4>
            </div>
          </div>

          <div className="rounded-2xl border border-glass-border bg-background p-5 shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-saffron-100 text-saffron-600 dark:bg-saffron-900/30 dark:text-saffron-500 flex items-center justify-center shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-cream-800">Pending Review</p>
              <h4 className="text-xl font-black text-saffron-600 dark:text-saffron-500">{stats.pending}</h4>
            </div>
          </div>

          <div className="rounded-2xl border border-glass-border bg-background p-5 shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-500 flex items-center justify-center shadow-sm">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-cream-800">Dharamshalas</p>
              <h4 className="text-xl font-black text-foreground">{stats.dharamshala}</h4>
            </div>
          </div>

          <div className="rounded-2xl border border-glass-border bg-background p-5 shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-500 flex items-center justify-center shadow-sm">
              <Utensils className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-cream-800">Bhojanshalas</p>
              <h4 className="text-xl font-black text-foreground">{stats.bhojanshala}</h4>
            </div>
          </div>

        </div>
      </section>

      {/* Main Splits Panel */}
      <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 3. Community Approval queue table (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-glass-border bg-background p-5 shadow-sm space-y-4 h-fit max-h-[600px] overflow-y-auto pr-1">
          <h3 className="font-serif text-sm font-bold text-foreground uppercase tracking-wider border-b border-glass-border pb-3 flex justify-between items-center">
            <span>Pending Contribution Proposals</span>
            <span className="text-[9px] px-2 py-0.5 rounded bg-saffron-100 text-saffron-600 font-extrabold uppercase">
              Queue
            </span>
          </h3>

          <div className="space-y-3.5">
            {suggestions
              .filter(s => s.status === "pending")
              .map((sug) => (
                <div
                  key={sug.id}
                  onClick={() => setSelectedSugId(sug.id)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all hover:scale-[1.01] relative overflow-hidden ${
                    selectedSugId === sug.id
                      ? "border-saffron-500 bg-saffron-50/10"
                      : "border-glass-border hover:bg-cream-50/30"
                  }`}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-saffron-500"></div>
                  
                  <div className="space-y-2 pl-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-bold text-foreground line-clamp-1">
                        {sug.update_type === "new_temple" ? sug.details.temple_name : `Correction: ${sug.details.temple_name || "Profile Update"}`}
                      </h4>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-cream-100 dark:bg-cream-200 text-cream-800 font-bold uppercase shrink-0">
                        {sug.update_type === "new_temple" ? "New" : sug.update_type === "photo_upload" ? "Photo" : "Edit"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-cream-800">
                      <span>By: {sug.contributor_name}</span>
                      <span className="flex items-center gap-1 font-bold text-saffron-600 dark:text-saffron-500 uppercase tracking-widest text-[9px]">
                        Review Proposal
                        <Eye className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}

            {suggestions.filter(s => s.status === "pending").length === 0 && (
              <div className="text-center py-12 border border-dashed border-glass-border bg-cream-50/50 rounded-2xl">
                <Check className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-foreground uppercase">Queue is Empty</h4>
                <p className="text-[10px] text-cream-800 max-w-xs mx-auto mt-0.5 leading-relaxed">
                  Excellent work! No community suggestions require moderator attention. Switch role to <strong>Contributor</strong> to submit suggestions!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 4. CRUD Grid Table of Temples (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-glass-border bg-background p-5 shadow-sm space-y-4 h-[600px] flex flex-col">
          <h3 className="font-serif text-sm font-bold text-foreground uppercase tracking-wider border-b border-glass-border pb-3 flex justify-between items-center shrink-0">
            <span>Jain Temple Database Management</span>
            <span className="text-[9px] px-2 py-0.5 rounded bg-amber-100 text-amber-600 font-extrabold uppercase">
              {temples.length} records
            </span>
          </h3>

          <div className="overflow-x-auto flex-grow pr-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-glass-border text-cream-800 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-2.5 px-3">Temple Name</th>
                  <th className="py-2.5 px-3">Sect</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border font-medium">
                {temples.map((t) => (
                  <tr key={t.id} className="hover:bg-cream-50/30">
                    <td className="py-3 px-3 font-bold text-foreground max-w-[200px] truncate">{t.temple_name}</td>
                    <td className="py-3 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold text-white uppercase ${
                        t.temple_type === "Digambar" ? "bg-amber-600" : t.temple_type === "Shwetambar" ? "bg-emerald-600" : "bg-orange-600"
                      }`}>
                        {t.temple_type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-cream-800">{t.city}, {t.state}</td>
                    <td className="py-3 px-3 text-right flex justify-end gap-1.5 mt-0.5">
                      <button
                        onClick={() => openEditForm(t)}
                        className="p-1 rounded hover:bg-cream-100 text-saffron-600"
                        title="Edit profile"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTemple(t.id)}
                        className="p-1 rounded hover:bg-cream-100 text-red-500"
                        title="Delete record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </section>

      {/* 5. COMPARATIVE PROPOSAL APPROVAL PANEL MODAL */}
      {activeSug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="max-w-4xl w-full bg-background border border-glass-border rounded-2xl p-6 md:p-8 shadow-xl space-y-6 my-8">
            <div className="flex justify-between items-center border-b border-glass-border pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-saffron-500">
                  Moderator Evaluation Board
                </span>
                <h3 className="font-serif text-lg font-black text-foreground uppercase tracking-wide">
                  Evaluate Suggestion #{activeSug.id}
                </h3>
              </div>
              <button onClick={() => setSelectedSugId(null)} className="p-1 rounded border border-glass-border text-foreground hover:bg-cream-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Contributor Profile */}
            <div className="p-4 rounded-xl border border-glass-border bg-cream-50/20 text-xs font-semibold text-cream-800 flex flex-wrap justify-between items-center gap-4">
              <span>Contributor: <strong>{activeSug.contributor_name}</strong> ({activeSug.contributor_email})</span>
              <span>Submitted: {new Date(activeSug.created_at).toLocaleString()}</span>
            </div>

            {/* SIDE-BY-SIDE SIDE COMPARISON splits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* Left Column: Original Profile */}
              <div className="rounded-xl border border-glass-border p-4 bg-cream-50/10 space-y-4">
                <h4 className="font-serif text-xs font-bold text-cream-800 uppercase tracking-wider border-b border-glass-border pb-2">
                  {activeSug.update_type === "new_temple" ? "Original Record (N/A)" : "Current Database Profile"}
                </h4>
                
                {originalTempleForSug ? (
                  <div className="space-y-2 text-xs">
                    <p><strong>Name:</strong> {originalTempleForSug.temple_name}</p>
                    <p><strong>Deity:</strong> {originalTempleForSug.moolnayak}</p>
                    <p><strong>Sect:</strong> {originalTempleForSug.temple_type}</p>
                    <p><strong>Location:</strong> {originalTempleForSug.city}, {originalTempleForSug.state}</p>
                    <p><strong>Address:</strong> {originalTempleForSug.address}</p>
                    <p><strong>Office Phone:</strong> {originalTempleForSug.phone || "None declared"}</p>
                    <p><strong>Timings:</strong> {originalTempleForSug.timings}</p>
                    <p><strong>Managing Trust:</strong> {originalTempleForSug.trust_name}</p>
                    <p className="line-clamp-3"><strong>History:</strong> {originalTempleForSug.history}</p>
                    <p><strong>Dharamshala:</strong> {originalTempleForSug.facilities.dharamshala_available ? "✓ Available" : "✗ Unavailable"}</p>
                    <p><strong>Bhojanshala:</strong> {originalTempleForSug.facilities.bhojanshala_available ? "✓ Available" : "✗ Unavailable"}</p>
                  </div>
                ) : (
                  <div className="text-center py-12 text-xs text-cream-800 italic">
                    This is a new temple submission. No original profile exists.
                  </div>
                )}
              </div>

              {/* Right Column: Proposed suggestion updates */}
              <div className="rounded-xl border border-saffron-200 dark:border-saffron-900/40 p-4 bg-saffron-50/5 space-y-4">
                <h4 className="font-serif text-xs font-bold text-saffron-600 dark:text-saffron-500 uppercase tracking-wider border-b border-saffron-200 pb-2">
                  Proposed Community Correction
                </h4>

                <div className="space-y-2 text-xs">
                  <p className="text-saffron-600 font-bold"><strong>Name:</strong> {activeSug.details.temple_name}</p>
                  <p><strong>Deity:</strong> {activeSug.details.moolnayak}</p>
                  <p><strong>Sect:</strong> {activeSug.details.temple_type}</p>
                  <p><strong>Location:</strong> {activeSug.details.city}, {activeSug.details.state}</p>
                  <p><strong>Address:</strong> {activeSug.details.address}</p>
                  <p className="text-saffron-600 font-bold"><strong>Office Phone:</strong> {activeSug.details.phone || "None"}</p>
                  <p className="text-saffron-600 font-bold"><strong>Timings:</strong> {activeSug.details.timings}</p>
                  <p className="text-saffron-600 font-bold"><strong>Managing Trust:</strong> {activeSug.details.trust_name}</p>
                  <p className="line-clamp-3"><strong>History:</strong> {activeSug.details.history}</p>
                  {activeSug.details.facilities && (
                    <>
                      <p><strong>Dharamshala:</strong> {activeSug.details.facilities.dharamshala_available ? "✓ Available" : "✗ Unavailable"}</p>
                      <p><strong>Bhojanshala:</strong> {activeSug.details.facilities.bhojanshala_available ? "✓ Available" : "✗ Unavailable"}</p>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* Moderator Action panel */}
            <div className="flex gap-4 border-t border-glass-border pt-5">
              <button
                onClick={() => handleRejectSug(activeSug.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border border-glass-border bg-background hover:bg-cream-100 text-red-500 text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <X className="h-4 w-4" />
                Reject Suggestion
              </button>
              
              <button
                onClick={() => handleApproveSug(activeSug.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-saffron-500 text-white text-xs font-bold hover:bg-saffron-600 shadow active:scale-[0.98] transition-all uppercase tracking-wider"
              >
                <Check className="h-4 w-4" />
                Approve Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. CRUD CREATE & EDIT DRAWER MODAL */}
      {crudModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <form onSubmit={handleCrudSubmit} className="max-w-3xl w-full bg-background border border-glass-border rounded-2xl p-6 md:p-8 shadow-xl space-y-6 my-8">
            <div className="flex justify-between items-center border-b border-glass-border pb-4">
              <h3 className="font-serif text-lg font-black text-foreground uppercase tracking-wide">
                {crudMode === "add" ? "Create Temple Record" : "Edit Temple Profile"}
              </h3>
              <button type="button" onClick={() => setCrudModalOpen(false)} className="p-1 rounded border border-glass-border text-foreground hover:bg-cream-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Inputs Grid */}
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">Temple Name</label>
                  <input
                    type="text"
                    required
                    value={templeName}
                    onChange={(e) => setTempleName(e.target.value)}
                    className="w-full px-3 py-2 border border-glass-border rounded-xl text-xs bg-cream-50/50 text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">Sect</label>
                  <select
                    value={templeType}
                    onChange={(e) => setTempleType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-glass-border rounded-xl text-xs bg-cream-50/50 text-foreground"
                  >
                    <option value="Digambar">Digambar</option>
                    <option value="Shwetambar">Shwetambar</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 border border-glass-border rounded-xl text-xs bg-cream-50/50 text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-glass-border rounded-xl text-xs bg-cream-50/50 text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">Full Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-glass-border rounded-xl text-xs bg-cream-50/50 text-foreground"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">Latitude</label>
                  <input
                    type="number"
                    step="0.00001"
                    required
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full px-3 py-2 border border-glass-border rounded-xl text-xs bg-cream-50/50 text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">Longitude</label>
                  <input
                    type="number"
                    step="0.00001"
                    required
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full px-3 py-2 border border-glass-border rounded-xl text-xs bg-cream-50/50 text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-glass-border rounded-xl text-xs bg-cream-50/50 text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">Moolnayak</label>
                  <input
                    type="text"
                    required
                    value={moolnayak}
                    onChange={(e) => setMoolnayak(e.target.value)}
                    className="w-full px-3 py-2 border border-glass-border rounded-xl text-xs bg-cream-50/50 text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">Timings</label>
                  <input
                    type="text"
                    required
                    value={timings}
                    onChange={(e) => setTimings(e.target.value)}
                    className="w-full px-3 py-2 border border-glass-border rounded-xl text-xs bg-cream-50/50 text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">Managing Trust</label>
                  <input
                    type="text"
                    required
                    value={trustName}
                    onChange={(e) => setTrustName(e.target.value)}
                    className="w-full px-3 py-2 border border-glass-border rounded-xl text-xs bg-cream-50/50 text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">History</label>
                <textarea
                  required
                  rows={3}
                  value={history}
                  onChange={(e) => setHistory(e.target.value)}
                  className="w-full px-3 py-2 border border-glass-border rounded-xl text-xs bg-cream-50/50 text-foreground resize-y"
                />
              </div>

              {/* Google Maps Smart Importer */}
              <div className="rounded-xl border border-glass-border bg-cream-50/20 p-4 space-y-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-bold text-foreground flex items-center gap-1 uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-saffron-500 animate-pulse"></span>
                    Google Maps Smart Importer
                  </span>
                  <span className="text-[9px] text-cream-800 font-semibold">
                    Paste Google Maps URL or coordinates to auto-extract the location and pull a real satellite image!
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={googleMapsLink}
                    onChange={(e) => setGoogleMapsLink(e.target.value)}
                    placeholder="Paste Google Maps link..."
                    className="flex-grow px-2 py-1.5 border border-glass-border rounded-xl text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-saffron-500"
                  />
                  <button
                    type="button"
                    onClick={handleSmartImport}
                    disabled={isFetchingDetails}
                    className="px-3 py-1.5 bg-saffron-500 text-white rounded-xl text-[10px] font-bold hover:bg-saffron-600 transition-all uppercase tracking-wider shrink-0 disabled:opacity-50"
                  >
                    {isFetchingDetails ? "Fetching..." : "Auto-Fetch"}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4 pt-0.5">
                  <span className="text-[9px] text-cream-800 font-semibold">Or generate from current coords:</span>
                  <button
                    type="button"
                    onClick={generateImageFromCoords}
                    disabled={!lat || !lng}
                    className="px-2.5 py-1 border border-glass-border bg-background text-foreground hover:bg-cream-100 rounded-lg text-[9px] font-bold transition-all disabled:opacity-40"
                  >
                    Generate Satellite Image
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-glass-border rounded-xl text-xs bg-cream-50/50 text-foreground"
                />
              </div>

              {imageUrl && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">Image Preview</label>
                  <div className="h-32 rounded-xl overflow-hidden border border-glass-border bg-cream-100 relative">
                    <img src={imageUrl} alt="Temple preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              {/* Facilities grid checkbox */}
              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">Facilities Available</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { key: "dharamshala_available", label: "Dharamshala" },
                    { key: "bhojanshala_available", label: "Bhojanshala" },
                    { key: "parking_available", label: "Parking" },
                    { key: "ac_rooms_available", label: "AC Rooms" },
                    { key: "family_rooms_available", label: "Family Rooms" },
                    { key: "lift_available", label: "Lift" },
                    { key: "wheelchair_accessible", label: "Wheelchair" },
                    { key: "drinking_water_available", label: "Drinking Water" },
                    { key: "online_contact_available", label: "Online Contact" },
                  ].map((f) => {
                    const isChecked = facilities[f.key as keyof Facilities];
                    return (
                      <div
                        key={f.key}
                        onClick={() => handleFacilityToggle(f.key as keyof Facilities)}
                        className={`flex items-center gap-2 p-2 border rounded-xl cursor-pointer select-none text-[11px] ${
                          isChecked ? "bg-saffron-50/20 border-saffron-500 text-saffron-600 dark:text-saffron-500 font-bold" : "border-glass-border text-foreground hover:bg-cream-50/50"
                        }`}
                      >
                        <div className={`h-4.5 w-4.5 border rounded flex items-center justify-center ${
                          isChecked ? "bg-saffron-500 border-saffron-500 text-white" : "border-glass-border bg-background"
                        }`}>
                          {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        {f.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex gap-4 border-t border-glass-border pt-4">
              <button
                type="button"
                onClick={() => setCrudModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-glass-border bg-background hover:bg-cream-100 text-foreground text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-saffron-500 text-white text-xs font-bold hover:bg-saffron-600 shadow active:scale-[0.98] transition-all uppercase tracking-wider"
              >
                Save Profile
              </button>
            </div>

          </form>
        </div>
      )}
    </div>
  );
}
