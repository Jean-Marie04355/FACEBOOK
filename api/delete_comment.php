<?php
header('Content-Type: application/json');
require_once 'config.php';

$id_comment = $_POST['id_comment'] ?? null;
$id_user = $_POST['id_user'] ?? null;

if (!$id_comment || !$id_user) {
    echo json_encode(['success' => false, 'message' => 'Paramètres manquants.']);
    exit;
}

try {
    // Vérifier que le commentaire appartient à l'utilisateur
    $stmt = $pdo->prepare('SELECT * FROM commentaires WHERE id = ? AND id_user = ?');
    $stmt->execute([$id_comment, $id_user]);
    $comment = $stmt->fetch();
    if (!$comment) {
        echo json_encode(['success' => false, 'message' => 'Suppression non autorisée.']);
        exit;
    }
    // Supprimer le commentaire
    $pdo->prepare('DELETE FROM commentaires WHERE id = ?')->execute([$id_comment]);
    echo json_encode(['success' => true, 'message' => 'Commentaire supprimé.']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur serveur.']);
} 