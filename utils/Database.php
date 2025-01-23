<?php
class Database {
    private static $instance = null;
    private $pdo;
    
    private function __construct() {
        try {
            require_once __DIR__ . '/../config/database.php';
            $this->pdo = $pdo;
        } catch (Exception $e) {
            error_log("Erreur Database: " . $e->getMessage());
            throw $e;
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->pdo;
    }
} 