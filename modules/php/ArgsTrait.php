<?php
declare(strict_types=1);

namespace Bga\Games\Afterus;

trait ArgsTrait {
    
//////////////////////////////////////////////////////////////////////////////
//////////// Game state arguments
////////////

    // Shared arguments used by the effect activation states and game logic.

    function argActivateEffect(int $playerId) {
        $line = $this->getCardsByLocation('line'.$playerId);
        $effects = $this->getEffects($line);
        $possibleEffects = $this->getPossibleEffects($playerId, $effects, $line, false);
        $remainingEffects = $this->getRemainingEffects($playerId, $possibleEffects);
        $appliedEffects = array_values(array_filter($possibleEffects, fn($effect) => !\array_any($remainingEffects, fn($remainingEffect) => $remainingEffect->row === $effect->row && $remainingEffect->cardIndex === $effect->cardIndex && $remainingEffect->closedFrameIndex === $effect->closedFrameIndex)));
        $currentEffect = count($remainingEffects) > 0 ? $remainingEffects[0] : null;

        $reactivate = $currentEffect ? \array_any($currentEffect->right, fn($condition) => $condition[1] == REACTIVATE) : false;

        $undos = json_decode($this->getUniqueValueFromDB("SELECT `undo` FROM `player` WHERE `player_id` = $playerId"));
        
        return [
            'line' => $line,
            'tamarins' => count(array_filter($line, fn($card) => $card->type == 0)),
            'effects' => $effects,
            'remainingEffects' => $remainingEffects,
            'appliedEffects' => $appliedEffects,
            'currentEffect' => $currentEffect,
            'reactivate' => $reactivate,
            'possibleEffects' => $reactivate ? $this->getPossibleEffects($playerId, $effects, $line, true, $currentEffect->left) : null,
            'undoCount' => count($undos),
        ];
    }

    public function getTypeField(int $type) {
        return match ($type) {
            1 => 'flowers',
            2 => 'fruits',
            3 => 'grains',
            4 => 'energy',
            default => null,
        };
    }

} 
