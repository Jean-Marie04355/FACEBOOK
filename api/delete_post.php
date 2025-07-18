<?php
header('Content-Type: application/json');
require_once 'config.php';

$id_post = $_POST['id_post'] ?? null;
$id_user = $_POST['id_user'] ?? null;

if (!$id_post || !$id_user) {
    echo json_encode(['success' => false, 'message' => 'Paramètres manquants.']);
    exit;
}

try {
    // Vérifier que le post appartient à l'utilisateur
    $stmt = $pdo->prepare('SELECT * FROM posts WHERE id = ? AND id_user = ?');
    $stmt->execute([$id_post, $id_user]);
    $post = $stmt->fetch();
    if (!$post) {
        echo json_encode(['success' => false, 'message' => 'Suppression non autorisée.']);
        exit;
    }
    // Supprimer les commentaires associés
    $pdo->prepare('DELETE FROM commentaires WHERE id_post = ?')->execute([$id_post]);
    // Supprimer les likes associés
    $pdo->prepare('DELETE FROM likes WHERE id_post = ?')->execute([$id_post]);
    // Supprimer le post
    $pdo->prepare('DELETE FROM posts WHERE id = ?')->execute([$id_post]);
    echo json_encode(['success' => true, 'message' => 'Publication supprimée.']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur serveur.']);
} 