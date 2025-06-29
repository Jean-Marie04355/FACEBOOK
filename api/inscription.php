<?php
// api/inscription.php
header('Content-Type: application/json');

// Inclure la connexion à la base de données
require_once __DIR__ . '/config.php';

// Fonction pour envoyer une réponse JSON et arrêter
function reponse($success, $message) {
    echo json_encode(['success' => $success, 'message' => $message]);
    // temporaire
file_put_contents("debug.txt", print_r($_POST, true));

    exit;
}

// Récupérer et valider les données POST
$nom = trim($_POST['nom'] ?? '');
$prenom = trim($_POST['prenom'] ?? '');
$date_naissance = $_POST['date_naissance'] ?? '';
$sexe = $_POST['sexe'] ?? '';
$email = trim($_POST['email'] ?? '');
$mot_de_passe = $_POST['mot_de_passe'] ?? '';
$conditions = isset($_POST['conditions']) ? true : false;

// Validation basique
if (!$nom || !$prenom || !$date_naissance || !$sexe || !$email || !$mot_de_passe || !$conditions) {
    reponse(false, 'Veuillez remplir tous les champs et accepter les conditions.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    reponse(false, 'Adresse e-mail invalide.');
}

if (!in_array($sexe, ['Homme', 'Femme'])) {
    reponse(false, 'Sexe invalide.');
}

try {
    // Vérifier si l'email existe déjà
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        reponse(false, 'Cette adresse e-mail est déjà utilisée.');
    }

    // Hasher le mot de passe
    $hash = password_hash($mot_de_passe, PASSWORD_DEFAULT);

    // Insérer l'utilisateur
    $stmt = $pdo->prepare("INSERT INTO users (nom, prenom, date_naissance, sexe, email, mot_de_passe) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$nom, $prenom, $date_naissance, $sexe, $email, $hash]);

    // TODO: Envoyer mail confirmation ici si besoin

    reponse(true, 'Inscription réussie ! Vous pouvez maintenant vous connecter.');
} catch (Exception $e) {
    reponse(false, 'Erreur serveur : ' . $e->getMessage());
}



// Charger le template HTML
$template = file_get_contents('../assets/email/confirmation.html');

// Remplacer les variables
$template = str_replace('{{prenom}}', $prenom, $template);
$template = str_replace('{{nom}}', $nom, $template);
$template = str_replace('{{email}}', $email, $template);

// Envoi de l'email
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=UTF-8\r\n";
$headers .= "From: Facebook <no-reply@votresite.com>\r\n";

mail($email, "Bienvenue sur Facebook", $template, $headers);

