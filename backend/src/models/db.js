const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect()
  .then(() => console.log('🟢 Connected to DB'))
  .catch((err) => console.error('🔴 DB connection error', err.stack));

module.exports = pool;
