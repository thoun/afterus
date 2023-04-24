<?php

trait ActionTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Player actions
    //////////// 
    
    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in nicodemus.action.php)
    */

    

    public function moveCard(int $index, int $direction /* -1 | 1 */) {
        self::checkAction('moveCard');

        $playerId = intval($this->getCurrentPlayerId());

        $location = 'line'.$playerId;
        $line = $this->getCardsByLocation($location);

        $otherCardIndex = $index + $direction;
        if ($otherCardIndex < 0) {
            $otherCardIndex = count($line) - 1;
        } else if ($otherCardIndex >= count($line)) {
            $otherCardIndex = 0;
        }

        $card = $this->getCardByLocation($location, $index);
        $otherCard = $this->getCardByLocation($location, $otherCardIndex);

        $this->cards->moveCard($card->id, $location, $otherCardIndex);
        $this->cards->moveCard($otherCard->id, $location, $index);
        $card->locationArg = $otherCardIndex;
        $otherCard->locationArg = $index;

        self::notifyAllPlayers('switchedCards', '', [
            'playerId' => $playerId,
            'index' => $index,
            'otherCardIndex' => $otherCardIndex,
            'card' => $card,
            'otherCard' => $otherCard,
        ]);

        $this->gamestate->nextPrivateState($playerId, 'stay');
    }

    public function validateCardOrder() {
        self::checkAction('validateCardOrder');

        $playerId = intval($this->getCurrentPlayerId());

        $this->gamestate->nextPrivateState($playerId, 'next');
    }

    private function applyEffect(int $playerId, Effect $effect, array $line) {
        if (!$effect->convertSign) {
            $resources = array_merge($effect->left, $effect->right);
            foreach($resources as $resource) {
                $this->gainResource($playerId, $resource, $line);
            }
        } else {
            foreach($effect->left as $resource) {
                $this->giveResource($playerId, $resource);
            }
            foreach($effect->right as $resource) {
                $this->gainResource($playerId, $resource, $line);
            }
        }
    }

    public function activateEffect(?int $row, ?int $cardIndex, ?int $index) {
        self::checkAction('activateEffect');

        $playerId = intval($this->getCurrentPlayerId());

        $args = $this->argActivateEffect($playerId);
        $currentEffect = $args['currentEffect'];
        $line = $args['line'];
        $appliedEffect = $currentEffect;

        if ($args['reactivate']) {
            $location = 'line'.$playerId;
            $card = $this->getCardByLocation($location, $cardIndex);
            $frame = $card->frames[$row][$index];
            if ($frame->type == OPENED_LEFT) {
                $cardIndex = $cardIndex - 1;
                $card = $this->getCardByLocation($location, $cardIndex);
                $frame = $card->frames[$row][count($card->frames[$row]) - 1];
            }

            $rowEffects = array_filter($args['possibleEffects'], fn($effect) => $effect->row === $row && $effect->cardIndex === $cardIndex);
            $closedFrameIndex = $frame->type == CLOSED ? $index : null;
            $appliedEffect = $this->array_find($rowEffects, fn($effect) => $effect->closedFrameIndex === $closedFrameIndex);
        }

        $this->applyActivateEffect($playerId, $appliedEffect, $currentEffect, $line);
    }

    function applyActivateEffect(int $playerId, Effect $appliedEffect, Effect $currentEffect, array $line) {
        $this->applyEffect($playerId, $appliedEffect, $line);

        $this->markedPlayedEffect($playerId, $currentEffect);

        $message = '';
        if (!$appliedEffect->convertSign) {
            $message = _('${player_name} gains ${resources} with activated effect');
        } else {
            $message = _('${player_name} spends ${left} to gain ${right} with activated effect');
        }
        
        self::notifyAllPlayers('activatedEffect', $message, [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'player' => $this->getPlayer($playerId),
            'resources' => $this->getResourcesStr(array_merge($appliedEffect->left, $appliedEffect->right)),
            'left' => $this->getResourcesStr($appliedEffect->left),
            'right' => $this->getResourcesStr($appliedEffect->right),
        ]);

        $args = $this->argActivateEffect($playerId);
        $newCurrentEffect = $args['currentEffect'];

        $this->gamestate->nextPrivateState($playerId, $newCurrentEffect != null ? 'stay' : 'next');
    }

    public function activateEffectToken(int $row, int $cardIndex, int $index) {
        self::checkAction('activateEffectToken');

        $playerId = intval($this->getCurrentPlayerId());

        $args = $this->argActivateEffectToken($playerId);
        $line = $args['line'];
        $appliedEffect = $this->getEffectFromClickedFrame($line, $args['possibleEffects'], $row, $cardIndex, $index);

        $this->applyEffect($playerId, $appliedEffect, $line);

        $message = '';
        if (!$appliedEffect->convertSign) {
            $message = _('${player_name} gains ${resources} with activated effect');
        } else {
            $message = _('${player_name} spends ${left} to gain ${right} with activated effect');
        }
        
        self::notifyAllPlayers('activatedEffect', $message, [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'player' => $this->getPlayer($playerId),
            'resources' => $this->getResourcesStr(array_merge($appliedEffect->left, $appliedEffect->right)),
            'left' => $this->getResourcesStr($appliedEffect->left),
            'right' => $this->getResourcesStr($appliedEffect->right),
        ]);

        if (intval($this->gamestate->state_id()) == ST_MULTIPLAYER_PHASE2) {
            $this->gamestate->nextPrivateState($playerId, 'next');
        } else {
            $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
        }
    }

    public function skipEffect() {
        self::checkAction('skipEffect');

        $playerId = intval($this->getCurrentPlayerId());
        
        $args = $this->argActivateEffect($playerId);
        $effect = $args['currentEffect'];

        $this->markedPlayedEffect($playerId, $effect);

        // TODO notif ?

        $args = $this->argActivateEffect($playerId);
        $effect = $args['currentEffect'];

        $this->gamestate->nextPrivateState($playerId, $effect != null ? 'stay' : 'next');
    }

    public function confirmActivations() {
        self::checkAction('confirmActivations');

        $playerId = intval($this->getCurrentPlayerId());

        $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
    }

    public function chooseToken(int $type) {
        //self::checkAction('chooseToken');

        $playerId = intval($this->getCurrentPlayerId());

        if (!in_array($type, [1,2,3,4])) {
            throw new BgaUserException("Invalid token choice");
        }

        if ($this->getPlayerSelectedToken($playerId) !== null) {
            $this->setPlayerSelectedToken($playerId, null);
        }

        $this->setPlayerSelectedToken($playerId, $type);

        $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
    }

    public function cancelChooseToken() {
        $playerId = intval($this->getCurrentPlayerId());

        $this->setPlayerSelectedToken($playerId, null);

        $this->gamestate->setPlayersMultiactive([$playerId], 'next', false);
    }

    public function neighborEffect(int $type) {
        self::checkAction('neighborEffect');

        $playerId = intval($this->getCurrentPlayerId());

        $args = $this->argBuyCard($playerId);
        if (!in_array($type, $args['neighborTokens'])) {
            throw new BgaUserException("You can't copy this token");
        }

        $this->DbQuery("UPDATE `player` SET `phase2_copied_type` = '$type' WHERE `player_id` = $playerId");

        $this->gamestate->nextPrivateState($playerId, 'neighborEffect');
    }

    public function applyNeighborEffect(int $type) {
        self::checkAction('applyNeighborEffect');

        $playerId = intval($this->getCurrentPlayerId());

        $args = $this->argApplyNeighborEffect($playerId);
        if (!$args['cost'][$type]) {
            throw new BgaUserException("You can't pay for that");
        }

        $resource = [];
        switch ($args['copiedType']) {
            case 1: $resource = [2, POINT]; break;
            case 2: $resource = [2, ENERGY]; break;
            case 3: $resource = [2, RAGE]; break;
        }
        
        $reactivate = $args['copiedType'] == 4;
        $give = [2, $type];
        $this->giveResource($playerId, $give);
        if (!$reactivate) {
            $this->gainResource($playerId, $resource, []);
        }

        $message = $reactivate ? 
            _('${player_name} spends ${left} to reactivate an effect') : 
            _('${player_name} spends ${left} to gain ${right} with activated effect');

        self::notifyAllPlayers('activatedEffect', $message, [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'player' => $this->getPlayer($playerId),
            'left' => $this->getResourcesStr([$give]),
            'right' => $reactivate ? [] : $this->getResourcesStr([$resource]),
        ]);

        if ($reactivate) {
            $this->gamestate->nextPrivateState($playerId, 'activateEffect');
            return;
        }

        if (!$this->getPlayer($playerId)->phase2cardBought) {
            $this->gamestate->nextPrivateState($playerId, 'next');
        } else {
            $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
        }
    }

    public function cancelNeighborEffect() {
        self::checkAction('cancelNeighborEffect');

        $playerId = intval($this->getCurrentPlayerId());

        $this->DbQuery("UPDATE `player` SET `phase2_copied_type` = NULL WHERE `player_id` = $playerId");

        $this->gamestate->nextPrivateState($playerId, 'next');
    }

    public function buyCard(int $level, int $type) {
        self::checkAction('buyCard');

        $playerId = intval($this->getCurrentPlayerId());

        $args = $this->argBuyCard($playerId);
        if (!$args['buyCardCost'][$level][$type]) {
            throw new BgaUserException("You can't pay for that");
        }

        $this->giveResource($playerId, [3 * $level, $type]);

        $this->DbQuery("UPDATE `player` SET `phase2_card_bought` = TRUE WHERE `player_id` = $playerId");

        $monkeyType = $args['token'];
        $locationArg = intval($this->getUniqueValueFromDB("SELECT max(`card_location_arg`) FROM `card` WHERE `card_location` = 'deck$playerId'")) + 1;
        $card = $this->getCardFromDb($this->cards->pickCardForLocation("deck-$monkeyType-$level", 'deck'.$playerId, $locationArg));

        self::notifyAllPlayers('buyCard', _('${player_name} buy a level ${level} ${type} card'), [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'player' => $this->getPlayer($playerId),
            'type' => $this->getMonkeyType($type), // for logs
            'level' => $level, // for logs
            'i18n' => ['type'],
            'card' => $card, // TODO show only to player ?
            'deckType' => $type * 10 + $level,
            'deckCount' => intval($this->cards->countCardInLocation("deck-$monkeyType-$level")),
        ]);

        if ($args['canUseNeighborToken']) {
            $this->gamestate->nextPrivateState($playerId, 'stay');
        } else {
            $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
        }
    }

    public function endTurn() {
        self::checkAction('endTurn');

        $playerId = intval($this->getCurrentPlayerId());

        $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
    } 

    function setAutoGain(bool $autoGain) {
        $playerId = intval($this->getCurrentPlayerId());

        $this->DbQuery("UPDATE `player` SET `player_auto_gain` = ".($autoGain ? 1 : 0)." WHERE `player_id` = $playerId");
        
        // dummy notif so player gets back hand
        $this->notifyPlayer($playerId, "setAutoGain", '', []);
    }

    function useRage(int $id) {
        $playerId = intval($this->getCurrentPlayerId());

        $card = $this->getCardFromDb($this->cards->getCard($id));

        if ($card == null || $card->location != 'line'.$playerId) {
            throw new BgaUserException("You can't discard this card");
        }
        $this->cards->moveCard($card->id, 'discard');

        $resource = $card->rageGain;
        $this->giveResource($playerId, [4, RAGE]);
        $this->gainResource($playerId, $resource, []);

        $message = $card->type == TAMARINS ?
            _('${player_name} gains ${resources} by discarding a tamarin') :
            _('${player_name} gains ${resources} by discarding a ${level} ${type}');

        $line = null;
        $privateState = $this->getPlayerPrivateState($playerId);
        if ($privateState == ST_PRIVATE_ORDER_CARDS) {
            // we need to reorder the line so the player isn't bothered with holes in the line
            $line = $this->getCardsByLocation('line'.$playerId);
            foreach ($line as $index => &$card) {
                $card->locationArg = $index;
                $this->cards->moveCard($card->id, 'line'.$playerId, $index);
            }
        }

        self::notifyAllPlayers('discardedCard', $message, [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'player' => $this->getPlayer($playerId),
            'resources' => $this->getResourcesStr([$resource]),
            'type' => $this->getMonkeyType($card->type), // for logs
            'level' => $card->level, // for logs
            'i18n' => ['type'],
            'card' => $card,
            'line' => $line,
        ]);

        if ($privateState == ST_PRIVATE_ACTIVATE_EFFECT && $this->argActivateEffect($playerId)['currentEffect'] == null) {
            $this->gamestate->nextPrivateState($playerId, 'next');
        } else {
            $this->gamestate->nextPrivateState($playerId, 'stay');
        }
    }  
}
