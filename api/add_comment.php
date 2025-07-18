<?php
header('Content-Type: application/json');
require_once 'config.php';

$id_user = $_POST['id_user'] ?? null;
$id_post = $_POST['id_post'] ?? null;
$texte = trim($_POST['texte'] ?? '');

if (!$id_user || !$id_post || $texte === '') {
    echo json_encode(['success' => false, 'message' => 'Paramètres manquants.']);
    exit;
}

try {
    $stmt = $pdo->prepare('INSERT INTO commentaires (id_user, id_post, texte, date_commentaire) VALUES (?, ?, ?, NOW())');
    $stmt->execute([$id_user, $id_post, $texte]);
    echo json_encode(['success' => true, 'message' => 'Commentaire ajouté !']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur serveur.']);
} 