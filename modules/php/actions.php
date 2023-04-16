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
    }

    public function validateCardOrder() {
        self::checkAction('validateCardOrder');

        $playerId = intval($this->getCurrentPlayerId());

        $this->gamestate->nextPrivateState($playerId, 'next');
    }

    public function activateEffect($row, $cardIndex, $index) {
        self::checkAction('activateEffect');

        $playerId = intval($this->getCurrentPlayerId());

        $args = $this->argActivateEffect($playerId);
        $effect = $args['currentEffect'];
        $line = $args['line'];

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

        $this->markedPlayedEffect($playerId, $effect);

        $message = '';
        if (!$effect->convertSign) {
            $message = _('${player_name} gains ${resources} with activated effect');
        } else {
            $message = _('${player_name} spends ${left} to gain ${right} with activated effect');
        }
        
        self::notifyAllPlayers('activatedEffect', $message, [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'player' => $this->getPlayer($playerId),
            'resources' => $this->getResourcesStr(array_merge($effect->left, $effect->right)),
            'left' => $this->getResourcesStr($effect->left),
            'right' => $this->getResourcesStr($effect->right),
        ]);

        $args = $this->argActivateEffect($playerId);
        $effect = $args['currentEffect'];

        $this->gamestate->nextPrivateState($playerId, $effect != null ? 'stay' : 'next');
    }

    public function activateEffectToken(int $row, int $cardIndex, int $index) {
        self::checkAction('activateEffectToken');

        $playerId = intval($this->getCurrentPlayerId());

        $args = $this->argActivateEffectToken($playerId);
        $line = $args['line'];
        $effect = $this->getEffectFromClickedFrame($line, $args['possibleEffects'], $row, $cardIndex, $index);

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

        $message = '';
        if (!$effect->convertSign) {
            $message = _('${player_name} gains ${resources} with activated effect');
        } else {
            $message = _('${player_name} spends ${left} to gain ${right} with activated effect');
        }
        
        self::notifyAllPlayers('activatedEffect', $message, [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'player' => $this->getPlayer($playerId),
            'resources' => $this->getResourcesStr(array_merge($effect->left, $effect->right)),
            'left' => $this->getResourcesStr($effect->left),
            'right' => $this->getResourcesStr($effect->right),
        ]);

        $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
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
}
