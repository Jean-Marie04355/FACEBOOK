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

if (!isset($input['user_id']) || !isset($input['friend_id'])) {
    echo json_encode(['success' => false, 'message' => 'ID utilisateur et ami requis']);
    exit;
}

$user_id = (int)$input['user_id'];
$friend_id = (int)$input['friend_id'];

// Vérifier qu'on ne se supprime pas soi-même
if ($user_id === $friend_id) {
    echo json_encode(['success' => false, 'message' => 'Vous ne pouvez pas vous supprimer vous-même']);
    exit;
}

try {
    // Vérifier que l'amitié existe
    $stmt = $pdo->prepare("SELECT * FROM amis WHERE ((id_user1 = ? AND id_user2 = ?) OR (id_user1 = ? AND id_user2 = ?)) AND statut = 'accepte'");
    $stmt->execute([$user_id, $friend_id, $friend_id, $user_id]);
    $friendship = $stmt->fetch();
    
    if (!$friendship) {
        echo json_encode(['success' => false, 'message' => 'Amitié non trouvée']);
        exit;
    }
    
    // Supprimer l'amitié
    $stmt = $pdo->prepare("DELETE FROM amis WHERE ((id_user1 = ? AND id_user2 = ?) OR (id_user1 = ? AND id_user2 = ?))");
    $stmt->execute([$user_id, $friend_id, $friend_id, $user_id]);
    
    echo json_encode(['success' => true, 'message' => 'Ami supprimé avec succès']);
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur lors de la suppression de l\'ami']);
}
?> 