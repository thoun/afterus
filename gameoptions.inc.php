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
 * gameoptions.inc.php
 *
 * AfterUs game options description
 * 
 * In this file, you can define your game options (= game variants).
 *   
 * Note: If your game has no variant, you don't have to modify this file.
 *
 * Note²: All options defined in this file should have a corresponding "game state labels"
 *        with the same ID (see "initGameStateLabels" in afterus.game.php)
 *
 * !! It is not a good idea to modify this file when a game is running !!
 *
 */

require_once("modules/php/constants.inc.php");

 $game_options = [

    OBJECTS_OPTION => [
        'name' => totranslate('Objects'),
        'values' => [
            1 => [
                'name' => totranslate('Recommended for beginners'),
                'tmdisplay' => totranslate('Recommended for beginners'),
            ],
            2 => [
                'name' => totranslate('Random objects'),
                'tmdisplay' => totranslate('Random objects'),
            ],
        ],
        'default' => 1,
    ],
];
    
$game_preferences = [
    201 => [
        'name' => totranslate('Automatically take free resources'),
        'needReload' => false,
        'values' => [
            1 => ['name' => totranslate('Enabled')],
            0 => ['name' => totranslate('Disabled')],
        ],
        'default' => 0,
    ],
];
