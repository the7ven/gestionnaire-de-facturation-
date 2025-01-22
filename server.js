const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const initializeDatabase = require('./db/init');

const app = express();

// Configuration CORS pour la production
const corsOptions = {
    origin: '*', // Permet toutes les origines pour le moment
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Servir les fichiers statiques (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Routes API
app.use('/api/articles', require('./routes/articles'));
app.use('/api/factures', require('./routes/factures'));

// Route pour la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Log des variables d'environnement (sans les mots de passe)
console.log('Configuration de l\'environnement :', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DB_HOST: process.env.MYSQLHOST,
    DB_NAME: process.env.MYSQLDATABASE,
    DB_USER: process.env.MYSQLUSER,
    DB_PASSWORD: process.env.MYSQLPASSWORD
});

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Erreur serveur' });
});

const PORT = process.env.PORT || 5000;

// Initialisation de la base de données avant de démarrer le serveur
initializeDatabase().then(success => {
    if (success) {
        app.listen(PORT, () => {
            console.log(`Serveur démarré sur le port ${PORT}`);
        });
    } else {
        console.error('Impossible de démarrer le serveur : échec de l\'initialisation de la base de données');
        process.exit(1);
    }
}); 