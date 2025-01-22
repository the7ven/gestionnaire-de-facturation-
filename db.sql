-- Suppression des tables existantes pour éviter les conflits
DROP TABLE IF EXISTS facture_articles;
DROP TABLE IF EXISTS factures;
DROP TABLE IF EXISTS articles;

-- Table des articles (catalogue des produits)
CREATE TABLE articles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    prix DECIMAL(10,2) NOT NULL,
    categorie ENUM('entree', 'plat', 'dessert', 'boisson') NOT NULL
);

-- Table des factures (informations générales de la facture)
CREATE TABLE factures (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numero_table INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table de liaison factures-articles (détails des articles dans chaque facture)
CREATE TABLE facture_articles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    facture_id INT NOT NULL,
    article_id INT NOT NULL,
    quantite INT NOT NULL,
    prix_unitaire DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (facture_id) REFERENCES factures(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id)
);

-- Index pour optimiser les recherches
CREATE INDEX idx_facture_articles ON facture_articles(facture_id, article_id); 