<?php
declare(strict_types=1);

namespace Bga\Games\Afterus\States;

use Bga\GameFramework\States\GameState;
use Bga\GameFramework\StateType;
use Bga\Games\Afterus\Game;

class EndRound extends GameState {
    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: ST_END_ROUND,
            type: StateType::GAME,
            name: 'endRound',
            updateGameProgression: true,
        );
    }

    public function onEnteringState(): int|string {
        $this->bga->tableStats->inc('roundNumber', 1);

        $playersIds = $this->game->getPlayersIds();
        foreach ($playersIds as $playerId) {
            $this->game->giveExtraTime($playerId);
            $this->game->cards->moveAllCardsInLocation('line'.$playerId, 'discard'.$playerId);

            $this->bga->notify->all('endRound', '', [
                'playerId' => $playerId,
            ]);
        }

        $endScoreReached = $this->game->isEndScoreReached();

        return $endScoreReached ? BeforeEndGame::class : NewRound::class;
    }
}
