/**
 * Script: fix_room_coordinates.js
 * Mục đích: Cập nhật tọa độ sai (mặc định HCM) cho các phòng có địa chỉ Hà Nội
 * Chạy: node fix_room_coordinates.js (trong thư mục backend)
 */

require("dotenv").config();
const db = require("./models");

const DEFAULT_WRONG_LAT = 10.7797;
const DEFAULT_WRONG_LON = 106.667;
const NOMINATIM_DELAY_MS = 1200; // Rate limit Nominatim: ~1 req/sec

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocodeAddress(address) {
  try {
    const fullAddress = `${address}, Việt Nam`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddress)}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "HomeNestCoordFixer/1.0 (admin@homenest.com)",
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          display_name: data[0].display_name,
        };
      }
    }
  } catch (err) {
    console.error(`[Geocode] Error for "${address}":`, err.message);
  }
  return null;
}

async function fixCoordinates() {
  try {
    await db.sequelize.authenticate();
    console.log("✅ Database connected.");

    // Tìm tất cả phòng có tọa độ sai (mặc định HCM)
    const allRooms = await db.Room.findAll();
    const wrongRooms = allRooms.filter(room => {
      return room.latitude && room.longitude &&
             Math.abs(room.latitude - DEFAULT_WRONG_LAT) < 0.001 &&
             Math.abs(room.longitude - DEFAULT_WRONG_LON) < 0.001;
    });

    console.log(`\n📦 Tìm thấy ${wrongRooms.length} phòng có tọa độ sai (${DEFAULT_WRONG_LAT}, ${DEFAULT_WRONG_LON})\n`);

    let fixed = 0;
    let failed = 0;

    for (const room of wrongRooms) {
      const roomData = room.toJSON ? room.toJSON() : room;
      console.log(`\n[Room ${roomData.id}] "${roomData.room_name}"`);
      console.log(`  📍 Địa chỉ: ${roomData.address}`);

      if (!roomData.address || roomData.address === "abc" || roomData.address.length < 5) {
        console.log(`  ⚠️ Bỏ qua - địa chỉ không hợp lệ.`);
        failed++;
        continue;
      }

      // Rate limit
      await sleep(NOMINATIM_DELAY_MS);

      const coords = await geocodeAddress(roomData.address);
      if (coords) {
        // Kiểm tra hợp lý: tọa độ phải ở Việt Nam
        if (coords.latitude < 8 || coords.latitude > 24 || coords.longitude < 102 || coords.longitude > 110) {
          console.log(`  ❌ Tọa độ trả về không hợp lý: ${coords.latitude}, ${coords.longitude}`);
          failed++;
          continue;
        }

        await db.Room.update(
          { latitude: coords.latitude, longitude: coords.longitude },
          { where: { id: roomData.id } }
        );

        console.log(`  ✅ Cập nhật: ${coords.latitude}, ${coords.longitude}`);
        console.log(`     → ${coords.display_name}`);
        fixed++;
      } else {
        console.log(`  ❌ Không tìm được tọa độ.`);
        failed++;
      }
    }

    console.log(`\n========================================`);
    console.log(`✅ Đã sửa: ${fixed} phòng`);
    console.log(`❌ Thất bại: ${failed} phòng`);
    console.log(`========================================`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

fixCoordinates();
