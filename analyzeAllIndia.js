const fs = require('fs');
const { MOCK_TEMPLES } = require('./src/services/mockData.js');

const INDIA_STATES = {
  "Andhra Pradesh": { lat: 15.91, lng: 79.74, cities: ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool"] },
  "Arunachal Pradesh": { lat: 27.1, lng: 93.6, cities: ["Itanagar", "Tawang", "Pasighat", "Ziro"] },
  "Assam": { lat: 26.2, lng: 92.9, cities: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon"] },
  "Bihar": { lat: 25.09, lng: 85.31, cities: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Rajgir", "Pawapuri"] },
  "Chhattisgarh": { lat: 21.2, lng: 81.6, cities: ["Raipur", "Bilaspur", "Durg", "Bhilai", "Korba", "Raigarh"] },
  "Goa": { lat: 15.2, lng: 73.9, cities: ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"] },
  "Gujarat": { lat: 22.25, lng: 71.19, cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Palitana"] },
  "Haryana": { lat: 29.0, lng: 76.0, cities: ["Gurugram", "Faridabad", "Panipat", "Ambala", "Rohtak", "Hisar"] },
  "Himachal Pradesh": { lat: 31.1, lng: 77.1, cities: ["Shimla", "Manali", "Dharamshala", "Solan", "Mandi"] },
  "Jharkhand": { lat: 23.61, lng: 85.27, cities: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Shikharji"] },
  "Karnataka": { lat: 15.31, lng: 75.71, cities: ["Bengaluru", "Mysuru", "Hubli", "Mangaluru", "Belagavi", "Shravanabelagola"] },
  "Kerala": { lat: 10.8, lng: 76.2, cities: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"] },
  "Madhya Pradesh": { lat: 23.47, lng: 77.94, cities: ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar"] },
  "Maharashtra": { lat: 19.75, lng: 75.71, cities: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Kolhapur"] },
  "Manipur": { lat: 24.8, lng: 93.9, cities: ["Imphal", "Churachandpur", "Thoubal", "Kakching"] },
  "Meghalaya": { lat: 25.4, lng: 91.2, cities: ["Shillong", "Tura", "Nongstoin", "Jowai"] },
  "Mizoram": { lat: 23.1, lng: 92.9, cities: ["Aizawl", "Lunglei", "Saiha", "Champhai"] },
  "Nagaland": { lat: 26.1, lng: 94.5, cities: ["Kohima", "Dimapur", "Mokokchung", "Tuensang"] },
  "Odisha": { lat: 20.9, lng: 85.0, cities: ["Bhubaneswar", "Cuttack", "Rourkela", "Puri", "Sambalpur", "Berhampur"] },
  "Punjab": { lat: 31.1, lng: 75.3, cities: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Hoshiarpur"] },
  "Rajasthan": { lat: 27.02, lng: 74.21, cities: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer"] },
  "Sikkim": { lat: 27.5, lng: 88.5, cities: ["Gangtok", "Namchi", "Geyzing", "Mangan"] },
  "Tamil Nadu": { lat: 11.12, lng: 78.65, cities: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"] },
  "Telangana": { lat: 18.11, lng: 79.01, cities: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"] },
  "Tripura": { lat: 23.9, lng: 91.9, cities: ["Agartala", "Dharmanagar", "Udaipur", "Kailashahar"] },
  "Uttar Pradesh": { lat: 26.8, lng: 80.9, cities: ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut", "Ayodhya", "Prayagraj", "Mathura", "Hastinapur"] },
  "Uttarakhand": { lat: 30.0, lng: 79.0, cities: ["Dehradun", "Haridwar", "Roorkee", "Rishikesh", "Haldwani", "Nainital"] },
  "West Bengal": { lat: 22.9, lng: 87.8, cities: ["Kolkata", "Howrah", "Asansol", "Siliguri", "Durgapur", "Darjeeling", "Kharagpur"] }
};

async function main() {
  const temples = MOCK_TEMPLES;
  console.log(`Initial temples in DB: ${temples.length}`);
  
  const uniqueTemples = [];
  const seenIds = new Set();
  const seenNamesAndCities = new Set();
  
  // Deduplicate current DB
  for (const t of temples) {
    const nameCityKey = `${t.temple_name.trim().toLowerCase()}-${t.city.trim().toLowerCase()}`;
    if (!seenIds.has(t.id) && !seenNamesAndCities.has(nameCityKey)) {
      seenIds.add(t.id);
      seenNamesAndCities.add(nameCityKey);
      uniqueTemples.push(t);
    }
  }

  const generated = [];
  
  for (const [state, data] of Object.entries(INDIA_STATES)) {
    const existingInState = uniqueTemples.filter(t => t.state === state);
    const coveredCities = new Set(existingInState.map(t => t.city.toLowerCase()));
    
    for (const city of data.cities) {
      if (!coveredCities.has(city.toLowerCase())) {
        // Generate 3 temples per missing city to ensure coverage without bloating too hard
        for (let i = 1; i <= 3; i++) {
          const latOffset = (Math.random() - 0.5) * 0.5;
          const lngOffset = (Math.random() - 0.5) * 0.5;
          
          const safeName = city.toLowerCase().replace(/[^a-z0-9]/g, '');
          const type = Math.random() > 0.5 ? "Digambar" : "Shwetambar";
          const deity = type === "Digambar" ? "Lord Mahavir" : "Lord Parshvanath";
          
          const newTemple = {
            id: `t-${state.slice(0,2).toLowerCase()}-${safeName}-a${i}`,
            temple_name: `Shree ${type} Jain Mandir - ${city} ${i}`,
            temple_type: type,
            state: state,
            city: city,
            address: `Jain Mohalla, ${city}, ${state}`,
            latitude: parseFloat((data.lat + latOffset).toFixed(5)),
            longitude: parseFloat((data.lng + lngOffset).toFixed(5)),
            phone: `+91 9${Math.floor(100000000 + Math.random() * 900000000)}`,
            history: `A serene ${type} Jain temple located in the heart of ${city}, ${state}.`,
            timings: "6:00 AM - 8:30 PM",
            moolnayak: deity,
            trust_name: `Shree ${city} Jain Trust`,
            image_url: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Sonagiri.jpg",
            facilities: {
              dharamshala_available: Math.random() > 0.6,
              bhojanshala_available: Math.random() > 0.5,
              parking_available: Math.random() > 0.3,
              ac_rooms_available: false,
              family_rooms_available: false,
              lift_available: false,
              wheelchair_accessible: Math.random() > 0.4,
              drinking_water_available: true,
              online_contact_available: false
            }
          };
          
          const nameCityKey = `${newTemple.temple_name.trim().toLowerCase()}-${newTemple.city.trim().toLowerCase()}`;
          if (!seenNamesAndCities.has(nameCityKey)) {
             seenNamesAndCities.add(nameCityKey);
             generated.push(newTemple);
          }
        }
      }
    }
  }
  
  if (generated.length > 0) {
    console.log(`Generated ${generated.length} new temples for missing states across India.`);
    uniqueTemples.push(...generated);
  }

  if (generated.length > 0) {
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
    try { fs.unlinkSync('./src/services/mockData.js'); } catch (e) {}
    console.log("Successfully rewrote mockData.ts with completely deduplicated ALL INDIA data!");
  } else {
    console.log("All 28 states and their major cities are already populated with zero duplicates.");
  }
}

main().catch(console.error);
