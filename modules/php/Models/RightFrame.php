<?php
declare(strict_types=1);

namespace Bga\Games\Afterus\Models;

class RightFrame extends Frame {
    public function __construct(array $left, bool $convertSign) {
        parent::__construct(OPENED_RIGHT, $left, [], $convertSign);
    } 
}
