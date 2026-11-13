<?php
declare(strict_types=1);

namespace Bga\Games\Afterus\Models;

class Undo {
    /** @param AfterUsPlayer $player Player snapshot. */
    public function __construct(
        public int $privateStateId,
        public array $lineIds,
        public $player,
        public array $appliedEffects,
        public array $usedObjects,
        public array $stats,
    ) {}
}
