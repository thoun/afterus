<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * AfterUs implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * stats.inc.php
 *
 * AfterUs game statistics description
 *
 */

/*
    In this file, you are describing game statistics, that will be displayed at the end of the
    game.
    
    !! After modifying this file, you must use "Reload  statistics configuration" in BGA Studio backoffice
    ("Control Panel" / "Manage Game" / "Your Game")
    
    There are 2 types of statistics:
    _ table statistics, that are not associated to a specific player (ie: 1 value for each game).
    _ player statistics, that are associated to each players (ie: 1 value for each player in the game).

    Statistics types can be "int" for integer, "float" for floating point values, and "bool" for boolean
    
    Once you defined your statistics there, you can start using "initStat", "setStat" and "incStat" method
    in your game logic, using statistics names defined below.
    
    !! It is not a good idea to modify this file when a game is running !!

    If your game is already public on BGA, please read the following before any change:
    http://en.doc.boardgamearena.com/Post-release_phase#Changes_that_breaks_the_games_in_progress
    
    Notes:
    * Statistic index is the reference used in setStat/incStat/initStat PHP method
    * Statistic index must contains alphanumerical characters and no space. Example: 'turn_played'
    * Statistics IDs must be >=10
    * Two table statistics can't share the same ID, two player statistics can't share the same ID
    * A table statistic can have the same ID than a player statistics
    * Statistics ID is the reference used by BGA website. If you change the ID, you lost all historical statistic data. Do NOT re-use an ID of a deleted statistic
    * Statistic name is the English description of the statistic as shown to players
    
*/

require_once(__DIR__.'/modules/php/constants.inc.php');

$stats_type = [
    // Statistics global to table
    "table" => [
        "roundNumber" => [
            "id" => 10,
            "name" => totranslate("Number of rounds"),
            "type" => "int"
        ],
    ],
    
    // Statistics existing for each player
    "player" => [
        
        // 30+ : effects
        "activatedEffects" => [
            "id" => 30,
            "name" => totranslate("Activated effects"),
            "type" => "int"
        ],
        "activatedEffectsFree" => [
            "id" => 31,
            "name" => totranslate("Activated effects (free)"),
            "type" => "int"
        ],
        "activatedEffectsCost" => [
            "id" => 32,
            "name" => totranslate("Activated effects (trade)"),
            "type" => "int"
        ],
        "activatedEffectsToken" => [
            "id" => 33,
            "name" => totranslate("Activated effects (chimpanzee token)"),
            "type" => "int"
        ],
        "skippedEffects" => [
            "id" => 34,
            "name" => totranslate("Skipped effects"),
            "type" => "int"
        ],
        // 40+ : resources
        "resourcesGained" => [
            "id" => 40,
            "name" => totranslate("Resources gained (of any type)"),
            "type" => "int"
        ],
        "resourcesGained".FLOWER => [
            "id" => 40 + FLOWER,
            "name" => totranslate("Flower gained"),
            "type" => "int"
        ],
        "resourcesGained".FRUIT => [
            "id" => 40 + FRUIT,
            "name" => totranslate("Fruit gained"),
            "type" => "int"
        ],
        "resourcesGained".GRAIN => [
            "id" => 40 + GRAIN,
            "name" => totranslate("Grain gained"),
            "type" => "int"
        ],
        "resourcesGained".ENERGY => [
            "id" => 40 + ENERGY,
            "name" => totranslate("Energy gained"),
            "type" => "int"
        ],
        "resourcesGained".POINT => [
            "id" => 40 + POINT,
            "name" => totranslate("Point gained"),
            "type" => "int"
        ],
        "resourcesGained".RAGE => [
            "id" => 40 + RAGE,
            "name" => totranslate("Rage gained"),
            "type" => "int"
        ],

        "resourcesSpent" => [
            "id" => 50,
            "name" => totranslate("Resources spent (of any type)"),
            "type" => "int"
        ],
        "resourcesSpent".FLOWER => [
            "id" => 50 + FLOWER,
            "name" => totranslate("Flower spent"),
            "type" => "int"
        ],
        "resourcesSpent".FRUIT => [
            "id" => 50 + FRUIT,
            "name" => totranslate("Fruit spent"),
            "type" => "int"
        ],
        "resourcesSpent".GRAIN => [
            "id" => 50 + GRAIN,
            "name" => totranslate("Grain spent"),
            "type" => "int"
        ],
        "resourcesSpent".ENERGY => [
            "id" => 50 + ENERGY,
            "name" => totranslate("Energy spent"),
            "type" => "int"
        ],

        // 60+ : tokens
        "activatedTokens" => [
            "id" => 60,
            "name" => totranslate("Tokens activated (of any type)"),
            "type" => "int"
        ],
        "activatedTokens".MANDRILLS => [
            "id" => 60 + MANDRILLS,
            "name" => totranslate("Mandrill tokens activated"),
            "type" => "int"
        ],
        "activatedTokens".ORANGUTANS => [
            "id" => 60 + ORANGUTANS,
            "name" => totranslate("Orangutan tokens activated"),
            "type" => "int"
        ],
        "activatedTokens".GORILLAS => [
            "id" => 60 + GORILLAS,
            "name" => totranslate("Gorilla tokens activated"),
            "type" => "int"
        ],
        "activatedTokens".CHIMPANZEES => [
            "id" => 60 + CHIMPANZEES,
            "name" => totranslate("Chimpanzee tokens activated"),
            "type" => "int"
        ],

        // 70+ : cards
        "cardsBought1" => [
            "id" => 71,
            "name" => totranslate("Level 1 cards bought"),
            "type" => "int"
        ],
        "cardsBought2" => [
            "id" => 72,
            "name" => totranslate("Level 2 cards bought"),
            "type" => "int"
        ],
        "addedCards" => [
            "id" => 73,
            "name" => totranslate("Added cards"),
            "type" => "int"
        ],
        "finalCardCount" => [
            "id" => 75,
            "name" => totranslate("Final card count"),
            "type" => "int"
        ],

        // 80+ : rage
        "removedCards" => [
            "id" => 80,
            "name" => totranslate("Removed cards"),
            "type" => "int"
        ],
        "removedCards0" => [
            "id" => 81,
            "name" => totranslate("Removed tamarins cards"),
            "type" => "int"
        ],
        "removedCards1" => [
            "id" => 82,
            "name" => totranslate("Removed cards of level 1"),
            "type" => "int"
        ],
        "removedCards2" => [
            "id" => 83,
            "name" => totranslate("Removed cards of level 2"),
            "type" => "int"
        ],

        "rageGain" => [
            "id" => 90,
            "name" => totranslate("Resources gained (of any type) with rage"),
            "type" => "int"
        ],
        "rageGain".FLOWER => [
            "id" => 90 + FLOWER,
            "name" => totranslate("Flower gained with rage"),
            "type" => "int"
        ],
        "rageGain".FRUIT => [
            "id" => 90 + FRUIT,
            "name" => totranslate("Fruit gained with rage"),
            "type" => "int"
        ],
        "rageGain".GRAIN => [
            "id" => 90 + GRAIN,
            "name" => totranslate("Grain gained with rage"),
            "type" => "int"
        ],
        "rageGain".ENERGY => [
            "id" => 90 + ENERGY,
            "name" => totranslate("Energy gained with rage"),
            "type" => "int"
        ],
        "rageGain".POINT => [
            "id" => 90 + POINT,
            "name" => totranslate("Point gained with rage"),
            "type" => "int"
        ],

        // 100+ : objects
        "usedObjects" => [
            "id" => 100,
            "name" => totranslate("Used objects"),
            "type" => "int"
        ],
    ],
];
