<?php
declare(strict_types=1);

namespace Bga\Games\Afterus\States;

use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\GameFramework\StateType;
use Bga\Games\Afterus\Game;

class TokenSelectReactivate extends GameState {
    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: ST_MULTIPLAYER_TOKEN_SELECT_REACTIVATE,
            type: StateType::MULTIPLE_ACTIVE_PLAYER,
            name: 'tokenSelectReactivate',
            description: clienttranslate('Phase 2 : Waiting for other players'),
            initialPrivate: ActivateEffectToken::class,
            transitions: ['next' => Phase2::class],
        );
    }

    public function onEnteringState(): void {
        $this->game->gamestate->initializePrivateStateForAllActivePlayers();
    }

    public function zombie(int $playerId): void {}
}
