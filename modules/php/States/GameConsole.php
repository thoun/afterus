<?php
declare(strict_types=1);

namespace Bga\Games\Afterus\States;

use Bga\GameFramework\States\GameState;
use Bga\GameFramework\StateType;
use Bga\Games\Afterus\Game;
use Bga\GameFramework\States\PossibleAction;
use Bga\GameFramework\Actions\CheckAction;
use Bga\GameFramework\Actions\Types\IntParam;
use Bga\GameFramework\NotificationMessage;
use Bga\GameFramework\UserException;

class GameConsole extends GameState {
    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: ST_PRIVATE_GAME_CONSOLE,
            type: StateType::PRIVATE,
            name: 'gameConsole',
            descriptionMyTurn: clienttranslate('You can select a card to place on top of your draw pile'),
            transitions: ['stay' => ST_PRIVATE_GAME_CONSOLE],
        );
    }

    #[PossibleAction]
    public function actUseGameConsole(#[IntParam(min: 0)] int $id, int $currentPlayerId) {
        $card = $this->game->getCardFromDb($this->game->cards->getCard($id));
        $level = $card->level;
        if ($level < 1) {
            throw new UserException(clienttranslate("Invalid card"));
        }
        $cost = $level * 2 + 1;
        if ($this->game->getPlayer($currentPlayerId)->energy < $cost) {
            throw new UserException(clienttranslate("Not enough energy"));
        }

        $this->game->saveUsedObject($currentPlayerId, 4);

        $left = [$cost, ENERGY];
        $this->game->giveResource($currentPlayerId, $left);

        $locationArg = intval($this->game->getUniqueValueFromDB("SELECT max(`card_location_arg`) FROM `card` WHERE `card_location` = 'pdeck$currentPlayerId'")) + 1;
        $this->game->cards->moveCard($card->id, 'pdeck'.$currentPlayerId, $locationArg);

        $this->bga->notify->all('replaceTopDeck', new NotificationMessage(clienttranslate('${player_name} uses object ${object} to place a card on top of its draw pile'), [
            'playerId' => $currentPlayerId,
            'player_name' => $this->game->getPlayerName($currentPlayerId),
            'object' => $this->game->getObjectName(4),
            'i18n' => ['object'],
            'player' => $this->game->getPlayer($currentPlayerId),
            'card' => $card,
        ]));

        $this->game->applyCancelObject($currentPlayerId);

        $this->game->gamestate->setPlayerNonMultiactive($currentPlayerId, 'next');
    }

    #[CheckAction(false)]
    #[PossibleAction]
    public function actCancelObject(int $currentPlayerId): void {
        $this->game->actCancelObject($currentPlayerId);
    }

    public function zombie(int $playerId): void {
        $energy = $this->game->getPlayer($playerId)->energy;
        $choices = array_values(array_filter($this->game->getCardsByLocation('line'.$playerId), fn($card) =>
            $card->level >= 1 && $energy >= $card->level * 2 + 1
        ));
        if ($choices === []) {
            $this->actCancelObject($playerId);
            return;
        }
        $card = $this->getRandomZombieChoice($choices);
        $this->actUseGameConsole($card->id, $playerId);
    }
}
