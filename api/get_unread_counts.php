<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require_once 'config.php';
session_start();
$current_user_id = $_GET['user_id'] ?? ($_SESSION['user_id'] ?? null);
error_log("get_unread_counts.php - user_id: " . $current_user_id);
if (!$current_user_id) {
    echo json_encode([]);
    exit;
}
$sql = "SELECT expediteur_id, COUNT(*) as unread FROM messages WHERE destinataire_id = ? AND vu = 0 GROUP BY expediteur_id";
$stmt = $pdo->prepare($sql);
$stmt->execute([$current_user_id]);
$result = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $result[$row['expediteur_id']] = (int)$row['unread'];
}
error_log("get_unread_counts.php - result: " . json_encode($result));
echo json_encode($result); 