<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once 'config.php';

// Vérifier que c'est une requête GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

// Récupérer l'ID de l'utilisateur depuis les paramètres GET
if (!isset($_GET['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'ID utilisateur requis']);
    exit;
}

$user_id = (int)$_GET['user_id'];

try {
    // Récupérer les invitations reçues avec les informations de l'expéditeur
    $stmt = $pdo->prepare("
        SELECT i.*, u.prenom, u.nom, u.photo_profil 
        FROM invitations i 
        JOIN users u ON i.sender_id = u.id 
        WHERE i.receiver_id = ? AND i.status = 'pending'
        ORDER BY i.sent_at DESC
    ");
    $stmt->execute([$user_id]);
    $invitations = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true, 
        'invitations' => $invitations
    ]);
    
} catch (PDOException $e) {
    error_log("Erreur base de données: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erreur lors de la récupération des invitations']);
}
?> 