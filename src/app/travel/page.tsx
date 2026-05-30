"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "../../components/Navbar";
import Map from "../../components/Map";
import TempleCard from "../../components/TempleCard";
import { db } from "../../services/db";
import { calculateDistance, formatDistance } from "../../utils/distance";
import { 
  Navigation, Car, MapPin, AlertTriangle, Play, Pause, RotateCcw, 
  Home, Utensils, Award, ShieldAlert, Sparkles, Compass
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

// Preset travel corridors for rich interactive demonstration
const CORRIDORS = [
  {
    id: "indore-ujjain",
    name: "Indore - Ujjain Scenic Highway",
    description: "4-lane corridor with historic city temples, hill shrines, and pure highway Bhojanshalas.",
    startCoords: [22.7196, 75.8480] as [number, number], // Indore Kanch
    endCoords: [23.1760, 75.7860] as [number, number], // Ujjain
    templeIds: ["t-indore-kanch", "t-indore-gommatagiri", "t-highway-mahavirgiri", "t-ujjain-avantika"],
  },
  {
    id: "delhi-jaipur",
    name: "Delhi - Jaipur Highway (NH 48)",
    description: "Connects the historic Lal Mandir, Tijara hill complex, and dynamic Jaipur pilgrim hubs.",
    startCoords: [28.6562, 77.2369] as [number, number], // Delhi Lal Mandir
    endCoords: [26.9124, 75.7873] as [number, number], // Jaipur
    templeIds: ["t-delhi-lalmandir", "t-tijara", "t-dynamic-1"],
  },
  {
    id: "gujarat-pilgrim",
    name: "Saurashtra Maha-Tirth Corridor",
    description: "The crown jewel route connecting Shatrunjaya hills in Palitana to Girnar Neminath in Junagadh.",
    startCoords: [21.4984, 71.8022] as [number, number], // Palitana
    endCoords: [21.5284, 70.5204] as [number, number], // Girnar
    templeIds: ["t-palitana", "t-girnar"],
  }
];

export default function SmartTravel() {
  const [temples, setTemples] = useState<Temple[]>([]);
  const [selectedCorridorId, setSelectedCorridorId] = useState(CORRIDORS[0].id);
  
  // Simulation drive states
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [speedKmh, setSpeedKmh] = useState(0);

  // Load Temples from DB
  useEffect(() => {
    async function loadData() {
      const data = await db.getTemples();
      setTemples(data);
    }
    loadData();
  }, []);

  // Compute Active Route Corridor Details
  const activeCorridor = useMemo(() => {
    return CORRIDORS.find(c => c.id === selectedCorridorId) || CORRIDORS[0];
  }, [selectedCorridorId]);

  // Filters temples that belong to this route
  const corridorTemples = useMemo(() => {
    return activeCorridor.templeIds
      .map(id => temples.find(t => t.id === id))
      .filter((t): t is Temple => !!t);
  }, [temples, activeCorridor]);

  // Plots route polylines connecting temples on the map
  const routePoints = useMemo(() => {
    return corridorTemples.map(t => [t.latitude, t.longitude] as [number, number]);
  }, [corridorTemples]);

  // Simulated Car's Live Position
  const simulatedCarLocation = useMemo(() => {
    if (routePoints.length === 0) return null;
    if (simStep === 0) return routePoints[0];
    if (simStep >= 100) return routePoints[routePoints.length - 1];

    // Compute interpolation coordinates along segments of the polyline
    const segmentCount = routePoints.length - 1;
    const totalStepPercentage = simStep / 100;
    const segmentIndex = Math.min(
      Math.floor(totalStepPercentage * segmentCount),
      segmentCount - 1
    );

    const segmentStart = routePoints[segmentIndex];
    const segmentEnd = routePoints[segmentIndex + 1];

    const segmentStep = 1 / segmentCount;
    const stepInSegment = (totalStepPercentage - (segmentIndex * segmentStep)) / segmentStep;

    const lat = segmentStart[0] + (segmentEnd[0] - segmentStart[0]) * stepInSegment;
    const lng = segmentStart[1] + (segmentEnd[1] - segmentStart[1]) * stepInSegment;

    return [lat, lng] as [number, number];
  }, [routePoints, simStep]);

  // Simulation Interval Engine
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSimulating) {
      setSpeedKmh(65); // Standard highway cruising
      interval = setInterval(() => {
        setSimStep((prev) => {
          if (prev >= 100) {
            setIsSimulating(false);
            setSpeedKmh(0);
            return 100;
          }
          return prev + 1; // Increment step
        });
      }, 500); // Trigger every 500ms
    } else {
      setSpeedKmh(0);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  // Reset Simulation
  const resetSimulation = () => {
    setIsSimulating(false);
    setSimStep(0);
    setSpeedKmh(0);
  };

  // Live Radar Proximity alerts relative to simulated car position
  const activeAlerts = useMemo(() => {
    if (!simulatedCarLocation || corridorTemples.length === 0) return [];

    return corridorTemples.map(t => {
      const distance = calculateDistance(
        simulatedCarLocation[0],
        simulatedCarLocation[1],
        t.latitude,
        t.longitude
      );

      // Travel time assuming current speed (fallback to 50km/h if static)
      const travelSpeed = speedKmh > 0 ? speedKmh : 50;
      const travelTimeMin = Math.round((distance / travelSpeed) * 60);

      return {
        temple: t,
        distance,
        travelTimeMin,
      };
    })
    .filter(alert => alert.distance > 0.05 && alert.distance <= 15) // Only alert if between 50m and 15km
    .sort((a, b) => a.distance - b.distance); // Nearest first
  }, [simulatedCarLocation, corridorTemples, speedKmh]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Banner Header */}
      <section className="bg-cream-50 dark:bg-cream-50/20 py-8 border-b border-glass-border spiritual-gradient">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-saffron-100 dark:bg-saffron-900/30 text-saffron-600 dark:text-saffron-500 text-[10px] font-bold uppercase tracking-wider glow-spiritual">
              <Car className="h-3.5 w-3.5" />
              Smart Highway travel companion
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-black text-foreground uppercase tracking-wide">
              Smart Travel Mode
            </h1>
            <p className="text-xs text-cream-800 font-semibold max-w-xl">
              Simulate or track your highway yatra! See upcoming temples, Bhojanshalas, and Dharamshalas within a 15 km radar range dynamically.
            </p>
          </div>

          {/* Corridor Selection Select */}
          <div className="w-full md:w-auto space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-cream-800">
              Select Driving Route
            </label>
            <select
              value={selectedCorridorId}
              onChange={(e) => {
                setSelectedCorridorId(e.target.value);
                resetSimulation();
              }}
              className="w-full md:w-72 px-3 py-2 rounded-xl border border-glass-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-saffron-500/20 text-foreground font-semibold cursor-pointer"
            >
              {CORRIDORS.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Splitscreen Travel Dashboard */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-auto lg:h-[680px]">
          
          {/* Left split: Simulation controls and Driving HUD (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-6 h-full overflow-y-auto pr-1">
            
            {/* Driving Simulator Controller widget */}
            <div className="rounded-2xl border border-glass-border bg-background p-6 shadow-sm space-y-6">
              <h3 className="font-serif text-sm font-bold text-foreground uppercase tracking-wider border-b border-glass-border pb-3 flex justify-between items-center">
                <span>Highway Control Center</span>
                <span className="text-[10px] text-cream-800 uppercase tracking-widest bg-cream-100 px-2 py-0.5 rounded font-bold">
                  {activeCorridor.id === "indore-ujjain" ? "MP Corridor" : "Highway"}
                </span>
              </h3>

              <p className="text-xs text-cream-800 font-semibold leading-relaxed">
                {activeCorridor.description}
              </p>

              {/* HUD Gauge block */}
              <div className="grid grid-cols-3 gap-4 border-y border-glass-border py-4 bg-cream-50/30 rounded-xl px-2">
                <div className="text-center flex flex-col items-center justify-center border-r border-glass-border">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-cream-800 mb-0.5">Speedometer</span>
                  <span className="text-lg font-black text-foreground">{speedKmh} <span className="text-[10px] font-bold">km/h</span></span>
                </div>
                <div className="text-center flex flex-col items-center justify-center border-r border-glass-border">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-cream-800 mb-0.5">Yatra Progress</span>
                  <span className="text-lg font-black text-saffron-500">{simStep}%</span>
                </div>
                <div className="text-center flex flex-col items-center justify-center">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-cream-800 mb-0.5">Radar Range</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-500">15 <span className="text-[10px] font-bold">km</span></span>
                </div>
              </div>

              {/* Sim Controllers */}
              <div className="flex gap-3">
                {isSimulating ? (
                  <button
                    onClick={() => setIsSimulating(false)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-glass-border bg-background hover:bg-cream-100 text-foreground text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    <Pause className="h-4 w-4 text-saffron-500" />
                    Pause Drive
                  </button>
                ) : (
                  <button
                    onClick={() => setIsSimulating(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-saffron-500 text-white text-xs font-bold hover:bg-saffron-600 shadow-md active:scale-95 transition-all uppercase tracking-wider"
                  >
                    <Play className="h-4 w-4" />
                    {simStep === 0 ? "Start Simulating Drive" : "Resume Drive"}
                  </button>
                )}

                <button
                  onClick={resetSimulation}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-glass-border bg-background hover:bg-cream-100 text-foreground transition-colors"
                  title="Reset Journey"
                >
                  <RotateCcw className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Progress Slider */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={simStep}
                  onChange={(e) => {
                    setSimStep(parseInt(e.target.value));
                    if (isSimulating) setIsSimulating(false);
                  }}
                  className="w-full accent-saffron-500 h-2 bg-cream-100 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* LIVE RADAR ALERTS CARD PANEL */}
            <div className="flex-grow flex flex-col space-y-4 min-h-[250px] pb-12 lg:pb-0">
              <div className="flex items-center gap-2 text-xs font-bold text-cream-800 dark:text-cream-800/80 uppercase tracking-widest px-1">
                <ShieldAlert className="h-4.5 w-4.5 text-saffron-500 animate-pulse" />
                <span>Live Radar Ahead ({activeAlerts.length})</span>
              </div>

              <div className="space-y-3.5 overflow-y-auto pr-1 flex-grow">
                {activeAlerts.map((alert) => {
                  const { temple, distance, travelTimeMin } = alert;
                  
                  return (
                    <div 
                      key={temple.id}
                      className="rounded-2xl border border-saffron-200 dark:border-saffron-900/40 bg-gradient-to-tr from-saffron-50/20 to-transparent p-4 flex gap-4 transition-all hover:scale-[1.01] shadow-sm relative overflow-hidden"
                    >
                      {/* Left color alert bar */}
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-saffron-500"></div>

                      <div className="flex-grow space-y-3.5 pl-2">
                        {/* Top Proximity HUD */}
                        <div className="flex items-center justify-between border-b border-glass-border pb-2">
                          <h4 className="font-serif text-sm font-bold text-foreground">
                            {temple.temple_name}
                          </h4>
                          <span className="px-2 py-0.5 rounded bg-saffron-500 text-white font-extrabold text-[9px] uppercase tracking-wider shadow-sm shrink-0">
                            Ahead in {formatDistance(distance)}
                          </span>
                        </div>

                        {/* Facilities Ahead summary */}
                        <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider text-cream-800">
                          {temple.facilities.dharamshala_available && (
                            <span className="flex items-center gap-1 bg-cream-100 dark:bg-cream-200 px-2 py-1 rounded-md text-emerald-700">
                              <Home className="h-3 w-3" />
                              Dharamshala Available
                            </span>
                          )}
                          {temple.facilities.bhojanshala_available && (
                            <span className="flex items-center gap-1 bg-cream-100 dark:bg-cream-200 px-2 py-1 rounded-md text-emerald-700">
                              <Utensils className="h-3 w-3" />
                              Bhojanshala Available
                            </span>
                          )}
                        </div>

                        {/* Navigation and eta alerts */}
                        <div className="flex justify-between items-center text-[10px] font-semibold text-cream-800">
                          <span>Est. Arrival: ~{travelTimeMin} mins</span>
                          
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${temple.latitude},${temple.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-saffron-600 dark:text-saffron-500 font-extrabold hover:text-saffron-700 uppercase tracking-widest no-underline"
                          >
                            Get Directions
                            <Compass className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {activeAlerts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-glass-border bg-cream-50/50">
                    <Navigation className="h-10 w-10 text-cream-800/40 mb-3 animate-pulse" />
                    <h4 className="text-sm font-bold text-foreground mb-1">Radar Scanning Active</h4>
                    <p className="text-xs text-cream-800 max-w-xs">
                      No temples or facilities within 15 km of current simulator coordinate. Drag the slider or play simulation to cruise into proximity zones.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right split: Interactive map with polyline routing (7 cols) */}
          <div className="lg:col-span-7 h-[400px] lg:h-full sticky top-20 z-10">
            <Map
              temples={corridorTemples}
              center={simulatedCarLocation || activeCorridor.startCoords}
              zoom={11}
              selectedTempleId={null}
              userLocation={simulatedCarLocation} // Renders car icon exactly on the interpolated coordinate
              routePoints={routePoints} // Draws a solid saffron dash road connecting markers
            />
          </div>
        </div>
      </section>
    </div>
  );
}
