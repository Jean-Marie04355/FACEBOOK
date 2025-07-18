<?php
require_once 'config.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Vérifier que c'est une requête POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

// Récupérer les données JSON
$data = json_decode(file_get_contents('php://input'), true);
$sender_id = $data['sender_id'] ?? null;
$receiver_id = $data['receiver_id'] ?? null;

if (!$sender_id || !$receiver_id || $sender_id == $receiver_id) {
    echo json_encode(['success' => false, 'message' => 'Paramètres invalides']);
    exit;
}

// Vérifier si l'invitation existe déjà
$stmt = $pdo->prepare("SELECT id FROM invitations WHERE sender_id = ? AND receiver_id = ?");
$stmt->execute([$sender_id, $receiver_id]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => 'Invitation déjà envoyée']);
    exit;
}

// Insérer l'invitation
$stmt = $pdo->prepare("INSERT INTO invitations (sender_id, receiver_id, status, sent_at) VALUES (?, ?, 'pending', NOW())");
if ($stmt->execute([$sender_id, $receiver_id])) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Erreur lors de l\'envoi']);
} 