<?php
declare(strict_types=1);

namespace Bga\Games\Afterus\States;

use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\GameFramework\StateType;
use Bga\Games\Afterus\Game;
use Bga\GameFramework\Actions\Types\IntParam;

class ActivateEffectToken extends GameState {
    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: ST_PRIVATE_ACTIVATE_EFFECT_TOKEN,
            type: StateType::PRIVATE,
            name: 'activateEffectToken',
            descriptionMyTurn: clienttranslate('Phase 2 : ${you} can activate an effect with Reactivate token'),
            transitions: ['stay' => ST_PRIVATE_ACTIVATE_EFFECT_TOKEN],
        );
    }

    public function zombie(int $playerId, array $args): void {
        $choices = array_values($args['possibleEffects']);
        if ($choices === []) {
            $this->actSkipEffectToken($playerId);
            return;
        }
        $effect = $this->getRandomZombieChoice($choices);
        $index = $this->game->getEffectFrameIndex($effect, $args['line']);
        $this->actActivateEffectToken($effect->row, $effect->cardIndex, $index, $playerId);
    }

    public function getArgs(int $playerId): array {
        $line = $this->game->getCardsByLocation('line'.$playerId);
        $effects = $this->game->getEffects($line);
        $possibleEffects = $this->game->getPossibleEffects($playerId, $effects, $line, true);

        return [
            'line' => $line,
            'effects' => $effects,
            'possibleEffects' => $possibleEffects,
        ];
    }

    #[PossibleAction]
    public function actActivateEffectToken(
        #[IntParam(min: 0)] int $row,
        #[IntParam(min: 0)] int $cardIndex,
        #[IntParam(min: 0)] int $index,
        int $currentPlayerId
    ) {
        $args = $this->getArgs($currentPlayerId);
        $line = $args['line'];
        $appliedEffect = $this->getEffectFromClickedFrame($line, $args['possibleEffects'], $row, $cardIndex, $index);

        $this->game->applyEffect($currentPlayerId, $appliedEffect, $line);

        $this->game->notifAppliedEffect($currentPlayerId, $appliedEffect);

        $free = count($appliedEffect->left) == 0 || (count($appliedEffect->left) == 1 && in_array($appliedEffect->left[0][1], [DIFFERENT, PER_TAMARINS]));

        $this->bga->playerStats->inc('activatedEffects', 1, $currentPlayerId);
        $this->bga->playerStats->inc($free ? 'activatedEffectsFree' : 'activatedEffectsCost', 1, $currentPlayerId);
        $this->bga->playerStats->inc('activatedEffectsToken', 1, $currentPlayerId);

        $this->game->gamestate->nextPrivateState($currentPlayerId, ConfirmActivationsPhase2::class);
    }

    #[PossibleAction]
    public function actSkipEffectToken(int $currentPlayerId) {
        $this->game->gamestate->nextPrivateState($currentPlayerId, ConfirmActivationsPhase2::class);
    }

    private function getEffectFromClickedFrame(array $line, array $possibleEffects, int $row, int $cardIndex, int $index) {
        $card = \array_find($line, fn($card) => $card->locationArg === $cardIndex);
        $frame = $card->frames[$row][$index];
        if ($frame->type == OPENED_LEFT) {
            $cardIndex = $cardIndex - 1;
            $card = \array_find($line, fn($card) => $card->locationArg === $cardIndex);
            $frame = $card->frames[$row][count($card->frames[$row]) - 1];
        }

        $effect = null;
        $searchIndex = $frame->type == OPENED_RIGHT ? null : /* closed */ $index;
        $effect = \array_find($possibleEffects, fn($effect) =>
            $effect->row === $row && $effect->cardIndex === $cardIndex && $effect->closedFrameIndex === $searchIndex
        );

        return $effect;
    }
}
