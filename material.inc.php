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
 * material.inc.php
 *
 * AfterUs game material description
 *
 * Here, you can describe the material of your game with PHP variables.
 *   
 * This file is loaded in your game logic class constructor, ie these variables
 * are available everywhere in your game logic code.
 *
 */

require_once(__DIR__.'/modules/php/constants.inc.php');
require_once(__DIR__.'/modules/php/objects/card.php');

/*
// resources
define('NOTHING', 0);
define('FLOWER', 1);
define('FRUIT', 2);
define('GRAIN', 3);
define('ENERGY', 4);
define('POINT', 5);
define('RAGE', 6);
define('DIFFERENT', 7);
define('PER_TAMARINS', 8);

// frames
define('OPENED_LEFT', 1);
define('CLOSED', 2);
define('OPENED_RIGHT', 3);

// monkey types
define('TAMARINS', 0);
define('ORANGUTANS', 1);
define('CHIMPANZEES', 2);
define('GORILLAS', 3);
define('MANDRILLS', 4);
*/

$TAMARINS = [
    new CardType(1, [1, FRUIT], [
        [new Frame(OPENED_LEFT, [], [[1, FRUIT]]), new Frame(OPENED_RIGHT, [[1, GRAIN]])],
        [new Frame(OPENED_LEFT, [], [[1, POINT]], true), new Frame(OPENED_RIGHT, [[2, GRAIN]], [], true)],
        [new Frame(OPENED_RIGHT, [[1, GRAIN], [1, FRUIT]], [], true)],
    ]),
    new CardType(2, [1, ENERGY], [
        [new Frame(OPENED_LEFT, [], [[1, FLOWER]]), new Frame(OPENED_RIGHT, [[1, GRAIN]])],
        [new Frame(CLOSED, [[1, ENERGY]], [[1, POINT]], true)],
        [new Frame(OPENED_RIGHT, [[1, FLOWER], [1, GRAIN]], [], true)],
    ]),
    new CardType(3, [1, FLOWER], [
        [new Frame(OPENED_LEFT, [], [[1, FLOWER]]), new Frame(CLOSED, [[1, FRUIT]])],
        [new Frame(OPENED_LEFT, [], [[1, POINT]], true), new Frame(OPENED_RIGHT, [[1, FLOWER], [1, ENERGY]], [], true)],
        [new Frame(OPENED_RIGHT, [[2, FRUIT]], [], true)],
    ]),
    new CardType(4, [1, FLOWER], [
        [new Frame(OPENED_LEFT, [], [[1, GRAIN]]), new Frame(CLOSED, [[1, ENERGY]]), new Frame(OPENED_RIGHT, [[1, FRUIT]])],
        [new Frame(OPENED_RIGHT, [[1, GRAIN], [1, ENERGY]], [], true)],
        [],
    ]),
    new CardType(5, [1, ENERGY], [
        [new Frame(CLOSED, [], [[1, ENERGY]]), new Frame(OPENED_RIGHT, [[1, GRAIN]])],
        [new Frame(CLOSED, [[1, FRUIT]], [[1, POINT]], true)],
        [new Frame(OPENED_RIGHT, [[1, FRUIT], [1, ENERGY]], [], true)],
    ]),
    new CardType(6, [1, FRUIT], [
        [new Frame(OPENED_LEFT, [], [[1, FLOWER]]), new Frame(OPENED_RIGHT, [[1, FRUIT]])],
        [new Frame(OPENED_LEFT, [], [[1, POINT]], true), new Frame(OPENED_RIGHT, [[2, FRUIT]], [], true)],
        [new Frame(OPENED_RIGHT, [[2, FLOWER]], [], true)],
    ]),
    new CardType(7, [1, GRAIN], [
        [new Frame(OPENED_LEFT, [], [[1, FRUIT]]), new Frame(OPENED_RIGHT, [[1, FLOWER]])],
        [new Frame(CLOSED, [[1, POINT]]),  new Frame(OPENED_RIGHT, [[1, FLOWER], [1, FRUIT]], [], true)],
        [],
    ]),
    new CardType(8, [1, GRAIN], [
        [new Frame(OPENED_LEFT, [], [[1, GRAIN]]), new Frame(OPENED_RIGHT, [[1, FLOWER]])],
        [new Frame(OPENED_LEFT, [], [[1, POINT]], true),  new Frame(OPENED_RIGHT, [[2, FLOWER]], [], true)],
        [new Frame(OPENED_RIGHT, [[2, GRAIN]], [], true)],
    ]),
];

$this->cards = [
    $TAMARINS,
];
