<?php
declare(strict_types=1);

namespace Bga\Games\Afterus\States;

use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\GameFramework\StateType;
use Bga\Games\Afterus\Game;

class ConfirmActivations extends GameState {
    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: ST_PRIVATE_CONFIRM_ACTIVATIONS,
            type: StateType::PRIVATE,
            name: 'confirmActivations',
            descriptionMyTurn: clienttranslate('Phase 1 : ${you} must confirm your turn'),
            transitions: ['stay' => ST_PRIVATE_CONFIRM_ACTIVATIONS, 'back' => ST_PRIVATE_ACTIVATE_EFFECT],
        );
    }

    public function zombie(int $playerId): void {
        $this->actConfirmActivations($playerId);
    }

    public function getArgs(int $playerId): array {
        return $this->game->argActivateEffect($playerId);
    }

    #[PossibleAction]
    public function actCancelLastMove(int $currentPlayerId): void {
        $this->game->actCancelLastMove($currentPlayerId);
    }

    #[PossibleAction]
    public function actCancelLastMoves(int $currentPlayerId): void {
        $this->game->actCancelLastMoves($currentPlayerId);
    }

    #[PossibleAction]
    public function actConfirmActivations(int $currentPlayerId): void {
        $this->game->gamestate->setPlayerNonMultiactive($currentPlayerId, EndPhase1::class);
    }
}
