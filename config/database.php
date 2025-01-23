<?php
define('DB_HOST', 'localhost');  // À modifier selon votre configuration
define('DB_USER', 'root');       // À modifier selon votre configuration
define('DB_PASS', '');           // À modifier selon votre configuration
define('DB_NAME', 'gestion-restaurant'); // À modifier selon votre configuration

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME,
        DB_USER,
        DB_PASS,
        array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8")
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo "Erreur de connexion : " . $e->getMessage();
    exit;
} 