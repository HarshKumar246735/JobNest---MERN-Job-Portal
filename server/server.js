require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
if (!process.env.JWT_SECRET) { console.error('JWT_SECRET is required'); process.exit(1); }
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  const server = http.createServer(app);
  require('./services/notify').setIO(require('./sockets')(server));
  require('./services/deadlines').start();
  server.listen(PORT, () => console.log(`API on :${PORT}`));
})
  .catch((e) => { console.error(e.message); process.exit(1); });
