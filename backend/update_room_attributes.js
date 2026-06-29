const { Room } = require('./models');

async function updateRooms() {
  try {
    console.log("Updating existing room attributes...");
    
    // Update Nhà nguyên căn (nhanguyencan)
    const res1 = await Room.update(
      { bedrooms: 3, bathrooms: 2 },
      { where: { type: 'nhanguyencan' } }
    );
    console.log(`Updated nhanguyencan: ${res1[0]} rooms.`);

    // Update Căn hộ dịch vụ (canhodichvu & dichvu)
    const res2 = await Room.update(
      { bedrooms: 2, bathrooms: 1 },
      { where: { type: ['canhodichvu', 'dichvu'] } }
    );
    console.log(`Updated canhodichvu / dichvu: ${res2[0]} rooms.`);

    // Update Chung cư mini (chungcumini)
    const res3 = await Room.update(
      { bedrooms: 2, bathrooms: 1 },
      { where: { type: 'chungcumini' } }
    );
    console.log(`Updated chungcumini: ${res3[0]} rooms.`);

    // Update Căn hộ chung cư (canho)
    const res4 = await Room.update(
      { bedrooms: 2, bathrooms: 2 },
      { where: { type: 'canho' } }
    );
    console.log(`Updated canho: ${res4[0]} rooms.`);

    // Make sure phongtro is 1, 1
    const res5 = await Room.update(
      { bedrooms: 1, bathrooms: 1 },
      { where: { type: 'phongtro' } }
    );
    console.log(`Updated phongtro: ${res5[0]} rooms.`);

    console.log("Database update completed!");
    process.exit(0);
  } catch (error) {
    console.error("Failed to update room attributes:", error);
    process.exit(1);
  }
}

updateRooms();
