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

$this->OBJECT_MIN_COST = [
    1 => 2,
    2 => 1,
    3 => 2,
    4 => 3,
    5 => 4,
    6 => 5,
    7 => 6,
];

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
    new LevelCard(137, [
        [new LeftFrame([[1, FRUIT]], false), new RightFrame([[1, ENERGY]], false)],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[1, POINT]]), new RightFrame([], true)],
        [new LeftFrame([[2, ENERGY]], true), new RightFrame([[1, FRUIT]], true)],
    ]),
    new LevelCard(138, [
        [new LeftFrame([[1, FLOWER]], false), new ClosedFrame([[1, PER_TAMARINS]]), new RightFrame([[1, FRUIT]], false)],
        [new LeftFrame([[3, POINT]], true), new RightFrame([[2, FRUIT]], true)],
        [],
    ]),
    new LevelCard(139, [
        [new LeftFrame([[1, GRAIN]], false), new ClosedFrame([[3, DIFFERENT]], [[1, FLOWER]]), new RightFrame([[2, FRUIT]], false)],
        [new LeftFrame([[2, POINT]], true), new RightFrame([[2, FRUIT]], true)],
        [new ClosedFrame([[1, GRAIN], [1, FLOWER]], [[2, ENERGY]]), new RightFrame([[1, FRUIT]], true)],
    ]),
    new LevelCard(140, [
        [new ClosedFrame([[1, FRUIT]]), new ClosedFrame([[1, FLOWER]]), new RightFrame([[1, ENERGY]], false)],
        [new LeftFrame([[2, POINT]], true), new RightFrame([[1, FLOWER], [1, FRUIT]], true)],
        [new LeftFrame([[2, ENERGY]], true), new RightFrame([[1, FRUIT]], true)],
    ]),
    new LevelCard(141, [
        [new ClosedFrame([[1, FRUIT]]), new ClosedFrame([[1, GRAIN]])],
        [new LeftFrame([[2, POINT]], true), new RightFrame([], true)],
        [new LeftFrame([[2, ENERGY]], true), new RightFrame([], true)],
    ]),
    new LevelCard(142, [
        [new ClosedFrame([[1, FRUIT]]), new ClosedFrame([[3, DIFFERENT]], [[2, FRUIT]]), new RightFrame([[1, FLOWER]], false)],
        [new LeftFrame([[2, POINT]], true), new RightFrame([[1, FLOWER], [1, FRUIT]], true)],
        [new LeftFrame([[2, ENERGY]], true), new RightFrame([], true)],
    ]),
    new LevelCard(143, [
        [new LeftFrame([[1, FRUIT]], false), new ClosedFrame([[1, ENERGY]])],
        [new ClosedFrame([[1, PER_TAMARINS]]), new RightFrame([[1, ENERGY]], true)],
        [new LeftFrame([[2, ENERGY]], true)],
    ]),
    new LevelCard(144, [
        [new LeftFrame([[1, GRAIN]], false), new ClosedFrame([[1, FRUIT]]), new ClosedFrame([[3, DIFFERENT]], [[1, ENERGY]])],
        [new ClosedFrame([[1, POINT]]), new RightFrame([[1, GRAIN]], true)],
        [new LeftFrame([[2, ENERGY]], true), new RightFrame([[2, FRUIT]], true)],
    ]),
    new LevelCard(145, [
        [new LeftFrame([[1, GRAIN]], false), new ClosedFrame([[1, FRUIT]])],
        [new ClosedFrame([[3, DIFFERENT]], [[1, POINT]])],
        [new ClosedFrame([[2, ENERGY]]), new RightFrame([[1, GRAIN], [1, ENERGY]], true)],
    ]),
    new LevelCard(146, [
        [new LeftFrame([[1, FRUIT]], false), new ClosedFrame([[1, ENERGY]]), new ClosedFrame([[1, GRAIN]])],
        [new LeftFrame([[2, POINT]], true), new RightFrame([[2, FRUIT]], true)],
        [new LeftFrame([[2, ENERGY]], true), new RightFrame([[1, ENERGY]], true)],
    ]),
    new LevelCard(147, [
        [new LeftFrame([[1, FLOWER]], false), new ClosedFrame([[1, FRUIT]]), new RightFrame([[1, FRUIT]], false)],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[3, DIFFERENT]], [[1, POINT]])],
        [new LeftFrame([[2, ENERGY]], true), new RightFrame([], true)],
    ]),
    new LevelCard(148, [
        [new LeftFrame([[1, FRUIT]], false), new ClosedFrame([[3, DIFFERENT]], [[1, ENERGY]]), new RightFrame([[1, GRAIN]], false)],
        [new ClosedFrame([[1, PER_TAMARINS]]), new RightFrame([[1, GRAIN], [1, FRUIT]], true)],
        [new LeftFrame([[2, ENERGY]], true)],
    ]),
    new LevelCard(149, [
        [new LeftFrame([[1, FLOWER]], false), new ClosedFrame([[1, FRUIT]]), new ClosedFrame([[3, DIFFERENT]], [[1, ENERGY]])],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[1, POINT]]), new RightFrame([[1, ENERGY]], true)],
        [new LeftFrame([[2, ENERGY]], true)],
    ]),
    new LevelCard(150, [
        [new LeftFrame([[1, GRAIN]], false), new ClosedFrame([[1, FRUIT]])],
        [new ClosedFrame([[1, POINT]]), new RightFrame([], true)],
        [new LeftFrame([[2, ENERGY]], true), new RightFrame([[1, FRUIT]], true)],
    ]),
    new LevelCard(151, [
        [new ClosedFrame([[1, ENERGY]]), new ClosedFrame([[3, DIFFERENT]], [[2, GRAIN]]), new RightFrame([[1, FLOWER]], false)],
        [new LeftFrame([[1, POINT]], true), new ClosedFrame([[1, ENERGY]], [[1, POINT]]), new RightFrame([[1, ENERGY]], true)],
        [new LeftFrame([[2, ENERGY]], true)],
    ]),
    new LevelCard(152, [
        [new LeftFrame([[1, ENERGY]], false), new ClosedFrame([[2, FRUIT]])],
        [new LeftFrame([[2, POINT]], true)],
        [new ClosedFrame([[1, ENERGY]]), new RightFrame([[1, FRUIT], [1, ENERGY]], true)],
    ]),
    new LevelCard(153, [
        [new ClosedFrame([[1, FRUIT]]), new ClosedFrame([[1, FLOWER]]), new RightFrame([[1, ENERGY]], false)],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[3, DIFFERENT]], [[1, POINT]])],
        [new LeftFrame([[2, ENERGY]], true), new RightFrame([[1, FLOWER]], true)]
    ]),
    new LevelCard(153, [
        [new LeftFrame([[1, FRUIT]], false), new ClosedFrame([[1, ENERGY]]), new RightFrame([[1, GRAIN]], false)],
        [new LeftFrame([[2, POINT]], true), new RightFrame([[1, ENERGY], [1, FRUIT]], true)],
        [new LeftFrame([[2, ENERGY]], true), new RightFrame([], true)]
    ]),
];

