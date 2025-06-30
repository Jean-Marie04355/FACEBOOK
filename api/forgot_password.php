<?php
header('Content-Type: application/json');
require_once 'config.php';

$email = trim($_POST['email'] ?? '');

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success'=>false, 'message'=>'Email invalide.']);
    exit;
}

try {
    // Vérifier que l’email existe
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email=?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode(['success'=>false, 'message'=>'Email non trouvé.']);
        exit;
    }

    // Générer un token sécurisé + expiration 1h
    $token = bin2hex(random_bytes(16));
    $expire = date('Y-m-d H:i:s', strtotime('+1 hour'));

    // Sauvegarder token et expiration en BDD
    $stmt = $pdo->prepare("UPDATE users SET reset_token=?, reset_expire=? WHERE email=?");
    $stmt->execute([$token, $expire, $email]);

    // Générer lien reset
    $reset_link = "http://localhost/FACEBOOK/vues/clients/reset_password.html?token=$token";

    // Préparer email HTML simple
    $message = "
    <html><body>
    <p>Bonjour,</p>
    <p>Pour réinitialiser votre mot de passe, cliquez sur le lien ci-dessous :</p>
    <p><a href='$reset_link'>$reset_link</a></p>
    <p>Ce lien expire dans 1 heure.</p>
    </body></html>
    ";

    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8\r\n";
    $headers .= "From: Facebook <no-reply@localhost>\r\n";

    mail($email, "Réinitialisation de votre mot de passe", $message, $headers);

    echo json_encode(['success'=>true, 'message'=>'Email de réinitialisation envoyé.']);
} catch (Exception $e) {
    echo json_encode(['success'=>false, 'message'=>'Erreur serveur.']);
}
?>
