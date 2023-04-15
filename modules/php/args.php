<?php

trait ArgsTrait {
    
//////////////////////////////////////////////////////////////////////////////
//////////// Game state arguments
////////////

    /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */
   
    function argActivateEffect(int $playerId) {
        $line = $this->getCardsByLocation('line'.$playerId);
        $effects = $this->getEffects($line);
        $possibleEffects = $this->getPossibleEffects($playerId, $effects, $line);
        $remainingEffects = $this->getRemainingEffects($playerId, $possibleEffects);
        $currentEffect = count($remainingEffects) > 0 ? $remainingEffects[0] : null;

        return [
            'line' => $line,
            'effects' => $effects,
            'possibleEffects' => $possibleEffects,
            'currentEffect' => $currentEffect,
        ];
    }
} 
