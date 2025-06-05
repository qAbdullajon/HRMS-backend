const pg = require("pg");
const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.POSTGRES_URL || // Vercel PostgreSQL uchun
  {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    dialectModule: pg,
    logging: false,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Ulanishni tekshirish
sequelize.authenticate()
  .then(() => console.log('PostgreSQLga muvaffaqiyatli ulanildi'))
  .catch(err => console.error('PostgreSQLga ulanishda xato:', err));

module.exports = sequelize;