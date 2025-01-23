<?php
class Article {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    public function getAll() {
        $stmt = $this->pdo->query("SELECT * FROM articles");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function create($data) {
        $stmt = $this->pdo->prepare("INSERT INTO articles (nom, prix, categorie) VALUES (?, ?, ?)");
        $stmt->execute([$data['nom'], $data['prix'], $data['categorie']]);
        return $this->pdo->lastInsertId();
    }
    
    public function getById($id) {
        $stmt = $this->pdo->prepare("SELECT * FROM articles WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function update($id, $data) {
        $stmt = $this->pdo->prepare("UPDATE articles SET nom = ?, prix = ?, categorie = ? WHERE id = ?");
        return $stmt->execute([$data['nom'], $data['prix'], $data['categorie'], $id]);
    }
    
    public function delete($id) {
        $stmt = $this->pdo->prepare("DELETE FROM articles WHERE id = ?");
        return $stmt->execute([$id]);
    }
} 