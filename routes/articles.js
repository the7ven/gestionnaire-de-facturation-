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

// Modifier un article
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nom, prix, categorie } = req.body;
    
    try {
        // Vérifier si l'article existe
        const [article] = await db.query('SELECT * FROM articles WHERE id = ?', [id]);
        
        if (article.length === 0) {
            return res.status(404).json({ message: 'Article non trouvé' });
        }

        // Mettre à jour l'article
        await db.query(
            'UPDATE articles SET nom = ?, prix = ?, categorie = ? WHERE id = ?',
            [nom, prix, categorie, id]
        );

        // Récupérer l'article mis à jour
        const [articleMisAJour] = await db.query(
            'SELECT * FROM articles WHERE id = ?',
            [id]
        );

        res.json(articleMisAJour[0]);
    } catch (err) {
        console.error('Erreur lors de la modification de l\'article:', err);
        res.status(400).json({ message: err.message });
    }
});

// Supprimer un article
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        // Vérifier si l'article existe
        const [article] = await db.query('SELECT * FROM articles WHERE id = ?', [id]);
        
        if (article.length === 0) {
            return res.status(404).json({ message: 'Article non trouvé' });
        }

        // Vérifier si l'article est utilisé dans des factures
        const [factures] = await db.query(
            'SELECT * FROM facture_articles WHERE article_id = ?',
            [id]
        );

        if (factures.length > 0) {
            return res.status(400).json({ 
                message: 'Impossible de supprimer cet article car il est utilisé dans des factures'
            });
        }

        // Supprimer l'article
        await db.query('DELETE FROM articles WHERE id = ?', [id]);
        
        res.json({ message: 'Article supprimé avec succès' });
    } catch (err) {
        console.error('Erreur lors de la suppression de l\'article:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router; 