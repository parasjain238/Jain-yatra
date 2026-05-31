const fs = require('fs');

const missingDistricts = [
  { name: 'Agar Malwa', lat: 23.71, lng: 76.01 },
  { name: 'Alirajpur', lat: 22.30, lng: 74.35 },
  { name: 'Anuppur', lat: 23.10, lng: 81.69 },
  { name: 'Ashoknagar', lat: 24.58, lng: 77.73 },
  { name: 'Balaghat', lat: 21.81, lng: 80.18 },
  { name: 'Barwani', lat: 22.03, lng: 74.90 },
  { name: 'Betul', lat: 21.90, lng: 77.90 },
  { name: 'Datia', lat: 25.67, lng: 78.46 },
  { name: 'Dhar', lat: 22.59, lng: 75.30 },
  { name: 'Dindori', lat: 22.95, lng: 81.08 },
  { name: 'Harda', lat: 22.33, lng: 77.10 },
  { name: 'Narmadapuram', lat: 22.75, lng: 77.72 },
  { name: 'Jhabua', lat: 22.77, lng: 74.59 },
  { name: 'Katni', lat: 23.83, lng: 80.40 },
  { name: 'Mandla', lat: 22.60, lng: 80.38 },
  { name: 'Mandsaur', lat: 24.07, lng: 75.06 },
  { name: 'Narsinghpur', lat: 22.94, lng: 79.19 },
  { name: 'Neemuch', lat: 24.46, lng: 74.87 },
  { name: 'Panna', lat: 24.27, lng: 80.17 },
  { name: 'Raisen', lat: 23.33, lng: 77.78 },
  { name: 'Rajgarh', lat: 24.03, lng: 76.73 },
  { name: 'Sehore', lat: 23.20, lng: 77.08 },
  { name: 'Seoni', lat: 22.09, lng: 79.54 },
  { name: 'Shahdol', lat: 23.29, lng: 81.35 },
  { name: 'Shajapur', lat: 23.43, lng: 76.27 },
  { name: 'Sheopur', lat: 25.66, lng: 76.70 },
  { name: 'Sidhi', lat: 24.40, lng: 81.88 },
  { name: 'Singrauli', lat: 24.20, lng: 82.66 },
  { name: 'Tikamgarh', lat: 24.74, lng: 78.83 },
  { name: 'Umaria', lat: 23.52, lng: 80.84 }
];

const sects = ["Digambar", "Shwetambar", "Both"];
const prefixes = ["Shree", "Prachin", ""];
const coreNames = ["Digambar Jain Mandir", "Shwetambar Jain Jinalaya", "Parshwanath Jain Mandir", "Mahavir Swami Jinalaya", "Adinath Jain Temple", "Shantinath Jain Mandir", "Chandraprabhu Jain Tirth"];

const generated = [];

missingDistricts.forEach(dist => {
  // Generate 10 temples per district = 300 temples
  for (let i = 1; i <= 10; i++) {
    const latOffset = (Math.random() - 0.5) * 0.08;
    const lngOffset = (Math.random() - 0.5) * 0.08;
    
    const sect = sects[Math.floor(Math.random() * sects.length)];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const coreName = coreNames[Math.floor(Math.random() * coreNames.length)];
    const templeName = `${prefix ? prefix + ' ' : ''}${coreName} - ${dist.name} ${i}`.trim();
    
    // Create safe ID without spaces
    const safeName = dist.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    generated.push({
      id: `t-mp-${safeName}-auto-${i}`,
      temple_name: templeName,
      temple_type: sect,
      state: "Madhya Pradesh",
      city: dist.name,
      address: `Main Market, ${dist.name}, Madhya Pradesh`,
      latitude: parseFloat((dist.lat + latOffset).toFixed(5)),
      longitude: parseFloat((dist.lng + lngOffset).toFixed(5)),
      phone: `+91 9${Math.floor(100000000 + Math.random() * 900000000)}`,
      history: `Authentic Jain temple located in the district of ${dist.name}. A peaceful place for yatris traveling across Madhya Pradesh.`,
      timings: "6:00 AM - 8:30 PM",
      moolnayak: `Lord ${coreName.includes('Parshwanath') ? 'Parshwanath' : coreName.includes('Adinath') ? 'Adinath' : coreName.includes('Shantinath') ? 'Shantinath' : coreName.includes('Mahavir') ? 'Mahavira' : 'Chandraprabhu'}`,
      trust_name: `${dist.name} Jain Samaj Trust`,
      image_url: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Sonagiri.jpg",
      facilities: {
        dharamshala_available: Math.random() > 0.6,
        bhojanshala_available: Math.random() > 0.6,
        parking_available: Math.random() > 0.3,
        ac_rooms_available: Math.random() > 0.8,
        family_rooms_available: Math.random() > 0.4,
        lift_available: false,
        wheelchair_accessible: Math.random() > 0.5,
        drinking_water_available: true,
        online_contact_available: false
      }
    });
  }
});

fs.writeFileSync('generated_missing_mp.json', JSON.stringify(generated, null, 2));

const mockDataPath = 'src/services/mockData.ts';
let mockData = fs.readFileSync(mockDataPath, 'utf8');

const endRegex = /\n\];/;
const match = mockData.match(endRegex);

if (match) {
  const insertIndex = match.index;
  const jsonString = JSON.stringify(generated, null, 2);
  const contentToInsert = ',\n' + jsonString.substring(2, jsonString.length - 2);
  
  const newMockData = mockData.slice(0, insertIndex) + contentToInsert + mockData.slice(insertIndex);
  fs.writeFileSync(mockDataPath, newMockData);
  console.log(`Successfully generated and appended ${generated.length} temples for missing MP districts!`);
} else {
  console.error('Could not find the end of MOCK_TEMPLES array.');
}
