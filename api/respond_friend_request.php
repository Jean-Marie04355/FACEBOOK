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

if (!isset($input['sender_id']) || !isset($input['receiver_id']) || !isset($input['action'])) {
    echo json_encode(['success' => false, 'message' => 'ID expéditeur, destinataire et action requis']);
    exit;
}

$sender_id = (int)$input['sender_id'];
$receiver_id = (int)$input['receiver_id'];
$action = $input['action']; // 'accept' ou 'decline'

if (!in_array($action, ['accept', 'decline'])) {
    echo json_encode(['success' => false, 'message' => 'Action invalide']);
    exit;
}

try {
    // Vérifier que la demande existe et est en attente
    $stmt = $pdo->prepare("SELECT * FROM amis WHERE id_user1 = ? AND id_user2 = ? AND statut = 'en_attente'");
    $stmt->execute([$sender_id, $receiver_id]);
    $request = $stmt->fetch();
    
    if (!$request) {
        echo json_encode(['success' => false, 'message' => 'Demande d\'ami non trouvée ou déjà traitée']);
        exit;
    }
    
    // Mettre à jour le statut
    $new_status = ($action === 'accept') ? 'accepte' : 'refuse';
    $stmt = $pdo->prepare("UPDATE amis SET statut = ?, date_action = NOW() WHERE id_user1 = ? AND id_user2 = ?");
    $stmt->execute([$new_status, $sender_id, $receiver_id]);
    
    $message = ($action === 'accept') ? 'Demande d\'ami acceptée' : 'Demande d\'ami refusée';
    echo json_encode(['success' => true, 'message' => $message]);
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur lors du traitement de la demande d\'ami']);
}
?> 