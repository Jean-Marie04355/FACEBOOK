<?php
header('Content-Type: application/json');
require_once 'config.php';

$id_post = $_GET['id_post'] ?? null;
if (!$id_post) {
    echo json_encode(['success' => false, 'message' => 'Paramètre id_post manquant.']);
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT c.*, u.nom, u.prenom, u.photo_profil FROM commentaires c JOIN users u ON c.id_user = u.id WHERE c.id_post = ? ORDER BY c.date_commentaire ASC');
    $stmt->execute([$id_post]);
    $comments = $stmt->fetchAll();
    echo json_encode(['success' => true, 'comments' => $comments]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur serveur.']);
} 