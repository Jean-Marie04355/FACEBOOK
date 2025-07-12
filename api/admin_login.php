<?php
require_once '../config.php';
header('Content-Type: application/json');

$email = $_POST['email'] ?? '';
$password = $_POST['mot_de_passe'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Champs obligatoires.']);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['mot_de_passe'])) {
    if (in_array($user['user_role'], ['admin', 'moderateur'])) {
        echo json_encode([
            'success' => true,
            'message' => 'Connexion réussie',
            'user' => [
                'id' => $user['id'],
                'nom' => $user['nom'],
                'prenom' => $user['prenom'],
                'email' => $user['email'],
                'role' => $user['user_role']
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => "Accès refusé."]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Identifiants invalides.']);
}
