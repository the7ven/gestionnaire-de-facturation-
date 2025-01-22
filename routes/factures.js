const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtenir toutes les factures
router.get('/', async (req, res) => {
    try {
        const [factures] = await db.query(`
            SELECT 
                f.id,
                f.numero_table,
                f.total,
                f.date_creation
            FROM factures f
            ORDER BY f.date_creation DESC
        `);

        res.json(factures);
    } catch (err) {
        console.error('Erreur:', err);
        res.status(500).json({ message: err.message });
    }
});

// Obtenir une facture spécifique avec ses détails
router.get('/:id', async (req, res) => {
    try {
        // Récupérer les informations de base de la facture
        const [facture] = await db.query(`
            SELECT id, numero_table, total, date_creation
            FROM factures 
            WHERE id = ?
        `, [req.params.id]);

        if (!facture[0]) {
            return res.status(404).json({ message: 'Facture non trouvée' });
        }

        // Récupérer les articles de la facture
        const [articles] = await db.query(`
            SELECT 
                a.nom,
                fa.quantite,
                fa.prix_unitaire,
                (fa.quantite * fa.prix_unitaire) as sous_total
            FROM facture_articles fa
            JOIN articles a ON fa.article_id = a.id
            WHERE fa.facture_id = ?
        `, [req.params.id]);

        // Construire la réponse
        const factureComplete = {
            ...facture[0],
            articles_details: articles
        };

        res.json(factureComplete);
    } catch (err) {
        console.error('Erreur lors de la récupération des détails de la facture:', err);
        res.status(500).json({ message: err.message });
    }
});

// Créer une facture
router.post('/', async (req, res) => {
    const { numeroTable, articles, total } = req.body;
    
    try {
        await db.query('START TRANSACTION');

        const [factureResult] = await db.query(
            'INSERT INTO factures (numero_table, total) VALUES (?, ?)',
            [numeroTable, total]
        );
        const factureId = factureResult.insertId;

        for (const article of articles) {
            await db.query(
                'INSERT INTO facture_articles (facture_id, article_id, quantite, prix_unitaire) VALUES (?, ?, ?, ?)',
                [
                    factureId,
                    article.article_id,
                    article.quantite,
                    article.prix_unitaire
                ]
            );
        }

        await db.query('COMMIT');

        res.status(201).json({ 
            id: factureId, 
            message: 'Facture créée avec succès',
            facture: {
                id: factureId,
                numeroTable,
                total,
                articles
            }
        });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Erreur serveur détaillée:', err);
        res.status(400).json({ 
            message: err.message,
            details: 'Erreur lors de l\'insertion des données'
        });
    }
});

module.exports = router; 