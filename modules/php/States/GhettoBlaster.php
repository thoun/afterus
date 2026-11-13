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

class GhettoBlaster extends GameState {
    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: ST_PRIVATE_GHETTO_BLASTER,
            type: StateType::PRIVATE,
            name: 'ghettoBlaster',
            descriptionMyTurn: clienttranslate('You can replace one card by a new one from your deck'),
            transitions: ['stay' => ST_PRIVATE_GHETTO_BLASTER],
        );
    }

    public function zombie(int $playerId): void {
        $choices = $this->game->getPlayer($playerId)->energy >= 2
            ? array_values($this->game->getCardsByLocation('line'.$playerId))
            : [];
        if ($choices === []) {
            $this->actCancelObject($playerId);
            return;
        }
        $card = $this->getRandomZombieChoice($choices);
        $this->actUseGhettoBlaster($card->id, $playerId);
    }

    #[PossibleAction]
    public function actUseGhettoBlaster(#[IntParam(min: 0)] int $id, int $currentPlayerId) {
        if ($this->game->getPlayer($currentPlayerId)->energy < 2) {
            throw new UserException(clienttranslate("Not enough energy"));
        }

        $this->game->saveUsedObject($currentPlayerId, 3);

        $left = [2, ENERGY];
        $this->game->giveResource($currentPlayerId, $left);

        $currentCard = $this->game->getCardFromDb($this->game->cards->getCard($id));
        $this->game->cards->moveCard($currentCard->id, 'discard'.$currentPlayerId);
        $this->game->refillPlayerDeckIfEmpty($currentPlayerId);
        $card = $this->game->getCardFromDb($this->game->cards->pickCardForLocation('pdeck'.$currentPlayerId, 'line'.$currentPlayerId, $currentCard->locationArg));
        $this->game->cardPickedFromDeck($currentPlayerId);

        $this->bga->notify->all('replaceLineCardDeck', new NotificationMessage(clienttranslate('${player_name} uses object ${object} to replace a card with a new card from the deck'), [
            'playerId' => $currentPlayerId,
            'player_name' => $this->game->getPlayerName($currentPlayerId),
            'object' => $this->game->getObjectName(3),
            'i18n' => ['object'],
            'player' => $this->game->getPlayer($currentPlayerId),
            'oldCard' => $currentCard,
            'newCard' => $card,
            'deckCount' => intval($this->game->cards->countCardInLocation('pdeck'.$currentPlayerId)),
            'deckTopCard' => Card::onlyId($this->game->getCardFromDb($this->game->cards->getCardOnTop('pdeck'.$currentPlayerId))),
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
