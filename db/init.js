const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function initializeDatabase() {
    try {
        // Création de la connexion
        const connection = await mysql.createConnection({
            host: process.env.MYSQLHOST,
            user: process.env.MYSQLUSER,
            password: process.env.MYSQLPASSWORD,
            database: process.env.MYSQL_DATABASE,
            port: process.env.PORT,
            multipleStatements: true // Important pour exécuter plusieurs requêtes
        });

        console.log('Connexion à la base de données établie');

        // Lecture du fichier SQL
        const sqlFile = await fs.readFile(path.join(__dirname, '../db.sql'), 'utf8');
        
        // Exécution des requêtes SQL
        await connection.query(sqlFile);
        
        console.log('Base de données initialisée avec succès');
        
        await connection.end();
        
        return true;
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données:', error);
        return false;
    }
}

module.exports = initializeDatabase; 