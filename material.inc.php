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
*/

$this->TAMARINS = [
    new CardType(1, [1, FRUIT], [
        [new LeftFrame([[1, FRUIT]], false), new RightFrame([[1, GRAIN]], false)],
        [new LeftFrame([[1, POINT]], true), new RightFrame([[2, GRAIN]], true)],
        [new RightFrame([[1, GRAIN], [1, FRUIT]], true)],
    ]),
    new CardType(2, [1, ENERGY], [
        [new LeftFrame([[1, FLOWER]], false), new RightFrame([[1, GRAIN]], false)],
        [new ClosedFrame([[1, ENERGY]], [[1, POINT]], true)],
        [new RightFrame([[1, FLOWER], [1, GRAIN]], true)],
    ]),
    new CardType(3, [1, FLOWER], [
        [new LeftFrame([[1, FLOWER]], false), new ClosedFrame([[1, FRUIT]])],
        [new LeftFrame([[1, POINT]], true), new RightFrame([[1, FLOWER], [1, ENERGY]], true)],
        [new RightFrame([[2, FRUIT]], true)],
    ]),
    new CardType(4, [1, FLOWER], [
        [new LeftFrame([[1, GRAIN]], false), new ClosedFrame([[1, ENERGY]]), new RightFrame([[1, FRUIT]], false)],
        [new RightFrame([[1, GRAIN], [1, ENERGY]], true)],
        [],
    ]),
    new CardType(5, [1, ENERGY], [
        [new ClosedFrame([[1, ENERGY]]), new RightFrame([[1, GRAIN]], false)],
        [new ClosedFrame([[1, FRUIT]], [[1, POINT]])],
        [new RightFrame([[1, FRUIT], [1, ENERGY]], true)],
    ]),
    new CardType(6, [1, FRUIT], [
        [new LeftFrame([[1, FLOWER]], false), new RightFrame([[1, FRUIT]], false)],
        [new LeftFrame([[1, POINT]], true), new RightFrame([[2, FRUIT]], true)],
        [new RightFrame([[2, FLOWER]], true)],
    ]),
    new CardType(7, [1, GRAIN], [
        [new LeftFrame([[1, FRUIT]], false), new RightFrame([[1, FLOWER]], false)],
        [new ClosedFrame([[1, POINT]]), new RightFrame([[1, FLOWER], [1, FRUIT]], true)],
        [],
    ]),
    new CardType(8, [1, GRAIN], [
        [new LeftFrame([[1, GRAIN]], false), new RightFrame([[1, FLOWER]], false)],
        [new LeftFrame([[1, POINT]], true), new RightFrame([[2, FLOWER]], true)],
        [new RightFrame([[2, GRAIN]], true)],
    ]),
];

$this->ORANGUTANS1 = [ 
    // TODO   
];

