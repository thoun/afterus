<?php
declare(strict_types=1);

namespace Bga\Games\Afterus\States;

use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\GameFramework\StateType;
use Bga\Games\Afterus\Game;

class Phase1 extends GameState {
    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: ST_MULTIPLAYER_PHASE1,
            type: StateType::MULTIPLE_ACTIVE_PLAYER,
            name: 'phase1',
            description: clienttranslate('Phase 1 : Players must order their cards and activate effects'),
            initialPrivate: OrderCards::class,
            transitions: ['next' => EndPhase1::class],
        );
    }

    public function onEnteringState(): void {
        $this->game->gamestate->setAllPlayersMultiactive();
        $this->game->gamestate->initializePrivateStateForAllActivePlayers();

        $playersIds = $this->game->getPlayersIds();
        foreach ($playersIds as $playerId) {
            $this->game->saveForUndo($playerId, true, false);
        }
    }

    public function zombie(int $playerId): void {}

    #[PossibleAction]
    public function actCancelLastMoves(int $currentPlayerId): void {
        $this->game->actCancelLastMoves($currentPlayerId);
    }
}
