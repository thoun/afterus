<?php
declare(strict_types=1);

namespace Bga\Games\Afterus\States;

use Bga\GameFramework\States\GameState;
use Bga\GameFramework\StateType;
use Bga\Games\Afterus\Game;
use Bga\GameFramework\States\PossibleAction;

class PrivateBeforeEndGame extends GameState {
    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: ST_PRIVATE_BEFORE_END_GAME,
            type: StateType::PRIVATE,
            name: 'privateBeforeEndGame',
            descriptionMyTurn: clienttranslate('End game : ${you} can use remaining rage'),
            transitions: ['stay' => ST_PRIVATE_BEFORE_END_GAME],
        );
    }

    #[PossibleAction]
    public function actEndGame(int $currentPlayerId): void {
        $this->game->gamestate->setPlayerNonMultiactive($currentPlayerId, EndScore::class);
    }

    public function zombie(int $playerId): void {
        $line = $this->game->getCardsByLocation('line'.$playerId);
        $totalCards = count($line)
            + (int)$this->game->cards->countCardInLocation('pdeck'.$playerId)
            + (int)$this->game->cards->countCardInLocation('discard'.$playerId);
        if ($this->game->getPlayer($playerId)->rage >= 4 && $totalCards > 4 && $line !== []) {
            $card = $this->getRandomZombieChoice(array_values($line));
            $this->game->actUseRage($card->id, $playerId);
            return;
        }
        $this->actEndGame($playerId);
    }
}
