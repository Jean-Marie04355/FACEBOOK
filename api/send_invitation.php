<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

// Vérifier que c'est une requête POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

// Récupérer les données JSON
$input = json_decode(file_get_contents('php://input'), true);

// Vérifier les données requises
if (!isset($input['sender_id']) || !isset($input['receiver_id'])) {
    echo json_encode(['success' => false, 'message' => 'ID expéditeur et destinataire requis']);
    exit;
}

$sender_id = (int)$input['sender_id'];
$receiver_id = (int)$input['receiver_id'];

// Vérifications de sécurité
if ($sender_id === $receiver_id) {
    echo json_encode(['success' => false, 'message' => 'Vous ne pouvez pas vous inviter vous-même']);
    exit;
}

try {
    // Vérifier que les utilisateurs existent
    $stmt = $pdo->prepare("SELECT id FROM users WHERE id IN (?, ?)");
    $stmt->execute([$sender_id, $receiver_id]);
    $users = $stmt->fetchAll();
    
    if (count($users) !== 2) {
        echo json_encode(['success' => false, 'message' => 'Un ou les deux utilisateurs n\'existent pas']);
        exit;
    }
    
    // Vérifier si une invitation existe déjà
    $stmt = $pdo->prepare("SELECT id FROM invitations WHERE 
        (sender_id = ? AND receiver_id = ?) OR 
        (sender_id = ? AND receiver_id = ?)");
    $stmt->execute([$sender_id, $receiver_id, $receiver_id, $sender_id]);
    $existing = $stmt->fetch();
    
    if ($existing) {
        echo json_encode(['success' => false, 'message' => 'Une invitation existe déjà entre ces utilisateurs']);
        exit;
    }
    
    // Insérer la nouvelle invitation
    $stmt = $pdo->prepare("INSERT INTO invitations (sender_id, receiver_id, status) VALUES (?, ?, 'pending')");
    $stmt->execute([$sender_id, $receiver_id]);
    
    echo json_encode(['success' => true, 'message' => 'Invitation envoyée avec succès']);
    
} catch (PDOException $e) {
    error_log("Erreur base de données: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erreur lors de l\'envoi de l\'invitation']);
}
?> 