$this->CHIMPANZEES1 = [    
    new LevelCard(155, [
        [new ClosedFrame([[1, FRUIT]]), new ClosedFrame([[1, GRAIN]])],
        [new ClosedFrame([[3, DIFFERENT]], [[2, POINT]]), new RightFrame([[1, ENERGY]], true)],
        [new Frame(OPENED_LEFT,[], [[1, REACTIVATE]], true), new RightFrame([[1, GRAIN]], true)],
    ]),
    new LevelCard(156, [
        [new ClosedFrame([[1, FRUIT]]), new RightFrame([[1, FLOWER]], false)],
        [new ClosedFrame([[1, PER_TAMARINS]]), new RightFrame([[1, ENERGY]], true)],
        [new LeftFrame([[1, REACTIVATE]], true), new RightFrame([[1, FLOWER], [1, ENERGY]], true)],
    ]),
    new LevelCard(157, [
        [new ClosedFrame([[1, FLOWER]]), new RightFrame([[1, GRAIN]], false)],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[1, POINT]]), new RightFrame([[1, FLOWER]], true)],
        [new LeftFrame([[1, REACTIVATE]], true)],
    ]),
    new LevelCard(158, [
        [new LeftFrame([[1, GRAIN]], false), new ClosedFrame([[3, DIFFERENT]], [[2, FLOWER]])],
        [new ClosedFrame([[4, DIFFERENT]], [[1, POINT]]), new ClosedFrame([[1, POINT]]), new RightFrame([[2, GRAIN]], true)],
        [new ClosedFrame([[1, ENERGY]], [[1, REACTIVATE]]), new RightFrame([[1, FLOWER], [1, FRUIT]], true)],
    ]),
    new LevelCard(159, [
        [new LeftFrame([[1, GRAIN]], false), new ClosedFrame([[1, FLOWER]])],
        [new ClosedFrame([[1, POINT]]), new RightFrame([[2, ENERGY]], true)],
        [new ClosedFrame([[1, GRAIN]], [[1, REACTIVATE]])],
    ]),
    new LevelCard(160, [
        [new ClosedFrame([[1, FRUIT]]), new ClosedFrame([[1, ENERGY]]), new RightFrame([[1, GRAIN]], false)],
        [new ClosedFrame([[3, DIFFERENT]], [[1, POINT]]), new RightFrame([[1, ENERGY]], true)],
        [new LeftFrame([[1, REACTIVATE]], true)],
    ]),
    new LevelCard(161, [
        [new LeftFrame([[1, FRUIT]], false), new ClosedFrame([[1, FLOWER]])],
        [new LeftFrame([[2, POINT]], true), new RightFrame([[0, NOTHING]], true)],
        [new LeftFrame([[1, REACTIVATE]], true), new RightFrame([[0, NOTHING]], true)],
    ]),
    new LevelCard(162, [
        [new LeftFrame([[1, FLOWER]], false), new ClosedFrame([[1, GRAIN]]), new RightFrame([[1, FRUIT]], false)],
        [new LeftFrame([[2, POINT]], true), new RightFrame([[1, ENERGY], [1, FRUIT]], true)],
        [new ClosedFrame([[1, ENERGY]], [[1, REACTIVATE]])],
    ]),
    new LevelCard(163, [
        [new LeftFrame([[1, FRUIT]], false), new ClosedFrame([[1, FLOWER]]), new RightFrame([[1, ENERGY]], false)],
        [new ClosedFrame([[1, ENERGY], [1, FRUIT]], [[3, POINT]])],
        [new LeftFrame([[1, REACTIVATE]], true), new RightFrame([[1, FLOWER], [1, ENERGY]], true)],
    ]),
    new LevelCard(164, [
        [new LeftFrame([[1, ENERGY]], false), new RightFrame([[1, FLOWER]], false)],
        [new ClosedFrame([[1, POINT]])],
        [new ClosedFrame([[1, FLOWER]], [[1, REACTIVATE]]), new RightFrame([[1, ENERGY]], true)],
    ]),
    new LevelCard(165, [
        [new LeftFrame([[1, GRAIN]], false), new ClosedFrame([[1, ENERGY]]), new RightFrame([[1, FRUIT]], false)],
        [new ClosedFrame([[3, DIFFERENT]], [[2, POINT]])],
        [new LeftFrame([[1, REACTIVATE]], true), new RightFrame([[1, GRAIN]], true)],
    ]),
    new LevelCard(166, [
        [new LeftFrame([[1, ENERGY]], false), new ClosedFrame([[3, DIFFERENT]], [[2, FRUIT]])],
        [new ClosedFrame([[1, PER_TAMARINS]]), new RightFrame([[1, FLOWER], [1, FRUIT]], true)],
        [new LeftFrame([[1, REACTIVATE]], true), new RightFrame([[1, GRAIN], [1, FRUIT]], true)],
    ]),
    new LevelCard(167, [
        [new LeftFrame([[1, GRAIN]], false), new ClosedFrame([[1, FLOWER]]), new RightFrame([[1, FRUIT]], false)],
        [new LeftFrame([[5, POINT]], true), new RightFrame([[1, FLOWER]], true)],
        [new LeftFrame([[1, REACTIVATE]], true), new RightFrame([[1, GRAIN], [1, FRUIT]], true)],
    ]),
    new LevelCard(168, [
        [new LeftFrame([[1, FRUIT]], false), new ClosedFrame([[3, DIFFERENT]], [[1, GRAIN]])],
        [new ClosedFrame([[3, DIFFERENT]], [[1, POINT]]), new RightFrame([[1, GRAIN], [1, FRUIT]], true)],
        [new LeftFrame([[1, REACTIVATE]], true), new ClosedFrame([[1, POINT]]), new RightFrame([[0, NOTHING]], true)],
    ]),
    new LevelCard(169, [
        [new ClosedFrame([[1, FRUIT]]), new RightFrame([[1, GRAIN]], false)],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[1, POINT]])],
        [new LeftFrame([[1, REACTIVATE]], true), new RightFrame([[1, FRUIT]], true)],
    ]),
    new LevelCard(170, [
        [new LeftFrame([[1, FRUIT]], false), new RightFrame([[1, FLOWER]], false)],
        [new ClosedFrame([[1, POINT]]), new ClosedFrame([[3, DIFFERENT]], [[1, GRAIN]]), new RightFrame([[1, FRUIT]], true)],
        [new LeftFrame([[1, REACTIVATE]], true), new RightFrame([[1, FLOWER], [1, ENERGY]], true)],
    ]),
    new LevelCard(171, [
        [new ClosedFrame([[1, GRAIN]]), new RightFrame([[1, FLOWER]], false)],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[1, POINT]])],
        [new ClosedFrame([[1, FRUIT]], [[1, REACTIVATE]])],
    ]),
    new LevelCard(172, [
        [new LeftFrame([[1, FLOWER]], false), new ClosedFrame([[1, GRAIN]]), new RightFrame([[1, GRAIN]], false)],
        [new ClosedFrame([[1, GRAIN], [1, FLOWER]], [[3, POINT]]), new RightFrame([[1, FRUIT], [1, FLOWER]], true)],
        [new LeftFrame([[1, REACTIVATE]], true)],
    ]),
];

