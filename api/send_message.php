<?php
require_once 'config.php';
session_start();
$current_user_id = $_POST['current_user_id'] ?? ($_SESSION['user_id'] ?? null);
$receiver_id = $_POST['user_id'] ?? null;
$message = trim($_POST['message'] ?? '');

if (!$current_user_id || !$receiver_id || (empty($message) && empty($_FILES['image']))) {
    echo json_encode(['success' => false, 'error' => 'Données manquantes']);
    exit;
}

$texte = !empty($message) ? $message : null;
$image = null;

// Gestion de l'image
if (!empty($_FILES['image']['tmp_name'])) {
    $img_name = 'chat_' . $current_user_id . '_' . time() . '_' . basename($_FILES['image']['name']);
    $img_path = '../assets/images/' . $img_name;
    move_uploaded_file($_FILES['image']['tmp_name'], $img_path);
    $image = $img_name;
}

$sql = "INSERT INTO messages (expediteur_id, destinataire_id, texte, image) VALUES (?, ?, ?, ?)";
$stmt = $pdo->prepare($sql);
$stmt->execute([$current_user_id, $receiver_id, $texte, $image]);
echo json_encode(['success' => true]);
