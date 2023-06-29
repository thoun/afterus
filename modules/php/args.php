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

    function argOrderCards(int $playerId) {
        $line = $this->getCardsByLocation('line'.$playerId);
        $effects = $this->getEffects($line);

        return [
            'line' => $line,
            'effects' => $effects,
        ];
    }
   
    function argActivateEffect(int $playerId) {
        $line = $this->getCardsByLocation('line'.$playerId);
        $effects = $this->getEffects($line);
        $possibleEffects = $this->getPossibleEffects($playerId, $effects, $line, false);
        $remainingEffects = $this->getRemainingEffects($playerId, $possibleEffects);
        $appliedEffects = array_values(array_filter($possibleEffects, fn($effect) => !$this->array_some($remainingEffects, fn($remainingEffect) => $remainingEffect->row === $effect->row && $remainingEffect->cardIndex === $effect->cardIndex && $remainingEffect->closedFrameIndex === $effect->closedFrameIndex)));
        $currentEffect = count($remainingEffects) > 0 ? $remainingEffects[0] : null;

        $reactivate = $currentEffect ? $this->array_some($currentEffect->right, fn($condition) => $condition[1] == REACTIVATE) : false;

        return [
            'line' => $line,
            'tamarins' => count(array_filter($line, fn($card) => $card->type == 0)),
            'effects' => $effects,
            'remainingEffects' => $remainingEffects,
            'appliedEffects' => $appliedEffects,
            'currentEffect' => $currentEffect,
            'reactivate' => $reactivate,
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

    private function getTypeField(int $type) {
        switch ($type) {
            case 1: return 'flowers';
            case 2: return 'fruits';
            case 3: return 'grains';
            case 4: return 'energy';
        }
    }

    function argBuyCard(int $playerId) {
        $player = $this->getPlayer($playerId);

        $canUseNeighborToken = !$player->phase2copiedType;
        $canBuyCard = !$player->phase2cardBought;

        $neighborTokens = [];
        if ($canUseNeighborToken) {
            $leftNeighbor = $this->getPlayerAfter($playerId);
            $rightNeighbor = $this->getPlayerBefore($playerId);

            $neighborTokens[] = $this->getPlayer($leftNeighbor)->chosenToken;
            if ($leftNeighbor != $rightNeighbor) {
                $otherToken = $this->getPlayer($rightNeighbor)->chosenToken;
                if ($otherToken != $neighborTokens[0]) {
                    $neighborTokens[] = $otherToken;
                }
            }
        }

        $token = $player->chosenToken;
        $buyCardCost = [];

        for ($level = 1; $level <= 2; $level++) {
            $buyCardCost[$level] = [];

            for ($type = 1; $type <= 3; $type++) {
                if ($type == $token || $token == 4) {
                    $typeField = $this->getTypeField($type);

                    $buyCardCost[$level][$type] = $player->{$typeField} >= 3 * $level;
                }
            }
        }

        $canUseGameConsole = false;
        if (in_array(4, $this->getGlobalVariable(OBJECTS, true) ?? [])) {
            $line = $this->getCardsByLocation('line'.$playerId);
            $canUseGameConsole = $this->array_some($line, fn($card) => $card->level > 0);
        }

        return [
            'token' => $token,
            'neighborTokens' => $neighborTokens,
            'canUseNeighborToken' => $canUseNeighborToken,
            'buyCardCost' => $buyCardCost,
            'canBuyCard' => $canBuyCard,
            'canUseGameConsole' => $canUseGameConsole,
            'type' => $this->getMonkeyType($token), // for logs
            'i18n' => ['type'],
        ];
    }

    function argApplyNeighborEffect(int $playerId) {
        $player = $this->getPlayer($playerId);

        $cost = [];
        for ($type = 1; $type <= 4; $type++) {
                $typeField = $this->getTypeField($type);
                $cost[$type] = $player->{$typeField} >= 2;
        }
        $gain = '';
        switch ($player->phase2copiedType) {
            case 1: $gain = '2 [Point]'; break;
            case 2: $gain = '2 [Energy]'; break;
            case 3: $gain = '2 [Rage]'; break;
            case 4: $gain = '[Reactivate]'; break;
        }

        return [
            'copiedType' => $player->phase2copiedType,
            'gain' => $gain,
            'cost' => $cost,
        ];
    }

    function argEndScore() {
        $playersIds = $this->getPlayersIds();

        $fullDecks = [];
        foreach($playersIds as $playerId) {
            $fullDecks[$playerId] = $this->getFullDeck($playerId);
        }

        return [
            'fullDecks' => $fullDecks,
        ];
    }
} 
