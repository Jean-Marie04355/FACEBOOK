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
if (!isset($input['invitation_id']) || !isset($input['user_id']) || !isset($input['response'])) {
    echo json_encode(['success' => false, 'message' => 'ID invitation, ID utilisateur et réponse requis']);
    exit;
}

$invitation_id = (int)$input['invitation_id'];
$user_id = (int)$input['user_id'];
$response = $input['response']; // 'accepted' ou 'declined'

if (!in_array($response, ['accepted', 'declined'])) {
    echo json_encode(['success' => false, 'message' => 'Réponse invalide']);
    exit;
}

try {
    // Vérifier que l'invitation existe et appartient à l'utilisateur
    $stmt = $pdo->prepare("SELECT * FROM invitations WHERE id = ? AND receiver_id = ? AND status = 'pending'");
    $stmt->execute([$invitation_id, $user_id]);
    $invitation = $stmt->fetch();
    
    if (!$invitation) {
        echo json_encode(['success' => false, 'message' => 'Invitation non trouvée ou déjà traitée']);
        exit;
    }
    
    // Commencer une transaction
    $pdo->beginTransaction();
    
    // Mettre à jour le statut de l'invitation
    $stmt = $pdo->prepare("UPDATE invitations SET status = ?, responded_at = NOW() WHERE id = ?");
    $stmt->execute([$response, $invitation_id]);
    
    // Si acceptée, ajouter dans la table amis
    if ($response === 'accepted') {
        $stmt = $pdo->prepare("INSERT INTO amis (id_user1, id_user2, statut) VALUES (?, ?, 'accepte')");
        $stmt->execute([$invitation['sender_id'], $invitation['receiver_id']]);
    }
    
    $pdo->commit();
    
    $message = $response === 'accepted' ? 'Invitation acceptée' : 'Invitation refusée';
    echo json_encode(['success' => true, 'message' => $message]);
    
} catch (PDOException $e) {
    $pdo->rollBack();
    error_log("Erreur base de données: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erreur lors du traitement de l\'invitation']);
}
?> 