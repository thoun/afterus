<?php
declare(strict_types=1);

namespace Bga\Games\Afterus\Models;

class Card extends CardType {
    public int $id;
    public string $location;
    public int $locationArg;
    public ?int $playerId = null; // the number in locationArg
    public ?int $type = null; // 0: base monkey, else 1-4
    public ?int $level = null; // 0: base monkey, else 1-2
    public ?int $subType = null; // index (1-18)

    public function __construct($dbCard, $CARDS) {
        $this->id = intval($dbCard['card_id'] ?? $dbCard['id']);
        $this->location = $dbCard['card_location'] ?? $dbCard['location'];
        $this->locationArg = intval($dbCard['card_location_arg'] ?? $dbCard['location_arg']);
        if (str_contains($this->location, 'pdeck') || str_contains($this->location, 'line') || str_contains($this->location, 'discard')) {
            preg_match('/\d+/', $this->location, $matches);
            $this->playerId = intval($matches[0]);
        }
        if (array_key_exists('card_type', $dbCard) || array_key_exists('type', $dbCard)) { // else it's only id
            $type = intval($dbCard['card_type'] ?? $dbCard['type']);
            $this->type = (int) floor($type / 10);
            $this->level = $type % 10;
            $this->subType = intval($dbCard['card_type_arg'] ?? $dbCard['type_arg']);

            $cardType = $CARDS[$type][$this->subType];
            $this->number = $cardType->number;
            $this->rageGain = $cardType->rageGain;
            $this->frames = $cardType->frames;
        }
    } 

    public static function onlyId(?Card $card) {
        if ($card == null) {
            return null;
        }

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