$this->CHIMPANZEES1 = [    
    new LevelCard(155, [
        [new ClosedFrame([[1, FRUIT]]), new ClosedFrame([[1, GRAIN]])],
        [new ClosedFrame([[3, DIFFERENT]], [[2, POINT]]), new RightFrame([[1, ENERGY]], true)],
        [new LeftFrame([[1, REACTIVATE]], true), new RightFrame([[1, GRAIN]], true)],
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
        [new LeftFrame([[2, POINT]], true), new RightFrame([], true)],
        [new LeftFrame([[1, REACTIVATE]], true), new RightFrame([], true)],
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
        [new LeftFrame([[1, REACTIVATE]], true), new ClosedFrame([[1, POINT]]), new RightFrame([], true)],
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
    new LevelCard(119, [
        [new LeftFrame([[1, FRUIT]], false), new ClosedFrame([[1, GRAIN]]), new RightFrame([[1, GRAIN]], false)],
        [new ClosedFrame([[3, DIFFERENT]], [[1, POINT]])],
        [new LeftFrame([[3, RAGE]], true), new RightFrame([], true)],
    ]),
    new LevelCard(120, [
        [new LeftFrame([[1, FLOWER]], false), new ClosedFrame([[1, GRAIN]]), new RightFrame([[1, FRUIT]], false)],
        [new LeftFrame([[2, POINT]], true), new RightFrame([[1, FRUIT], [1, GRAIN]], true)],
        [new ClosedFrame([[2, GRAIN]], [[3, RAGE]]), new RightFrame([[1, GRAIN], [1, ENERGY]], true)],
    ]),
    new LevelCard(121, [
        [new LeftFrame([[1, GRAIN]], false), new RightFrame([[1, ENERGY]], false)],
        [new LeftFrame([[3, POINT]], true), new RightFrame([[1, ENERGY]], true)],
        [new LeftFrame([[3, RAGE]], true), new RightFrame([], true)],
    ]),
    new LevelCard(122, [
        [new LeftFrame([[1, FLOWER]], false), new ClosedFrame([[1, GRAIN]]), new RightFrame([[1, ENERGY]], false)],
        [new LeftFrame([[3, POINT]], true), new RightFrame([[1, ENERGY]], true)],
        [new LeftFrame([[2, RAGE]], true), new RightFrame([[1, GRAIN], [1, ENERGY]], true)],
    ]),
    new LevelCard(123, [
        [new ClosedFrame([[1, FRUIT]]), new ClosedFrame([[3, DIFFERENT]], [[1, GRAIN]]), new RightFrame([[1, FLOWER]], false)],
        [new LeftFrame([[2, POINT]], true), new RightFrame([[1, FRUIT], [1, GRAIN]], true)],
        [new LeftFrame([[3, RAGE]], true), new ClosedFrame([[1, POINT]])],
    ]),
    new LevelCard(124, [
        [new LeftFrame([[1, GRAIN]], false), new RightFrame([[1, FRUIT]], false)],
        [new LeftFrame([[2, POINT]], true)],
        [new LeftFrame([[2, RAGE]], true), new RightFrame([[1, GRAIN], [1, ENERGY]], true)],
    ]),
    new LevelCard(125, [
        [new ClosedFrame([[1, ENERGY]]), new ClosedFrame([[1, GRAIN]]), new RightFrame([[1, FLOWER]], false)],
        [new LeftFrame([[2, POINT]], true)],
        [new LeftFrame([[3, RAGE]], true), new RightFrame([[1, GRAIN]], true)],
    ]),
    new LevelCard(126, [
        [new LeftFrame([[1, FLOWER]], false), new ClosedFrame([[1, GRAIN]]), new ClosedFrame([[3, DIFFERENT]], [[1, GRAIN]])],
        [new LeftFrame([[2, POINT]], true), new RightFrame([[1, ENERGY]], true)],
        [new LeftFrame([[2, RAGE]], true), new ClosedFrame([[1, GRAIN]], [[1, RAGE]]), new RightFrame([[1, FLOWER]], true)],
    ]),
    new LevelCard(127, [
        [new LeftFrame([[1, FLOWER]], false), new ClosedFrame([[1, FRUIT]]), new ClosedFrame([[1, GRAIN]])],
        [new ClosedFrame([[1, GRAIN], [1, FLOWER]], [[3, POINT]])],
        [new LeftFrame([[2, RAGE]], true), new RightFrame([[2, GRAIN]], true)],
    ]),
    new LevelCard(128, [
        [new LeftFrame([[1, FRUIT]], false), new RightFrame([[1, GRAIN]], false)],
        [new ClosedFrame([[3, DIFFERENT]], [[1, POINT]]), new ClosedFrame([[1, POINT]]), new RightFrame([], true)],
        [new LeftFrame([[3, RAGE]], true)],
    ]),
    new LevelCard(129, [
        [new LeftFrame([[1, GRAIN]], false), new ClosedFrame([[1, GRAIN]])],
        [new ClosedFrame([[3, DIFFERENT]], [[1, POINT]]), new RightFrame([[1, ENERGY]], true)],
        [new ClosedFrame([[1, FRUIT], [1, GRAIN]], [[3, RAGE]]), new RightFrame([[1, FLOWER]], true)],
    ]),
    new LevelCard(130, [
        [new ClosedFrame([[1, ENERGY]]), new ClosedFrame([[1, GRAIN]]), new RightFrame([[1, FRUIT]], false)],
        [new ClosedFrame([[3, DIFFERENT]], [[1, POINT]]), new RightFrame([[2, GRAIN]], true)],
        [new LeftFrame([[3, RAGE]], true), new RightFrame([[1, GRAIN], [1, FRUIT]], true)],
    ]),
    new LevelCard(131, [
        [new LeftFrame([[1, FLOWER]], false), new RightFrame([[1, GRAIN]], false)],
        [new LeftFrame([[2, POINT]], true)],
        [new ClosedFrame([[1, ENERGY]], [[3, RAGE]]), new RightFrame([[1, GRAIN]], true)],
    ]),
    new LevelCard(132, [
        [new LeftFrame([[1, ENERGY]], false), new RightFrame([[1, GRAIN]], false)],
        [new LeftFrame([[2, POINT]], true), new RightFrame([[2, GRAIN]], true)],
        [new ClosedFrame([[2, RAGE]])],
    ]),
    new LevelCard(133, [
        [new LeftFrame([[1, FLOWER]], false), new ClosedFrame([[1, GRAIN]]), new ClosedFrame([[1, GRAIN]])],
        [new ClosedFrame([[3, DIFFERENT]], [[1, POINT]]), new RightFrame([[1, GRAIN]], true)],
        [new LeftFrame([[3, RAGE]], true)],
    ]),
    new LevelCard(134, [
        [new LeftFrame([[1, FRUIT]], false), new ClosedFrame([[1, GRAIN]]), new RightFrame([[1, GRAIN]], false)],
        [new ClosedFrame([[3, DIFFERENT]], [[1, POINT]])],
        [new LeftFrame([[3, RAGE]], true), new RightFrame([], true)],
    ]),
    new LevelCard(135, [
        [new LeftFrame([[1, FRUIT]], false), new ClosedFrame([[1, GRAIN]]), new RightFrame([[1, GRAIN]], false)],
        [new ClosedFrame([[3, DIFFERENT]], [[1, POINT]]), new RightFrame([[1, ENERGY]], true)],
        [new LeftFrame([[2, RAGE]], true), new RightFrame([[1, FRUIT]], true)],
    ]),
    new LevelCard(136, [
        [new LeftFrame([[1, GRAIN]], false), new ClosedFrame([[1, FRUIT]]), new RightFrame([[1, FLOWER]], false)],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[1, POINT]])],
        [new LeftFrame([[2, RAGE]], true), new RightFrame([[1, GRAIN], [1, FLOWER]], true)],
    ]),  
];

