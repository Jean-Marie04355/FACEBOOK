<?php
// api/config.php

$host = 'localhost';         // hôte MySQL (ou IP si distant)
$dbname = 'reseau_social';   // nom de ta base de données
$username = 'root';          // utilisateur MySQL (par défaut en local)
$password = 'root';            // mot de passe root pour MAMP (pas de mot de passe)

$charset = 'utf8mb4';        // encodage
$dsn = "mysql:host=$host;dbname=$dbname;charset=$charset";

// Options de PDO
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,   // erreurs SQL
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,         // fetch associatif
    PDO::ATTR_EMULATE_PREPARES   => false,                    // sécurité
];

try {
    $pdo = new PDO($dsn, $username, $password, $options);
} catch (PDOException $e) {
    // Ne jamais afficher le message exact en production
    exit(json_encode([
        'success' => false,
        'message' => 'Erreur de connexion à la base de données.'
    ]));
}
