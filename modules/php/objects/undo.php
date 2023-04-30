<?php

class Undo {
    public int $privateStateId;
    public array $lineIds;
    public /*Player*/ $player;

    public function __construct(int $privateStateId, array $lineIds, /*Player*/ $player) {
        $this->privateStateId = $privateStateId;
        $this->lineIds = $lineIds;
        $this->player = $player;
    }

}
?>