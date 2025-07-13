<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!isset($input['id'], $input['prenom'], $input['nom'], $input['email'])) {
    echo json_encode(['success' => false, 'message' => 'Champs requis manquants']);
    exit;
}

$id = (int)$input['id'];
$prenom = trim($input['prenom']);
$nom = trim($input['nom']);
$email = trim($input['email']);
$password = isset($input['password']) ? $input['password'] : '';
$photo_profil = isset($input['photo_profil']) ? $input['photo_profil'] : null;

if (!$prenom || !$nom || !$email) {
    echo json_encode(['success' => false, 'message' => 'Tous les champs sont obligatoires']);
    exit;
}

try {
    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? AND id != ?');
    $stmt->execute([$email, $id]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Cet email est déjà utilisé par un autre compte']);
        exit;
    }
    // Mise à jour
    if ($password) {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare('UPDATE users SET prenom = ?, nom = ?, email = ?, mot_de_passe = ?' . ($photo_profil ? ', photo_profil = ?' : '') . ' WHERE id = ?');
        $params = [$prenom, $nom, $email, $hash];
        if ($photo_profil) $params[] = $photo_profil;
        $params[] = $id;
        $stmt->execute($params);
    } else {
        $stmt = $pdo->prepare('UPDATE users SET prenom = ?, nom = ?, email = ?' . ($photo_profil ? ', photo_profil = ?' : '') . ' WHERE id = ?');
        $params = [$prenom, $nom, $email];
        if ($photo_profil) $params[] = $photo_profil;
        $params[] = $id;
        $stmt->execute($params);
    }
    echo json_encode(['success' => true, 'message' => 'Profil mis à jour avec succès']);
} catch (PDOException $e) {
    error_log('Erreur update_profile: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erreur lors de la mise à jour du profil']);
}
?> 