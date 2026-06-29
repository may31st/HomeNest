require('dotenv').config();
const db = require('./models');

async function main() {
  const contracts = await db.Contract.findAll();
  console.log(`Found ${contracts.length} contracts.`);
  let updatedCount = 0;
  for (const c of contracts) {
    if (c.terms && c.terms.includes('RENTHOUSE')) {
      c.terms = c.terms.replace(/RENTHOUSE/g, 'HOMENEST');
      await c.save();
      updatedCount++;
    }
  }
  console.log(`Successfully updated ${updatedCount} contracts.`);
  process.exit(0);
}

main().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});
