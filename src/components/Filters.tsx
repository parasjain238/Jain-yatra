"use client";

import { useState, useEffect } from "react";
import { Search, RotateCcw, Filter, ChevronDown, Check } from "lucide-react";

interface FiltersState {
  searchQuery: string;
  sect: {
    Digambar: boolean;
    Shwetambar: boolean;
    Both: boolean;
  };
  distanceLimit: number; // 0 means no limit
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

interface FiltersProps {
  onFilterChange: (filters: FiltersState) => void;
  availableStates: string[];
  availableCities: string[];
  onReset: () => void;
  isTravelMode?: boolean; // Simplify view for travel mode page if needed
}

const initialFiltersState: FiltersState = {
  searchQuery: "",
  sect: {
    Digambar: true,
    Shwetambar: true,
    Both: true,
  },
  distanceLimit: 500, // Default to 500km search
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

export default function Filters({
  onFilterChange,
  availableStates,
  availableCities,
  onReset,
  isTravelMode = false,
}: FiltersProps) {
  const [filters, setFilters] = useState<FiltersState>(initialFiltersState);

  // Notify parent on change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, searchQuery: e.target.value }));
  };

  const handleSectToggle = (sect: "Digambar" | "Shwetambar" | "Both") => {
    setFilters((prev) => ({
      ...prev,
      sect: {
        ...prev.sect,
        [sect]: !prev.sect[sect],
      },
    }));
  };

  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, distanceLimit: parseInt(e.target.value) }));
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, state: e.target.value, city: "" })); // Reset city on state change
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, city: e.target.value }));
  };

  const handleFacilityToggle = (facilityKey: keyof FiltersState["facilities"]) => {
    setFilters((prev) => ({
      ...prev,
      facilities: {
        ...prev.facilities,
        [facilityKey]: !prev.facilities[facilityKey],
      },
    }));
  };

  const resetAll = () => {
    setFilters(initialFiltersState);
    onReset();
  };

  const facilityLabels: { key: keyof FiltersState["facilities"]; label: string }[] = [
    { key: "dharamshala_available", label: "Dharamshala Available" },
    { key: "bhojanshala_available", label: "Bhojanshala Available" },
    { key: "parking_available", label: "Parking Available" },
    { key: "ac_rooms_available", label: "AC Rooms Available" },
    { key: "family_rooms_available", label: "Family Rooms Available" },
    { key: "lift_available", label: "Lift Available" },
    { key: "wheelchair_accessible", label: "Wheelchair Accessible" },
    { key: "drinking_water_available", label: "Drinking Water" },
    { key: "online_contact_available", label: "Online Contact Available" },
  ];

  return (
    <div className="flex flex-col h-full bg-background border border-glass-border rounded-2xl p-5 shadow-sm space-y-6">
      {/* Filters Title Header */}
      <div className="flex items-center justify-between border-b border-glass-border pb-4">
        <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
          <Filter className="h-4.5 w-4.5 text-saffron-500" />
          Filter Discoveries
        </h3>
        <button
          onClick={resetAll}
          className="flex items-center gap-1 text-[11px] font-bold text-saffron-600 dark:text-saffron-500 hover:text-saffron-700 uppercase tracking-wider"
          title="Reset all filters to default"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>

      {/* Dynamic Search Bar */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-cream-800 dark:text-cream-800/80">
          Keyword Search
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-cream-800/60" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={handleSearchChange}
            placeholder="Search name, deity, or history..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-glass-border bg-cream-50 dark:bg-cream-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500/20 focus:border-saffron-500 transition-all text-foreground"
          />
        </div>
      </div>

      {/* Distance Slider (Only if not in custom route travel mode) */}
      {!isTravelMode && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-wider text-cream-800 dark:text-cream-800/80">
              Maximum Distance Radius
            </label>
            <span className="text-xs font-bold text-saffron-600 dark:text-saffron-500">
              {filters.distanceLimit === 500 ? "Any distance" : `${filters.distanceLimit} km`}
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="500"
            step="10"
            value={filters.distanceLimit}
            onChange={handleDistanceChange}
            className="w-full accent-saffron-500 bg-cream-100 dark:bg-cream-200 h-2 rounded-lg cursor-pointer appearance-none"
          />
          <div className="flex justify-between text-[9px] font-semibold text-cream-800">
            <span>10 km</span>
            <span>250 km</span>
            <span>500 km+</span>
          </div>
        </div>
      )}

      {/* Sect Toggle (Digambar / Shwetambar) */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-cream-800 dark:text-cream-800/80">
          Sect / Tradition
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(["Digambar", "Shwetambar", "Both"] as const).map((sect) => {
            const isChecked = filters.sect[sect];
            return (
              <button
                key={sect}
                onClick={() => handleSectToggle(sect)}
                className={`py-2 rounded-xl text-[11px] font-bold border uppercase tracking-wider text-center transition-all ${
                  isChecked
                    ? "bg-saffron-500 border-saffron-500 text-white shadow-sm"
                    : "border-glass-border text-foreground bg-background hover:bg-cream-50"
                }`}
              >
                {sect}
              </button>
            );
          })}
        </div>
      </div>

      {/* Location Dropdowns */}
      <div className="grid grid-cols-2 gap-3">
        {/* State Select */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-cream-800 dark:text-cream-800/80">
            Select State
          </label>
          <div className="relative">
            <select
              value={filters.state}
              onChange={handleStateChange}
              className="w-full px-3 py-2.5 rounded-xl border border-glass-border bg-cream-50 dark:bg-cream-100 text-xs focus:outline-none focus:ring-2 focus:ring-saffron-500/20 text-foreground appearance-none pr-8 font-medium cursor-pointer"
            >
              <option value="">All States</option>
              {availableStates.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3.5 h-3.5 w-3.5 text-cream-800/60 pointer-events-none" />
          </div>
        </div>

        {/* City Select */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-cream-800 dark:text-cream-800/80">
            Select City
          </label>
          <div className="relative">
            <select
              value={filters.city}
              onChange={handleCityChange}
              disabled={!filters.state}
              className="w-full px-3 py-2.5 rounded-xl border border-glass-border bg-cream-50 dark:bg-cream-100 text-xs focus:outline-none focus:ring-2 focus:ring-saffron-500/20 text-foreground appearance-none pr-8 font-medium disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <option value="">All Cities</option>
              {availableCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3.5 h-3.5 w-3.5 text-cream-800/60 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Facilities Checkboxes */}
      <div className="space-y-3 pt-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-cream-800 dark:text-cream-800/80">
          Required Facilities
        </label>
        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
          {facilityLabels.map((f) => {
            const isChecked = filters.facilities[f.key];
            return (
              <div
                key={f.key}
                onClick={() => handleFacilityToggle(f.key)}
                className="flex items-center gap-3 cursor-pointer group text-xs text-foreground font-semibold py-0.5 select-none"
              >
                <div
                  className={`flex h-4.5 w-4.5 items-center justify-center rounded border transition-all ${
                    isChecked
                      ? "bg-saffron-500 border-saffron-500 text-white"
                      : "border-glass-border bg-background group-hover:border-saffron-500"
                  }`}
                >
                  {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
                <span className="text-cream-900 group-hover:text-saffron-600 transition-colors font-medium">
                  {f.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
