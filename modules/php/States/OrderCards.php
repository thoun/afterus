<?php
declare(strict_types=1);

namespace Bga\Games\Afterus\States;

use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\GameFramework\StateType;
use Bga\Games\Afterus\Game;
use Bga\GameFramework\Actions\Types\IntParam;

class OrderCards extends GameState {
    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: ST_PRIVATE_ORDER_CARDS,
            type: StateType::PRIVATE,
            name: 'orderCards',
            descriptionMyTurn: clienttranslate('Phase 1 : ${you} must order the picked cards'),
            transitions: ['stay' => ST_PRIVATE_ORDER_CARDS],
        );
    }

    public function zombie(int $playerId, array $args): void {
        $remaining = array_values($args['line']);
        $position = 0;
        while (count($remaining) > 1) {
            $card = $this->getRandomZombieChoice($remaining);
            $line = array_values($this->game->getCardsByLocation('line'.$playerId));
            $index = \array_find_key($line, fn($candidate) => $candidate->id === $card->id);
            // Build a random order through the same adjacent moves as the player.
            while ($index > $position) {
                $this->actMoveCard($index, true, $playerId);
                $index--;
            }
            $remaining = array_values(array_filter($remaining, fn($candidate) => $candidate->id !== $card->id));
            $position++;
        }
        $this->actValidateCardOrder($playerId);
    }

    public function getArgs(int $playerId): array {
        $line = $this->game->getCardsByLocation('line'.$playerId);
        $effects = $this->game->getEffects($line);

        return [
            'line' => $line,
            'effects' => $effects,
        ];
    }

    #[PossibleAction]
    public function actMoveCard(#[IntParam(min: 0)] int $index, bool $direction, int $currentPlayerId) {
        $direction = $direction ? -1 : 1;

        $location = 'line'.$currentPlayerId;
        $line = $this->game->getCardsByLocation($location);
        $movedCards = [];

        $card = $line[$index];
        if ($index == 0 && $direction == -1) {
            $otherCards = array_slice($line, 1);

            $this->game->cards->moveCard($card->id, $location, count($otherCards));
            $card->locationArg = count($otherCards);

            foreach ($otherCards as &$otherCard) {
                $this->game->cards->moveCard($otherCard->id, $location, $otherCard->locationArg - 1);
                $otherCard->locationArg = $otherCard->locationArg - 1;
            }
            $movedCards = array_merge($otherCards, [$card]);
        } else if ($index == count($line) - 1 && $direction == 1) {
            $otherCards = array_slice($line, 0, count($line) - 1);

            $this->game->cards->moveCard($card->id, $location, 0);
            $card->locationArg = 0;

            foreach ($otherCards as &$otherCard) {
                $this->game->cards->moveCard($otherCard->id, $location, $otherCard->locationArg + 1);
                $otherCard->locationArg = $otherCard->locationArg + 1;
            }
            $movedCards = array_merge([$card], $otherCards);
        } else {
            $otherCardIndex = $index + $direction;
            if ($otherCardIndex < 0) {
                $otherCardIndex = count($line) - 1;
            } else if ($otherCardIndex >= count($line)) {
                $otherCardIndex = 0;
            }

            $otherCard = $line[$otherCardIndex];

            $this->game->cards->moveCard($card->id, $location, $otherCardIndex);
            $this->game->cards->moveCard($otherCard->id, $location, $index);
            $card->locationArg = $otherCardIndex;
            $otherCard->locationArg = $index;
            $movedCards = [$card, $otherCard];
        }

        $this->bga->notify->all('switchedCards', '', [
            'playerId' => $currentPlayerId,
            'movedCards' => $movedCards,
        ]);

        /*$this->bga->notify->all('logTODO', 'card order ${order} movedCardsOrder ${movedCardsOrder}', [
            'order' => json_encode(array_map(fn($card) => $card->locationArg, $this->game->getCardsByLocation('line'.$currentPlayerId))),
            'movedCardsOrder' => json_encode(array_map(fn($card) => $card->locationArg, $movedCards)),
        ]);*/

        $this->game->gamestate->nextPrivateState($currentPlayerId, OrderCards::class);
    }

    #[PossibleAction]
    public function actValidateCardOrder(int $currentPlayerId) {
        $remaining = $this->game->applyAutoGainEffects($currentPlayerId);

        $this->game->gamestate->nextPrivateState($currentPlayerId, $remaining ? ActivateEffect::class : ConfirmActivations::class);
    }
}
