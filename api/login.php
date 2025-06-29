<?php
header('Content-Type: application/json');
require_once 'config.php';

$email = $_POST['email'] ?? '';
$mot_de_passe = $_POST['mot_de_passe'] ?? '';

if (empty($email) || empty($mot_de_passe)) {
    echo json_encode(['success' => false, 'message' => 'Champs manquants.']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, nom, prenom, email, mot_de_passe FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($mot_de_passe, $user['mot_de_passe'])) {
        echo json_encode([
            'success' => true,
            'message' => 'Connexion réussie !',
            'user' => [
                'id' => $user['id'],
                'nom' => $user['nom'],
                'prenom' => $user['prenom'],
                'email' => $user['email']
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Email ou mot de passe incorrect.']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur serveur.']);
}
