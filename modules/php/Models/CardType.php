<?php
declare(strict_types=1);

namespace Bga\Games\Afterus\Models;

class CardType {
    /**
     * @param array $rageGain [quantity, type]
     * @param array $frames 3 rows (0,1,2) of frames[]
     */
    public function __construct(
        public int $number,
        public array $rageGain,
        public array $frames,
    ) {}
}
