<?php
header('Content-Type: application/json');
require_once 'config.php';

$article_id = $_GET['article_id'] ?? null;
if (!$article_id) {
    echo json_encode(['success'=>false, 'message'=>'Article ID requis']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT c.id, c.commentaire, c.created_at, u.nom, u.prenom, u.avatar
                           FROM commentaires c
                           JOIN users u ON c.user_id = u.id
                           WHERE c.article_id=?
                           ORDER BY c.created_at ASC");
    $stmt->execute([$article_id]);
    $comments = $stmt->fetchAll();

    echo json_encode(['success'=>true, 'comments'=>$comments]);
} catch (Exception $e) {
    echo json_encode(['success'=>false, 'message'=>'Erreur serveur']);
}
