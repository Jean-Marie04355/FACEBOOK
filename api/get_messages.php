<?php
require_once 'config.php';
session_start();
$current_user_id = $_GET['current_user_id'] ?? ($_SESSION['user_id'] ?? null);
$other_user_id = $_GET['user_id'] ?? null;
if (!$current_user_id || !$other_user_id) {
    echo json_encode([]);
    exit;
}

$sql = "SELECT id, expediteur_id, destinataire_id, texte, image, date_envoi, vu
        FROM messages
        WHERE (expediteur_id = ? AND destinataire_id = ?)
           OR (expediteur_id = ? AND destinataire_id = ?)
        ORDER BY date_envoi ASC";
$stmt = $pdo->prepare($sql);
$stmt->execute([$current_user_id, $other_user_id, $other_user_id, $current_user_id]);
$messages = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $row['is_me'] = ($row['expediteur_id'] == $current_user_id);
    if ($row['image']) {
        $row['type'] = 'image';
        $row['content'] = $row['image'];
    } else {
        $row['type'] = 'text';
        $row['content'] = $row['texte'];
    }
    $messages[] = $row;
}
// Marquer comme lus tous les messages reçus par l'utilisateur connecté
$update = $pdo->prepare("UPDATE messages SET vu = 1 WHERE destinataire_id = ? AND expediteur_id = ? AND vu = 0");
$update->execute([$current_user_id, $other_user_id]);
echo json_encode($messages);
