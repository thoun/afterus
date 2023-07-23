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
        $movedCards = [];

        $card = $line[$index];
        if ($index == 0 && $direction == -1) {
            $otherCards = array_slice($line, 1);

            $this->cards->moveCard($card->id, $location, count($otherCards));
            $card->locationArg = count($otherCards);

            foreach ($otherCards as &$otherCard) {
                $this->cards->moveCard($otherCard->id, $location, $otherCard->locationArg - 1);
                $otherCard->locationArg = $otherCard->locationArg - 1;
            }
            $movedCards = array_merge($otherCards, [$card]);
        } else if ($index == count($line) - 1 && $direction == 1) {
            $otherCards = array_slice($line, 0, count($line) - 1);

            $this->cards->moveCard($card->id, $location, 0);
            $card->locationArg = 0;

            foreach ($otherCards as &$otherCard) {
                $this->cards->moveCard($otherCard->id, $location, $otherCard->locationArg + 1);
                $otherCard->locationArg = $otherCard->locationArg + 1;
            }
            $movedCards = array_merge([$card], $otherCards);
        } else {
            $otherCardIndex = $index + $direction;
            if ($otherCardIndex < 0) {
                $otherCardIndex = count($line) - 1;
            } else if ($otherCardIndex >= count($line)) {
                $otherCardIndex = 0;
            }

            $otherCard = $line[$otherCardIndex];

            $this->cards->moveCard($card->id, $location, $otherCardIndex);
            $this->cards->moveCard($otherCard->id, $location, $index);
            $card->locationArg = $otherCardIndex;
            $otherCard->locationArg = $index;
            $movedCards = [$card, $otherCard];
        }

        self::notifyAllPlayers('switchedCards', '', [
            'playerId' => $playerId,
            'movedCards' => $movedCards,
        ]);

        /*$this->notifyAllPlayers('logTODO', 'card order ${order} movedCardsOrder ${movedCardsOrder}', [
            'order' => json_encode(array_map(fn($card) => $card->locationArg, $this->getCardsByLocation('line'.$playerId))),
            'movedCardsOrder' => json_encode(array_map(fn($card) => $card->locationArg, $movedCards)),
        ]);*/

        $this->gamestate->nextPrivateState($playerId, 'stay');
    }

    public function validateCardOrder() {
        self::checkAction('validateCardOrder');

        $playerId = intval($this->getCurrentPlayerId());

        $remaining = $this->applyAutoGainEffects($playerId);

        $this->gamestate->nextPrivateState($playerId, $remaining ? 'next' : 'confirm');
    }

    private function applyEffect(int $playerId, Effect &$effect, array $line) {        
        if (count($effect->left) == 1) {
            if ($effect->left[0][1] == DIFFERENT) {
                $effect->left = [];
                $effect->convertSign = false;
            } else if ($effect->left[0][1] == PER_TAMARINS) {
                $tamarins = count(array_filter($line, fn($card) => $card->type == 0));
                $effect->left[0] = $effect->left[0][0];
                $effect->left[0][0] *= $tamarins;
            }
        }

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

    private function notifAppliedEffect(int $playerId, Effect $appliedEffect) {
        $message = '';
        if (!$appliedEffect->convertSign || count($appliedEffect->left) == 0) {
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
    }

    public function activateEffect(?int $row, ?int $cardIndex, ?int $index) {
        self::checkAction('activateEffect');

        $playerId = intval($this->getCurrentPlayerId());

        $this->saveForUndo($playerId, false, false);

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

            if ($currentEffect->row === $row && $currentEffect->cardIndex === $cardIndex && $currentEffect->closedFrameIndex === $closedFrameIndex) {
                throw new BgaUserException(self::_('You must click on another frame to activate it, not the current frame'));
            }

            $appliedEffect = $this->array_find($rowEffects, fn($effect) => $effect->closedFrameIndex === $closedFrameIndex);

            foreach($currentEffect->left as $resource) {
                $this->giveResource($playerId, $resource);
            }
        }

        $this->applyActivateEffect($playerId, $appliedEffect, $currentEffect, $line);

        $remaining = $this->applyAutoGainEffects($playerId);

        $this->gamestate->nextPrivateState($playerId, $remaining ? 'stay' : 'next');
    }

    function applyActivateEffect(int $playerId, Effect $appliedEffect, Effect $currentEffect, array $line) {
        $this->applyEffect($playerId, $appliedEffect, $line);

        $this->markedPlayedEffect($playerId, $currentEffect);

        $this->notifAppliedEffect($playerId, $appliedEffect);    
        
        $free = !$appliedEffect->convertSign || (count($appliedEffect->left) == 1 && in_array($appliedEffect->left[0][1], [DIFFERENT, PER_TAMARINS]));
        
        $this->incStat(1, 'activatedEffects', $playerId);
        $this->incStat(1, $free ? 'activatedEffectsFree' : 'activatedEffectsCost', $playerId);
    }

    public function activateEffectToken(int $row, int $cardIndex, int $index) {
        self::checkAction('activateEffectToken');

        $playerId = intval($this->getCurrentPlayerId());

        $args = $this->argActivateEffectToken($playerId);
        $line = $args['line'];
        $appliedEffect = $this->getEffectFromClickedFrame($line, $args['possibleEffects'], $row, $cardIndex, $index);

        $this->applyEffect($playerId, $appliedEffect, $line);

        $this->notifAppliedEffect($playerId, $appliedEffect);
        
        $free = count($appliedEffect->left) == 0 || (count($appliedEffect->left) == 1 && in_array($appliedEffect->left[0][1], [DIFFERENT, PER_TAMARINS]));
        
        $this->incStat(1, 'activatedEffects', $playerId);
        $this->incStat(1, $free ? 'activatedEffectsFree' : 'activatedEffectsCost', $playerId);
        $this->incStat(1, 'activatedEffectsToken', $playerId);

        $this->gamestate->nextPrivateState($playerId, 'next');
    }

    public function skipEffect() {
        self::checkAction('skipEffect');

        $playerId = intval($this->getCurrentPlayerId());

        $this->saveForUndo($playerId, false, false);
        
        $args = $this->argActivateEffect($playerId);
        $effect = $args['currentEffect'];

        $this->markedPlayedEffect($playerId, $effect);
        $this->incStat(1, 'skippedEffects', $playerId);

        // TODO notif ?

        $remaining = $this->applyAutoGainEffects($playerId);

        $this->gamestate->nextPrivateState($playerId, $remaining ? 'stay' : 'next');
    }

    public function confirmActivations() {
        self::checkAction('confirmActivations');

        $playerId = intval($this->getCurrentPlayerId());

        if (intval($this->gamestate->state_id()) == ST_MULTIPLAYER_PHASE2) {
            $this->gamestate->nextPrivateState($playerId, 'next');
        } else {
            $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
        }
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
        $this->gamestate->initializePrivateState($playerId);
    }

    public function neighborEffect(int $type) {
        self::checkAction('neighborEffect');

        $playerId = intval($this->getCurrentPlayerId());

        $args = $this->argBuyCard($playerId);
        if (!in_array($type, array_keys($args['neighborTokens']))) {
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
        if ($reactivate) {            
            $this->saveForUndo($playerId, true, false);
        }

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

        $this->incStat(1, 'activatedTokens', $playerId);
        $this->incStat(1, 'activatedTokens'.$args['copiedType'], $playerId);

        if ($reactivate) {
            $this->gamestate->nextPrivateState($playerId, 'activateEffect');
            return;
        }

        //if (!$this->getPlayer($playerId)->phase2cardBought) {
            $this->gamestate->nextPrivateState($playerId, 'next');
        /*} else {
            $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
        }*/
    }

    public function cancelNeighborEffect() {
        self::checkAction('cancelNeighborEffect');

        $playerId = intval($this->getCurrentPlayerId());

        $this->DbQuery("UPDATE `player` SET `phase2_copied_type` = NULL WHERE `player_id` = $playerId");

        $this->gamestate->nextPrivateState($playerId, 'next');
    }

    private function takeCard(int $playerId, int $level, int $type, array $cost) {
        $this->giveResource($playerId, $cost);

        $locationArg = intval($this->getUniqueValueFromDB("SELECT max(`card_location_arg`) FROM `card` WHERE `card_location` = 'pdeck$playerId'")) + 1;
        $card = $this->getCardFromDb($this->cards->pickCardForLocation("deck-$type-$level", 'pdeck'.$playerId, $locationArg));

        self::notifyAllPlayers('buyCard', _('${player_name} buys a level ${level} ${type} card with ${resources}'), [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'player' => $this->getPlayer($playerId),
            'type' => $this->getMonkeyType($type), // for logs
            'level' => $level, // for logs
            'i18n' => ['type'],
            'card' => Card::onlyId($card),
            'deckType' => $type * 10 + $level,
            'deckCount' => intval($this->cards->countCardInLocation("deck-$type-$level")),
            'deckTopCard' => Card::onlyId($this->getCardFromDb($this->cards->getCardOnTop("deck-$type-$level"))),
            'resources' => $this->getResourcesStr([$cost]),
        ]);
        $this->incStat(1, 'addedCards', $playerId);

        $this->cardAddedToDeck($playerId);
    }

    public function buyCard(int $level, int $type) {
        self::checkAction('buyCard');

        $playerId = intval($this->getCurrentPlayerId());

        $args = $this->argBuyCard($playerId);
        if (!$args['buyCardCost'][$level][$type]) {
            throw new BgaUserException("You can't pay for that");
        }

        $this->DbQuery("UPDATE `player` SET `phase2_card_bought` = TRUE WHERE `player_id` = $playerId");
        $this->takeCard($playerId, $level, $args['token'], [3 * $level, $type]);

        $this->incStat(1, 'cardsBought'.$level, $playerId);

        //if ($args['canUseNeighborToken']) {
            $this->gamestate->nextPrivateState($playerId, 'stay');
        /*} else {
            $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
        }*/
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
            throw new BgaUserException("You can't remove this card");
        }

        if ($this->getPlayer($playerId)->rage < 4) {
            throw new BgaUserException("Not enough rage");
        }

        $totalPlayerCards = intval($this->cards->countCardInLocation('pdeck'.$playerId)) +
            intval($this->cards->countCardInLocation('line'.$playerId)) +
            intval($this->cards->countCardInLocation('discard'.$playerId));
        if ($totalPlayerCards <= 4) {
            throw new BgaUserException("You can't have less than 4 cards in play");
        }
        
        $this->cards->moveCard($card->id, 'discard');

        $resource = $card->rageGain;
        $this->giveResource($playerId, [4, RAGE]);
        $this->gainResource($playerId, $resource, []);

        $message = $card->type == TAMARINS ?
            _('${player_name} gains ${resources} by removing a tamarin') :
            _('${player_name} gains ${resources} by removing a level ${level} ${type}');

        $line = null;
        $privateState = $this->getPlayerPrivateState($playerId);
        if ($privateState == ST_PRIVATE_ORDER_CARDS || ($privateState >= 80 && $privateState <= 90 && $this->getPlayer($playerId)->privateStateBeforeObject == ST_PRIVATE_ORDER_CARDS)) {
            // we need to reorder the line so the player isn't bothered with holes in the line
            $line = $this->getCardsByLocation('line'.$playerId);
            foreach ($line as $index => &$card) {
                $card->locationArg = $index;
                $this->cards->moveCard($card->id, 'line'.$playerId, $index);
            }
        }

        self::notifyAllPlayers('removedCard', $message, [
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

        $this->incStat(1, 'removedCards', $playerId);
        $this->incStat(1, 'removedCards'.$card->level, $playerId);
        $this->incStat($resource[0], 'rageGain', $playerId);
        $this->incStat($resource[0], 'rageGain'.$resource[1], $playerId);

        if ($privateState == ST_PRIVATE_ACTIVATE_EFFECT && $this->argActivateEffect($playerId)['currentEffect'] == null) {
            $this->gamestate->nextPrivateState($playerId, 'next');
        } else if ($this->gamestate->isPlayerActive($playerId)) {
            $this->gamestate->nextPrivateState($playerId, 'stay');
        }
    }  

    function useObject(int $number) {
        if ($number < 1 || $number > 7) {
            throw new BgaUserException("Invalid card number");
        }
        $objects = $this->getGlobalVariable(OBJECTS, true) ?? [];
        if (!in_array($number, $objects)) {
            throw new BgaUserException("This object is not on the table");
        }

        $playerId = intval($this->getCurrentPlayerId());
        $usedObjects =  $this->getUsedObjects($playerId);
        if (in_array($number, $usedObjects)) {
            throw new BgaUserException("You already used this object in the round");
        }

        $privateStateId = $this->getPlayerPrivateState($playerId);
        if ($privateStateId >= 80 && $privateStateId < 90) {
            throw new BgaUserException("You're already activating an object");
        }

        if ($this->getPlayer($playerId)->energy < $this->OBJECT_MIN_COST[$number]) {
            throw new BgaUserException("Not enough energy");
        }

        if (in_array($number, [1, 4])) {
            $line = $this->getCardsByLocation('line'.$playerId);
            if (!$this->array_some($line, fn($card) => $card->level > 0)) {
                throw new BgaUserException("There is no level 1/2 card on your line");
            }
        }

        if (in_array($number, [1, 3, 5]) && $privateStateId !== ST_PRIVATE_ORDER_CARDS) {
            throw new BgaUserException("You can only activate this object when assembling");
        }

        $mainStateId = intval($this->gamestate->state_id());
        if (($number == 4 && $mainStateId < ST_MULTIPLAYER_PHASE2) || ($number == 7 && $mainStateId < ST_MULTIPLAYER_CHOOSE_TOKEN)) {
            throw new BgaUserException("You can only activate this object at phase 2");
        }

        
        switch ($number) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 7:
                $this->savePrivateStateBeforeObject($playerId, $privateStateId);
                $this->gamestate->setPrivateState($playerId, 80 + $number);
                break;
            case 5:
                $this->usePinballMachine($playerId);
                break;
            case 6:
                $this->useComputer($playerId);
                break;
        }
    }  

    function applyCancelObject(int $playerId) {
        $stateBefore = $this->getPlayer($playerId)->privateStateBeforeObject;

        if ($stateBefore > 0) {
            $this->savePrivateStateBeforeObject($playerId, 0);
            $this->gamestate->setPrivateState($playerId, $stateBefore);
        } else {
            if (!$this->gamestate->isPlayerActive($playerId)) {
                $this->gamestate->setPlayersMultiactive([$playerId], 'next');
            }
            $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
        }
    }

    function cancelObject() {
        //self::checkAction('cancelObject');

        $playerId = intval($this->getCurrentPlayerId());
        $this->applyCancelObject($playerId);
    }

    public function useMobilePhone(int $id, int $newType) {
        self::checkAction('useMobilePhone');

        $playerId = intval($this->getCurrentPlayerId());

        $oldCard = $this->getCardFromDb($this->cards->getCard($id));       
        $level = $oldCard->level;
        if ($level < 1) {
            throw new BgaUserException("Invalid card");
        }
        $cost = $level + 1;
        if ($this->getPlayer($playerId)->energy < $cost) {
            throw new BgaUserException("Not enough energy");
        }
        
        $this->saveUsedObject($playerId, 1);

        $oldType = $oldCard->type; 
        $left = [$cost, ENERGY];
        $this->giveResource($playerId, $left);

        $oldDeck = "deck-$oldType-$level";
        $this->DbQuery("UPDATE `card` SET `card_location_arg` = `card_location_arg` + 1 WHERE `card_location` = '$oldDeck'");
        $this->cards->moveCard($oldCard->id, $oldDeck, 0);
        $newDeck = "deck-$newType-$level";
        $newCard = $this->getCardFromDb($this->cards->pickCardForLocation($newDeck, 'line'.$playerId, $oldCard->locationArg));
        
        $table = [];
        $tableTopCards = [];
        foreach ([$oldType, $newType] as $monkeyType) {
            $table[$monkeyType * 10 + $level] = intval($this->cards->countCardInLocation("deck-$monkeyType-$level"));
            $tableTopCards[$monkeyType * 10 + $level] = Card::onlyId($this->getCardFromDb($this->cards->getCardOnTop("deck-$monkeyType-$level")));
        }

        self::notifyAllPlayers('replaceLineCard', clienttranslate('${player_name} uses object ${object} to permanently replace a card with a new card of same type and level from the main board'), [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'object' => $this->getObjectName(1),
            'i18n' => ['object'],
            'player' => $this->getPlayer($playerId),
            'oldCard' => $oldCard,
            'newCard' => $newCard,
            'table' => $table,
            'tableTopCards' => $tableTopCards,
        ]);

        $this->cardAddedToDeck($playerId);

        $this->saveForUndo($playerId, true, true);

        $this->applyCancelObject($playerId);
    }

    public function useMinibar(int $left, int $right) {
        self::checkAction('useMinibar');

        $playerId = intval($this->getCurrentPlayerId());
        $player = $this->getPlayer($playerId);

        if ($player->energy < ($left == ENERGY ? 2 : 1)) {
            throw new BgaUserException("Not enough energy");
        }
        if ($left != ENERGY) {
            switch ($left) {
                case FLOWER: 
                    if ($player->flowers < 1) {
                        throw new BgaUserException("Not enough flowers");
                    }
                    break;
                case FRUIT: 
                    if ($player->fruits < 1) {
                        throw new BgaUserException("Not enough fruits");
                    }
                    break;
                case GRAIN: 
                    if ($player->grains < 1) {
                        throw new BgaUserException("Not enough grains");
                    }
                    break;
            }
        }
        
        $this->saveUsedObject($playerId, 2);

        if ($left == ENERGY) {
            $this->giveResource($playerId, [2, ENERGY]);
        } else {
            $this->giveResource($playerId, [1, ENERGY]);
            $this->giveResource($playerId, [1, $left]);
        }
        $this->gainResource($playerId, [1, $right], []);

        self::notifyAllPlayers('activatedEffect', clienttranslate('${player_name} uses object ${object} to convert ${left} to ${right}'), [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'object' => $this->getObjectName(2),
            'i18n' => ['object'],
            'player' => $this->getPlayer($playerId),
            'left' => $this->getResourcesStr([[1, $left]]),
            'right' => $this->getResourcesStr([[1, $right]]),
        ]);

        $this->applyCancelObject($playerId);
    }

    public function useGhettoBlaster(int $id) {
        self::checkAction('useGhettoBlaster');

        $playerId = intval($this->getCurrentPlayerId());

        if ($this->getPlayer($playerId)->energy < 2) {
            throw new BgaUserException("Not enough energy");
        }
        
        $this->saveUsedObject($playerId, 3);

        $left = [2, ENERGY];
        $this->giveResource($playerId, $left);

        $currentCard = $this->getCardFromDb($this->cards->getCard($id));
        $this->cards->moveCard($currentCard->id, 'discard'.$playerId);
        $this->refillPlayerDeckIfEmpty($playerId);
        $card = $this->getCardFromDb($this->cards->pickCardForLocation('pdeck'.$playerId, 'line'.$playerId, $currentCard->locationArg));
        $this->cardPickedFromDeck($playerId);

        self::notifyAllPlayers('replaceLineCardDeck', clienttranslate('${player_name} uses object ${object} to replace a card with a new card from the deck'), [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'object' => $this->getObjectName(3),
            'i18n' => ['object'],
            'player' => $this->getPlayer($playerId),
            'oldCard' => $currentCard,
            'newCard' => $card,
            'deckCount' => intval($this->cards->countCardInLocation('pdeck'.$playerId)),
            'deckTopCard' => Card::onlyId($this->getCardFromDb($this->cards->getCardOnTop('pdeck'.$playerId))),
        ]);

        $this->cardAddedToDeck($playerId);

        $this->saveForUndo($playerId, true, true);

        $this->applyCancelObject($playerId);
    }

    public function useGameConsole(int $id) {
        self::checkAction('useGameConsole');

        $playerId = intval($this->getCurrentPlayerId());
    
        $card = $this->getCardFromDb($this->cards->getCard($id));
        $level = $card->level;
        if ($level < 1) {
            throw new BgaUserException("Invalid card");
        }
        $cost = $level * 2 + 1;
        if ($this->getPlayer($playerId)->energy < $cost) {
            throw new BgaUserException("Not enough energy");
        }
        
        $this->saveUsedObject($playerId, 4);

        $left = [$cost, ENERGY];
        $this->giveResource($playerId, $left);

        $locationArg = intval($this->getUniqueValueFromDB("SELECT max(`card_location_arg`) FROM `card` WHERE `card_location` = 'pdeck$playerId'")) + 1;
        $this->cards->moveCard($card->id, 'pdeck'.$playerId, $locationArg);

        self::notifyAllPlayers('replaceTopDeck', clienttranslate('${player_name} uses object ${object} to place a card on top of its draw pile'), [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'object' => $this->getObjectName(4),
            'i18n' => ['object'],
            'player' => $this->getPlayer($playerId),
            'card' => $card,
        ]);

        $this->applyCancelObject($playerId);        

        $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
    }

    function usePinballMachine(int $playerId) {
        if ($this->getPlayer($playerId)->energy < 4) {
            throw new BgaUserException("Not enough energy");
        }

        $this->saveUsedObject($playerId, 5);

        $left = [4, ENERGY];
        $this->giveResource($playerId, $left);

        $this->refillPlayerDeckIfEmpty($playerId);
        $card = $this->getCardFromDb($this->cards->pickCardForLocation('pdeck'.$playerId, 'line'.$playerId, intval($this->cards->countCardInLocation('line'.$playerId))));
        $this->cardPickedFromDeck($playerId);

        self::notifyAllPlayers('addCardToLine', clienttranslate('${player_name} uses object ${object} to add a 5th card'), [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'object' => $this->getObjectName(5),
            'i18n' => ['object'],
            'player' => $this->getPlayer($playerId),
            'card' => $card,
            'line' => $this->getCardsByLocation('line'.$playerId),              
            'deckCount' => intval($this->cards->countCardInLocation('pdeck'.$playerId)),
            'deckTopCard' => Card::onlyId($this->getCardFromDb($this->cards->getCardOnTop('pdeck'.$playerId))),
        ]);

        /*$this->notifyAllPlayers('logTODO', 'card order ${order}', [
            'order' => json_encode(array_map(fn($card) => $card->locationArg, $this->getCardsByLocation('line'.$playerId))),
        ]);*/

        $this->saveForUndo($playerId, true, true);

        if ($this->gamestate->isPlayerActive($playerId)) {
            $this->gamestate->nextPrivateState($playerId, 'stay');
        }
    }

    function useComputer(int $playerId) {
        if ($this->getPlayer($playerId)->energy < 5) {
            throw new BgaUserException("Not enough energy");
        }

        $this->saveUsedObject($playerId, 6);

        $left = [5, ENERGY];
        $right = [5, POINT];
        $this->giveResource($playerId, $left);
        $this->gainResource($playerId, $right, []);
        
        self::notifyAllPlayers('activatedEffect', clienttranslate('${player_name} uses object ${object} to convert ${left} to ${right}'), [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'object' => $this->getObjectName(6),
            'i18n' => ['object'],
            'player' => $this->getPlayer($playerId),
            'left' => $this->getResourcesStr([$left]),
            'right' => $this->getResourcesStr([$right]),
        ]);

        if ($this->gamestate->isPlayerActive($playerId)) {
            $this->gamestate->nextPrivateState($playerId, 'stay');
        }
    }

    function useMoped(int $type, int $level) {
        //self::checkAction('useMoped');

        $playerId = intval($this->getCurrentPlayerId());

        $cost = $level == 2 ? 9 : 6;
        if ($this->getPlayer($playerId)->energy < $cost) {
            throw new BgaUserException("Not enough energy");
        }
        
        $this->saveUsedObject($playerId, 7);

        $this->takeCard($playerId, $level, $type, [$cost, ENERGY]);

        $this->saveForUndo($playerId, true, true);

        $this->applyCancelObject($playerId);
    }

    private function restoreStats(int $playerId, array $stats) {
        foreach ($stats as $key => $value) {
            $this->DbQuery("UPDATE `stats` SET `stats_value` = $value WHERE `stats_player_id` = $playerId AND `stats_id` = $key");
        }
    }

    public function cancelLastMove() {
        self::checkAction('cancelLastMove');


        $playerId = intval($this->getCurrentPlayerId());
        $undos = json_decode($this->getUniqueValueFromDB("SELECT `undo` FROM `player` WHERE `player_id` = $playerId"));
        if (count($undos) <= 1) {
            $this->cancelLastMoves();
            return;
        }

        $undo = $undos[count($undos) - 1];

        $line = [];
        foreach((array)$undo->lineIds as $index => $id) {
            $this->cards->moveCard($id, 'line'.$playerId, $index);
            $line[] = $this->getCardFromDb($this->cards->getCard($id));
        }
        
        $player = $undo->player;
        $appliedEffectsJsonObj = json_encode($undo->appliedEffects);
        $usedObjectsJsonObj = json_encode($undo->usedObjects);
        $undosJson = json_encode(array_slice($undos, 0, count($undos) - 1));

        $this->DbQuery("UPDATE `player` SET `player_flower` = $player->flowers, `player_fruit` = $player->fruits, `player_grain` = $player->grains, `player_energy` = $player->energy, `player_score` = $player->score, `player_rage` = $player->rage, `applied_effects` = '$appliedEffectsJsonObj', `used_objects` = '$usedObjectsJsonObj', `undo` = '$undosJson' WHERE `player_id` = $playerId");
        $this->restoreStats($playerId, (array)$undo->stats);

        self::notifyAllPlayers('cancelLastMoves', clienttranslate('${player_name} cancels their last move'), [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'line' => $line,
            'player' => $this->getPlayer($playerId),
        ]);

        $this->gamestate->setPrivateState($playerId, $undo->privateStateId);
    } 

    public function cancelLastMoves() {
        self::checkAction('cancelLastMoves');

        $playerId = intval($this->getCurrentPlayerId());
        $undos = json_decode($this->getUniqueValueFromDB("SELECT `undo` FROM `player` WHERE `player_id` = $playerId"));
        $undo = $undos[0];

        $line = [];
        foreach((array)$undo->lineIds as $index => $id) {
            $this->cards->moveCard($id, 'line'.$playerId, $index);
            $line[] = $this->getCardFromDb($this->cards->getCard($id));
        }
        
        $player = $undo->player;
        $appliedEffectsJsonObj = json_encode($undo->appliedEffects);
        $usedObjectsJsonObj = json_encode($undo->usedObjects);


        $undosJson = json_encode([$undo]);

        $this->DbQuery("UPDATE `player` SET `player_flower` = $player->flowers, `player_fruit` = $player->fruits, `player_grain` = $player->grains, `player_energy` = $player->energy, `player_score` = $player->score, `player_rage` = $player->rage, `applied_effects` = '$appliedEffectsJsonObj', `used_objects` = '$usedObjectsJsonObj', `undo` = '$undosJson' WHERE `player_id` = $playerId");
        $this->restoreStats($playerId, (array)$undo->stats);

        self::notifyAllPlayers('cancelLastMoves', clienttranslate('${player_name} cancels their last moves'), [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'line' => $line,
            'player' => $this->getPlayer($playerId),
        ]);

        $this->gamestate->setPrivateState($playerId, $undo->privateStateId);
    }  
}
