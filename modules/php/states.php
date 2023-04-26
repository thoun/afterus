<?php

trait StateTrait {

//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */

    function stNewRound() {
        $this->DbQuery("UPDATE `player` SET `applied_effects` = '[]', `chosen_token` = NULL, `phase2_copied_type` = NULL, phase2_card_bought = false");

        $playersIds = $this->getPlayersIds();
        foreach ($playersIds as $playerId) {
            $line = [];
            for ($i = 0; $i < 4; $i++) {
                $this->refillPlayerDeckIfEmpty($playerId);
                $line[] = $this->getCardFromDb($this->cards->pickCardForLocation('deck'.$playerId, 'line'.$playerId, $i));
            }

            self::notifyAllPlayers('newRound', '', [
                'playerId' => $playerId,
                'cards' => $line,
            ]);
        }

        $this->gamestate->nextState('next');
    }

    function stPhase1() {
        $this->gamestate->setAllPlayersMultiactive();
        $this->gamestate->initializePrivateStateForAllActivePlayers(); 
    }

    function stEndPhase1() {
        $endScoreReached = $this->isEndScoreReached();

        if ($endScoreReached) {
            $this->gamestate->nextState('endGame');
        } else {
            $this->gamestate->nextState('next');
        }
    }

    function stChooseToken() {
        $this->gamestate->setAllPlayersMultiactive();
        $this->gamestate->initializePrivateStateForAllActivePlayers(); 
    }

    function stRevealTokens() {
        $tokens = [];
        $playersIds = $this->getPlayersIds();
        $playersIdsWithReactivate = [];

        foreach ($playersIds as $playerId) {
            $token = $this->getPlayer($playerId)->chosenToken;
            $tokens[$playerId] = $token;

            $resource = null;

            switch ($token) {
                case 1: $resource = [2, POINT]; break;
                case 2: $resource = [2, ENERGY]; break;
                case 3: $resource = [2, RAGE]; break;
            }

            if ($resource == null) {
                $playersIdsWithReactivate[] = $playerId;
            } else {
                $this->gainResource($playerId, $resource, []);
                
                self::notifyAllPlayers('activatedEffect', _('${player_name} gains ${resources} with chosen token'), [
                    'playerId' => $playerId,
                    'player_name' => $this->getPlayerName($playerId),
                    'player' => $this->getPlayer($playerId),
                    'resources' => $this->getResourcesStr([$resource]),
                ]);
            }
        }
        
        self::notifyAllPlayers('revealTokens', '', [
            'tokens' => $tokens,
        ]);

        if (count($playersIdsWithReactivate) > 0) {
            $this->gamestate->setPlayersMultiactive($playersIdsWithReactivate, 'next', true);
        }
        $this->gamestate->nextState(count($playersIdsWithReactivate) > 0 ? 'reactivate' : 'next');
    }

    function stTokenSelectReactivate() {
        $this->gamestate->initializePrivateStateForAllActivePlayers(); 
    }

    function stPhase2() {
        $this->gamestate->setAllPlayersMultiactive();
        $this->gamestate->initializePrivateStateForAllActivePlayers(); 
    }

    function stEndRound() {
        $this->incStat(1, 'roundNumber');

        
        $playersIds = $this->getPlayersIds();
        foreach ($playersIds as $playerId) {
            $this->cards->moveAllCardsInLocation('line'.$playerId, 'discard'.$playerId);

            self::notifyAllPlayers('endRound', '', [
                'playerId' => $playerId,
            ]);
        }

        $endScoreReached = $this->isEndScoreReached();

        $this->gamestate->nextState($endScoreReached ? 'endScore' : 'newRound');
    }

    function stEndScore() {
        $playersIds = $this->getPlayersIds();

        foreach($playersIds as $playerId) {
            // TODO stats?
        }

        $this->gamestate->nextState('endGame');
    }
}
