const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Configuration CORS pour la production
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? 'https://votre-domaine-frontend.com'
        : 'http://localhost:5000',
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

// Au début du fichier, après les requires
console.log('Variables d\'environnement :', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    port: process.env.PORT
});

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Erreur serveur' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
}); 