-- Script pour ajouter la colonne 'vu' à la table messages
-- Exécute ce script dans phpMyAdmin ou via MySQL

ALTER TABLE `messages` ADD COLUMN `vu` tinyint(1) DEFAULT 0 AFTER `date_envoi`;

-- Marquer tous les messages existants comme non lus (optionnel)
-- UPDATE `messages` SET `vu` = 0 WHERE `vu` IS NULL; 