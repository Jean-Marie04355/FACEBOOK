<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

if (!isset($_GET['id'])) {
    echo json_encode(['success' => false, 'message' => 'ID utilisateur requis']);
    exit;
}

$user_id = (int)$_GET['id'];

try {
    $stmt = $pdo->prepare('SELECT id, nom, prenom, email, sexe, date_naissance, photo_profil, role, date_inscription, statut FROM users WHERE id = ?');
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();
    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'Utilisateur non trouvé']);
        exit;
    }
    echo json_encode(['success' => true, 'user' => $user]);
} catch (PDOException $e) {
    error_log('Erreur profil utilisateur: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erreur lors de la récupération du profil']);
}
?> 