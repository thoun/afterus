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
        $possibleEffects = $this->getPossibleEffects($playerId, $effects, $line, false);
        $remainingEffects = $this->getRemainingEffects($playerId, $possibleEffects);
        $appliedEffects = array_values(array_filter($possibleEffects, fn($effect) => !$this->array_some($remainingEffects, fn($remainingEffect) => $remainingEffect->row === $effect->row && $remainingEffect->cardIndex === $effect->cardIndex && $remainingEffect->closedFrameIndex === $effect->closedFrameIndex)));
        $currentEffect = count($remainingEffects) > 0 ? $remainingEffects[0] : null;

        $reactivate = $this->array_some($currentEffect->right, fn($condition) => $condition[1] == REACTIVATE);

        return [
            'line' => $line,
            'effects' => $effects,
            'remainingEffects' => $remainingEffects,
            'appliedEffects' => $appliedEffects,
            'currentEffect' => $currentEffect,
            'possibleEffects' => $reactivate ? $this->getPossibleEffects($playerId, $effects, $line, true) : null,
        ];
    }

    function argChooseToken() {
        $playersIds = $this->getPlayersIds();
        
        $private = [];

        foreach($playersIds as $playerId) {
            $private[$playerId] = [
                'token' => $this->getPlayer($playerId)->chosenToken,
            ];
        }

        return [
            '_private' => $private,
        ];
    }

    function argActivateEffectToken(int $playerId) {
        $line = $this->getCardsByLocation('line'.$playerId);
        $effects = $this->getEffects($line);
        $possibleEffects = $this->getPossibleEffects($playerId, $effects, $line, true);

        return [
            'line' => $line,
            'effects' => $effects,
            'possibleEffects' => $possibleEffects,
        ];
    }
} 
