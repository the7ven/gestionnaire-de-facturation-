<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Configuration du logging
ini_set('log_errors', 1);
ini_set('error_log', '../php-error.log');

// Ajout des headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Si c'est une requête OPTIONS, on arrête ici
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';
require_once '../models/Facture.php';

header('Content-Type: application/json');

try {
    $facture = new Facture($pdo);
    $method = $_SERVER['REQUEST_METHOD'];

    switch($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                $result = $facture->getById($_GET['id']);
                if ($result) {
                    echo json_encode($result);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Facture non trouvée']);
                }
            } else {
                $factures = $facture->getAll();
                echo json_encode($factures);
            }
            break;
        
        case 'POST':
            try {
                error_log("Début du traitement POST facture");
                $data = json_decode(file_get_contents('php://input'), true);
                error_log("Données reçues : " . print_r($data, true));
                
                if (!$data || !isset($data['numero_table']) || !isset($data['articles'])) {
                    error_log("Données invalides : structure incorrecte");
                    http_response_code(400);
                    echo json_encode(['error' => 'Données invalides']);
                    break;
                }
                
                error_log("Tentative de création de la facture");
                $id = $facture->create($data);
                error_log("Facture créée avec succès, ID: " . $id);
                http_response_code(201);
                echo json_encode(['message' => 'Facture créée', 'id' => $id]);
            } catch (Exception $e) {
                error_log("Erreur lors de la création de la facture: " . $e->getMessage());
                error_log("Stack trace: " . $e->getTraceAsString());
                http_response_code(500);
                echo json_encode(['error' => 'Erreur lors de la création de la facture: ' . $e->getMessage()]);
            }
            break;
    }
} catch (Exception $e) {
    error_log("Erreur générale: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
} 