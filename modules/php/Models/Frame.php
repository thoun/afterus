<?php
declare(strict_types=1);

namespace Bga\Games\Afterus\Models;

class Frame {
    /**
     * @param int $type OPENED_LEFT, CLOSED, OPENED_RIGHT
     * @param array $left [[quantity, type], ...]
     * @param array $right [[quantity, type], ...]
     */
    public function __construct(
        public int $type,
        public array $left = [],
        public array $right = [],
        public bool $convertSign = false,
    ) {}
}
