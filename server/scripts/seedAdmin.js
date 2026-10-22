require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const connectDB = require('../config/db');
const User = require('../models/User');
(async () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD (min 12 chars) in .env first.'); process.exit(1);
  }
  await connectDB();
  if (await User.findOne({ email: ADMIN_EMAIL.toLowerCase() })) { console.log('Admin already exists.'); process.exit(0); }
  await User.create({ name: 'Administrator', email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' });
  console.log('Admin created:', ADMIN_EMAIL); process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });

