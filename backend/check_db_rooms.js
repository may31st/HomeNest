const { sequelize, Room } = require('./models');

async function check() {
  try {
    const rooms = await Room.findAll();
    console.log("TOTAL ROOMS:", rooms.length);
    rooms.forEach(r => {
      console.log(`ID: ${r.id}, Name: ${r.room_name}`);
      console.log(`room_images Type: ${typeof r.room_images}, Value:`, r.room_images);
      console.log('---');
    });
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

check();
