<?php

require_once(__DIR__.'/../constants.inc.php');

class Frame {
    public int $type; // OPENED_LEFT, CLOSED, OPENED_RIGHT
    public array $left; // [[quantity, type], ...]
    public array $right; // [[quantity, type], ...]
    public bool $convertSign;
  
    public function __construct(int $type, array $left = [], array $right = [], bool $convertSign = false) {
        $this->type = $type;
        $this->left = $left;
        $this->right = $right;
        $this->convertSign = $convertSign;
    } 
}

class LeftFrame extends Frame {
    public function __construct(array $right, bool $convertSign) {
        parent::__construct(OPENED_LEFT, [], $right, $convertSign);
    } 
}

class ClosedFrame extends Frame {
    public function __construct(array $left, array $right = []) {
        parent::__construct(CLOSED, $left, $right, count($left) > 0 && count($right) > 0);
    } 
}

class RightFrame extends Frame {
    public function __construct(array $left, bool $convertSign) {
        parent::__construct(OPENED_RIGHT, $left, [], $convertSign);
    } 
}

class Effect extends Frame {
    public int $row;
    public int $cardIndex;
    public /*int | null*/ $closedFrameIndex = null;

    public function __construct(int $row, array $left = [], array $right = [], bool $convertSign, int $cardIndex, $closedFrameIndex = null) {
        parent::__construct(CLOSED, $left, $right, $convertSign);
        $this->row = $row;
        $this->cardIndex = $cardIndex;
        $this->closedFrameIndex = $closedFrameIndex;
    } 
}

class CardType {
    public int $number;
    public array $rageGain; // [quantity, type]
    public array $frames; // 3 rows (0,1,2) of frames[]
  
    public function __construct(int $number, array $rageGain, array $frames) {
        $this->number = $number;
        $this->rageGain = $rageGain;
        $this->frames = $frames;
    } 
}

class LevelCard extends CardType {
    public function __construct(int $number, array $frames) {
        parent::__construct($number, [3, POINT], $frames);
    }
}

class Card extends CardType {
    public int $id;
    public string $location;
    public int $locationArg;
    public int $playerId; // the number in locationArg
    public int $type; // 0: base monkey, else 1-4
    public int $level; // 0: base monkey, else 1-2
    public int $subType; // index (1-18)

    public function __construct($dbCard, $CARDS) {
        $this->id = intval($dbCard['card_id'] ?? $dbCard['id']);
        $this->location = $dbCard['card_location'] ?? $dbCard['location'];
        $this->locationArg = intval($dbCard['card_location_arg'] ?? $dbCard['location_arg']);
        preg_match('/\d+/', $this->location, $matches);
        $this->playerId = intval($matches[0]);
        $type = intval($dbCard['card_type'] ?? $dbCard['type']);
        $this->type = floor($type / 10);
        $this->level = $type % 10;
        $this->subType = intval($dbCard['card_type_arg'] ?? $dbCard['type_arg']);

        $cardType = $CARDS[$type][$this->subType];
        $this->number = $cardType->number;
        $this->rageGain = $cardType->rageGain;
        $this->frames = $cardType->frames;
    } 

    public static function onlyId(Card $card) {
        return new Card([
            'card_id' => $card->id,
            'card_location' => $card->location,
            'card_location_arg' => $card->locationArg,
        ], null);
    }

    public static function onlyIds(array $cards) {
        return array_map(fn($card) => self::onlyId($card), $cards);
    }
}

?>