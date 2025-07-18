<?php
header('Content-Type: application/json');
require_once 'config.php';

// Vérifier la méthode
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée.']);
    exit;
}

$id_user = $_POST['id_user'] ?? null;
$contenu = $_POST['contenu'] ?? '';

if (!$id_user || ($contenu === '' && empty($_FILES['image']) && empty($_FILES['video']))) {
    echo json_encode(['success' => false, 'message' => 'Champs obligatoires manquants.']);
    exit;
}

$image_path = null;
$video_path = null;

// Gestion de l'upload d'image
if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $img_ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
    $img_name = 'post_' . $id_user . '_' . time() . '.' . $img_ext;
    $img_dest = '../assets/images/' . $img_name;
    if (move_uploaded_file($_FILES['image']['tmp_name'], $img_dest)) {
        $image_path = 'assets/images/' . $img_name;
    }
}

// Gestion de l'upload de vidéo
if (!empty($_FILES['video']) && $_FILES['video']['error'] === UPLOAD_ERR_OK) {
    $vid_ext = strtolower(pathinfo($_FILES['video']['name'], PATHINFO_EXTENSION));
    $vid_name = 'post_' . $id_user . '_' . time() . '.' . $vid_ext;
    $vid_dest = '../assets/videos/' . $vid_name;
    if (move_uploaded_file($_FILES['video']['tmp_name'], $vid_dest)) {
        $video_path = 'assets/videos/' . $vid_name;
    }
}

try {
    $stmt = $pdo->prepare("INSERT INTO posts (id_user, contenu, image, video, date_post) VALUES (?, ?, ?, ?, NOW())");
    $stmt->execute([$id_user, $contenu, $image_path, $video_path]);
    echo json_encode(['success' => true, 'message' => 'Publication réussie !']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur serveur.']);
} 