$this->MANDRILLS1 = [ 
    new LevelCard(101, [
        [new LeftFrame([[1, FLOWER]], false), new ClosedFrame([[1, FLOWER]])],
        [new ClosedFrame([[1, PER_TAMARINS]]), new RightFrame([[2, FLOWER]], true)],
        [new LeftFrame([[2, POINT]], true), new RightFrame([[2, FLOWER]], true)],
    ]),
    new LevelCard(102, [
        [new ClosedFrame([[1, GRAIN]]), new ClosedFrame([[1, FLOWER]]), new RightFrame([[1, FLOWER]], false)],
        [new LeftFrame([[2, POINT]], true), new RightFrame([[1, FLOWER], [1, ENERGY]], true)],
        [new ClosedFrame([[1, GRAIN]], [[2, POINT]])],
    ]),  
    new LevelCard(103, [
        [new LeftFrame([[1, FRUIT]], false), new ClosedFrame([[1, FRUIT]]), new RightFrame([[1, FLOWER]], false)],
        [new ClosedFrame([[3, DIFFERENT]], [[1, POINT]])],
        [new ClosedFrame([[2, FRUIT]], [[3, POINT]]), new RightFrame([[1, FLOWER]], true)],
    ]), 
    new LevelCard(104, [
        [new LeftFrame([[1, FLOWER]], false), new ClosedFrame([[1, FLOWER], [1, GRAIN]])],
        [new LeftFrame([[3, POINT]], true), new RightFrame([[1, GRAIN]], true)],
        [new LeftFrame([[2, POINT]], true), new RightFrame([[2, FLOWER]], true)],
    ]), 
    new LevelCard(105, [
        [new LeftFrame([[1, ENERGY]], false), new ClosedFrame([[1, FLOWER]]), new RightFrame([[1, FRUIT]], false)],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[1, FRUIT]], [[1, POINT]])],
        [new LeftFrame([[2, POINT]], true), new RightFrame([[1, ENERGY]], true)],
    ]), 
    new LevelCard(106, [
        [new LeftFrame([[1, ENERGY]], false), new ClosedFrame([[1, FLOWER]]), new RightFrame([[1, FLOWER]], false)],
        [new ClosedFrame([[1, POINT]]), new RightFrame([[1, ENERGY]], true)],
        [new LeftFrame([[2, POINT]], true)],
    ]), 
    new LevelCard(107, [
        [new LeftFrame([[1, FLOWER]], false), new ClosedFrame([[1, GRAIN]]), new RightFrame([[1, ENERGY]], false)],
        [new ClosedFrame([[1, ENERGY]], [[2, POINT]])],
        [new LeftFrame([[2, POINT]], true), new RightFrame([[1, ENERGY]], true)],
    ]), 
    new LevelCard(108, [
        [new LeftFrame([[1, FRUIT]], false), new ClosedFrame([[1, ENERGY]]), new RightFrame([[1, FLOWER]], false)],
        [new ClosedFrame([[1, POINT]]), new RightFrame([[1, FLOWER], [1, FRUIT]], true)],
        [new LeftFrame([[2, POINT]], true), new RightFrame([[2, ENERGY]], true)],
    ]), 
    new LevelCard(109, [
        [new LeftFrame([[1, FLOWER]], false), new ClosedFrame([[1, GRAIN]]), new RightFrame([[1, ENERGY]], false)],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[3, DIFFERENT]], [[1, POINT]]), new RightFrame([[2, FLOWER]], true)],
        [new ClosedFrame([[1, ENERGY]], [[2, POINT]])],
    ]), 
    new LevelCard(110, [
        [new LeftFrame([[1, GRAIN]], false), new ClosedFrame([[1, FLOWER]]), new RightFrame([[1, FLOWER]], false)],
        [new LeftFrame([[2, POINT]], true), new RightFrame([], true)],
        [new LeftFrame([[2, POINT]], true), new RightFrame([[1, GRAIN]], true)],
    ]), 
    new LevelCard(111, [
        [new LeftFrame([[1, FRUIT]], false), new ClosedFrame([[1, GRAIN]]), new ClosedFrame([[1, FLOWER]])],
        [new ClosedFrame([[3, DIFFERENT]], [[1, POINT]]), new RightFrame([[1, FLOWER], [1, ENERGY]], true)],
        [new LeftFrame([[2, POINT]], true), new RightFrame([[1, FLOWER]], true)],
    ]), 
    new LevelCard(112, [
        [new LeftFrame([[1, FLOWER]], false), new ClosedFrame([[1, GRAIN]]), new ClosedFrame([[1, FRUIT]])],
        [new LeftFrame([[2, POINT]], true), new RightFrame([[1, FLOWER], [1, ENERGY]], true)],
        [new ClosedFrame([[1, FRUIT], [1, FLOWER]], [[3, POINT]]), new RightFrame([[1, FLOWER], [1, GRAIN]], true)],
    ]), 
    new LevelCard(113, [
        [new LeftFrame([[1, FRUIT]], false), new ClosedFrame([[1, FLOWER]])],
        [new ClosedFrame([[1, PER_TAMARINS]]), new RightFrame([[1, FLOWER]], true)],
        [new LeftFrame([[2, POINT]], true), new RightFrame([[2, FLOWER]], true)],
    ]), 
    new LevelCard(114, [
        [new LeftFrame([[1, FLOWER]], false), new ClosedFrame([[1, GRAIN]])],
        [new ClosedFrame([[3, DIFFERENT]], [[1, POINT]]), new RightFrame([[1, GRAIN]], true)],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[1, POINT]]), new RightFrame([[1, FLOWER], [1, ENERGY]], true)],
    ]), 
    new LevelCard(115, [
        [new LeftFrame([[1, FRUIT]], false), new ClosedFrame([[1, FLOWER]])],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[1, POINT]]), new RightFrame([[1, FLOWER]], true)],
        [new ClosedFrame([[3, DIFFERENT]], [[1, POINT]]), new RightFrame([[2, FLOWER]], true)],
    ]), 
    new LevelCard(116, [
        [new LeftFrame([[1, GRAIN]], false), new RightFrame([[1, FLOWER]], false)],
        [new LeftFrame([[2, POINT]], true)],
        [new ClosedFrame([[2, POINT]]), new RightFrame([[1, FLOWER]], true)],
    ]), 
    new LevelCard(117, [
        [new LeftFrame([[1, FLOWER]], false), new ClosedFrame([[1, FRUIT]])],
        [new LeftFrame([[3, POINT]], true), new RightFrame([[1, ENERGY]], true)],
        [new ClosedFrame([[1, FRUIT]], [[2, POINT]]), new RightFrame([[1, FLOWER]], true)],
    ]), 
    new LevelCard(118, [
        [new ClosedFrame([[1, FLOWER]]), new ClosedFrame([[1, FLOWER]]), new RightFrame([[1, ENERGY]], false)],
        [new ClosedFrame([[3, DIFFERENT]], [[1, POINT]]), new RightFrame([[1, FLOWER]], true)],
        [new ClosedFrame([[3, POINT]])],
    ]),
];

