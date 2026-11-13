<?php
declare(strict_types=1);

namespace Bga\Games\Afterus\States;

use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\GameFramework\StateType;
use Bga\Games\Afterus\Game;

class ConfirmActivationsPhase2 extends GameState {
    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: ST_PRIVATE_CONFIRM_ACTIVATIONS_PHASE2,
            type: StateType::PRIVATE,
            name: 'confirmActivationsPhase2',
            descriptionMyTurn: clienttranslate('Phase 2 : ${you} must confirm your activated effect'),
            transitions: ['stay' => ST_PRIVATE_CONFIRM_ACTIVATIONS_PHASE2],
        );
    }

    public function zombie(int $playerId): void {
        $this->actConfirmActivations($playerId);
    }

    public function getArgs(int $playerId): array {
        return $this->game->argActivateEffect($playerId);
    }

    #[PossibleAction]
    public function actCancelLastMoves(int $currentPlayerId): void {
        $this->game->actCancelLastMoves($currentPlayerId);
    }

    #[PossibleAction]
    public function actConfirmActivations(int $currentPlayerId) {
        $stateId = $this->game->gamestate->getCurrentMainStateId();

        // TODO TEMP until fixing how a player can be here without a chosen token
        if ($stateId == ST_MULTIPLAYER_TOKEN_SELECT_REACTIVATE) {
            $player = $this->game->getPlayer($currentPlayerId);
            if ($player->chosenToken === null) {
                $undos = json_decode($this->game->getUniqueValueFromDB("SELECT `undo` FROM `player` WHERE `player_id` = $currentPlayerId"));
                $undo = \array_find($undos, fn($u) => $u->player->chosenToken !== null);
                $this->game->setPlayerSelectedToken($currentPlayerId, $undo->player->chosenToken);
            }
        }

        if ($stateId == ST_MULTIPLAYER_PHASE2) {
            $this->game->gamestate->nextPrivateState($currentPlayerId, BuyCard::class);
        } else {
            $this->game->gamestate->setPlayerNonMultiactive($currentPlayerId, Phase2::class);
        }
    }
}
