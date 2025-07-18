<?php
require_once 'config.php';
session_start();
$current_user_id = $_SESSION['user_id'] ?? $_POST['user_id'] ?? null;
if (!$current_user_id) {
    echo json_encode([]);
    exit;
}

$sql = "SELECT u.id, u.nom, u.prenom, u.photo_profil as avatar
        FROM users u
        WHERE u.id IN (
            SELECT DISTINCT IF(expediteur_id = ?, destinataire_id, expediteur_id)
            FROM messages
            WHERE expediteur_id = ? OR destinataire_id = ?
        ) AND u.id != ?";
$stmt = $pdo->prepare($sql);
$stmt->execute([$current_user_id, $current_user_id, $current_user_id, $current_user_id]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