$this->ORANGUTANS2 = [ 
    new LevelCard(225, [
        [new LeftFrame([[1, FRUIT]], false), new ClosedFrame([[1, FLOWER]]), new RightFrame([[2, ENERGY]], false)],
        [new LeftFrame([[3, POINT]], true), new ClosedFrame([[1, POINT]]), new RightFrame([[1, FRUIT]], true)],
        [new ClosedFrame([[2, ENERGY]])],
    ]), 
    new LevelCard(226, [
        [new LeftFrame([[1, FRUIT]], false), new ClosedFrame([[1, ENERGY]]), new ClosedFrame([[1, GRAIN]]), new RightFrame([[1, GRAIN]], false)],
        [new ClosedFrame([[1, ENERGY], [2, POINT]]), new ClosedFrame([[1, GRAIN], [2, POINT]])],
        [new LeftFrame([[2, ENERGY]], true), new ClosedFrame([[1, ENERGY]]), new RightFrame([[1, GRAIN]], true)],
    ]), 
    new LevelCard(227, [
        [new LeftFrame([[1, FLOWER]], false), new ClosedFrame([[1, FRUIT]]), new RightFrame([[2, ENERGY]], false)],
        [new LeftFrame([[3, POINT]], true), new ClosedFrame([[1, ENERGY]], [[2, POINT]]), new RightFrame([[2, FRUIT]], true)],
        [new ClosedFrame([[1, ENERGY]]), new ClosedFrame([[1, ENERGY]])],
    ]), 
    new LevelCard(228, [
        [new LeftFrame([[1, FRUIT]], false), new ClosedFrame([[1, GRAIN]]), new RightFrame([[2, ENERGY]], false)],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[3, DIFFERENT]], [[2, POINT]]), new RightFrame([], true)],
        [new LeftFrame([[3, ENERGY]], true), new ClosedFrame([[1, ENERGY]], [[2, POINT]]), new RightFrame([[1, FRUIT]], true)],
    ]), 
    new LevelCard(229, [
        [new ClosedFrame([[1, FLOWER]]), new ClosedFrame([[2, ENERGY]]), new RightFrame([[1, FRUIT]], false)],
        [new LeftFrame([[3, POINT]], true), new ClosedFrame([[1, POINT]]), new RightFrame([], true)],
        [new LeftFrame([[3, ENERGY]], true), new RightFrame([[1, FRUIT]], true)],
    ]), 
    new LevelCard(230, [
        [new LeftFrame([[1, ENERGY]], false), new ClosedFrame([[1, FRUIT]]), new ClosedFrame([[2, ENERGY]])],
        [new LeftFrame([[3, POINT]], true), new ClosedFrame([[3, DIFFERENT]], [[1, POINT]]), new ClosedFrame([[2, POINT]])],
        [new LeftFrame([[2, ENERGY]], true), new RightFrame([[1, FRUIT]], true)],
    ]), 
    new LevelCard(231, [
        [new LeftFrame([[1, FLOWER]], false), new ClosedFrame([[3, DIFFERENT]], [[2, FRUIT]]), new ClosedFrame([[2, ENERGY]])],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[1, FLOWER]], [[2, POINT]]), new RightFrame([[1, ENERGY]], true)],
        [new LeftFrame([[3, ENERGY]], true), new ClosedFrame([[1, POINT]]), new RightFrame([[1, ENERGY]], true)],
    ]), 
    new LevelCard(232, [
        [new LeftFrame([[1, ENERGY]], false), new ClosedFrame([[1, GRAIN]]), new RightFrame([[1, FRUIT]], false)],
        [new ClosedFrame([[1, FRUIT]], [[3, POINT]]), new RightFrame([[1, FRUIT]], true)],
        [new LeftFrame([[3, ENERGY]], true), new ClosedFrame([[3, DIFFERENT]], [[2, POINT]]), new RightFrame([], true)],
    ]), 
    new LevelCard(233, [
        [new LeftFrame([[1, FRUIT]], false), new ClosedFrame([[1, GRAIN], [1, FRUIT]]), new RightFrame([[1, ENERGY]], false)],
        [new LeftFrame([[3, POINT]], true), new ClosedFrame([[1, FRUIT]], [[2, POINT]]), new RightFrame([[1, ENERGY]], true)],
        [new LeftFrame([[3, ENERGY]], true), new RightFrame([], true)],
    ]), 
    new LevelCard(234, [
        [new LeftFrame([[1, ENERGY]], false), new ClosedFrame([[1, ENERGY]]), new RightFrame([[1, FRUIT]], false)],
        [new LeftFrame([[3, POINT]], true), new ClosedFrame([[1, FRUIT]], [[3, POINT]]), new RightFrame([], true)],
        [new LeftFrame([[3, ENERGY]], true), new RightFrame([], true)],
    ]), 
    new LevelCard(235, [
        [new LeftFrame([[1, FLOWER]], false), new ClosedFrame([[1, ENERGY], [1, FRUIT]])],
        [new LeftFrame([[3, POINT]], true), new ClosedFrame([[3, DIFFERENT]], [[2, POINT]]), new ClosedFrame([[1, POINT]])],
        [new LeftFrame([[3, ENERGY]], true), new ClosedFrame([[1, ENERGY]]), new RightFrame([[1, FLOWER]], true)],
    ]), 
    new LevelCard(236, [
        [new LeftFrame([[1, FRUIT]], false), new ClosedFrame([[2, ENERGY]])],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[1, ENERGY]], [[2, POINT]]), new RightFrame([], true)],
        [new ClosedFrame([[2, ENERGY]]), new RightFrame([[1, FRUIT]], true)],
    ]), 
];

