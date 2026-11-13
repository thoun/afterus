<?php
declare(strict_types=1);

namespace Bga\Games\Afterus\Models;

class LevelCard extends CardType {
    public function __construct(int $number, array $frames) {
        parent::__construct($number, [3, POINT], $frames);
    }
}
