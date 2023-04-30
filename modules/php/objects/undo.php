<?php

class Undo {
    public int $privateStateId;
    public array $lineIds;
    public /*Player*/ $player;
    public array $appliedEffects;
    public array $usedObjects;

    public function __construct(int $privateStateId, array $lineIds, /*Player*/ $player, array $appliedEffects, array $usedObjects) {
        $this->privateStateId = $privateStateId;
        $this->lineIds = $lineIds;
        $this->player = $player;
        $this->appliedEffects = $appliedEffects;
        $this->usedObjects = $usedObjects;
    }

}
?>