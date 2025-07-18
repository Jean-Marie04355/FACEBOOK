<?php
header('Content-Type: application/json');
require_once 'config.php';

$id_user = $_POST['id_user'] ?? null;
$id_post = $_POST['id_post'] ?? null;
$type = $_POST['type'] ?? null; // 'like', 'love', 'haha', 'wow', 'sad', 'angry'

$valid_types = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];

if (!$id_user || !$id_post || !in_array($type, $valid_types)) {
    echo json_encode(['success' => false, 'message' => 'Paramètres manquants ou invalides.']);
    exit;
}

try {
    // Vérifier si l'utilisateur a déjà réagi à ce post
    $stmt = $pdo->prepare('SELECT * FROM likes WHERE id_user = ? AND id_post = ?');
    $stmt->execute([$id_user, $id_post]);
    $existing = $stmt->fetch();

    if ($existing) {
        if ($existing['type'] === $type) {
            // Si même type, on retire la réaction
            $pdo->prepare('DELETE FROM likes WHERE id_user = ? AND id_post = ?')->execute([$id_user, $id_post]);
            echo json_encode(['success' => true, 'action' => 'removed']);
        } else {
            // Sinon, on met à jour le type
            $pdo->prepare('UPDATE likes SET type = ? WHERE id_user = ? AND id_post = ?')->execute([$type, $id_user, $id_post]);
            echo json_encode(['success' => true, 'action' => 'updated']);
        }
    } else {
        // Sinon, on ajoute la réaction
        $pdo->prepare('INSERT INTO likes (id_user, id_post, type) VALUES (?, ?, ?)')->execute([$id_user, $id_post, $type]);
        echo json_encode(['success' => true, 'action' => 'added']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur serveur.']);
} 