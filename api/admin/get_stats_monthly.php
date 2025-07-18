<?php
header('Content-Type: application/json');

// Connexion à la base de données
$conn = new mysqli("localhost", "root", "", "reseau_social");
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Connexion échouée"]);
    exit;
}

// ✅ Fonction corrigée avec 3 paramètres
function getMonthlyCounts($conn, $table, $colonne_date) {
    $sql = "
        SELECT DATE_FORMAT(`$colonne_date`, '%Y-%m') AS mois, COUNT(*) AS total
        FROM `$table`
        WHERE `$colonne_date` IS NOT NULL
        GROUP BY mois
        ORDER BY mois ASC
    ";

    $result = $conn->query($sql);

    if (!$result) {
        echo json_encode([
            "success" => false,
            "message" => "Erreur SQL sur la table `$table`",
            "sql" => $sql,
            "erreur" => $conn->error
        ]);
        exit;
    }

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[$row['mois']] = (int)$row['total'];
    }

    return $data;
}

// Appels avec bonnes colonnes
$inscriptions = getMonthlyCounts($conn, 'users', 'date_inscription');
$publications = getMonthlyCounts($conn, 'posts', 'date_post');
$commentaires = getMonthlyCounts($conn, 'commentaires', 'date_commentaire');

// Résultat final
echo json_encode([
    "success" => true,
    "inscriptions" => $inscriptions,
    "publications" => $publications,
    "commentaires" => $commentaires
]);

$conn->close();
