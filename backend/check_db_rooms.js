const { sequelize, Room } = require('./models');

async function check() {
  try {
    const rooms = await Room.findAll();
    console.log("TOTAL ROOMS:", rooms.length);
    rooms.forEach(r => {
      console.log(`ID: ${r.id}, Name: ${r.room_name}, Address: ${r.address}, Price: ${r.price_per_month}, Lat: ${r.latitude}, Lon: ${r.longitude}, Status: ${r.status}`);
      console.log('---');
    });
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

check();
