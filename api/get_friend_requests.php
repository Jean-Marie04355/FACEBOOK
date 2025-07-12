<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

$user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;

if (!$user_id) {
    echo json_encode(['success' => false, 'message' => 'ID utilisateur requis']);
    exit;
}

try {
    // Récupérer les demandes d'amis reçues en attente
    $stmt = $pdo->prepare("
        SELECT 
            u.id,
            u.nom,
            u.prenom,
            u.email,
            u.photo_profil,
            a.date_action as request_date
        FROM users u
        INNER JOIN amis a ON a.id_user1 = u.id
        WHERE a.id_user2 = ? AND a.statut = 'en_attente'
        ORDER BY a.date_action DESC
    ");
    
    $stmt->execute([$user_id]);
    $pending_requests = $stmt->fetchAll();
    
    // Récupérer les demandes d'amis envoyées en attente
    $stmt = $pdo->prepare("
        SELECT 
            u.id,
            u.nom,
            u.prenom,
            u.email,
            u.photo_profil,
            a.date_action as request_date
        FROM users u
        INNER JOIN amis a ON a.id_user2 = u.id
        WHERE a.id_user1 = ? AND a.statut = 'en_attente'
        ORDER BY a.date_action DESC
    ");
    
    $stmt->execute([$user_id]);
    $sent_requests = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'received_requests' => $pending_requests,
        'sent_requests' => $sent_requests,
        'received_count' => count($pending_requests),
        'sent_count' => count($sent_requests)
    ]);
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur lors de la récupération des demandes d\'amis']);
}
?> 