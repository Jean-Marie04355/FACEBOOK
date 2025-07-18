-- Script pour mettre à jour la table likes pour supporter les émojis
-- Exécuter ce script dans phpMyAdmin ou via MySQL

-- Modifier la colonne 'type' pour accepter plus de valeurs
-- Utilisation de codes Unicode pour éviter les problèmes d'encodage
ALTER TABLE likes MODIFY COLUMN type ENUM('like', 'love', 'haha', 'wow', 'sad', 'angry') NOT NULL;

-- Optionnel : Ajouter un commentaire pour documenter
ALTER TABLE likes COMMENT = 'Table des réactions aux posts avec émojis'; 