$this->CHIMPANZEES2 = [ 
    new LevelCard(237, [
        [new LeftFrame([[1, ENERGY]], false), new ClosedFrame([[1, FLOWER]]), new RightFrame([[1, FRUIT]], false)],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[1, FRUIT]], [[3, POINT]]), new RightFrame([[1, ENERGY]], true)],
        [new ClosedFrame([[1, FLOWER]], [[1, REACTIVATE]]), new RightFrame([[2, GRAIN]], true)],
    ]), 
    new LevelCard(238, [
        [new LeftFrame([[1, FRUIT]], false), new ClosedFrame([[3, DIFFERENT]], [[2, FLOWER]]), new RightFrame([[1, GRAIN]], false)],
        [new ClosedFrame([[1, POINT]]), new ClosedFrame([[3, FLOWER]], [[5, POINT]]), new RightFrame([[1, GRAIN]], true)],
        [new LeftFrame([[1, REACTIVATE]], true), new RightFrame([[1, FRUIT]], true)],
    ]),     
    new LevelCard(239, [
        [new ClosedFrame([[3, DIFFERENT]], [[2, GRAIN]]), new RightFrame([[1, ENERGY]], false)],
        [new LeftFrame([[3, POINT]], true), new ClosedFrame([[1, ENERGY]], [[3, POINT]]), new RightFrame([], true)],
        [new LeftFrame([[1, REACTIVATE]], true), new ClosedFrame([[1, ENERGY]], [[1, REACTIVATE]]), new RightFrame([[2, GRAIN]], true)],
    ]),   
    new LevelCard(240, [
        [new LeftFrame([[1, FLOWER]], false), new RightFrame([[1, GRAIN]], false)],
        [new LeftFrame([[3, POINT]], true), new ClosedFrame([[2, POINT]])],
        [new LeftFrame([[1, REACTIVATE]], true), new ClosedFrame([[1, FLOWER]], [[1, REACTIVATE]]), new RightFrame([], true)],
    ]),   
    new LevelCard(241, [
        [new LeftFrame([[1, GRAIN]], false), new ClosedFrame([[1, FLOWER], [1, FRUIT]])],
        [new LeftFrame([[3, POINT]], true), new ClosedFrame([[1, GRAIN]], [[2, POINT]]), new RightFrame([[1, ENERGY]], true)],
        [new LeftFrame([[1, REACTIVATE]], true), new ClosedFrame([[1, FRUIT]], [[1, REACTIVATE]]), new RightFrame([[1, FLOWER]], true)],
    ]),   
    new LevelCard(242, [
        [new LeftFrame([[1, FLOWER]], false), new ClosedFrame([[3, DIFFERENT]], [[2, FRUIT]])],
        [new ClosedFrame([[2, POINT]]), new ClosedFrame([[2, POINT]]), new RightFrame([[1, FRUIT]], true)],
        [new LeftFrame([[1, REACTIVATE]], true)],
    ]), 
    new LevelCard(243, [
        [new LeftFrame([[1, GRAIN]], false), new ClosedFrame([[1, GRAIN]]), new RightFrame([[1, FLOWER]], false)],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[1, POINT]]), new ClosedFrame([[1, POINT]])],
        [new LeftFrame([[1, REACTIVATE]], true), new ClosedFrame([[1, FLOWER]], [[1, REACTIVATE]]), new RightFrame([[2, GRAIN]], true)],
    ]),  
    new LevelCard(244, [
        [new LeftFrame([[1, FRUIT]], false), new RightFrame([[1, FLOWER]], false)],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[3, DIFFERENT]], [[2, POINT]]), new RightFrame([], true)],
        [new ClosedFrame([[1, ENERGY]], [[1, REACTIVATE]]), new ClosedFrame([[2, POINT]])],
    ]),   
    new LevelCard(245, [
        [new LeftFrame([[1, GRAIN]], false), new ClosedFrame([[1, FRUIT]]), new RightFrame([[1, ENERGY]], false)],
        [new LeftFrame([[3, POINT]], true), new ClosedFrame([[1, POINT]]), new ClosedFrame([[3, DIFFERENT]], [[2, POINT]])],
        [new LeftFrame([[1, REACTIVATE]], true), new ClosedFrame([[1, ENERGY]], [[1, REACTIVATE]]), new RightFrame([[2, FRUIT]], true)],
    ]),   
    new LevelCard(246, [
        [new LeftFrame([[1, FRUIT]], false), new RightFrame([[1, GRAIN]], false)],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[2, POINT]]), new RightFrame([], true)],
        [new LeftFrame([[1, REACTIVATE]], true), new ClosedFrame([[1, FRUIT]], [[1, REACTIVATE]]), new RightFrame([[1, FRUIT]], true)],
    ]),  
    new LevelCard(247, [
        [new LeftFrame([[1, ENERGY]], false), new ClosedFrame([[1, GRAIN]]), new RightFrame([[1, FLOWER]], false)],
        [new LeftFrame([[3, POINT]], true), new ClosedFrame([[1, POINT]]), new RightFrame([[1, ENERGY]], false)],
        [new LeftFrame([[1, REACTIVATE]], true), new ClosedFrame([[1, ENERGY]], [[1, REACTIVATE]]), new RightFrame([[1, FLOWER]], true)],
    ]),   
    new LevelCard(248, [
        [new LeftFrame([[1, GRAIN]], false), new ClosedFrame([[1, FLOWER]]), new RightFrame([[1, FRUIT]], false)],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[1, GRAIN], [1, FRUIT]], [[3, POINT]]), new RightFrame([], false)],
        [new ClosedFrame([[1, FLOWER]], [[1, REACTIVATE]]), new ClosedFrame([[1, ENERGY]], [[1, REACTIVATE]])],
    ]),   
];

