<?php
declare(strict_types=1);

namespace Bga\Games\Afterus\States;

use Bga\GameFramework\States\GameState;
use Bga\GameFramework\StateType;
use Bga\Games\Afterus\Game;

class EndScore extends GameState {
    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: ST_END_SCORE,
            type: StateType::GAME,
            name: 'endScore',
        );
    }

    public function onEnteringState(): int {
        $playersIds = $this->game->getPlayersIds();

        foreach($playersIds as $playerId) {
            $this->bga->playerStats->set('finalCardCount', count($this->game->getFullDeck($playerId)), $playerId);
        }

        return ST_END_GAME;
    }

    public function getArgs(): array {
        $playersIds = $this->game->getPlayersIds();

        $fullDecks = [];
        foreach($playersIds as $playerId) {
            $fullDecks[$playerId] = $this->game->getFullDeck($playerId);
        }

        return [
            'fullDecks' => $fullDecks,
        ];
    }
}
