<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

// Activer l'affichage des erreurs pour le debug
error_reporting(E_ALL);
ini_set('display_errors', 0); // Désactiver l'affichage des erreurs HTML

$targetDir = '../assets/images/';
$maxSize = 2 * 1024 * 1024; // 2 Mo
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

if (!isset($_FILES['photo']) || !isset($_POST['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Fichier ou utilisateur manquant']);
    exit;
}

$file = $_FILES['photo'];
$user_id = (int)$_POST['user_id'];

// Vérifier que le dossier existe et est accessible en écriture
if (!is_dir($targetDir)) {
    if (!mkdir($targetDir, 0755, true)) {
        echo json_encode(['success' => false, 'message' => 'Impossible de créer le dossier d\'upload']);
        exit;
    }
}

if (!is_writable($targetDir)) {
    echo json_encode(['success' => false, 'message' => 'Dossier non accessible en écriture']);
    exit;
}

if ($file['error'] !== UPLOAD_ERR_OK) {
    $errorMessages = [
        UPLOAD_ERR_INI_SIZE => 'Fichier trop volumineux',
        UPLOAD_ERR_FORM_SIZE => 'Fichier trop volumineux',
        UPLOAD_ERR_PARTIAL => 'Upload partiel',
        UPLOAD_ERR_NO_FILE => 'Aucun fichier',
        UPLOAD_ERR_NO_TMP_DIR => 'Dossier temporaire manquant',
        UPLOAD_ERR_CANT_WRITE => 'Erreur d\'écriture',
        UPLOAD_ERR_EXTENSION => 'Extension non autorisée'
    ];
    $message = isset($errorMessages[$file['error']]) ? $errorMessages[$file['error']] : 'Erreur lors de l\'upload';
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}

if ($file['size'] > $maxSize) {
    echo json_encode(['success' => false, 'message' => 'Fichier trop volumineux (max 2 Mo)']);
    exit;
}

// Vérifier l'extension du fichier (plus simple et plus fiable)
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

if (!in_array($ext, $allowedExtensions)) {
    echo json_encode(['success' => false, 'message' => 'Type de fichier non autorisé. Extensions autorisées: jpg, jpeg, png, gif, webp']);
    exit;
}

$filename = 'profile_' . $user_id . '_' . time() . '.' . $ext;
$targetFile = $targetDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $targetFile)) {
    echo json_encode(['success' => false, 'message' => 'Erreur lors de l\'enregistrement du fichier']);
    exit;
}

echo json_encode(['success' => true, 'file' => $filename]);
?> 