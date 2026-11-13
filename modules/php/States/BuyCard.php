<?php
declare(strict_types=1);

namespace Bga\Games\Afterus\States;

use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\GameFramework\StateType;
use Bga\Games\Afterus\Game;
use Bga\GameFramework\Actions\Types\IntParam;
use Bga\GameFramework\UserException;

class BuyCard extends GameState {
    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: ST_PRIVATE_BUY_CARD,
            type: StateType::PRIVATE,
            name: 'buyCard',
            descriptionMyTurn: clienttranslate('Phase 2 : ${you} can buy a ${type} card'),
            transitions: ['stay' => ST_PRIVATE_BUY_CARD],
        );
    }

    public function zombie(int $playerId, array $args): void {
        $choices = [];
        if ($args['canBuyCard']) {
            foreach ($args['buyCardCost'] as $level => $costs) {
                if ((int)$this->game->cards->countCardInLocation('deck-'.$args['token'].'-'.$level) === 0) {
                    continue;
                }
                foreach ($costs as $type => $canPay) {
                    if ($canPay) {
                        $choices[] = ['buy', (int)$level, (int)$type];
                    }
                }
            }
        }
        $player = $this->game->getPlayer($playerId);
        $canPayNeighbor = max($player->flowers, $player->fruits, $player->grains, $player->energy) >= 2;
        if ($args['canUseNeighborToken'] && $canPayNeighbor) {
            foreach (array_keys($args['neighborTokens']) as $type) {
                if (in_array((int)$type, [1, 2, 3, 4], true)) {
                    $choices[] = ['neighbor', (int)$type];
                }
            }
        }
        if ($choices === []) {
            $this->actEndTurn($playerId);
            return;
        }
        $choice = $this->getRandomZombieChoice($choices);
        if ($choice[0] === 'buy') {
            $this->actBuyCard($choice[1], $choice[2], $playerId);
        } else {
            $this->actNeighborEffect($choice[1], $playerId);
        }
    }

    public function getArgs(int $playerId): array {
        $player = $this->game->getPlayer($playerId);

        $canUseNeighborToken = !$player->phase2copiedType;
        $canBuyCard = !$player->phase2cardBought;

        $neighborTokens = [];
        if ($canUseNeighborToken) {
            $leftNeighbor = $this->game->getPlayerAfter($playerId);
            $rightNeighbor = $this->game->getPlayerBefore($playerId);

            $leftToken = $this->game->getPlayer($leftNeighbor)->chosenToken;
            $neighborTokens[$leftToken] = [$leftNeighbor];
            if ($leftNeighbor != $rightNeighbor) {
                $rightToken = $this->game->getPlayer($rightNeighbor)->chosenToken;
                if ($rightToken == $leftToken) {
                    $neighborTokens[$leftToken][] = $rightNeighbor;
                } else {
                    $neighborTokens[$rightToken] = [$rightNeighbor];
                }
            }
        }

        $token = $player->chosenToken;
        $buyCardCost = [];

        for ($level = 1; $level <= 2; $level++) {
            $buyCardCost[$level] = [];

            for ($type = 1; $type <= 3; $type++) {
                if ($type == $token || $token == 4) {
                    $typeField = $this->game->getTypeField($type);

                    $buyCardCost[$level][$type] = $player->{$typeField} >= 3 * $level;
                }
            }
        }

        $canUseGameConsole = false;
        if (in_array(4, $this->game->getGlobalVariable(OBJECTS, true) ?? [])) {
            $line = $this->game->getCardsByLocation('line'.$playerId);
            $canUseGameConsole = \array_any($line, fn($card) => $card->level > 0);
        }

        return [
            'token' => $token,
            'neighborTokens' => $neighborTokens,
            'canUseNeighborToken' => $canUseNeighborToken,
            'buyCardCost' => $buyCardCost,
            'canBuyCard' => $canBuyCard,
            'canUseGameConsole' => $canUseGameConsole,
            'type' => $token != null ? $this->game->getMonkeyType($token) : null, // for logs
            'i18n' => ['type'],
        ];
    }

    #[PossibleAction]
    public function actBuyCard(#[IntParam(min: 0)] int $level, #[IntParam(min: 0)] int $type, int $currentPlayerId) {
        $args = $this->getArgs($currentPlayerId);
        if (!$args['buyCardCost'][$level][$type]) {
            throw new UserException(clienttranslate("You can't pay for that"));
        }

        $this->game->DbQuery("UPDATE `player` SET `phase2_card_bought` = TRUE WHERE `player_id` = $currentPlayerId");
        $this->game->takeCard($currentPlayerId, $level, $args['token'], [3 * $level, $type]);

        $this->bga->playerStats->inc('cardsBought'.$level, 1, $currentPlayerId);

        $this->game->gamestate->nextPrivateState($currentPlayerId, BuyCard::class);
    }

    #[PossibleAction]
    public function actNeighborEffect(#[IntParam(min: 0)] int $type, int $currentPlayerId) {
        $args = $this->getArgs($currentPlayerId);
        if (!in_array($type, array_keys($args['neighborTokens']))) {
            throw new UserException(clienttranslate("You can't copy this token"));
        }

        $this->game->DbQuery("UPDATE `player` SET `phase2_copied_type` = '$type' WHERE `player_id` = $currentPlayerId");

        $this->game->gamestate->nextPrivateState($currentPlayerId, ApplyNeighborEffect::class);
    }

    #[PossibleAction]
    public function actEndTurn(int $currentPlayerId) {
        $destination = $this->game->gamestate->getCurrentMainStateId() === ST_MULTIPLAYER_TOKEN_SELECT_REACTIVATE
            ? Phase2::class
            : EndRound::class;
        $this->game->gamestate->setPlayerNonMultiactive($currentPlayerId, $destination);
    }
}
