<?php
declare(strict_types=1);

namespace Bga\Games\Afterus\Models;

class Effect extends Frame {
    public int $row;
    public int $cardIndex;
    public ?int $closedFrameIndex = null;

    public function __construct(int $row, array $left, array $right, bool $convertSign, int $cardIndex, ?int $closedFrameIndex = null) {
        parent::__construct(CLOSED, $left, $right, $convertSign);
        $this->row = $row;
        $this->cardIndex = $cardIndex;
        $this->closedFrameIndex = $closedFrameIndex;
    } 
}