$this->GORILLAS2 = [ 
    new LevelCard(213, [
        [new LeftFrame([[1, GRAIN]], false), new ClosedFrame([[1, GRAIN]]), new RightFrame([[1, FRUIT]], false)],
        [new LeftFrame([[3, POINT]], true), new ClosedFrame([[3, DIFFERENT]], [[2, POINT]]), new RightFrame([], true)],
        [new LeftFrame([[3, RAGE]], true), new ClosedFrame([[1, FRUIT]], [[2, RAGE]]), new RightFrame([], true)],
    ]), 
    new LevelCard(214, [
        [new LeftFrame([[1, FLOWER]], false), new ClosedFrame([[1, FRUIT]]), new RightFrame([[1, GRAIN]], false)],
        [new LeftFrame([[3, POINT]], true), new ClosedFrame([[1, POINT]]), new RightFrame([], true)],
        [new ClosedFrame([[1, RAGE]]), new ClosedFrame([[1, GRAIN]], [[2, RAGE]])],
    ]), 
    new LevelCard(215, [
        [new ClosedFrame([[3, DIFFERENT]], [[1, ENERGY]]), new RightFrame([[2, GRAIN]], false)],
        [new LeftFrame([[3, POINT]], true), new ClosedFrame([[2, POINT]]), new RightFrame([[1, GRAIN]], true)],
        [new LeftFrame([[3, RAGE]], true), new ClosedFrame([[1, POINT]]), new RightFrame([[1, GRAIN]], true)],
    ]), 
    new LevelCard(216, [
        [new ClosedFrame([[3, DIFFERENT]], [[1, GRAIN]]), new ClosedFrame([[1, FLOWER], [1, FRUIT]]), new RightFrame([[1, ENERGY]], false)],
        [new LeftFrame([[3, POINT]], true), new ClosedFrame([[3, DIFFERENT]], [[2, POINT]]), new RightFrame([[1, ENERGY]], true)],
        [new LeftFrame([[3, RAGE]], true), new ClosedFrame([[1, FLOWER]], [[2, RAGE]]), new RightFrame([[1, GRAIN]], true)],
    ]), 
    new LevelCard(217, [
        [new LeftFrame([[1, ENERGY]], false), new ClosedFrame([[1, GRAIN]])],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[1, GRAIN]], [[2, POINT]]), new RightFrame([[1, ENERGY]], true)],
        [new ClosedFrame([[2, RAGE]]), new ClosedFrame([[1, ENERGY]], [[2, RAGE]]), new RightFrame([[1, GRAIN]], true)],
    ]), 
    new LevelCard(218, [
        [new LeftFrame([[1, GRAIN]], false), new ClosedFrame([[1, FLOWER]]), new ClosedFrame([[3, DIFFERENT]], [[2, GRAIN]])],
        [new ClosedFrame([[1, FRUIT], [1, FLOWER], [1, GRAIN]], [[5, POINT]]), new RightFrame([[1, GRAIN]], true)],
        [new LeftFrame([[3, RAGE]], true), new ClosedFrame([[1, POINT]]), new RightFrame([], true)],
    ]), 
    new LevelCard(219, [
        [new LeftFrame([[1, GRAIN]], false), new ClosedFrame([[1, FRUIT]]), new RightFrame([[1, FLOWER]], false)],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[1, FLOWER]], [[2, POINT]])],
        [new LeftFrame([[3, RAGE]], true), new ClosedFrame([[2, RAGE]]), new RightFrame([[1, GRAIN]], true)],
    ]), 
    new LevelCard(220, [
        [new LeftFrame([[1, GRAIN]], false), new ClosedFrame([[1, GRAIN], [1, FRUIT]])],
        [new LeftFrame([[3, POINT]], true), new ClosedFrame([[2, POINT]]), new RightFrame([[1, FRUIT]], true)],
        [new LeftFrame([[3, RAGE]], true), new RightFrame([[1, ENERGY]], true)],
    ]), 
    new LevelCard(221, [
        [new LeftFrame([[1, GRAIN]], false), new ClosedFrame([[1, GRAIN]]), new RightFrame([[1, ENERGY]], false)],
        [new LeftFrame([[3, POINT]], true), new ClosedFrame([[1, GRAIN], [1, ENERGY]], [[3, POINT]])],
        [new ClosedFrame([[2, RAGE]]), new ClosedFrame([[1, GRAIN]], [[2, RAGE]])],
    ]), 
    new LevelCard(222, [
        [new LeftFrame([[1, ENERGY]], false), new ClosedFrame([[1, FLOWER], [1, GRAIN]]), new RightFrame([[1, GRAIN]], false)],
        [new LeftFrame([[3, POINT]], true), new ClosedFrame([[1, ENERGY]], [[2, POINT]]), new ClosedFrame([[1, POINT]])],
        [new LeftFrame([[2, RAGE]], true), new RightFrame([[1, GRAIN]], true)],
    ]), 
    new LevelCard(223, [
        [new LeftFrame([[1, GRAIN]], false), new ClosedFrame([[1, GRAIN], [1, FRUIT]]), new RightFrame([[1, FLOWER]], false)],
        [new LeftFrame([[3, POINT]], true), new ClosedFrame([[1, POINT]]), new RightFrame([[2, GRAIN]], true)],
        [new ClosedFrame([[1, GRAIN]], [[2, RAGE]]), new ClosedFrame([[1, ENERGY]], [[2, RAGE]])],
    ]), 
    new LevelCard(224, [
        [new LeftFrame([[1, FRUIT]], false), new ClosedFrame([[2, GRAIN]]), new RightFrame([[2, FLOWER]], false)],
        [new LeftFrame([[3, POINT]], true), new ClosedFrame([[3, DIFFERENT]], [[2, POINT]]), new RightFrame([[1, GRAIN]], true)],
        [new LeftFrame([[3, RAGE]], true), new RightFrame([[1, GRAIN]], true)],
    ]), 
];

