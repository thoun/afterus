<?php
declare(strict_types=1);

namespace Bga\Games\Afterus\States;

use Bga\GameFramework\States\GameState;
use Bga\GameFramework\StateType;
use Bga\Games\Afterus\Game;

class BeforeEndGame extends GameState {
    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: ST_MULTIPLAYER_BEFORE_END_GAME,
            type: StateType::MULTIPLE_ACTIVE_PLAYER,
            name: 'beforeEndGame',
            description: clienttranslate('End game : Waiting for other players'),
            initialPrivate: PrivateBeforeEndGame::class,
            transitions: ['next' => EndScore::class],
        );
    }

    public function onEnteringState(): void {
        $playersIds = $this->game->getPlayersIds();
        $playersWithRage = [];
        foreach ($playersIds as $playerId) {
            if ($this->game->getPlayer($playerId)->rage >= 4 && count($this->game->getCardsByLocation('line'.$playerId)) > 0) {
                $playersWithRage[] = $playerId;
            }
        }

        if (count($playersWithRage) > 0) {
            $this->game->gamestate->setPlayersMultiactive($playersWithRage, EndScore::class, true);
            $this->game->gamestate->initializePrivateStateForAllActivePlayers();
        } else {
            $this->game->gamestate->nextState('next');
        }
    }

    public function zombie(int $playerId): void {}
}
