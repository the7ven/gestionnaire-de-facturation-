const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtenir tous les articles
router.get('/', async (req, res) => {
    try {
        const [articles] = await db.query('SELECT * FROM articles');
        console.log('Articles récupérés:', articles);
        res.json(articles);
    } catch (err) {
        console.error('Erreur lors de la récupération des articles:', err);
        res.status(500).json({ message: err.message });
    }
});

// Créer un article
router.post('/', async (req, res) => {
    const { nom, prix, categorie } = req.body;
    try {
        console.log('Tentative d\'ajout d\'article:', { nom, prix, categorie });
        const [result] = await db.query(
            'INSERT INTO articles (nom, prix, categorie) VALUES (?, ?, ?)',
            [nom, prix, categorie]
        );
        console.log('Article ajouté avec succès:', result);
        const [nouvelArticle] = await db.query(
            'SELECT * FROM articles WHERE id = ?',
            [result.insertId]
        );
        res.status(201).json(nouvelArticle[0]);
    } catch (err) {
        console.error('Erreur lors de l\'ajout d\'article:', err);
        res.status(400).json({ message: err.message });
    }
});

module.exports = router; 