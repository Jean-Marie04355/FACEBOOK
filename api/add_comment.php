<?php
header('Content-Type: application/json');
require_once 'config.php';

$user_id = $_POST['user_id'] ?? null;
$article_id = $_POST['article_id'] ?? null;
$commentaire = trim($_POST['commentaire'] ?? '');

if (!$user_id || !$article_id || !$commentaire) {
    echo json_encode(['success'=>false, 'message'=>'Données invalides']);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO commentaires (user_id, article_id, commentaire) VALUES (?, ?, ?)");
    $stmt->execute([$user_id, $article_id, $commentaire]);

    echo json_encode(['success'=>true, 'message'=>'Commentaire ajouté']);
} catch (Exception $e) {
    echo json_encode(['success'=>false, 'message'=>'Erreur serveur']);
}
