
-- ------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- AfterUs implementation : © <Your name here> <Your email address here>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-- -----

-- dbmodel.sql

-- This is the file where you are describing the database schema of your game
-- Basically, you just have to export from PhpMyAdmin your table structure and copy/paste
-- this export here.
-- Note that the database itself and the standard tables ("global", "stats", "gamelog" and "player") are
-- already created and must not be created here

-- Note: The database schema is created from this file when the game starts. If you modify this file,
--       you have to restart a game to see your changes in database.

-- Example 1: create a standard "card" table to be used with the "Deck" tools (see example game "hearts"):

CREATE TABLE IF NOT EXISTS `card` (
   `card_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
   `card_type` varchar(16) NOT NULL,
   `card_type_arg` int(11) NOT NULL,
   `card_location` varchar(16) NOT NULL,
   `card_location_arg` int(11) NOT NULL,
   PRIMARY KEY (`card_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

-- Example 2: add a custom field to the standard "player" table
ALTER TABLE `player` ADD `player_auto_gain` SMALLINT UNSIGNED NOT NULL DEFAULT 0;
ALTER TABLE `player` ADD `applied_effects` json;
ALTER TABLE `player` ADD `used_objects` json;
ALTER TABLE `player` ADD `undo` json;
ALTER TABLE `player` ADD `player_flower` SMALLINT UNSIGNED NOT NULL DEFAULT 0;
ALTER TABLE `player` ADD `player_fruit` SMALLINT UNSIGNED NOT NULL DEFAULT 0;
ALTER TABLE `player` ADD `player_grain` SMALLINT UNSIGNED NOT NULL DEFAULT 0;
ALTER TABLE `player` ADD `player_energy` SMALLINT UNSIGNED NOT NULL DEFAULT 0;
ALTER TABLE `player` ADD `player_rage` SMALLINT UNSIGNED NOT NULL DEFAULT 0;
ALTER TABLE `player` ADD `chosen_token` SMALLINT UNSIGNED;
ALTER TABLE `player` ADD `phase2_copied_type` SMALLINT UNSIGNED;
ALTER TABLE `player` ADD `phase2_card_bought` SMALLINT UNSIGNED NOT NULL DEFAULT 0;
ALTER TABLE `player` ADD `private_state_before_object` SMALLINT UNSIGNED;
ALTER TABLE `player` ADD `can_see_top_card` SMALLINT UNSIGNED NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS `global_variables` (
  `name` varchar(50) NOT NULL,
  `value` json,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

