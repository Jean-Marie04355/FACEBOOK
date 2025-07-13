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
    // Récupérer tous les amis de l'utilisateur (où l'amitié est acceptée)
    $stmt = $pdo->prepare("
        SELECT 
            u.id,
            u.prenom,
            u.nom,
            u.photo_profil,
            a.date_action
        FROM amis a
        JOIN users u ON (
            (a.id_user1 = :user_id AND a.id_user2 = u.id)
            OR (a.id_user2 = :user_id AND a.id_user1 = u.id)
        )
        WHERE (a.id_user1 = :user_id OR a.id_user2 = :user_id) 
        AND a.statut = 'accepte'
        ORDER BY a.date_action DESC
    ");
    $stmt->execute(['user_id' => $user_id]);
    $friends = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true, 
        'friends' => $friends
    ]);
    
} catch (PDOException $e) {
    error_log("Erreur base de données: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erreur lors de la récupération des amis']);
}
?> 