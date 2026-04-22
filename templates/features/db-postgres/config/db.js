const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.connect()
    .then(() => console.log("PostgreSQL connected"))
    .catch(() => console.error("PostgreSQL connection failed"));

module.exports = pool;
