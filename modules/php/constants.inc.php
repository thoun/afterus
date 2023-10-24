<?php

// resources
define('FLOWER', 1);
define('FRUIT', 2);
define('GRAIN', 3);
define('ENERGY', 4);
define('POINT', 5);
define('RAGE', 6);
define('DIFFERENT', 7);
define('PER_TAMARINS', 8);
define('REACTIVATE', 10);

// frames
define('OPENED_LEFT', 1);
define('CLOSED', 2);
define('OPENED_RIGHT', 3);

// monkey types
define('TAMARINS', 0);
define('MANDRILLS', 1);
define('ORANGUTANS', 2);
define('GORILLAS', 3);
define('CHIMPANZEES', 4);

/*
 * State constants
 */
define('ST_BGA_GAME_SETUP', 1);

define('ST_NEW_ROUND', 10);

define('ST_MULTIPLAYER_PHASE1', 20);
define('ST_PRIVATE_ORDER_CARDS', 25);
define('ST_PRIVATE_ACTIVATE_EFFECT', 30);
define('ST_PRIVATE_CONFIRM_ACTIVATIONS', 33);
define('ST_END_PHASE1', 35);

define('ST_MULTIPLAYER_CHOOSE_TOKEN', 40);
define('ST_PRIVATE_CHOOSE_TOKEN', 41);
define('ST_REVEAL_TOKENS', 45);
define('ST_MULTIPLAYER_TOKEN_SELECT_REACTIVATE', 50);
define('ST_PRIVATE_ACTIVATE_EFFECT_TOKEN', 51);
define('ST_PRIVATE_CONFIRM_ACTIVATIONS_PHASE2', 52);

define('ST_MULTIPLAYER_PHASE2', 60);
define('ST_PRIVATE_BUY_CARD', 61);
define('ST_PRIVATE_APPLY_NEIGHBOR_EFFECT', 62);

define('ST_PRIVATE_MOBILE_PHONE', 81);
define('ST_PRIVATE_MINIBAR', 82);
define('ST_PRIVATE_GHETTO_BLASTER', 83);
define('ST_PRIVATE_GAME_CONSOLE', 84);
define('ST_PRIVATE_MOPED', 87);

define('ST_END_ROUND', 95);

const ST_MULTIPLAYER_BEFORE_END_GAME = 96;
const ST_PRIVATE_BEFORE_END_GAME = 97;

define('ST_END_SCORE', 98);

define('ST_END_GAME', 99);
define('END_SCORE', 100);

/*
 * Constants
 */
define('LAST_TURN', 10);

/*
 * Options
 */
define('OBJECTS_OPTION', 100);

/*
 * Global variables
 */
define('OBJECTS', 'objects');


?>
