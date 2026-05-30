"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import { db } from "../../services/db";
import { 
  Sparkles, Landmark, Info, CheckCircle, ArrowLeft, Send, Image,
  Home, Utensils, Car, Wind, Users, ArrowUpDown, Accessibility, Droplet, PhoneCall
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

function ContributeForm() {
  const searchParams = useSearchParams();
  const preselectedTempleId = searchParams.get("temple_id");

  const [temples, setTemples] = useState<Temple[]>([]);
  const [formType, setFormType] = useState<"new_temple" | "correction" | "photo_upload">("new_temple");
  
  // Contributor details
  const [contributorName, setContributorName] = useState("");
  const [contributorEmail, setContributorEmail] = useState("");

  // Common Form States
  const [selectedTempleId, setSelectedTempleId] = useState("");
  
  // Temple Profile Fields (for new temple and corrections)
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

  // Facility Flags
  const [facilities, setFacilities] = useState<Facilities>({
    dharamshala_available: false,
    bhojanshala_available: false,
    parking_available: false,
    ac_rooms_available: false,
    family_rooms_available: false,
    lift_available: false,
    wheelchair_accessible: false,
    drinking_water_available: true,
    online_contact_available: false,
  });

  // Photo upload states
  const [photoDescription, setPhotoDescription] = useState("");
  
  // Submit feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [ticketId, setTicketId] = useState("");

  // Load available temples list for correction select dropdowns
  useEffect(() => {
    async function loadData() {
      const data = await db.getTemples();
      setTemples(data);
      
      if (preselectedTempleId) {
        setFormType("correction");
        setSelectedTempleId(preselectedTempleId);
      }
    }
    loadData();
  }, [preselectedTempleId]);

  // Pre-populate fields on existing temple selection
  useEffect(() => {
    if (formType === "correction" && selectedTempleId) {
      const selected = temples.find(t => t.id === selectedTempleId);
      if (selected) {
        setTempleName(selected.temple_name);
        setTempleType(selected.temple_type);
        setState(selected.state);
        setCity(selected.city);
        setAddress(selected.address);
        setLat(selected.latitude.toString());
        setLng(selected.longitude.toString());
        setPhone(selected.phone);
        setHistory(selected.history);
        setTimings(selected.timings);
        setMoolnayak(selected.moolnayak);
        setTrustName(selected.trust_name);
        setImageUrl(selected.image_url);
        setFacilities(selected.facilities);
      }
    } else if (formType === "new_temple") {
      // Clear fields
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
      setFacilities({
        dharamshala_available: false,
        bhojanshala_available: false,
        parking_available: false,
        ac_rooms_available: false,
        family_rooms_available: false,
        lift_available: false,
        wheelchair_accessible: false,
        drinking_water_available: true,
        online_contact_available: false,
      });
    }
  }, [selectedTempleId, formType, temples]);

  const handleFacilityToggle = (key: keyof Facilities) => {
    setFacilities(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributorName || !contributorEmail) {
      alert("Please fill in your contributor credentials.");
      return;
    }

    setIsSubmitting(true);

    let details: any = {};

    if (formType === "new_temple" || formType === "correction") {
      details = {
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
    } else if (formType === "photo_upload") {
      details = {
        temple_id: selectedTempleId,
        photo_url: imageUrl || "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80",
        description: photoDescription
      };
    }

    try {
      const suggestion = await db.addSuggestion({
        temple_id: formType === "new_temple" ? undefined : selectedTempleId,
        update_type: formType,
        details,
        contributor_email: contributorEmail,
        contributor_name: contributorName
      });

      setTicketId(suggestion.id);
      setSubmitSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Error submitting proposal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const facilityLabels: { key: keyof Facilities; label: string; icon: any }[] = [
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

  if (submitSuccess) {
    return (
      <div className="max-w-md w-full bg-background border border-glass-border rounded-2xl p-8 shadow-md text-center space-y-6 animate-fade-in mx-auto">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-500">
          <CheckCircle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif text-xl sm:text-2xl font-black text-foreground uppercase tracking-wider">
            Suggestion Submitted!
          </h2>
          <p className="text-xs text-cream-800 font-semibold">
            Your proposal has been successfully queued for moderator review.
          </p>
        </div>

        <div className="rounded-xl border border-dashed border-glass-border p-4 bg-cream-50/30 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cream-800">
            Verification Ticket ID
          </span>
          <p className="font-mono text-sm font-bold text-saffron-600 dark:text-saffron-500">
            {ticketId}
          </p>
        </div>

        <div className="text-xs text-cream-800 leading-relaxed max-w-xs mx-auto font-medium">
          To test the moderator approval flow instantly, use the **Navbar Role Switcher** to become an <strong>Admin</strong>, open the <strong>Admin Panel</strong>, and approve this suggestion!
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => {
              setSubmitSuccess(false);
              setTicketId("");
            }}
            className="flex-1 py-2.5 rounded-xl border border-glass-border bg-background hover:bg-cream-100 text-foreground text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Submit Another
          </button>
          <Link
            href="/"
            className="flex-1 flex items-center justify-center py-2.5 rounded-xl bg-saffron-500 text-white text-xs font-bold hover:bg-saffron-600 shadow transition-colors uppercase tracking-wider"
          >
            Back Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-background border border-glass-border rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
      
      {/* Section 1: Contributor Profile */}
      <div className="space-y-4">
        <h3 className="font-serif text-sm font-bold text-foreground uppercase tracking-wider border-b border-glass-border pb-2 flex items-center gap-2">
          <Info className="h-4.5 w-4.5 text-saffron-500" />
          1. Contributor Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">
              Your Full Name
            </label>
            <input
              type="text"
              required
              value={contributorName}
              onChange={(e) => setContributorName(e.target.value)}
              placeholder="e.g. Paras Jain"
              className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-cream-50/50 dark:bg-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500/20 text-foreground"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">
              Email Address
            </label>
            <input
              type="email"
              required
              value={contributorEmail}
              onChange={(e) => setContributorEmail(e.target.value)}
              placeholder="e.g. paras@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-cream-50/50 dark:bg-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500/20 text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Suggestion Type Switch */}
      <div className="space-y-4">
        <h3 className="font-serif text-sm font-bold text-foreground uppercase tracking-wider border-b border-glass-border pb-2 flex items-center gap-2">
          <Landmark className="h-4.5 w-4.5 text-saffron-500" />
          2. What details would you like to contribute?
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {(["new_temple", "correction", "photo_upload"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFormType(type)}
              className={`py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest text-center transition-all ${
                formType === type
                  ? "bg-saffron-500 border-saffron-500 text-white shadow"
                  : "border-glass-border text-foreground bg-background hover:bg-cream-50"
              }`}
            >
              {type === "new_temple" ? "New Temple" : type === "correction" ? "Correct Info" : "Upload Photo"}
            </button>
          ))}
        </div>
      </div>

      {/* Form Switch Area */}
      <div className="space-y-6">
        
        {/* If correcting info or uploading photo, display Temple Selector */}
        {formType !== "new_temple" && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">
              Select Target Temple Profile
            </label>
            <select
              required
              value={selectedTempleId}
              onChange={(e) => setSelectedTempleId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-cream-50/50 dark:bg-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500/20 text-foreground font-semibold cursor-pointer"
            >
              <option value="">-- Choose Existing Temple profile --</option>
              {temples.map(t => (
                <option key={t.id} value={t.id}>
                  {t.temple_name} ({t.city}, {t.state})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Render inputs for New Temple / Corrections */}
        {formType !== "photo_upload" && (formType === "new_temple" || selectedTempleId) && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="font-serif text-sm font-bold text-foreground uppercase tracking-wider border-b border-glass-border pb-2">
              3. Temple Profile Information
            </h3>
            
            {/* Temple Name & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">
                  Temple Profile Name
                </label>
                <input
                  type="text"
                  required
                  value={templeName}
                  onChange={(e) => setTempleName(e.target.value)}
                  placeholder="e.g. Tijara Chandraprabhu Tirth"
                  className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-cream-50/50 dark:bg-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500/20 text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">
                  Temple Tradition
                </label>
                <select
                  value={templeType}
                  onChange={(e) => setTempleType(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-cream-50/50 dark:bg-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500/20 text-foreground font-semibold cursor-pointer"
                >
                  <option value="Digambar">Digambar</option>
                  <option value="Shwetambar">Shwetambar</option>
                  <option value="Both">Both traditions</option>
                </select>
              </div>
            </div>

            {/* State & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">
                  State / Union Territory
                </label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Rajasthan"
                  className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-cream-50/50 dark:bg-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500/20 text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">
                  City / Village
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Alwar"
                  className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-cream-50/50 dark:bg-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500/20 text-foreground"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">
                Full Postal Address
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Alwar Road, Tijara, Alwar District, Rajasthan 301411"
                className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-cream-50/50 dark:bg-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500/20 text-foreground"
              />
            </div>

            {/* Coordinates & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">
                  Latitude Coordinates
                </label>
                <input
                  type="number"
                  step="0.00001"
                  required
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="e.g. 27.9288"
                  className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-cream-50/50 dark:bg-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500/20 text-foreground"
                />
          </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">
                  Longitude Coordinates
                </label>
                <input
                  type="number"
                  step="0.00001"
                  required
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="e.g. 76.8574"
                  className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-cream-50/50 dark:bg-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500/20 text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">
                  Office Contact Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 1469 222 101"
                  className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-cream-50/50 dark:bg-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500/20 text-foreground"
                />
              </div>
            </div>

            {/* Timings, Moolnayak, Trust */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">
                  Presiding Deity (Moolnayak)
                </label>
                <input
                  type="text"
                  required
                  value={moolnayak}
                  onChange={(e) => setMoolnayak(e.target.value)}
                  placeholder="e.g. Lord Chandraprabhu"
                  className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-cream-50/50 dark:bg-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500/20 text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">
                  Worship Timings
                </label>
                <input
                  type="text"
                  required
                  value={timings}
                  onChange={(e) => setTimings(e.target.value)}
                  placeholder="e.g. 5:00 AM - 9:30 PM"
                  className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-cream-50/50 dark:bg-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500/20 text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">
                  Managing Trust Name
                </label>
                <input
                  type="text"
                  required
                  value={trustName}
                  onChange={(e) => setTrustName(e.target.value)}
                  placeholder="e.g. Shree Digambar Jain Trust"
                  className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-cream-50/50 dark:bg-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500/20 text-foreground"
                />
              </div>
            </div>

            {/* History */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">
                Temple History & Heritage
              </label>
              <textarea
                required
                rows={4}
                value={history}
                onChange={(e) => setHistory(e.target.value)}
                placeholder="Provide details about structural construction, ancient records, miraculous discoveries, or local legends..."
                className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-cream-50/50 dark:bg-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500/20 text-foreground resize-y font-medium"
              />
            </div>

            {/* Photo URL */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">
                Temple Image URL (Unsplash or web link)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-cream-50/50 dark:bg-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500/20 text-foreground"
              />
            </div>

            {/* Facilities Checklist Flags */}
            <div className="space-y-4 pt-2">
              <h3 className="font-serif text-sm font-bold text-foreground uppercase tracking-wider border-b border-glass-border pb-2">
                4. Available Facilities Declare
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {facilityLabels.map((f) => {
                  const isChecked = facilities[f.key as keyof Facilities];
                  const Icon = f.icon;
                  return (
                    <div
                      key={f.key}
                      onClick={() => handleFacilityToggle(f.key as keyof Facilities)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                        isChecked
                          ? "bg-saffron-50/20 border-saffron-500 text-saffron-600 dark:text-saffron-500 font-bold"
                          : "border-glass-border text-foreground hover:bg-cream-50/50"
                      }`}
                    >
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center border shadow-sm ${
                        isChecked 
                          ? "bg-saffron-100 border-saffron-200" 
                          : "bg-cream-100 border-glass-border text-cream-800"
                      }`}>
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <span className="text-xs">{f.label.split(" ")[0]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* Photo Upload Section */}
        {formType === "photo_upload" && selectedTempleId && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="font-serif text-sm font-bold text-foreground uppercase tracking-wider border-b border-glass-border pb-2 flex items-center gap-2">
              <Image className="h-4.5 w-4.5 text-saffron-500" />
              3. Submit Photo Details
            </h3>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">
                Photo URL (Unsplash or web link)
              </label>
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-cream-50/50 dark:bg-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500/20 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">
                Caption / Description
              </label>
              <input
                type="text"
                required
                value={photoDescription}
                onChange={(e) => setPhotoDescription(e.target.value)}
                placeholder="e.g. Newly constructed Bhojanshala main dining hall view."
                className="w-full px-4 py-2.5 rounded-xl border border-glass-border bg-cream-50/50 dark:bg-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500/20 text-foreground"
              />
            </div>
          </div>
        )}
      </div>

      {/* Form Submit buttons */}
      <div className="flex gap-4 border-t border-glass-border pt-6 mt-6">
        <Link
          href="/"
          className="flex-1 py-3 rounded-xl border border-glass-border bg-background hover:bg-cream-100 text-foreground text-xs font-bold text-center uppercase tracking-wider transition-colors"
        >
          Cancel
        </Link>
        
        <button
          type="submit"
          disabled={isSubmitting || (formType !== "new_temple" && !selectedTempleId)}
          className="flex-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-saffron-500 text-white text-xs font-bold hover:bg-saffron-600 shadow active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider"
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? "Submitting..." : "Submit Proposal For Review"}
        </button>
      </div>

    </form>
  );
}

export default function Contribute() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <section className="bg-cream-50 dark:bg-cream-50/20 py-10 border-b border-glass-border spiritual-gradient">
        <div className="mx-auto max-w-3xl px-4 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-saffron-100 dark:bg-saffron-900/30 text-saffron-600 dark:text-saffron-500 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            Empower the Yatra community
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-black text-foreground uppercase tracking-wide">
            JainYatra Contribution wizard
          </h1>
          <p className="text-xs text-cream-800 font-semibold max-w-xl mx-auto">
            Suggest profile corrections, upload photos, or submit missing temples. Help thousands of yatris travel safely across India with verified facilities.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl w-full px-4 py-12 flex-grow">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center bg-background border border-glass-border rounded-2xl p-16 shadow-sm animate-pulse text-center">
            <div className="h-10 w-10 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <span className="text-xs font-bold text-cream-800 uppercase tracking-wider">Loading Contribution Form...</span>
          </div>
        }>
          <ContributeForm />
        </Suspense>
      </section>
    </div>
  );
}
