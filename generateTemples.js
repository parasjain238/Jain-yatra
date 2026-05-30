const fs = require('fs');

const cities = [
  { name: 'Indore', lat: 22.7196, lng: 75.8577 },
  { name: 'Bhopal', lat: 23.2599, lng: 77.4126 },
  { name: 'Jabalpur', lat: 23.1815, lng: 79.9864 },
  { name: 'Gwalior', lat: 26.2124, lng: 78.1772 },
  { name: 'Ujjain', lat: 23.1765, lng: 75.7885 },
  { name: 'Sagar', lat: 23.8388, lng: 78.7378 },
  { name: 'Ratlam', lat: 23.3315, lng: 75.0367 },
  { name: 'Rewa', lat: 24.5362, lng: 81.3037 },
  { name: 'Satna', lat: 24.5770, lng: 80.8282 },
  { name: 'Khandwa', lat: 21.8299, lng: 76.3533 },
  { name: 'Burhanpur', lat: 21.3145, lng: 76.2230 },
  { name: 'Dewas', lat: 22.9575, lng: 76.0543 },
  { name: 'Chhindwara', lat: 22.0574, lng: 78.9382 },
  { name: 'Morena', lat: 26.5020, lng: 78.0051 },
  { name: 'Bhind', lat: 26.5647, lng: 78.7904 },
  { name: 'Guna', lat: 24.6467, lng: 77.3117 },
  { name: 'Shivpuri', lat: 25.4316, lng: 77.6599 },
  { name: 'Vidisha', lat: 23.5251, lng: 77.8081 },
  { name: 'Chhatarpur', lat: 24.9150, lng: 79.5822 },
  { name: 'Damoh', lat: 23.8340, lng: 79.4443 }
];

const sects = ["Digambar", "Shwetambar", "Both"];
const suffixes = ["Parshwanath Mandir", "Adinath Temple", "Mahavir Swami Jinalaya", "Shantinath Digambar Mandir", "Chandraprabhu Tirth", "Siddhakshetra", "Atishay Kshetra", "Jain Basadi"];

const generated = [];

cities.forEach(city => {
  // Generate 25 temples per city = 500 temples
  for (let i = 1; i <= 25; i++) {
    const latOffset = (Math.random() - 0.5) * 0.1; // roughly 10km spread
    const lngOffset = (Math.random() - 0.5) * 0.1;
    
    const sect = sects[Math.floor(Math.random() * sects.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const name = `Shree ${city.name} ${suffix} - ${i}`;
    
    generated.push({
      id: `t-${city.name.toLowerCase()}-auto-${i}`,
      temple_name: name,
      temple_type: sect,
      state: "Madhya Pradesh",
      city: city.name,
      address: `Auto-generated Location ${i}, ${city.name}, MP`,
      latitude: parseFloat((city.lat + latOffset).toFixed(5)),
      longitude: parseFloat((city.lng + lngOffset).toFixed(5)),
      phone: `+91 9${Math.floor(100000000 + Math.random() * 900000000)}`,
      history: `An auto-generated record for ${city.name} Jain community. Madhya Pradesh houses over 1000 glorious temples!`,
      timings: "6:00 AM - 8:30 PM",
      moolnayak: `Lord ${suffix.split(" ")[0]}`,
      trust_name: `${city.name} Jain Samaj Trust`,
      image_url: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Sonagiri.jpg",
      facilities: {
        dharamshala_available: Math.random() > 0.5,
        bhojanshala_available: Math.random() > 0.5,
        parking_available: Math.random() > 0.2,
        ac_rooms_available: Math.random() > 0.7,
        family_rooms_available: Math.random() > 0.3,
        lift_available: false,
        wheelchair_accessible: Math.random() > 0.5,
        drinking_water_available: true,
        online_contact_available: false
      }
    });
  }
});

fs.writeFileSync('generated_temples.json', JSON.stringify(generated, null, 2));
console.log(`Generated ${generated.length} temples!`);
