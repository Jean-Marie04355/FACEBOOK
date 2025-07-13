<?php
require_once 'config.php';

$nom = "Admin";
$prenom = "Super";
$date_naissance = "1990-01-01";
$sexe = "Homme";
$email = "admin@gmail.com";
$mot_de_passe = password_hash("admin123", PASSWORD_DEFAULT); // mot de passe sécurisé
$user_role = "admin";

try {
    $stmt = $pdo->prepare("INSERT INTO users (nom, prenom, date_naissance, sexe, email, mot_de_passe, user_role)
                           VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$nom, $prenom, $date_naissance, $sexe, $email, $mot_de_passe, $user_role]);
    echo "✅ Compte super administrateur créé avec succès.";
} catch (Exception $e) {
    echo "❌ Erreur : " . $e->getMessage();
}
