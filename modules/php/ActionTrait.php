<?php
declare(strict_types=1);

namespace Bga\Games\Afterus;

use Bga\Games\Afterus\Models\Effect;
use Bga\Games\Afterus\Models\Card;
use Bga\Games\Afterus\States\MobilePhone;
use Bga\Games\Afterus\States\Moped;
use Bga\Games\Afterus\States\GameConsole;
use Bga\Games\Afterus\States\Minibar;
use Bga\Games\Afterus\States\GhettoBlaster;
use Bga\Games\Afterus\Models\Undo;

use Bga\GameFramework\Actions\CheckAction;
use Bga\GameFramework\Actions\Types\IntParam;
use Bga\GameFramework\NotificationMessage;
use Bga\GameFramework\UserException;

trait ActionTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Player actions
    //////////// 
    
    /*
        Each time a player is doing some game action, one of the methods below is called.
        Autowired act methods receive validated request parameters and the current player ID.
    */

    public function applyEffect(int $playerId, Effect &$effect, array $line) {
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

    public function notifAppliedEffect(int $playerId, Effect $appliedEffect) {
        $message = '';
        if (!$appliedEffect->convertSign || count($appliedEffect->left) == 0) {
            $message = clienttranslate('${player_name} gains ${resources} with activated effect');
        } else {
            $message = clienttranslate('${player_name} spends ${left} to gain ${right} with activated effect');
        }
        
        $this->bga->notify->all('activatedEffect', new NotificationMessage($message, [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'player' => $this->getPlayer($playerId),
            'resources' => $this->getResourcesStr(array_merge($appliedEffect->left, $appliedEffect->right)),
            'left' => $this->getResourcesStr($appliedEffect->left),
            'right' => $this->getResourcesStr($appliedEffect->right),
        ]));
    }

    function applyActivateEffect(int $playerId, Effect $appliedEffect, Effect $currentEffect, array $line) {
        $this->applyEffect($playerId, $appliedEffect, $line);

        $this->markedPlayedEffect($playerId, $currentEffect);

        $this->notifAppliedEffect($playerId, $appliedEffect);    
        
        $free = !$appliedEffect->convertSign || (count($appliedEffect->left) == 1 && in_array($appliedEffect->left[0][1], [DIFFERENT, PER_TAMARINS]));
        
        $this->bga->playerStats->inc('activatedEffects', 1, $playerId);
        $this->bga->playerStats->inc($free ? 'activatedEffectsFree' : 'activatedEffectsCost', 1, $playerId);
    }

    public function takeCard(int $playerId, int $level, int $type, array $cost) {
        $this->giveResource($playerId, $cost);

        $locationArg = intval($this->getUniqueValueFromDB("SELECT max(`card_location_arg`) FROM `card` WHERE `card_location` = 'pdeck$playerId'")) + 1;
        $card = $this->getCardFromDb($this->cards->pickCardForLocation("deck-$type-$level", 'pdeck'.$playerId, $locationArg));

        $this->bga->notify->all('buyCard', new NotificationMessage(clienttranslate('${player_name} buys a level ${level} ${type} card with ${resources}'), [
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
        ]));
        $this->bga->playerStats->inc('addedCards', 1, $playerId);

        $this->cardAddedToDeck($playerId);
    }

    #[CheckAction(false)]
    public function actSetAutoGain(bool $autoGain, int $currentPlayerId) {
        $this->DbQuery("UPDATE `player` SET `player_auto_gain` = ".($autoGain ? 1 : 0)." WHERE `player_id` = $currentPlayerId");
        
        // dummy notif so player gets back hand
        $this->bga->notify->player($currentPlayerId, "setAutoGain", '', []);
    }

    #[CheckAction(false)]
    public function actUseRage(#[IntParam(min: 0)] int $id, int $currentPlayerId) {
        if ($this->gamestate->getCurrentMainStateId() >= ST_END_SCORE) {
            throw new UserException(clienttranslate("You can't do actions after game end"));
        }

        $card = $this->getCardFromDb($this->cards->getCard($id));

        if ($card == null || $card->location != 'line'.$currentPlayerId) {
            throw new UserException(clienttranslate("You can't remove this card"));
        }

        if ($this->getPlayer($currentPlayerId)->rage < 4) {
            throw new UserException(clienttranslate("Not enough rage"));
        }

        $totalPlayerCards = intval($this->cards->countCardInLocation('pdeck'.$currentPlayerId)) +
            intval($this->cards->countCardInLocation('line'.$currentPlayerId)) +
            intval($this->cards->countCardInLocation('discard'.$currentPlayerId));
        if ($totalPlayerCards <= 4) {
            throw new UserException(clienttranslate("You can't have less than 4 cards in play"));
        }
        
        $this->cards->moveCard($card->id, 'discard');

        $resource = $card->rageGain;
        $this->giveResource($currentPlayerId, [4, RAGE]);
        $this->gainResource($currentPlayerId, $resource, []);

        $message = $card->type == TAMARINS ?
            clienttranslate('${player_name} gains ${resources} by removing a tamarin') :
            clienttranslate('${player_name} gains ${resources} by removing a level ${level} ${type}');

        $line = null;
        $privateState = $this->getPlayerPrivateState($currentPlayerId);
        if ($privateState == ST_PRIVATE_ORDER_CARDS || ($privateState >= 80 && $privateState <= 90 && $this->getPlayer($currentPlayerId)->privateStateBeforeObject == ST_PRIVATE_ORDER_CARDS)) {
            // we need to reorder the line so the player isn't bothered with holes in the line
            $line = $this->getCardsByLocation('line'.$currentPlayerId);
            foreach ($line as $index => &$card) {
                $card->locationArg = $index;
                $this->cards->moveCard($card->id, 'line'.$currentPlayerId, $index);
            }
        }

        $this->bga->notify->all('removedCard', new NotificationMessage($message, [
            'playerId' => $currentPlayerId,
            'player_name' => $this->getPlayerName($currentPlayerId),
            'player' => $this->getPlayer($currentPlayerId),
            'resources' => $this->getResourcesStr([$resource]),
            'type' => $this->getMonkeyType($card->type), // for logs
            'level' => $card->level, // for logs
            'i18n' => ['type'],
            'card' => $card,
            'line' => $line,
        ]));

        $this->bga->playerStats->inc('removedCards', 1, $currentPlayerId);
        $this->bga->playerStats->inc('removedCards'.$card->level, 1, $currentPlayerId);
        $this->bga->playerStats->inc('rageGain', $resource[0], $currentPlayerId);
        $this->bga->playerStats->inc('rageGain'.$resource[1], $resource[0], $currentPlayerId);

        if ($privateState == ST_PRIVATE_ACTIVATE_EFFECT && $this->argActivateEffect($currentPlayerId)['currentEffect'] == null) {
            $this->gamestate->nextPrivateState($currentPlayerId, 'next');
        } else if ($privateState == ST_PRIVATE_CONFIRM_ACTIVATIONS && $this->argActivateEffect($currentPlayerId)['currentEffect'] != null) {
            $this->gamestate->nextPrivateState($currentPlayerId, 'back');
        } else if ($this->gamestate->isPlayerActive($currentPlayerId)) {
            $this->gamestate->nextPrivateState($currentPlayerId, 'stay');
        }
    }  

    #[CheckAction(false)]
    public function actUseObject(#[IntParam(min: 0)] int $number, int $currentPlayerId) {
        if ($this->gamestate->getCurrentMainStateId() >= ST_END_SCORE) {
            throw new UserException(clienttranslate("You can't do actions after game end"));
        }
        
        if ($number < 1 || $number > 7) {
            throw new UserException(clienttranslate("Invalid card number"));
        }
        $objects = $this->getGlobalVariable(OBJECTS, true) ?? [];
        if (!in_array($number, $objects)) {
            throw new UserException(clienttranslate("This object is not on the table"));
        }

        $usedObjects =  $this->getUsedObjects($currentPlayerId);
        if (in_array($number, $usedObjects)) {
            throw new UserException(clienttranslate("You already used this object in the round"));
        }

        $privateStateId = $this->getPlayerPrivateState($currentPlayerId);
        if ($privateStateId >= 80 && $privateStateId < 90) {
            throw new UserException(clienttranslate("You're already activating an object"));
        }

        if ($this->getPlayer($currentPlayerId)->energy < $this->OBJECT_MIN_COST[$number]) {
            throw new UserException(clienttranslate("Not enough energy"));
        }

        if (in_array($number, [1, 4])) {
            $line = $this->getCardsByLocation('line'.$currentPlayerId);
            if (!\array_any($line, fn($card) => $card->level > 0)) {
                throw new UserException(clienttranslate("There is no level 1/2 card on your line"));
            }
        }

        if (in_array($number, [1, 3, 5]) && $privateStateId !== ST_PRIVATE_ORDER_CARDS) {
            throw new UserException(clienttranslate("You can only activate this object when assembling"));
        }

        $mainStateId = $this->gamestate->getCurrentMainStateId();
        if (($number == 4 && $mainStateId < ST_MULTIPLAYER_PHASE2) || ($number == 7 && $mainStateId < ST_MULTIPLAYER_CHOOSE_TOKEN)) {
            throw new UserException(clienttranslate("You can only activate this object at phase 2"));
        }

        switch ($number) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 7:
                $this->savePrivateStateBeforeObject($currentPlayerId, $privateStateId);
                $objectState = match ($number) {
                    1 => MobilePhone::class,
                    2 => Minibar::class,
                    3 => GhettoBlaster::class,
                    4 => GameConsole::class,
                    7 => Moped::class,
                    default => 80 + $number,
                };
                // Object actions are routed through the active player's private state.
                // A saved state of 0 makes applyCancelObject restore their waiting status.
                if (!$this->gamestate->isPlayerActive($currentPlayerId)) {
                    $this->gamestate->setPlayersMultiactive([$currentPlayerId], 'next', false);
                }
                $this->gamestate->setPrivateState($currentPlayerId, $objectState);
                break;
            case 5:
                $this->usePinballMachine($currentPlayerId);
                break;
            case 6:
                $this->useComputer($currentPlayerId);
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

    #[CheckAction(false)]
    public function actCancelObject(int $currentPlayerId) {
        $this->applyCancelObject($currentPlayerId);
    }

    function usePinballMachine(int $playerId) {
        if ($this->getPlayer($playerId)->energy < 4) {
            throw new UserException(clienttranslate("Not enough energy"));
        }

        $this->saveUsedObject($playerId, 5);

        $left = [4, ENERGY];
        $this->giveResource($playerId, $left);

        $this->refillPlayerDeckIfEmpty($playerId);
        $card = $this->getCardFromDb($this->cards->pickCardForLocation('pdeck'.$playerId, 'line'.$playerId, intval($this->cards->countCardInLocation('line'.$playerId))));
        $this->cardPickedFromDeck($playerId);

        $this->bga->notify->all('addCardToLine', new NotificationMessage(clienttranslate('${player_name} uses object ${object} to add a 5th card'), [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'object' => $this->getObjectName(5),
            'i18n' => ['object'],
            'player' => $this->getPlayer($playerId),
            'card' => $card,
            'line' => $this->getCardsByLocation('line'.$playerId),              
            'deckCount' => intval($this->cards->countCardInLocation('pdeck'.$playerId)),
            'deckTopCard' => Card::onlyId($this->getCardFromDb($this->cards->getCardOnTop('pdeck'.$playerId))),
        ]));

        /*$this->bga->notify->all('logTODO', 'card order ${order}', [
            'order' => json_encode(array_map(fn($card) => $card->locationArg, $this->getCardsByLocation('line'.$playerId))),
        ]);*/

        $this->saveForUndo($playerId, true, true);

        if ($this->gamestate->isPlayerActive($playerId)) {
            $this->gamestate->nextPrivateState($playerId, 'stay');
        }
    }

    function useComputer(int $playerId) {
        if ($this->getPlayer($playerId)->energy < 5) {
            throw new UserException(clienttranslate("Not enough energy"));
        }

        $this->saveUsedObject($playerId, 6);

        $left = [5, ENERGY];
        $right = [5, POINT];
        $this->giveResource($playerId, $left);
        $this->gainResource($playerId, $right, []);
        
        $this->bga->notify->all('activatedEffect', new NotificationMessage(clienttranslate('${player_name} uses object ${object} to convert ${left} to ${right}'), [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'object' => $this->getObjectName(6),
            'i18n' => ['object'],
            'player' => $this->getPlayer($playerId),
            'left' => $this->getResourcesStr([$left]),
            'right' => $this->getResourcesStr([$right]),
        ]));

        if ($this->gamestate->isPlayerActive($playerId)) {
            $this->gamestate->nextPrivateState($playerId, 'stay');
        }
    }

    private function restoreStats(int $playerId, array $stats) {
        foreach ($stats as $key => $value) {
            $this->DbQuery("UPDATE `stats` SET `stats_value` = $value WHERE `stats_player_id` = $playerId AND `stats_id` = $key");
        }
    }

    public function actCancelLastMove(int $currentPlayerId) {
        $undos = json_decode($this->getUniqueValueFromDB("SELECT `undo` FROM `player` WHERE `player_id` = $currentPlayerId"));
        if (count($undos) <= 1) {
            $this->actCancelLastMoves($currentPlayerId);
            return;
        }
        $undo = $undos[count($undos) - 1];        
        $undosJson = json_encode(array_slice($undos, 0, count($undos) - 1));
        $this->applyCancel($currentPlayerId, $undo, $undosJson, clienttranslate('${player_name} cancels their last move'));
    } 

    public function actCancelLastMoves(int $currentPlayerId) {
        $undos = json_decode($this->getUniqueValueFromDB("SELECT `undo` FROM `player` WHERE `player_id` = $currentPlayerId"));
        $undo = $undos[0];
        $undosJson = json_encode([$undo]);
        $this->applyCancel($currentPlayerId, $undo, $undosJson, clienttranslate('${player_name} cancels their last moves'));
    }  

    private function applyCancel(int $playerId, /*Undo*/ $undo, string $undosJson, string $message) {
        $line = [];
        foreach((array)$undo->lineIds as $index => $id) {
            $this->cards->moveCard($id, 'line'.$playerId, $index);
            $line[] = $this->getCardFromDb($this->cards->getCard($id));
        }

        $player = $undo->player;        
        $appliedEffectsJsonObj = json_encode($undo->appliedEffects);
        $usedObjectsJsonObj = json_encode($undo->usedObjects);

        $this->DbQuery("UPDATE `player` SET `player_flower` = $player->flowers, `player_fruit` = $player->fruits, `player_grain` = $player->grains, `player_energy` = $player->energy, `player_rage` = $player->rage, `applied_effects` = '$appliedEffectsJsonObj', `used_objects` = '$usedObjectsJsonObj', `undo` = '$undosJson' WHERE `player_id` = $playerId");
        $this->bga->playerScore->set($playerId, $player->score, null);
        $this->restoreStats($playerId, (array)$undo->stats);

        $removeLastTurn = false;
        if (boolval($this->getGameStateValue((string) LAST_TURN)) && intval($this->getUniqueValueFromDB("SELECT count(*) FROM player where `player_score` >= 80")) == 0) {
            $this->setGameStateValue((string) LAST_TURN, 0);
            $removeLastTurn = true;
        }

        $this->bga->notify->all('cancelLastMoves', new NotificationMessage($message, [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'line' => $line,
            'player' => $this->getPlayer($playerId),
            'removeLastTurn' => $removeLastTurn,
        ]));

        $this->gamestate->setPrivateState($playerId, $undo->privateStateId);
    }
}
