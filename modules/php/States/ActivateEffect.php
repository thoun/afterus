<?php
declare(strict_types=1);

namespace Bga\Games\Afterus\States;

use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\GameFramework\StateType;
use Bga\Games\Afterus\Game;
use Bga\GameFramework\Actions\Types\IntParam;
use Bga\GameFramework\UserException;

class ActivateEffect extends GameState {
    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: ST_PRIVATE_ACTIVATE_EFFECT,
            type: StateType::PRIVATE,
            name: 'activateEffect',
            descriptionMyTurn: clienttranslate('Phase 1 : ${you} can activate an effect'),
            transitions: ['stay' => ST_PRIVATE_ACTIVATE_EFFECT, 'next' => ST_PRIVATE_CONFIRM_ACTIVATIONS],
        );
    }

    public function zombie(int $playerId, array $args): void {
        if ($args['currentEffect'] === null) {
            $this->game->gamestate->nextPrivateState($playerId, ConfirmActivations::class);
            return;
        }
        if (!$args['reactivate']) {
            $this->actActivateEffect($playerId);
            return;
        }
        $choices = array_values(array_filter($args['possibleEffects'], fn($effect) =>
            $effect->row !== $args['currentEffect']->row ||
            $effect->cardIndex !== $args['currentEffect']->cardIndex ||
            $effect->closedFrameIndex !== $args['currentEffect']->closedFrameIndex
        ));
        if ($choices === []) {
            $this->actSkipEffect($playerId);
            return;
        }
        $effect = $this->getRandomZombieChoice($choices);
        $index = $this->game->getEffectFrameIndex($effect, $args['line']);
        $this->actActivateEffect($playerId, $effect->row, $effect->cardIndex, $index);
    }

    public function getArgs(int $playerId): array {
        return $this->game->argActivateEffect($playerId);
    }

    #[PossibleAction]
    public function actActivateEffect(
        int $currentPlayerId,
        #[IntParam(min: 0)] ?int $row = null,
        #[IntParam(min: 0)] ?int $cardIndex = null,
        #[IntParam(min: 0)] ?int $index = null
    ) {
        $this->game->saveForUndo($currentPlayerId, false, false);

        $args = $this->getArgs($currentPlayerId);
        $currentEffect = $args['currentEffect'];
        $line = $args['line'];
        $appliedEffect = $currentEffect;

        if ($args['reactivate']) {


            $location = 'line'.$currentPlayerId;
            $card = $this->game->getCardByLocation($location, $cardIndex);
            $frame = $card->frames[$row][$index];
            if ($frame->type == OPENED_LEFT) {
                $cardIndex = $cardIndex - 1;
                $card = $this->game->getCardByLocation($location, $cardIndex);
                $frame = $card->frames[$row][count($card->frames[$row]) - 1];
            }

            $rowEffects = array_filter($args['possibleEffects'], fn($effect) => $effect->row === $row && $effect->cardIndex === $cardIndex);
            $closedFrameIndex = $frame->type == CLOSED ? $index : null;

            if ($currentEffect->row === $row && $currentEffect->cardIndex === $cardIndex && $currentEffect->closedFrameIndex === $closedFrameIndex) {
                throw new UserException(clienttranslate('You must click on another frame to activate it, not the current frame'));
            }

            $appliedEffect = \array_find($rowEffects, fn($effect) => $effect->closedFrameIndex === $closedFrameIndex);

            foreach($currentEffect->left as $resource) {
                $this->game->giveResource($currentPlayerId, $resource);
            }
        }

        if (!$appliedEffect) {
            throw new UserException(clienttranslate('Unknown effect, please report a bug'));
        }

        $this->game->applyActivateEffect($currentPlayerId, $appliedEffect, $currentEffect, $line);

        $remaining = $this->game->applyAutoGainEffects($currentPlayerId);

        $this->game->gamestate->nextPrivateState($currentPlayerId, $remaining ? ActivateEffect::class : ConfirmActivations::class);
    }

    #[PossibleAction]
    public function actSkipEffect(int $currentPlayerId) {
        $this->game->saveForUndo($currentPlayerId, false, false);

        $args = $this->getArgs($currentPlayerId);
        $effect = $args['currentEffect'];

        $this->game->markedPlayedEffect($currentPlayerId, $effect);
        $this->bga->playerStats->inc('skippedEffects', 1, $currentPlayerId);

        // TODO notif ?

        $remaining = $this->game->applyAutoGainEffects($currentPlayerId);

        $this->game->gamestate->nextPrivateState($currentPlayerId, $remaining ? ActivateEffect::class : ConfirmActivations::class);
    }

    #[PossibleAction]
    public function actCancelLastMove(int $currentPlayerId): void {
        $this->game->actCancelLastMove($currentPlayerId);
    }

    #[PossibleAction]
    public function actCancelLastMoves(int $currentPlayerId): void {
        $this->game->actCancelLastMoves($currentPlayerId);
    }
}
