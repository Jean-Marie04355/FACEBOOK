<?php
header('Content-Type: application/json');

$conn = new mysqli("localhost", "root", "", "reseau_social");
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Connexion échouée"]);
    exit;
}

// Requêtes de stats utilisateurs
$res = $conn->query("SELECT user_role, COUNT(*) as total FROM users GROUP BY user_role");
$roles = [
    "admin" => 0,
    "moderator" => 0,
    "user" => 0
];
$totalUsers = 0;

while ($row = $res->fetch_assoc()) {
    $roles[$row['user_role']] = (int)$row['total'];
    $totalUsers += $row['total'];
}

// (Optionnel) Requête si tu as une table des publications
$postCount = 0;
if ($conn->query("SHOW TABLES LIKE 'posts'")->num_rows) {
    $res = $conn->query("SELECT COUNT(*) as total FROM posts");
    $postCount = $res->fetch_assoc()['total'];
}

echo json_encode([
    "success" => true,
    "total_users" => $totalUsers,
    "admins" => $roles['admin'],
    "moderateurs" => $roles['moderator'],  // Ici la bonne clé
    "users" => $roles['user'],
    "total_posts" => $postCount
]);
$conn->close();
