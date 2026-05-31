const fs = require('fs');
const { MOCK_TEMPLES } = require('./src/services/mockData.js');

async function main() {
  const temples = MOCK_TEMPLES;
  console.log(`Total temples before cleanup: ${temples.length}`);

  const uniqueTemples = [];
  const seenIds = new Set();
  // We'll deduplicate by exact name AND city to prevent identical temples in same city
  const seenNamesAndCities = new Set();
  let removedCount = 0;

  for (const t of temples) {
    const nameCityKey = `${t.temple_name.trim().toLowerCase()}-${t.city.trim().toLowerCase()}`;
    if (seenIds.has(t.id) || seenNamesAndCities.has(nameCityKey)) {
      removedCount++;
    } else {
      seenIds.add(t.id);
      seenNamesAndCities.add(nameCityKey);
      uniqueTemples.push(t);
    }
  }

  console.log(`Removed ${removedCount} duplicates.`);
  console.log(`Total temples after cleanup: ${uniqueTemples.length}`);

  if (removedCount > 0) {
    const fileContent = `export interface Facilities {
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

export interface Temple {
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

export interface CommunityUpdate {
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

export const MOCK_TEMPLES: Temple[] = ${JSON.stringify(uniqueTemples, null, 2)};
`;
    
    fs.writeFileSync('src/services/mockData.ts', fileContent);
    console.log("Successfully rewrote mockData.ts with clean data!");
  } else {
    console.log("Database is already perfectly deduplicated!");
  }
}

main().catch(console.error);
