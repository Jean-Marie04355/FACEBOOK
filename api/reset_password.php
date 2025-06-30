<?php
header('Content-Type: application/json');
require_once 'config.php';

$token = $_POST['token'] ?? '';
$new_password = $_POST['new_password'] ?? '';

if (!$token || !$new_password) {
    echo json_encode(['success'=>false, 'message'=>'Champs manquants.']);
    exit;
}

try {
    // Vérifier token valide + non expiré
    $stmt = $pdo->prepare("SELECT id FROM users WHERE reset_token=? AND reset_expire > NOW()");
    $stmt->execute([$token]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode(['success'=>false, 'message'=>'Token invalide ou expiré.']);
        exit;
    }

    $hash = password_hash($new_password, PASSWORD_DEFAULT);

    // Mettre à jour mot de passe et supprimer token
    $stmt = $pdo->prepare("UPDATE users SET mot_de_passe=?, reset_token=NULL, reset_expire=NULL WHERE id=?");
    $stmt->execute([$hash, $user['id']]);

    echo json_encode(['success'=>true, 'message'=>'Mot de passe réinitialisé avec succès.']);
} catch (Exception $e) {
    echo json_encode(['success'=>false, 'message'=>'Erreur serveur.']);
}
?>
