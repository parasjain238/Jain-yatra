const query = `
[out:json][timeout:60];
area["name"="Madhya Pradesh"]["admin_level"="4"]->.searchArea;
(
  node["amenity"="place_of_worship"]["religion"="jain"](area.searchArea);
  way["amenity"="place_of_worship"]["religion"="jain"](area.searchArea);
);
out center;
`;

fetch(`http://overpass-api.de/api/interpreter`, {
  method: 'POST',
  body: 'data=' + encodeURIComponent(query),
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})
.then(res => res.json())
.then(data => {
  const elements = data.elements || [];
  console.log(`Found ${elements.length} Jain temples in MP.`);
  if (elements.length > 0) {
    console.log(elements[0]);
  }
})
.catch(err => console.error("Error:", err));
