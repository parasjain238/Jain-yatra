import requests
import json

overpass_url = "http://overpass-api.de/api/interpreter"
overpass_query = """
[out:json][timeout:60];
area["name"="Madhya Pradesh"]["admin_level"="4"]->.searchArea;
(
  node["amenity"="place_of_worship"]["religion"="jain"](area.searchArea);
  way["amenity"="place_of_worship"]["religion"="jain"](area.searchArea);
);
out center;
"""
try:
    response = requests.get(overpass_url, params={'data': overpass_query}, timeout=60)
    data = response.json()
    elements = data.get('elements', [])
    print(f"Found {len(elements)} Jain temples in MP.")
    if elements:
        print(elements[0])
except Exception as e:
    print(f"Error: {e}")
