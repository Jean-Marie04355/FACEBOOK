<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!isset($input['user_id'], $input['file'])) {
    echo json_encode(['success' => false, 'message' => 'Paramètres manquants']);
    exit;
}
$user_id = (int)$input['user_id'];
$file = basename($input['file']);
$target = '../assets/images/' . $file;

try {
    // Supprimer le fichier si il existe
    if (file_exists($target)) {
        unlink($target);
    }
    // Mettre à jour la base
    $stmt = $pdo->prepare('UPDATE users SET photo_profil = NULL WHERE id = ?');
    $stmt->execute([$user_id]);
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    error_log('Erreur suppression photo: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erreur lors de la suppression']);
} 