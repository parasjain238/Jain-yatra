import { Temple, MOCK_TEMPLES, CommunityUpdate } from "./mockData";

// Prevent multiple instances of mock database store in development hot reloads
const globalForDb = globalThis as unknown as {
  temples: Temple[];
  suggestions: CommunityUpdate[];
  userRole: "Guest" | "Contributor" | "Admin";
};

// Always reload pre-seeded temples in development so changes in mockData.ts reflect instantly!
if (process.env.NODE_ENV === "development" || !globalForDb.temples) {
  globalForDb.temples = [...MOCK_TEMPLES];
}

if (!globalForDb.userRole) {
  globalForDb.userRole = "Guest";
}

if (!globalForDb.suggestions) {
  globalForDb.suggestions = [
    {
      id: "sug-1",
      temple_id: "t-indore-gommatagiri",
      update_type: "correction",
      details: {
        phone: "+91 94250 58742",
        timings: "5:30 AM - 9:30 PM",
        trust_name: "Gommatagiri Digambar Jain Welfare Trust"
      },
      contributor_email: "paras.jain@example.com",
      contributor_name: "Paras Jain",
      status: "pending",
      created_at: new Date().toISOString()
    },
    {
      id: "sug-2",
      update_type: "new_temple",
      details: {
        temple_name: "Gwalior Gopachal Parvat",
        temple_type: "Digambar",
        state: "Madhya Pradesh",
        city: "Gwalior",
        address: "Gopachal Parvat, Near Gwalior Fort, Gwalior, MP 474001",
        latitude: 26.2166,
        longitude: 78.1692,
        phone: "+91 751 240 9851",
        moolnayak: "Lord Adinath (47-foot monolithic statue)",
        trust_name: "Gopachal Parvat Digambar Jain Kshetr Samiti",
        timings: "6:00 AM - 8:30 PM",
        history: "Gopachal Parvat contains spectacular rock-cut monuments containing gigantic monolithic statues of Jain Tirthankaras carved between 1341 and 1479 AD under Tomar rulers. The largest is a 47-foot seated statue of Lord Adinath.",
        image_url: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80",
        facilities: {
          dharamshala_available: true,
          bhojanshala_available: false,
          parking_available: true,
          ac_rooms_available: false,
          family_rooms_available: false,
          lift_available: false,
          wheelchair_accessible: false,
          drinking_water_available: true,
          online_contact_available: false
        }
      },
      contributor_email: "amit.shah@example.com",
      contributor_name: "Amit Shah",
      status: "pending",
      created_at: new Date().toISOString()
    }
  ];
}

export const db = {
  // Developer Role Switcher API
  getUserRole: () => globalForDb.userRole,
  setUserRole: (role: "Guest" | "Contributor" | "Admin") => {
    globalForDb.userRole = role;
    return role;
  },

  // Temple Database APIs
  getTemples: async (): Promise<Temple[]> => {
    return globalForDb.temples;
  },
  
  getTempleById: async (id: string): Promise<Temple | null> => {
    return globalForDb.temples.find(t => t.id === id) || null;
  },
  
  addTemple: async (temple: Omit<Temple, "id">): Promise<Temple> => {
    const newTemple: Temple = {
      ...temple,
      id: `t-${Date.now()}`
    };
    globalForDb.temples.unshift(newTemple);
    return newTemple;
  },
  
  updateTemple: async (id: string, updates: Partial<Temple>): Promise<Temple | null> => {
    const index = globalForDb.temples.findIndex(t => t.id === id);
    if (index === -1) return null;
    
    // Support facility updates specifically
    if (updates.facilities) {
      updates.facilities = {
        ...globalForDb.temples[index].facilities,
        ...updates.facilities
      };
    }
    
    globalForDb.temples[index] = {
      ...globalForDb.temples[index],
      ...updates
    };
    return globalForDb.temples[index];
  },
  
  deleteTemple: async (id: string): Promise<boolean> => {
    const index = globalForDb.temples.findIndex(t => t.id === id);
    if (index === -1) return false;
    globalForDb.temples.splice(index, 1);
    return true;
  },

  // Community Contribution / Admin Approvals APIs
  getSuggestions: async (): Promise<CommunityUpdate[]> => {
    return globalForDb.suggestions;
  },
  
  addSuggestion: async (suggestion: Omit<CommunityUpdate, "id" | "status" | "created_at">): Promise<CommunityUpdate> => {
    const newSug: CommunityUpdate = {
      ...suggestion,
      id: `sug-${Date.now()}`,
      status: "pending",
      created_at: new Date().toISOString()
    };
    globalForDb.suggestions.unshift(newSug);
    return newSug;
  },
  
  approveSuggestion: async (id: string): Promise<CommunityUpdate | null> => {
    const index = globalForDb.suggestions.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    const sug = globalForDb.suggestions[index];
    sug.status = "approved";
    
    if (sug.update_type === "new_temple") {
      const { facilities, ...basicInfo } = sug.details;
      await db.addTemple({
        ...basicInfo,
        facilities: facilities || {
          dharamshala_available: false,
          bhojanshala_available: false,
          parking_available: false,
          ac_rooms_available: false,
          family_rooms_available: false,
          lift_available: false,
          wheelchair_accessible: false,
          drinking_water_available: true,
          online_contact_available: false
        }
      });
    } else if (sug.update_type === "correction" && sug.temple_id) {
      await db.updateTemple(sug.temple_id, sug.details);
    }
    
    return sug;
  },
  
  rejectSuggestion: async (id: string, feedback?: string): Promise<CommunityUpdate | null> => {
    const index = globalForDb.suggestions.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    globalForDb.suggestions[index].status = "rejected";
    globalForDb.suggestions[index].admin_feedback = feedback || "Incorrect or unverified information.";
    return globalForDb.suggestions[index];
  }
};
