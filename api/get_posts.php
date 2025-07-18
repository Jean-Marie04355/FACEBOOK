<?php
header('Content-Type: application/json');
require_once 'config.php';

$id_user = $_GET['id_user'] ?? null;

try {
    $stmt = $pdo->query("SELECT p.*, u.nom, u.prenom, u.photo_profil FROM posts p JOIN users u ON p.id_user = u.id ORDER BY p.date_post DESC");
    $posts = $stmt->fetchAll();

    foreach ($posts as &$post) {
        // Compter chaque type de réaction
        $reaction_types = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];
        $post['reactions'] = [];
        
        foreach ($reaction_types as $type) {
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM likes WHERE id_post = ? AND type = ?");
            $stmt->execute([$post['id'], $type]);
            $post['reactions'][$type] = (int)$stmt->fetchColumn();
        }

        // Réaction de l'utilisateur connecté
        if ($id_user) {
            $userReactionStmt = $pdo->prepare("SELECT type FROM likes WHERE id_post = ? AND id_user = ?");
            $userReactionStmt->execute([$post['id'], $id_user]);
            $post['user_reaction'] = $userReactionStmt->fetchColumn() ?: null;
        } else {
            $post['user_reaction'] = null;
        }
    }

    echo json_encode(['success' => true, 'posts' => $posts]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur serveur.']);
} 