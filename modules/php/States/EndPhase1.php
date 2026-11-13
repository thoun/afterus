<?php
declare(strict_types=1);

namespace Bga\Games\Afterus\States;

use Bga\GameFramework\States\GameState;
use Bga\GameFramework\StateType;
use Bga\Games\Afterus\Game;

class EndPhase1 extends GameState {
    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: ST_END_PHASE1,
            type: StateType::GAME,
            name: 'endPhase1',
            updateGameProgression: true,
        );
    }

    public function onEnteringState(): int|string {
        $playersIds = $this->game->getPlayersIds();
        foreach ($playersIds as $playerId) {
            $this->game->giveExtraTime($playerId);
        }

        $endScoreReached = $this->game->isEndScoreReached();

        if ($endScoreReached) {
            return BeforeEndGame::class;
        } else {
            return ChooseToken::class;
        }
    }
}
