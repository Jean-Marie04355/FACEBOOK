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

if (!isset($_GET['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'ID utilisateur requis']);
    exit;
}

$user_id = (int)$_GET['user_id'];

try {
    $stmt = $pdo->prepare('SELECT id, contenu, image, date_post FROM posts WHERE id_user = ? ORDER BY date_post DESC');
    $stmt->execute([$user_id]);
    $posts = $stmt->fetchAll();
    echo json_encode(['success' => true, 'posts' => $posts]);
} catch (PDOException $e) {
    error_log('Erreur get_user_posts: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erreur lors de la récupération des posts']);
}
?> 