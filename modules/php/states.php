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
        $this->DbQuery("UPDATE `player` SET `applied_effects` = '[]', `chosen_token` = NULL");

        $playersIds = $this->getPlayersIds();
        foreach ($playersIds as $playerId) {
            $line = [];
            for ($i = 0; $i < 4; $i++) {
                if (intval($this->cards->countCardInLocation('deck'.$playerId)) == 0) {
                    $this->cards->moveAllCardsInLocation('discard'.$playerId, 'deck'.$playerId);
                    $this->cards->shuffle('deck'.$playerId);

                    self::notifyAllPlayers('log', _('${player_name} shuffles discarded cards back to form a new deck (deck was empty)'), [
                        'playerId' => $playerId,
                        'player_name' => $this->getPlayerName($playerId),
                    ]);
                }
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

        /* TODO $playersIds = $this->getPlayersIds();
        foreach ($playersIds as $playerId) {
            $score = $this->getPlayerScore($playerId);
            $scoreAux = $this->getPlayerScoreAux($playerId);
            self::notifyAllPlayers('log', clienttranslate('${player_name} ends round ${roundNumber} with ${totalScore} points (${roundScore} points this round)'), [
                'playerId' => $playerId,
                'player_name' => $this->getPlayerName($playerId),
                'roundNumber' => $roundNumber,
                'totalScore' => $score + $scoreAux,
                'roundScore' => $scoreAux,
            ]);
        }

        // apply round score (scoreAux) to score
        $this->DbQuery("UPDATE player SET `player_score` = `player_score` + `player_score_aux`");*/

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
