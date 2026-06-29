require('dotenv').config();
const { Room } = require('./models');

const STATIC_MAPPINGS = [
  { keywords: ['triều khúc'], lat: 20.9840, lng: 105.7986 },
  { keywords: ['nguyễn trãi'], lat: 20.9948, lng: 105.8098 },
  { keywords: ['tô hiến thành', 'quận 10'], lat: 10.7797, lng: 106.6668 },
  { keywords: ['kim giang'], lat: 20.9786, lng: 105.8159 },
  { keywords: ['hoàng mai'], lat: 20.9754, lng: 105.8679 },
  { keywords: ['hạ đình'], lat: 20.9890, lng: 105.8077 },
  { keywords: ['tú mỡ', 'trung kính'], lat: 21.0118, lng: 105.7958 },
  { keywords: ['bát tràng', 'gia lâm'], lat: 20.9723, lng: 105.9126 },
  { keywords: ['cổ nhuế'], lat: 21.0664, lng: 105.7820 },
  { keywords: ['phạm tuấn tài'], lat: 21.0425, lng: 105.7876 },
  { keywords: ['thị trấn trôi', 'hoài đức'], lat: 21.0728, lng: 105.7088 },
  { keywords: ['tân mỹ', 'mỹ đình'], lat: 21.0194, lng: 105.7679 },
];

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;
if (!MAPBOX_TOKEN) {
  console.warn("WARNING: MAPBOX_TOKEN is not defined in environment variables.");
}


async function geocodeAddress(address) {
  if (!address) return null;
  
  const norm = address.toLowerCase();
  for (const mapping of STATIC_MAPPINGS) {
    if (mapping.keywords.some(kw => norm.includes(kw))) {
      // Return static coordinates with a tiny random jitter so rooms don't sit perfectly on top of each other
      const jitterLat = (Math.random() - 0.5) * 0.005;
      const jitterLng = (Math.random() - 0.5) * 0.005;
      return {
        lat: mapping.lat + jitterLat,
        lng: mapping.lng + jitterLng,
        source: 'static_cache'
      };
    }
  }

  // Fallback to Mapbox API
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng, source: 'mapbox_api' };
    }
  } catch (e) {
    console.error(`Error geocoding address "${address}":`, e.message);
  }

  // Default coordinate: HCM City
  return { lat: 10.7797, lng: 106.6668, source: 'default_fallback' };
}

async function seed() {
  try {
    const rooms = await Room.findAll();
    console.log(`Found ${rooms.length} rooms to seed coordinates.`);
    
    let updatedCount = 0;
    for (const room of rooms) {
      const coords = await geocodeAddress(room.address);
      if (coords) {
        room.latitude = coords.lat;
        room.longitude = coords.lng;
        await room.save();
        updatedCount++;
        console.log(`[${updatedCount}/${rooms.length}] Room ID: ${room.id} (${room.room_name.substring(0, 30)}...) -> Lat: ${coords.lat.toFixed(6)}, Lng: ${coords.lng.toFixed(6)} [Source: ${coords.source}]`);
      }
    }
    console.log(`Successfully updated coordinates for ${updatedCount} rooms.`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding coordinates failed:", error);
    process.exit(1);
  }
}

seed();
