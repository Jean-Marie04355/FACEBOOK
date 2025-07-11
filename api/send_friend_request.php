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

if (!isset($input['sender_id']) || !isset($input['receiver_id'])) {
    echo json_encode(['success' => false, 'message' => 'ID expéditeur et destinataire requis']);
    exit;
}

$sender_id = (int)$input['sender_id'];
$receiver_id = (int)$input['receiver_id'];

// Vérifier que les utilisateurs existent
try {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE id IN (?, ?)");
    $stmt->execute([$sender_id, $receiver_id]);
    $users = $stmt->fetchAll();
    
    if (count($users) !== 2) {
        echo json_encode(['success' => false, 'message' => 'Un ou les deux utilisateurs n\'existent pas']);
        exit;
    }
    
    // Vérifier qu'on ne s'ajoute pas soi-même
    if ($sender_id === $receiver_id) {
        echo json_encode(['success' => false, 'message' => 'Vous ne pouvez pas vous ajouter vous-même']);
        exit;
    }
    
    // Vérifier si une demande existe déjà
    $stmt = $pdo->prepare("SELECT * FROM amis WHERE (id_user1 = ? AND id_user2 = ?) OR (id_user1 = ? AND id_user2 = ?)");
    $stmt->execute([$sender_id, $receiver_id, $receiver_id, $sender_id]);
    $existing = $stmt->fetch();
    
    if ($existing) {
        if ($existing['statut'] === 'en_attente') {
            echo json_encode(['success' => false, 'message' => 'Une demande d\'ami est déjà en attente']);
        } elseif ($existing['statut'] === 'accepte') {
            echo json_encode(['success' => false, 'message' => 'Vous êtes déjà amis']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Demande d\'ami précédemment refusée']);
        }
        exit;
    }
    
    // Insérer la nouvelle demande d'ami
    $stmt = $pdo->prepare("INSERT INTO amis (id_user1, id_user2, statut) VALUES (?, ?, 'en_attente')");
    $stmt->execute([$sender_id, $receiver_id]);
    
    echo json_encode(['success' => true, 'message' => 'Demande d\'ami envoyée avec succès']);
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur lors de l\'envoi de la demande d\'ami']);
}
?> 