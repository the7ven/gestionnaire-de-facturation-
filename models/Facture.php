<?php
class Facture {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    public function getAll() {
        // On récupère d'abord toutes les factures
        $stmt = $this->pdo->query("SELECT * FROM factures ORDER BY date_creation DESC");
        $factures = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Pour chaque facture, on récupère ses articles
        foreach ($factures as &$facture) {
            $stmt = $this->pdo->prepare("
                SELECT 
                    fa.quantite,
                    fa.prix_unitaire,
                    a.id as article_id,
                    a.nom as article_nom,
                    a.categorie
                FROM facture_articles fa
                JOIN articles a ON fa.article_id = a.id
                WHERE fa.facture_id = ?
            ");
            $stmt->execute([$facture['id']]);
            $facture['articles'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        
        return $factures;
    }
    
    public function create($data) {
        $this->pdo->beginTransaction();
        try {
            // Création de la facture
            $stmt = $this->pdo->prepare("INSERT INTO factures (numero_table, total, date_creation) VALUES (?, ?, NOW())");
            $stmt->execute([$data['numero_table'], $data['total']]);
            $factureId = $this->pdo->lastInsertId();
            
            // Ajout des articles de la facture
            $stmt = $this->pdo->prepare("INSERT INTO facture_articles (facture_id, article_id, quantite, prix_unitaire) VALUES (?, ?, ?, ?)");
            foreach ($data['articles'] as $article) {
                $stmt->execute([$factureId, $article['id'], $article['quantite'], $article['prix_unitaire']]);
            }
            
            $this->pdo->commit();
            return $factureId;
        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }
    
    public function getById($id) {
        // Récupération de la facture
        $stmt = $this->pdo->prepare("
            SELECT f.*, fa.article_id, fa.quantite, fa.prix_unitaire, a.nom
            FROM factures f
            LEFT JOIN facture_articles fa ON f.id = fa.facture_id
            LEFT JOIN articles a ON fa.article_id = a.id
            WHERE f.id = ?
        ");
        $stmt->execute([$id]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (empty($rows)) return null;
        
        // Formatage des données
        $facture = [
            'id' => $rows[0]['id'],
            'numero_table' => $rows[0]['numero_table'],
            'total' => $rows[0]['total'],
            'date_creation' => $rows[0]['date_creation'],
            'articles' => []
        ];
        
        foreach ($rows as $row) {
            if ($row['article_id']) {
                $facture['articles'][] = [
                    'id' => $row['article_id'],
                    'nom' => $row['nom'],
                    'quantite' => $row['quantite'],
                    'prix_unitaire' => $row['prix_unitaire']
                ];
            }
        }
        
        return $facture;
    }
} 