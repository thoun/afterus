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
 * states.inc.php
 *
 * AfterUs game states description
 *
 */

/*
   Game state machine is a tool used to facilitate game developpement by doing common stuff that can be set up
   in a very easy way from this configuration file.

   Please check the BGA Studio presentation about game state to understand this, and associated documentation.

   Summary:

   States types:
   _ activeplayer: in this type of state, we expect some action from the active player.
   _ multipleactiveplayer: in this type of state, we expect some action from multiple players (the active players)
   _ game: this is an intermediary state where we don't expect any actions from players. Your game logic must decide what is the next game state.
   _ manager: special type for initial and final state

   Arguments of game states:
   _ name: the name of the GameState, in order you can recognize it on your own code.
   _ description: the description of the current game state is always displayed in the action status bar on
                  the top of the game. Most of the time this is useless for game state with "game" type.
   _ descriptionmyturn: the description of the current game state when it's your turn.
   _ type: defines the type of game states (activeplayer / multipleactiveplayer / game / manager)
   _ action: name of the method to call when this game state become the current game state. Usually, the
             action method is prefixed by "st" (ex: "stMyGameStateName").
   _ possibleactions: array that specify possible player actions on this step. It allows you to use "checkAction"
                      method on both client side (Javacript: this.checkAction) and server side (PHP: self::checkAction).
   _ transitions: the transitions are the possible paths to go from a game state to another. You must name
                  transitions in order to use transition names in "nextState" PHP method, and use IDs to
                  specify the next game state for each transition.
   _ args: name of the method to call to retrieve arguments for this gamestate. Arguments are sent to the
           client side to be used on "onEnteringState" or to set arguments in the gamestate description.
   _ updateGameProgression: when specified, the game progression is updated (=> call to your getGameProgression
                            method).
*/
require_once("modules/php/constants.inc.php");

$basicGameStates = [

    // The initial state. Please do not modify.
    ST_BGA_GAME_SETUP => [
        "name" => "gameSetup",
        "description" => clienttranslate("Game setup"),
        "type" => "manager",
        "action" => "stGameSetup",
        "transitions" => [ "" => ST_NEW_ROUND ]
    ],
   
    // Final state.
    // Please do not modify.
    ST_END_GAME => [
        "name" => "gameEnd",
        "description" => clienttranslate("End of game"),
        "type" => "manager",
        "action" => "stGameEnd",
        "args" => "argGameEnd",
    ],
];

$playerActionsGameStates = [

    ST_MULTIPLAYER_PHASE1 => [
        "name" => "phase1",
        "description" => clienttranslate('Phase 1 : Players must order their cards and activate effects'),
        "descriptionmyturn" => '',
        "type" => "multipleactiveplayer",
        "initialprivate" => ST_PRIVATE_ORDER_CARDS,
        "action" => "stPhase1",
        "possibleactions" => [ "cancelLastMove", "cancelResolutions", "cancelAll" ],
        "transitions" => [
            "next" => ST_END_PHASE1,
        ],
    ],

    ST_PRIVATE_ORDER_CARDS => [
        "name" => "orderCards",
        "descriptionmyturn" => clienttranslate('Phase 1 : ${you} must order the picked cards'),
        "type" => "private",
        //"args" => "argOrderCards",
        "possibleactions" => [ "moveCard", "validateCardOrder" ],
        "transitions" => [
          'next' => ST_PRIVATE_ACTIVATE_EFFECT,
        ],
    ],

    ST_PRIVATE_ACTIVATE_EFFECT => [
        "name" => "activateEffect",
        "descriptionmyturn" => clienttranslate('Phase 1 : ${you} can activate an effect'),
        "type" => "private",
        "args" => "argActivateEffect",
        "possibleactions" => [ "activateEffect", "skipEffect", "cancelLastMove", "cancelResolutions", "cancelAll" ],
        "transitions" => [
          'stay' => ST_PRIVATE_ACTIVATE_EFFECT,
          'next' => ST_PRIVATE_CONFIRM_ACTIVATIONS,
        ],
    ],

    ST_PRIVATE_CONFIRM_ACTIVATIONS => [
        "name" => "confirmActivations",
        "descriptionmyturn" => clienttranslate('Phase 1 : ${you} must confirm your turn'),
        "type" => "private",
        "possibleactions" => [ "confirmActivations", "cancelLastMove", "cancelResolutions", "cancelAll" ],
        "transitions" => [
          'next' => ST_PRIVATE_ACTIVATE_EFFECT,
        ],
    ],

    ST_MULTIPLAYER_CHOOSE_TOKEN => [
        "name" => "chooseToken",
        "description" => clienttranslate('Waiting for other players'),
        "descriptionmyturn" => clienttranslate('Phase 2 : ${you} must choose a token'),
        "type" => "multipleactiveplayer",
        "action" => "stChooseToken",
        "args" => "argChooseToken",
        "possibleactions" => [ 
            "chooseToken",
            "cancelChooseToken",
        ],
        "transitions" => [
            "next" => ST_REVEAL_TOKENS,
        ],
    ],

    ST_MULTIPLAYER_PHASE2 => [ // TODO allow copy/apply effect in any order, then copy/recruit
        "name" => "phase2",
        "description" => clienttranslate('Phase 2 : Waiting for other players'),
        "descriptionmyturn" => '',
        "type" => "multipleactiveplayer",
        "initialprivate" => ST_PRIVATE_ACTIVATE_EFFECT,
        //"action" => "stPlayCard",
    "possibleactions" => [ /*"cancelPlaceShape"*/ ],
        "transitions" => [
            "next" => ST_END_ROUND,
        ],
    ],
];

$gameGameStates = [

    ST_NEW_ROUND => [
        "name" => "newRound",
        "description" => "",
        "type" => "game",
        "action" => "stNewRound",
        "transitions" => [
            "next" => ST_MULTIPLAYER_PHASE1,
        ],
    ],

    ST_END_PHASE1 => [
        "name" => "endPhase1",
        "description" => "",
        "type" => "game",
        "action" => "stEndPhase1",
        "updateGameProgression" => true,
        "transitions" => [
            //"next" => ST_MULTIPLAYER_CHOOSE_TOKEN,
            "next" => ST_END_ROUND, // TODO TEMP
            "endGame" => ST_END_SCORE
        ],
    ],

    ST_REVEAL_TOKENS => [
        "name" => "revealTokens",
        "description" => clienttranslate('Revealing chosen tokens...'),
        "type" => "game",
        "action" => "stRevealTokens",
        "transitions" => [
            "next" => ST_MULTIPLAYER_PHASE2,
        ],
    ],

    ST_END_ROUND => [
        "name" => "endRound",
        "description" => "",
        "type" => "game",
        "action" => "stEndRound",
        "updateGameProgression" => true,
        "transitions" => [
            "newRound" => ST_NEW_ROUND,
            "endScore" => ST_END_SCORE,
        ],
    ],

    ST_END_SCORE => [
        "name" => "endScore",
        "description" => "",
        "type" => "game",
        "action" => "stEndScore",
        "transitions" => [
            "endGame" => ST_END_GAME,
        ],
    ],
];
 
$machinestates = $basicGameStates + $playerActionsGameStates + $gameGameStates;



