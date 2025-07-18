<?php
require_once 'config.php';
session_start();

// DEBUG : pour voir ce que tu reçois
// file_put_contents('debug_search.txt', print_r($_GET, true));

$current_user_id = null;
if (isset($_GET['user_id']) && is_numeric($_GET['user_id'])) {
    $current_user_id = (int)$_GET['user_id'];
} elseif (isset($_SESSION['user_id'])) {
    $current_user_id = $_SESSION['user_id'];
}

$search = trim($_GET['q'] ?? '');
header('Content-Type: application/json');
if (!$current_user_id) {
    echo json_encode(['error' => 'Pas d\'utilisateur connecté', 'session' => $_SESSION, 'get' => $_GET]);
    exit;
}

if ($search !== '') {
    $sql = "SELECT id, nom, prenom, photo_profil as avatar
            FROM users
            WHERE id != ? 
              AND role != 'admin'
              AND (nom LIKE ? OR prenom LIKE ?)
            LIMIT 20";
    $like = "%$search%";
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$current_user_id, $like, $like]);
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode([
            'debug' => [
                'current_user_id' => $current_user_id,
                'search' => $search,
                'sql' => $sql,
                'params' => [$current_user_id, $like, $like],
                'count' => count($result)
            ],
            'data' => $result
        ]);
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
} else {
    $sql = "SELECT id, nom, prenom, photo_profil as avatar
            FROM users
            WHERE id != ? 
              AND role != 'admin'
            LIMIT 20";
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$current_user_id]);
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($result);
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}
