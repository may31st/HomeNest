const { sequelize, User } = require('./models');

async function createAdmin() {
  try {
    const adminEmail = 'admin@gmail.com';
    const existing = await User.findOne({ where: { email: adminEmail } });
    if (existing) {
      console.log("Admin account already exists. Updating to role: 'admin'...");
      existing.role = 'admin';
      await existing.save();
      console.log("Admin account updated successfully!");
    } else {
      console.log("Creating brand new admin account...");
      await User.create({
        email: adminEmail,
        password: 'Admin123',
        firstName: 'Admin',
        lastName: 'Admin',
        role: 'admin',
        phone_number: 99999999,
        address: 'Hà Nội'
      });
      console.log("Admin account created successfully!");
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

createAdmin();
