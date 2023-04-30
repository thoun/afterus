<?php

trait UtilTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Utility functions
    ////////////

    function array_find(array $array, callable $fn) {
        foreach ($array as $value) {
            if($fn($value)) {
                return $value;
            }
        }
        return null;
    }

    function array_findIndex(array $array, callable $fn) {
        $index = 0;
        foreach ($array as $value) {
            if($fn($value)) {
                return $index;
            }
            $index++;
        }
        return null;
    }

    function array_find_key(array $array, callable $fn) {
        foreach ($array as $key => $value) {
            if($fn($value)) {
                return $key;
            }
        }
        return null;
    }

    function array_some(array $array, callable $fn) {
        foreach ($array as $value) {
            if($fn($value)) {
                return true;
            }
        }
        return false;
    }
    
    function array_every(array $array, callable $fn) {
        foreach ($array as $value) {
            if(!$fn($value)) {
                return false;
            }
        }
        return true;
    }

    function setGlobalVariable(string $name, /*object|array*/ $obj) {
        /*if ($obj == null) {
            throw new \Error('Global Variable null');
        }*/
        $jsonObj = json_encode($obj);
        $this->DbQuery("INSERT INTO `global_variables`(`name`, `value`)  VALUES ('$name', '$jsonObj') ON DUPLICATE KEY UPDATE `value` = '$jsonObj'");
    }

    function getGlobalVariable(string $name, $asArray = null) {
        $json_obj = $this->getUniqueValueFromDB("SELECT `value` FROM `global_variables` where `name` = '$name'");
        if ($json_obj) {
            $object = json_decode($json_obj, $asArray);
            return $object;
        } else {
            return null;
        }
    }

    function deleteGlobalVariable(string $name) {
        $this->DbQuery("DELETE FROM `global_variables` where `name` = '$name'");
    }

    function getPlayersIds() {
        return array_keys($this->loadPlayersBasicInfos());
    }

    function getRoundCardCount() {
        return count($this->getPlayersIds()) + 2;
    }

    function getPlayerName(int $playerId) {
        return self::getUniqueValueFromDB("SELECT player_name FROM player WHERE player_id = $playerId");
    }

    function getPlayerScore(int $playerId) {
        return intval($this->getUniqueValueFromDB("SELECT player_score FROM player where `player_id` = $playerId"));
    }

    function getPlayer(int $id) {
        $sql = "SELECT * FROM player WHERE player_id = $id";
        $dbResults = $this->getCollectionFromDb($sql);
        return array_map(fn($dbResult) => new AfterUsPlayer($dbResult), array_values($dbResults))[0];
    }

    function isEndScoreReached() {
        return boolval($this->getGameStateValue(LAST_TURN));
    }

    function getCardById(int $id) {
        $sql = "SELECT * FROM `card` WHERE `card_id` = $id";
        $dbResults = $this->getCollectionFromDb($sql);
        $cards = array_map(fn($dbCard) => $this->getCardFromDb($dbCard), array_values($dbResults));
        return count($cards) > 0 ? $cards[0] : null;
    }

    function getCardFromDb(array $dbCard) {
        if ($dbCard == null) {
            return null;
        }
        $card = new Card($dbCard, $this->CARDS);

        if ($card->type == 0) {
            $gameinfos = self::getGameinfos();
            $colorToIndex = array_flip($gameinfos['player_colors']);
            $card->number += 8 * $colorToIndex[$this->getPlayerColorById($card->playerId)];
        }

        return $card;
    }

    function getCardsByLocation(string $location, /*int|null*/ $location_arg = null, /*int|null*/ $type = null, /*int|null*/ $number = null) {
        $sql = "SELECT * FROM `card` WHERE `card_location` = '$location'";
        if ($location_arg !== null) {
            $sql .= " AND `card_location_arg` = $location_arg";
        }
        if ($type !== null) {
            $sql .= " AND `card_type` = $type";
        }
        if ($number !== null) {
            $sql .= " AND `card_type_arg` = $number";
        }
        $sql .= " ORDER BY `card_location_arg`";
        $dbResults = $this->getCollectionFromDb($sql);
        return array_map(fn($dbCard) => $this->getCardFromDb($dbCard), array_values($dbResults));
    }

    function getCardByLocation(string $location, int $location_arg, /*int|null*/ $type = null, /*int|null*/ $number = null) {
        return $this->getCardsByLocation($location, $location_arg, $type, $number)[0];
    }

    function setupCards(array $playersIds) {
        // number cards
        $cards = [];
        foreach ($playersIds as $playerId) {
            foreach ($this->TAMARINS as $index => $card) {
                $cards[] = [ 'type' => 0, 'type_arg' => $index + 1, 'nbr' => 1 ];
            }
            $this->cards->createCards($cards, 'deck'.$playerId);
            $this->cards->shuffle('deck'.$playerId);
        }

        foreach ([ORANGUTANS, CHIMPANZEES, GORILLAS, MANDRILLS] as $monkeyType) {
            foreach ([1, 2] as $level) {
                $cards = [];
                $type = $monkeyType * 10 + $level;
                foreach ($this->CARDS[$type] as $subType => $card) {
                    $cards[] = [ 'type' => $type, 'type_arg' => $subType, 'nbr' => 1 ];
                }
                $this->cards->createCards($cards, "deck-$monkeyType-$level");
                $this->cards->shuffle("deck-$monkeyType-$level");
            }
        }
    }

    function setupObjects(bool $beginner) {
        $objects = [];
        if ($beginner) {
            $objects = [3, 6, 7];
        } else {
            $availableObjects = [1, 2, 3, 4, 5, 6, 7];
    
            for ($i = 0; $i < 3; $i++) {
                $index = bga_rand(1, count($availableObjects)) - 1;
                $objects[] = $availableObjects[$index];
                array_splice($availableObjects, $index, 1);
            }
        }

        $this->setGlobalVariable(OBJECTS, $objects);
    }
    
    function getEffects(array $playerLine) {
        $effects = [];

        for ($i = 0; $i < 3; $i++) {
            $openedRightFrame = null;
            $openedRightFrameCardIndex = null;

            foreach ($playerLine as $card) {
                $cardIndex = $card->locationArg;

                foreach ($card->frames[$i] as $frameIndex => $frame) {
                    if ($frame->type === OPENED_LEFT && $openedRightFrame !== null && $openedRightFrameCardIndex !== null && $openedRightFrameCardIndex === $cardIndex - 1) {
                        //$this->debug([$cardIndex, $openedRightFrameCardIndex, $openedRightFrame]);
                        $effects[] = new Effect($i, $openedRightFrame->left, $frame->right, $openedRightFrame->convertSign || $frame->convertSign, $openedRightFrameCardIndex);
                    }
                    $openedRightFrame = null;

                    if ($frame->type === CLOSED) {
                        $effects[] = new Effect($i, $frame->left, $frame->right, $frame->convertSign, $cardIndex, $frameIndex);
                    } else if ($frame->type === OPENED_RIGHT) {
                        $openedRightFrame = $frame;
                        $openedRightFrameCardIndex = $cardIndex;
                    }
                }
            }
        }

        return $effects;
    }

    function isFreeEffect(Effect $effect) {
        return !$effect->convertSign || 
            count($effect->left) == 0 || 
            (count($effect->left) == 1 && $effect->left[0][1] == DIFFERENT);
    }

    private function getEffectFromClickedFrame(array $line, array $possibleEffects, int $row, int $cardIndex, int $index) {
        $card = $this->array_find($line, fn($card) => $card->locationArg === $cardIndex);
        $frame = $card->frames[$row][$index];
        if ($frame->type == OPENED_LEFT) {
            $cardIndex = $cardIndex - 1;
            $card = $this->array_find($line, fn($card) => $card->locationArg === $cardIndex);
            $frame = $card->frames[$row][count($card->frames[$row]) - 1];
        }

        $effect = null;
        $searchIndex = $frame->type == OPENED_RIGHT ? null : /* closed */ $index;
        $effect = $this->array_find($possibleEffects, fn($effect) => 
            $effect->row === $row && $effect->cardIndex === $cardIndex && $effect->closedFrameIndex === $searchIndex
        );

        return $effect;
    }

    public function getPossibleEffects(int $playerId, array $allEffects, array $line, bool $ignoreReactivate) {
        $player = $this->getPlayer($playerId);
        $possibleEffects = array_values(array_filter($allEffects, fn($effect) => 
            !$effect->convertSign || 
            count($effect->left) == 0 || 
            $this->array_every($effect->left, fn($condition) => $this->playerMeetsCondition($player, $condition, $line))
        ));

        $tamarins = count(array_filter($line, fn($card) => $card->type == 0));
        if ($tamarins == 0) {
            $possibleEffects = array_values(array_filter($allEffects, fn($effect) => 
                count($effect->left) != 1 || 
                !$this->array_some($effect->left, fn($condition) => $condition[1] == PER_TAMARINS)
            ));
        }

        if ($ignoreReactivate) {
            $possibleEffects = array_values(array_filter($possibleEffects, fn($effect) => 
                count($effect->right) == 0 || !$this->array_some($effect->right, fn($condition) => $condition[1] == REACTIVATE)
            ));
        }

        return $possibleEffects;
    }

    public function getRemainingEffects(int $playerId, array $allEffects) {
        $appliedEffects = json_decode($this->getUniqueValueFromDB("SELECT `applied_effects` FROM `player` WHERE `player_id` = $playerId") ?? '[]', true);

        $remainingEffects = $allEffects;
        foreach($appliedEffects as $effect) {
            $index = $this->array_findIndex($remainingEffects, fn($remainingEffect) => $remainingEffect->row === $effect[0] && $remainingEffect->cardIndex === $effect[1] && $remainingEffect->closedFrameIndex === $effect[2]);
            unset($remainingEffects[$index]); 
            $remainingEffects = array_values($remainingEffects);
        }

        return $remainingEffects;
    }

    private function markedPlayedEffect(int $playerId, $effect) {
        $appliedEffects = json_decode($this->getUniqueValueFromDB("SELECT `applied_effects` FROM `player` WHERE `player_id` = $playerId") ?? '[]', true);
        
        $appliedEffect = [$effect->row, $effect->cardIndex, $effect->closedFrameIndex];
        $appliedEffects[] = $appliedEffect;
        $jsonObj = json_encode($appliedEffects);
        $this->DbQuery("UPDATE `player` SET `applied_effects` = '$jsonObj' WHERE `player_id` = $playerId");
    }

    public function playerMeetsCondition(AfterUsPlayer $player, array $condition, array $line) {
        $quantity = $condition[0];

        switch ($condition[1]) {
            case FLOWER: return $quantity <= $player->flowers;
            case FRUIT: return $quantity <= $player->fruits;
            case GRAIN: return $quantity <= $player->grains;
            case ENERGY: return $quantity <= $player->energy;
            case POINT: return $quantity <= $player->score;
            case RAGE: return $quantity <= $player->rage;
            case DIFFERENT:
                $groupByType = [];
                foreach($line as $card) {
                    $groupByType[$card->type][] = $card;
                }
                return count($groupByType) >= $quantity;
            case PER_TAMARINS: return $this->array_some($line, fn($card) => $card->type == 0);
            default: throw new BgaVisibleSystemException('invalid condition');
        }
    }
    
    private function giveResource(int $playerId, array $resource) {
        $quantity = $resource[0];

        switch ($resource[1]) {
            case FLOWER: $this->DbQuery("UPDATE `player` SET `player_flower` = `player_flower` - $quantity WHERE `player_id` = $playerId"); break;
            case FRUIT: $this->DbQuery("UPDATE `player` SET `player_fruit` = `player_fruit` - $quantity WHERE `player_id` = $playerId"); break;
            case GRAIN: $this->DbQuery("UPDATE `player` SET `player_grain` = `player_grain` - $quantity WHERE `player_id` = $playerId"); break;
            case ENERGY: $this->DbQuery("UPDATE `player` SET `player_energy` = `player_energy` - $quantity WHERE `player_id` = $playerId"); break;
            case POINT: $this->DbQuery("UPDATE `player` SET `player_score` = `player_score` - $quantity WHERE `player_id` = $playerId"); break;
            case RAGE: $this->DbQuery("UPDATE `player` SET `player_rage` = `player_rage` - $quantity WHERE `player_id` = $playerId"); break;
            default: throw new BgaVisibleSystemException('invalid giveResource');
        }
    }

    private function checkLastTurn() {        
        if (!boolval($this->getGameStateValue(LAST_TURN)) && intval($this->getUniqueValueFromDB("SELECT count(*) FROM player where `player_score` >= 80")) > 0) {
            $this->setGameStateValue(LAST_TURN, 1);

            self::notifyAllPlayers('lastTurn', clienttranslate('A player reached 80 points, triggering the end of the game !'), []);
        }
    }

    private function gainResource(int $playerId, array $resource, array $line) {
        $quantity = $resource[0];

        switch ($resource[1]) {
            case FLOWER: $this->DbQuery("UPDATE `player` SET `player_flower` = `player_flower` + $quantity WHERE `player_id` = $playerId"); break;
            case FRUIT: $this->DbQuery("UPDATE `player` SET `player_fruit` = `player_fruit` + $quantity WHERE `player_id` = $playerId"); break;
            case GRAIN: $this->DbQuery("UPDATE `player` SET `player_grain` = `player_grain` + $quantity WHERE `player_id` = $playerId"); break;
            case ENERGY: $this->DbQuery("UPDATE `player` SET `player_energy` = `player_energy` + $quantity WHERE `player_id` = $playerId"); break;
            case POINT: 
                $this->DbQuery("UPDATE `player` SET `player_score` = `player_score` + $quantity WHERE `player_id` = $playerId");
                $this->checkLastTurn();
                break;
            case RAGE: $this->DbQuery("UPDATE `player` SET `player_rage` = `player_rage` + $quantity WHERE `player_id` = $playerId"); break;
            case PER_TAMARINS: 
                $tamarins = count(array_filter($line, fn($card) => $card->type == 0));
                $this->DbQuery("UPDATE `player` SET `player_score` = `player_score` + $tamarins WHERE `player_id` = $playerId");
                $this->checkLastTurn();
                break;
            default: throw new BgaVisibleSystemException("invalid gainResource $quantity ".$resource[1]);
        }
    }

    private function getResourceCode(int $resource) {
        switch ($resource) {
            case FLOWER: return '[Flower]';
            case FRUIT: return '[Fruit]';
            case GRAIN: return '[Grain]';
            case ENERGY: return '[Energy]';
            case POINT: return '[Point]';
            case RAGE: return '[Rage]';
            case DIFFERENT: return '[Different]';
            case PER_TAMARINS: return '/ [Tamarin]';
            case REACTIVATE: return '[Reactivate]';
            default: throw new BgaVisibleSystemException('invalid getResourceCode');
        }
    }

    private function getResourcesStr(array $resources) {
        return implode(' ', array_map(fn($resource) => $resource[0] . ' ' . $this->getResourceCode($resource[1]), $resources));
    }

    function getPlayerSelectedToken(int $playerId) {
        return $this->getPlayer($playerId)->chosenToken;
    }

    function setPlayerSelectedToken(int $playerId, /*int|null*/ $selectedToken) {
        $selected = $selectedToken !== null;
        $this->DbQuery("UPDATE `player` SET `chosen_token` = ". ($selected ? $selectedToken : 'NULL') ." WHERE `player_id` = $playerId");
        $this->notifyAllPlayers('selectedToken', '', [
            'playerId' => $playerId,
            'token' => 0,
            'cancel' => !$selected,
        ]);
        $this->notifyPlayer($playerId, 'selectedToken', '', [
            'playerId' => $playerId,
            'token' => $selectedToken,
            'cancel' => !$selected,
        ]);
    }

    function getMonkeyType(int $type) {
        switch ($type) {
            case 0: return clienttranslate('tamarin');
            case 1: return clienttranslate('mandrill');
            case 2: return clienttranslate('orangutan');
            case 3: return clienttranslate('gorilla');
            case 4: return clienttranslate('chimpanzee');
        }
    }

    function getObjectName(int $number) {
        switch ($number) {
            case 1: return clienttranslate("Mobile phone");
            case 2: return clienttranslate("Minibar");
            case 3: return clienttranslate("Ghetto blaster");
            case 4: return clienttranslate("Game console");
            case 5: return clienttranslate("Pinball Machine");
            case 6: return clienttranslate("Computer");
            case 7: return clienttranslate("Moped");
        }
    }

    function getPlayerPrivateState(int $playerId) {
        return $this->gamestate->isPlayerActive($playerId) ? intval($this->getUniqueValueFromDB("SELECT `player_state` FROM `player` WHERE `player_id` = $playerId")) : 0;
    }

    function savePrivateStateBeforeObject(int $playerId, int $stateId) {
        $this->DbQuery("UPDATE `player` SET `private_state_before_object` = $stateId WHERE `player_id` = $playerId");        
    }

    function applyAutoGainEffects(int $playerId) {
        $args = $this->argActivateEffect($playerId);
        $currentEffect = $args['currentEffect'];

        if ($this->getPlayer($playerId)->autoGain) {
            while ($currentEffect != null && $this->isFreeEffect($currentEffect) && !$this->array_some($currentEffect->right, fn($resource) => $resource[1] == REACTIVATE)) {
                $line = $this->getCardsByLocation('line'.$playerId);
                $this->applyActivateEffect($playerId, $currentEffect, $currentEffect, $line);

                $args = $this->argActivateEffect($playerId);
                $currentEffect = $args['currentEffect'];
            }
        }

        return $currentEffect != null;
    }

    function refillPlayerDeckIfEmpty(int $playerId) {
        if (intval($this->cards->countCardInLocation('deck'.$playerId)) == 0) {
            $this->cards->moveAllCardsInLocation('discard'.$playerId, 'deck'.$playerId);
            $this->cards->shuffle('deck'.$playerId);

            self::notifyAllPlayers('refillDeck', _('${player_name} shuffles discarded cards back to form a new deck (deck was empty)'), [
                'playerId' => $playerId,
                'player_name' => $this->getPlayerName($playerId),
                'deckCount' => intval($this->cards->countCardInLocation('deck'.$playerId)),
            ]);
        }
    }

    function getUsedObjects(int $playerId) {
        return json_decode($this->getUniqueValueFromDB("SELECT `used_objects` FROM `player` WHERE `player_id` = $playerId") ?? '[]', true);
    }

    private function saveUsedObject(int $playerId, int $object) {
        $usedObjects = json_decode($this->getUniqueValueFromDB("SELECT `used_objects` FROM `player` WHERE `player_id` = $playerId") ?? '[]', true);

        $usedObjects[] = $object;
        $jsonObj = json_encode($usedObjects);
        $this->DbQuery("UPDATE `player` SET `used_objects` = '$jsonObj' WHERE `player_id` = $playerId");

        self::notifyPlayer($playerId, 'useObject', '', [
            'playerId' => $playerId,
            'object' => $object,
        ]);
    }

    function saveForUndo(int $playerId, bool $logUndoPoint) {
        $line = $this->getCardsByLocation('line'.$playerId);
        $player = $this->getPlayer($playerId);

        if ($logUndoPoint) {
            self::notifyPlayer($playerId, 'log', clienttranslate('As you revealed a hidden element, Cancel last moves will only allow to come back to this point'), []);
        }

        $lineIds = [];
        foreach ($line as $card) {
            $lineIds[$card->locationArg] = $card->id;
        }

        $undo = new Undo(
            $this->getPlayerPrivateState($playerId),
            $lineIds,
            $player,
        );
        $jsonObj = json_encode($undo);
        $this->DbQuery("UPDATE `player` SET `undo` = '$jsonObj' WHERE `player_id` = $playerId");
    }
}
