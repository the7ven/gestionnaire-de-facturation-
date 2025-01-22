const mysql = require('mysql2/promise');
require('dotenv').config();

const config = {
    development: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 5,
        queueLimit: 0
    },
    production: {
        host: process.env.PROD_DB_HOST,
        user: process.env.PROD_DB_USER,
        password: process.env.PROD_DB_PASSWORD,
        database: process.env.PROD_DB_NAME,
        port: process.env.PROD_DB_PORT,
        waitForConnections: true,
        connectionLimit: 3,
        queueLimit: 0
    }
};

const env = process.env.NODE_ENV || 'development';
const pool = mysql.createPool(config[env]);

pool.getConnection()
    .then(connection => {
        console.log(`Connecté à la base de données MySQL en mode ${env}!`);
        console.log(`Host: ${config[env].host}`);
        console.log(`Database: ${config[env].database}`);
        connection.release();
    })
    .catch(err => {
        console.error('Erreur de connexion à la base de données:', err);
        process.exit(1);
    });

module.exports = pool; 