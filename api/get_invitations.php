<?php
require_once 'config.php';
header('Content-Type: application/json');

$user_id = $_GET['user_id'] ?? null;
if (!$user_id) {
    echo json_encode([]);
    exit;
}

$stmt = $pdo->prepare("SELECT i.id, u.nom, u.prenom, u.photo_profil as avatar, i.status
    FROM invitations i
    JOIN users u ON u.id = i.sender_id
    WHERE i.receiver_id = ? AND i.status = 'pending'
    ORDER BY i.sent_at DESC");
$stmt->execute([$user_id]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?> 