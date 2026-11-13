<?php
declare(strict_types=1);

namespace Bga\Games\Afterus\States;

use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\GameFramework\StateType;
use Bga\Games\Afterus\Game;
use Bga\GameFramework\Actions\CheckAction;
use Bga\GameFramework\Actions\Types\IntParam;
use Bga\Games\Afterus\Models\Card;
use Bga\GameFramework\NotificationMessage;
use Bga\GameFramework\UserException;

class MobilePhone extends GameState {
    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: ST_PRIVATE_MOBILE_PHONE,
            type: StateType::PRIVATE,
            name: 'mobilePhone',
            descriptionMyTurn: clienttranslate('You can exchange a level 1 or 2 card with a new one from the main board'),
            transitions: ['stay' => ST_PRIVATE_MOBILE_PHONE],
        );
    }

    public function zombie(int $playerId): void {
        $energy = $this->game->getPlayer($playerId)->energy;
        $choices = [];
        foreach ($this->game->getCardsByLocation('line'.$playerId) as $card) {
            if ($card->level < 1 || $energy < $card->level + 1) {
                continue;
            }
            foreach ([1, 2, 3, 4] as $type) {
                // The replaced card is returned before drawing, so its own deck is always usable.
                if ($type === $card->type || (int)$this->game->cards->countCardInLocation("deck-$type-$card->level") > 0) {
                    $choices[] = [$card->id, $type];
                }
            }
        }
        if ($choices === []) {
            $this->actCancelObject($playerId);
            return;
        }
        [$id, $type] = $this->getRandomZombieChoice($choices);
        $this->actUseMobilePhone($id, $type, $playerId);
    }

    #[PossibleAction]
    public function actUseMobilePhone(
        #[IntParam(min: 0)] int $id,
        #[IntParam(name: 'type', min: 0)] int $newType,
        int $currentPlayerId
    ) {
        $oldCard = $this->game->getCardFromDb($this->game->cards->getCard($id));
        $level = $oldCard->level;
        if ($level < 1) {
            throw new UserException(clienttranslate("Invalid card"));
        }
        $cost = $level + 1;
        if ($this->game->getPlayer($currentPlayerId)->energy < $cost) {
            throw new UserException(clienttranslate("Not enough energy"));
        }

        $this->game->saveUsedObject($currentPlayerId, 1);

        $oldType = $oldCard->type;
        $left = [$cost, ENERGY];
        $this->game->giveResource($currentPlayerId, $left);

        $oldDeck = "deck-$oldType-$level";
        $this->game->DbQuery("UPDATE `card` SET `card_location_arg` = `card_location_arg` + 1 WHERE `card_location` = '$oldDeck'");
        $this->game->cards->moveCard($oldCard->id, $oldDeck, 0);
        $newDeck = "deck-$newType-$level";
        $newCard = $this->game->getCardFromDb($this->game->cards->pickCardForLocation($newDeck, 'line'.$currentPlayerId, $oldCard->locationArg));

        $table = [];
        $tableTopCards = [];
        foreach ([$oldType, $newType] as $monkeyType) {
            $table[$monkeyType * 10 + $level] = intval($this->game->cards->countCardInLocation("deck-$monkeyType-$level"));
            $tableTopCards[$monkeyType * 10 + $level] = Card::onlyId($this->game->getCardFromDb($this->game->cards->getCardOnTop("deck-$monkeyType-$level")));
        }

        $this->bga->notify->all('replaceLineCard', new NotificationMessage(clienttranslate('${player_name} uses object ${object} to permanently replace a card with a new card of same type and level from the main board'), [
            'playerId' => $currentPlayerId,
            'player_name' => $this->game->getPlayerName($currentPlayerId),
            'object' => $this->game->getObjectName(1),
            'i18n' => ['object'],
            'player' => $this->game->getPlayer($currentPlayerId),
            'oldCard' => $oldCard,
            'newCard' => $newCard,
            'table' => $table,
            'tableTopCards' => $tableTopCards,
        ]));

        $this->game->cardAddedToDeck($currentPlayerId);

        $this->game->saveForUndo($currentPlayerId, true, true);

        $this->game->applyCancelObject($currentPlayerId);
    }

    #[CheckAction(false)]
    #[PossibleAction]
    public function actCancelObject(int $currentPlayerId): void {
        $this->game->actCancelObject($currentPlayerId);
    }
}
