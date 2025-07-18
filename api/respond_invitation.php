<?php
require_once 'config.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$invitation_id = $data['invitation_id'] ?? null;
$action = $data['action'] ?? null; // 'accepted' ou 'declined'

if (!$invitation_id || !in_array($action, ['accepted', 'declined'])) {
    echo json_encode(['success' => false, 'message' => 'Paramètres invalides']);
    exit;
}

try {
    // Mettre à jour le statut de l'invitation
    $stmt = $pdo->prepare("UPDATE invitations SET status = ?, responded_at = NOW() WHERE id = ?");
    if (!$stmt->execute([$action, $invitation_id])) {
        error_log('Erreur update invitation: ' . implode(' | ', $stmt->errorInfo()));
        echo json_encode(['success' => false, 'message' => 'Erreur lors de la mise à jour de l\'invitation']);
        exit;
    }
    
    // Si l'invitation est acceptée, créer l'amitié si elle n'existe pas déjà
    if ($action === 'accepted') {
        // Récupérer les détails de l'invitation
        $stmt = $pdo->prepare("SELECT sender_id, receiver_id FROM invitations WHERE id = ?");
        $stmt->execute([$invitation_id]);
        $invitation = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($invitation) {
            // Vérifier si l'amitié existe déjà dans un sens ou dans l'autre
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM amis WHERE (id_user1 = ? AND id_user2 = ?) OR (id_user1 = ? AND id_user2 = ?)");
            $stmt->execute([
                $invitation['sender_id'], $invitation['receiver_id'],
                $invitation['receiver_id'], $invitation['sender_id']
            ]);
            if ($stmt->fetchColumn() == 0) {
                // Créer l'amitié dans la table amis
                $stmt = $pdo->prepare("INSERT INTO amis (id_user1, id_user2, statut, date_action) VALUES (?, ?, 'accepte', NOW())");
                if (!$stmt->execute([$invitation['sender_id'], $invitation['receiver_id']])) {
                    error_log('Erreur insertion amis: ' . implode(' | ', $stmt->errorInfo()));
                }
            }
        }
    }
    
    echo json_encode(['success' => true]);
    
} catch (PDOException $e) {
    error_log("Erreur base de données: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erreur lors du traitement']);
}
?> 