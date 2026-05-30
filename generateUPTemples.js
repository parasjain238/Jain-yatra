const fs = require('fs');

const cities = [
  { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
  { name: 'Kanpur', lat: 26.4499, lng: 80.3319 },
  { name: 'Agra', lat: 27.1767, lng: 78.0081 },
  { name: 'Varanasi', lat: 25.3176, lng: 82.9739 },
  { name: 'Meerut', lat: 28.9845, lng: 77.7064 },
  { name: 'Hastinapur', lat: 29.1712, lng: 78.0163 },
  { name: 'Ayodhya', lat: 26.7922, lng: 82.1998 },
  { name: 'Mathura', lat: 27.4924, lng: 77.6737 },
  { name: 'Prayagraj', lat: 25.4358, lng: 81.8463 },
  { name: 'Aligarh', lat: 27.8974, lng: 78.0880 },
  { name: 'Ghaziabad', lat: 28.6692, lng: 77.4538 },
  { name: 'Noida', lat: 28.5355, lng: 77.3910 },
  { name: 'Firozabad', lat: 27.1593, lng: 78.3957 },
  { name: 'Jhansi', lat: 25.4484, lng: 78.5685 },
  { name: 'Muzaffarnagar', lat: 29.4727, lng: 77.7085 },
  { name: 'Bareilly', lat: 28.3670, lng: 79.4304 },
  { name: 'Moradabad', lat: 28.8386, lng: 78.7733 },
  { name: 'Gorakhpur', lat: 26.7606, lng: 83.3732 },
  { name: 'Saharanpur', lat: 29.9640, lng: 77.5460 }
];

const sects = ["Digambar", "Shwetambar", "Both"];
const prefixes = ["Shree", "Shri", "Prachin", "Moolnayak", ""];
const names = ["Digambar Jain Mandir", "Shwetambar Jain Temple", "Parshwanath Jain Mandir", "Mahavir Swami Jinalaya", "Adinath Digambar Jain Temple", "Shantinath Jain Mandir", "Chandraprabhu Jain Tirth"];

const generated = [];

cities.forEach(city => {
  // Generate 15 temples per city = ~285 temples
  for (let i = 1; i <= 15; i++) {
    const latOffset = (Math.random() - 0.5) * 0.1;
    const lngOffset = (Math.random() - 0.5) * 0.1;
    
    const sect = sects[Math.floor(Math.random() * sects.length)];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const coreName = names[Math.floor(Math.random() * names.length)];
    
    // Formatting name realistically
    const templeName = `${prefix ? prefix + ' ' : ''}${coreName}${i > 10 ? ' (Sector ' + i + ')' : ''}`.trim();
    
    generated.push({
      id: `t-up-${city.name.toLowerCase()}-auto-${i}`,
      temple_name: templeName,
      temple_type: sect,
      state: "Uttar Pradesh",
      city: city.name,
      address: `Near Main Market, ${city.name}, Uttar Pradesh`,
      latitude: parseFloat((city.lat + latOffset).toFixed(5)),
      longitude: parseFloat((city.lng + lngOffset).toFixed(5)),
      phone: `+91 9${Math.floor(100000000 + Math.random() * 900000000)}`,
      history: `A realistic auto-generated temple profile for the historic city of ${city.name} in Uttar Pradesh, providing pilgrims with spiritual peace.`,
      timings: "5:30 AM - 8:30 PM",
      moolnayak: `Lord ${coreName.includes('Parshwanath') ? 'Parshwanath' : coreName.includes('Adinath') ? 'Adinath' : coreName.includes('Shantinath') ? 'Shantinath' : coreName.includes('Mahavir') ? 'Mahavira' : 'Chandraprabhu'}`,
      trust_name: `${city.name} Jain Samaj Trust`,
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

fs.writeFileSync('generated_up_temples.json', JSON.stringify(generated, null, 2));
console.log(`Generated ${generated.length} UP temples!`);
