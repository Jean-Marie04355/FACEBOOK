<?php
header('Content-Type: application/json');
require_once '../config.php'; // Chemin adapté

try {
    $stmt = $pdo->query("SELECT id, nom, prenom, email, user_role FROM users");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'users' => $users]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur serveur']);
}