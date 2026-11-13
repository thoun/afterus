<?php
declare(strict_types=1);

namespace Bga\Games\Afterus\Models;

class ClosedFrame extends Frame {
    public function __construct(array $left, array $right = []) {
        parent::__construct(CLOSED, $left, $right, count($left) > 0 && count($right) > 0);
    } 
}