$this->MANDRILLS2 = [ 
    new LevelCard(201, [
        [new LeftFrame([[1, FLOWER]], false), new ClosedFrame([[1, FLOWER]]), new ClosedFrame([[1, FRUIT]])],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[1, POINT]]), new RightFrame([], true)],
        [new LeftFrame([[3, POINT]], true), new ClosedFrame([[1, FRUIT]], [[2, POINT]]), new RightFrame([], true)],
    ]), 
    new LevelCard(202, [
        [new ClosedFrame([[2, FLOWER]]), new ClosedFrame([[1, FRUIT]]), new RightFrame([[1, ENERGY]], false)],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[1, FLOWER]], [[2, POINT]])],
        [new ClosedFrame([[1, ENERGY]], [[3, POINT]]), new RightFrame([[1, FLOWER]], true)],
    ]), 
    new LevelCard(203, [
        [new LeftFrame([[1, ENERGY]], false), new ClosedFrame([[1, GRAIN], [1, FRUIT]]), new ClosedFrame([[1, FLOWER]])],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[1, POINT]]), new RightFrame([[1, FLOWER]], true)],
        [new ClosedFrame([[1, ENERGY]], [[2, POINT]]), new ClosedFrame([[1, GRAIN]], [[2, POINT]])],
    ]), 
    new LevelCard(204, [
        [new LeftFrame([[1, GRAIN]], false), new RightFrame([[1, FRUIT]], false)],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[2, POINT]]), new RightFrame([], true)],
        [new ClosedFrame([[1, FRUIT], [1, GRAIN]], [[4, POINT]]), new RightFrame([], true)],
    ]), 
    new LevelCard(205, [
        [new LeftFrame([[1, FLOWER]], false), new ClosedFrame([[1, FLOWER]]), new ClosedFrame([[1, GRAIN]])],
        [new LeftFrame([[3, POINT]], true), new ClosedFrame([[1, POINT]]), new RightFrame([], true)],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[3, DIFFERENT]], [[2, POINT]]), new RightFrame([], true)],
    ]), 
    new LevelCard(206, [
        [new LeftFrame([[1, FRUIT]], false), new ClosedFrame([[1, FLOWER]]), new RightFrame([[1, ENERGY]], false)],
        [new ClosedFrame([[1, ENERGY]], [[2, POINT]]), new RightFrame([], true)],
        [new LeftFrame([[3, POINT]], true), new ClosedFrame([[2, POINT]]), new RightFrame([[1, FLOWER], [1, ENERGY]], true)],
    ]), 
    new LevelCard(207, [
        [new LeftFrame([[1, FLOWER]], false), new ClosedFrame([[1, FLOWER]]), new ClosedFrame([[1, FLOWER]]), new RightFrame([[1, GRAIN]], false)],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[1, ENERGY]], [[2, POINT]]), new RightFrame([[1, FLOWER]], true)],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[3, DIFFERENT]], [[2, POINT]]), new RightFrame([], true)],
    ]), 
    new LevelCard(208, [
        [new ClosedFrame([[1, FLOWER]]), new ClosedFrame([[1, GRAIN]]), new ClosedFrame([[1, FRUIT]])],
        [new LeftFrame([[3, POINT]], true), new RightFrame([[1, FLOWER]], true)],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[2, POINT]]), new RightFrame([], true)],
    ]), 
    new LevelCard(209, [
        [new LeftFrame([[1, FLOWER]], false), new ClosedFrame([[2, GRAIN]]), new RightFrame([[1, FLOWER]], false)],
        [new LeftFrame([[3, POINT]], true), new RightFrame([], true)],
        [new ClosedFrame([[2, FLOWER]], [[4, POINT]]), new RightFrame([[1, FLOWER]], true)],
    ]), 
    new LevelCard(210, [
        [new LeftFrame([[1, GRAIN]], false), new ClosedFrame([[2, FLOWER]])],
        [new ClosedFrame([[1, FLOWER], [1, GRAIN]], [[4, POINT]]), new RightFrame([[1, FLOWER]], true)],
        [new LeftFrame([[3, POINT]], true), new ClosedFrame([[1, POINT]]), new RightFrame([[1, FLOWER]], true)],
    ]), 
    new LevelCard(211, [
        [new LeftFrame([[1, ENERGY]], false), new ClosedFrame([[1, FLOWER]]), new RightFrame([[1, FRUIT]], false)],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[2, POINT]]), new RightFrame([[1, ENERGY]], true)],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[1, ENERGY]], [[2, POINT]]), new RightFrame([], true)],
    ]), 
    new LevelCard(212, [
        [new ClosedFrame([[1, FLOWER], [1, GRAIN]]), new ClosedFrame([[1, FLOWER], [1, FRUIT]])],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[3, DIFFERENT]], [[2, POINT]]), new RightFrame([[1, FRUIT]], true)],
        [new LeftFrame([[2, POINT]], true), new ClosedFrame([[1, POINT]]), new RightFrame([[1, FLOWER]], true)],
    ]), 
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
