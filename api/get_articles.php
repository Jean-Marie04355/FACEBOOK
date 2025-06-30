<?php
header('Content-Type: application/json');
require_once 'config.php';

// Optionnel : récupérer l'id utilisateur connecté (par ex. via session ou token)
// Ici on simule user_id envoyé en GET pour savoir quels likes il a faits
$user_id = $_GET['user_id'] ?? null;

try {
    $sql = "SELECT a.id, a.description, a.image, a.created_at, u.nom, u.prenom, u.email, u.avatar
            FROM articles a
            JOIN users u ON a.user_id = u.id
            ORDER BY a.created_at DESC";
    $stmt = $pdo->query($sql);
    $articles = $stmt->fetchAll();

    // Récupérer les likes/dislikes de l'utilisateur (pour colorer les icônes)
    $user_likes = [];
    if ($user_id) {
        $stmt = $pdo->prepare("SELECT article_id, type FROM likes WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $likes = $stmt->fetchAll();
        foreach ($likes as $like) {
            $user_likes[$like['article_id']] = $like['type'];
        }
    }

    // Récupérer le nombre de likes et dislikes par article
    $stmt = $pdo->query("SELECT article_id, 
                               SUM(type='like') AS likes_count,
                               SUM(type='dislike') AS dislikes_count
                        FROM likes GROUP BY article_id");
    $counts = $stmt->fetchAll(PDO::FETCH_UNIQUE);

    // Construire la réponse
    $result = [];
    foreach ($articles as $article) {
        $id = $article['id'];
        $result[] = [
            'id' => $id,
            'description' => $article['description'],
            'image' => $article['image'],
            'created_at' => $article['created_at'],
            'user' => [
                'nom' => $article['nom'],
                'prenom' => $article['prenom'],
                'email' => $article['email'],
                'avatar' => $article['avatar'] ?? null,  // suppose un champ avatar dans users
            ],
            'likes_count' => $counts[$id]['likes_count'] ?? 0,
            'dislikes_count' => $counts[$id]['dislikes_count'] ?? 0,
            'user_like' => $user_likes[$id] ?? null,
        ];
    }

    echo json_encode(['success'=>true, 'articles'=>$result]);

} catch (Exception $e) {
    echo json_encode(['success'=>false, 'message'=>'Erreur serveur']);
}
