<?php
header('Content-Type: application/json');
require_once 'config.php';

$user_id = $_POST['user_id'] ?? null;
$article_id = $_POST['article_id'] ?? null;
$type = $_POST['type'] ?? null; // 'like' ou 'dislike'

if (!$user_id || !$article_id || !in_array($type, ['like', 'dislike'])) {
    echo json_encode(['success'=>false, 'message'=>'Données invalides']);
    exit;
}

try {
    // Vérifier si l'utilisateur a déjà liké/disliké
    $stmt = $pdo->prepare("SELECT id, type FROM likes WHERE user_id=? AND article_id=?");
    $stmt->execute([$user_id, $article_id]);
    $existing = $stmt->fetch();

    if ($existing) {
        if ($existing['type'] === $type) {
            // Supprimer le like/dislike (toggle off)
            $stmt = $pdo->prepare("DELETE FROM likes WHERE id=?");
            $stmt->execute([$existing['id']]);
        } else {
            // Mettre à jour le type (changer like en dislike ou inverse)
            $stmt = $pdo->prepare("UPDATE likes SET type=? WHERE id=?");
            $stmt->execute([$type, $existing['id']]);
        }
    } else {
        // Ajouter un nouveau like/dislike
        $stmt = $pdo->prepare("INSERT INTO likes (user_id, article_id, type) VALUES (?, ?, ?)");
        $stmt->execute([$user_id, $article_id, $type]);
    }

    echo json_encode(['success'=>true]);

} catch (Exception $e) {
    echo json_encode(['success'=>false, 'message'=>'Erreur serveur']);
}
