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
}
