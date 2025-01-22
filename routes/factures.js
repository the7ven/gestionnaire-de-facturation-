const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtenir toutes les factures avec les détails des articles
router.get('/', async (req, res) => {
    try {
        const [factures] = await db.query(`
            SELECT 
                f.id,
                f.numero_table,
                f.total,
                f.date_creation,
                GROUP_CONCAT(
                    JSON_OBJECT(
                        'nom', a.nom,
                        'quantite', fa.quantite,
                        'prix_unitaire', fa.prix_unitaire,
                        'sous_total', (fa.quantite * fa.prix_unitaire)
                    )
                ) as articles_details
            FROM factures f
            LEFT JOIN facture_articles fa ON f.id = fa.facture_id
            LEFT JOIN articles a ON fa.article_id = a.id
            GROUP BY f.id
            ORDER BY f.date_creation DESC
        `);

        // Formater les données pour inclure les articles
        const facturesFormatees = factures.map(facture => ({
            ...facture,
            articles_details: facture.articles_details ? JSON.parse(`[${facture.articles_details}]`) : []
        }));

        res.json(facturesFormatees);
    } catch (err) {
        console.error('Erreur:', err);
        res.status(500).json({ message: err.message });
    }
});

// Créer une facture
router.post('/', async (req, res) => {
    const { numeroTable, articles, total } = req.body;
    
    try {
        // Debug: Afficher les données reçues
        console.log('Données reçues:', req.body);
        
        // Début de la transaction
        await db.query('START TRANSACTION');

        // Créer la facture
        const [factureResult] = await db.query(
            'INSERT INTO factures (numero_table, total) VALUES (?, ?)',
            [numeroTable, total]
        );
        const factureId = factureResult.insertId;

        // Debug: Afficher l'ID de la facture créée
        console.log('Facture créée avec ID:', factureId);

        // Ajouter les articles de la facture
        for (const article of articles) {
            // Conversion explicite des valeurs
            const articleData = {
                facture_id: factureId,
                article_id: Number(article.article_id),
                quantite: Number(article.quantite),
                prix_unitaire: Number(article.prix_unitaire)
            };

            console.log('Insertion article avec données:', articleData);

            // Vérification des valeurs avant insertion
            if (!articleData.prix_unitaire) {
                throw new Error(`Prix unitaire invalide pour l'article ${articleData.article_id}`);
            }

            await db.query(
                'INSERT INTO facture_articles (facture_id, article_id, quantite, prix_unitaire) VALUES (?, ?, ?, ?)',
                [
                    articleData.facture_id,
                    articleData.article_id,
                    articleData.quantite,
                    articleData.prix_unitaire
                ]
            );
        }

        // Valider la transaction
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
        // Annuler la transaction en cas d'erreur
        await db.query('ROLLBACK');
        console.error('Erreur serveur détaillée:', err);
        res.status(400).json({ 
            message: err.message,
            details: 'Erreur lors de l\'insertion des données'
        });
    }
});

// Obtenir une facture spécifique avec ses détails
router.get('/:id', async (req, res) => {
    try {
        const [facture] = await db.query(`
            SELECT 
                f.id,
                f.numero_table,
                f.total,
                f.date_creation,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'nom', a.nom,
                        'quantite', fa.quantite,
                        'prix_unitaire', fa.prix_unitaire,
                        'sous_total', (fa.quantite * fa.prix_unitaire)
                    )
                ) as articles_details
            FROM factures f
            LEFT JOIN facture_articles fa ON f.id = fa.facture_id
            LEFT JOIN articles a ON fa.article_id = a.id
            WHERE f.id = ?
            GROUP BY f.id
        `, [req.params.id]);

        if (!facture[0]) {
            return res.status(404).json({ message: 'Facture non trouvée' });
        }

        // Formater la réponse
        const factureFormatee = {
            ...facture[0],
            articles_details: JSON.parse(facture[0].articles_details)
        };

        res.json(factureFormatee);
    } catch (err) {
        console.error('Erreur:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router; 