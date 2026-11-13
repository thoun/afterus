<?php
declare(strict_types=1);

namespace Bga\Games\Afterus\Models;

class LeftFrame extends Frame {
    public function __construct(array $right, bool $convertSign) {
        parent::__construct(OPENED_LEFT, [], $right, $convertSign);
    } 
}