$this->GORILLAS1 = [ 
    // TODO   
];

$this->MANDRILLS1 = [ 
    // TODO   
];

$this->ORANGUTANS2 = [ 
    // TODO   
];

$this->CHIMPANZEES2 = [    
];

$this->GORILLAS2 = [ 
    // TODO   
];

$this->MANDRILLS2 = [ 
    // TODO   
];

$this->CARDS = [
    0 => [],
    11 => [],
    12 => [],
    21 => [],
    22 => [],
    31 => [],
    32 => [],
    41 => [],
    42 => [],
];

foreach ($this->TAMARINS as $index => $card) {
    $this->CARDS[0][$index + 1] = $card;
}
foreach ($this->ORANGUTANS1 as $index => $card) {
    $this->CARDS[ORANGUTANS * 10 + 1][$index + 1] = $card;
}
foreach ($this->CHIMPANZEES1 as $index => $card) {
    $this->CARDS[CHIMPANZEES * 10 + 1][$index + 1] = $card;
}
foreach ($this->GORILLAS1 as $index => $card) {
    $this->CARDS[GORILLAS * 10 + 1][$index + 1] = $card;
}
foreach ($this->MANDRILLS1 as $index => $card) {
    $this->CARDS[MANDRILLS * 10 + 1][$index + 1] = $card;
}
foreach ($this->ORANGUTANS2 as $index => $card) {
    $this->CARDS[ORANGUTANS * 10 + 2][$index + 1] = $card;
}
foreach ($this->CHIMPANZEES2 as $index => $card) {
    $this->CARDS[CHIMPANZEES * 10 + 2][$index + 1] = $card;
}
foreach ($this->GORILLAS2 as $index => $card) {
    $this->CARDS[GORILLAS * 10 + 2][$index + 1] = $card;
}
foreach ($this->MANDRILLS2 as $index => $card) {
    $this->CARDS[MANDRILLS * 10 + 2][$index + 1] = $card;
}
