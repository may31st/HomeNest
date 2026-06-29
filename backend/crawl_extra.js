require('dotenv').config();
const startBrowser = require('./crawl_data/browser');
const { scraper } = require('./crawl_data/scraper');
const { Room } = require('./models');

const STATIC_MAPPINGS = [
  { keywords: ['triều khúc'], lat: 20.9840, lng: 105.7986 },
  { keywords: ['nguyễn trãi'], lat: 20.9948, lng: 105.8098 },
  { keywords: ['tô hiến thành', 'quận 10'], lat: 10.7797, lng: 106.6668 },
  { keywords: ['kim giang'], lat: 20.9786, lng: 105.8159 },
  { keywords: ['hoàng mai'], lat: 20.9754, lng: 105.8679 },
  { keywords: ['hạ định'], lat: 20.9890, lng: 105.8077 },
  { keywords: ['tú mỡ', 'trung kính'], lat: 21.0118, lng: 105.7958 },
  { keywords: ['bát tràng', 'gia lâm'], lat: 20.9723, lng: 105.9126 },
  { keywords: ['cổ nhuế'], lat: 21.0664, lng: 105.7820 },
  { keywords: ['phạm tuấn tài'], lat: 21.0425, lng: 105.7876 },
  { keywords: ['thị trấn trôi', 'hoài đức'], lat: 21.0728, lng: 105.7088 },
  { keywords: ['tân mỹ', 'mỹ đình'], lat: 21.0194, lng: 105.7679 },
  { keywords: ['cầu giấy'], lat: 21.0278, lng: 105.7962 },
  { keywords: ['thanh xuân'], lat: 20.9938, lng: 105.8248 },
];

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;
if (!MAPBOX_TOKEN) {
  console.warn("WARNING: MAPBOX_TOKEN is not defined in environment variables.");
}


async function geocodeAddress(address) {
  if (!address) return { lat: 21.0285, lng: 105.8048 };
  
  const norm = address.toLowerCase();
  for (const mapping of STATIC_MAPPINGS) {
    if (mapping.keywords.some(kw => norm.includes(kw))) {
      const jitterLat = (Math.random() - 0.5) * 0.005;
      const jitterLng = (Math.random() - 0.5) * 0.005;
      return {
        lat: mapping.lat + jitterLat,
        lng: mapping.lng + jitterLng,
        source: 'static_cache'
      };
    }
  }

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng, source: 'mapbox_api' };
    }
  } catch (e) {
    console.error(`Error geocoding "${address}":`, e.message);
  }

  return { lat: 21.0285, lng: 105.8048, source: 'default_fallback' };
}

async function run() {
  let browser;
  try {
    console.log("🚀 Starting browser for extra crawl...");
    browser = await startBrowser();
    if (!browser) {
      console.error("❌ Failed to launch Puppeteer.");
      process.exit(1);
    }

    const targets = [
      { name: "Cầu Giấy", url: "https://phongtro123.com/cho-thue-phong-tro-quan-cau-giay" },
      { name: "Thanh Xuân", url: "https://phongtro123.com/cho-thue-phong-tro-quan-thanh-xuan" },
      { name: "Triều Khúc", url: "https://phongtro123.com/cho-thue-phong-tro-duong-trieu-khuc" }
    ];

    let totalImported = 0;

    for (const target of targets) {
      console.log(`\n=== Crawling rooms in ${target.name} ===`);
      const results = await scraper(browser, target.url);
      console.log(`Scraped ${results.length} rooms from ${target.name}.`);

      for (const roomData of results) {
        if (!roomData.room_name || !roomData.address) continue;

        const cleanAddress = roomData.address.replace(/\s*-\s*Xem bản đồ$/, '');
        const coords = await geocodeAddress(cleanAddress);

        const price = (() => {
          const parsed = parseFloat(roomData.price_per_month.replace(/[^0-9.]/g, ''));
          return isNaN(parsed) ? 0 : parsed;
        })();

        const areaVal = roomData.area ? parseInt(roomData.area.replace(/m²/g, '').trim(), 10) : null;
        
        await Room.create({
          room_name: roomData.room_name,
          description: Array.isArray(roomData.description) ? roomData.description.join(' ') : (roomData.description || ''),
          price_per_month: price,
          room_images: roomData.room_images || [],
          rating: roomData.rating && !isNaN(parseInt(roomData.rating))
            ? parseInt(roomData.rating)
            : Math.floor(Math.random() * 5) + 1,
          area: areaVal,
          status: 'available',
          type: 'phongtro',
          address: cleanAddress,
          latitude: coords.lat,
          longitude: coords.lng
        });

        totalImported++;
        console.log(`Imported room: "${roomData.room_name.substring(0, 30)}..." in ${target.name} [Coords: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}]`);
      }
    }

    console.log(`\n✅ Crawling complete! Imported a total of ${totalImported} new rooms.`);
    await browser.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Crawling error:", error);
    if (browser) await browser.close();
    process.exit(1);
  }
}

run();
