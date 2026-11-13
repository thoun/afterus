<?php
declare(strict_types=1);

namespace Bga\Games\Afterus\States;

use Bga\GameFramework\States\GameState;
use Bga\GameFramework\StateType;
use Bga\Games\Afterus\Game;

class Phase2 extends GameState {
    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: ST_MULTIPLAYER_PHASE2,
            type: StateType::MULTIPLE_ACTIVE_PLAYER,
            name: 'phase2',
            description: clienttranslate('Phase 2 : Waiting for other players'),
            initialPrivate: BuyCard::class,
            transitions: ['next' => EndRound::class],
        );
    }

    public function onEnteringState(): void {
        $this->game->gamestate->setAllPlayersMultiactive();
        $this->game->gamestate->initializePrivateStateForAllActivePlayers();
    }

    public function zombie(int $playerId): void {}
}
