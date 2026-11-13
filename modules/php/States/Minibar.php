<?php
declare(strict_types=1);

namespace Bga\Games\Afterus\States;

use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\GameFramework\StateType;
use Bga\Games\Afterus\Game;
use Bga\GameFramework\Actions\CheckAction;
use Bga\GameFramework\Actions\Types\IntParam;
use Bga\GameFramework\NotificationMessage;
use Bga\GameFramework\UserException;

class Minibar extends GameState {
    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: ST_PRIVATE_MINIBAR,
            type: StateType::PRIVATE,
            name: 'minibar',
            descriptionMyTurn: clienttranslate('You can exchange resources'),
            transitions: ['stay' => ST_PRIVATE_MINIBAR],
        );
    }

    public function zombie(int $playerId): void {
        $player = $this->game->getPlayer($playerId);
        $choices = [];
        foreach ([FLOWER => $player->flowers, FRUIT => $player->fruits, GRAIN => $player->grains, ENERGY => $player->energy] as $left => $quantity) {
            if ($quantity < 1 || $player->energy < ($left === ENERGY ? 2 : 1)) {
                continue;
            }
            foreach ([FLOWER, FRUIT, GRAIN, ENERGY] as $right) {
                if ($left !== $right) {
                    $choices[] = [$left, $right];
                }
            }
        }
        if ($choices === []) {
            $this->actCancelObject($playerId);
            return;
        }
        [$left, $right] = $this->getRandomZombieChoice($choices);
        $this->actUseMinibar($left, $right, $playerId);
    }

    #[PossibleAction]
    public function actUseMinibar(#[IntParam(min: 0)] int $left, #[IntParam(min: 0)] int $right, int $currentPlayerId) {
        $player = $this->game->getPlayer($currentPlayerId);

        if ($player->energy < ($left == ENERGY ? 2 : 1)) {
            throw new UserException(clienttranslate("Not enough energy"));
        }
        if ($left != ENERGY) {
            switch ($left) {
                case FLOWER:
                    if ($player->flowers < 1) {
                        throw new UserException(clienttranslate("Not enough flowers"));
                    }
                    break;
                case FRUIT:
                    if ($player->fruits < 1) {
                        throw new UserException(clienttranslate("Not enough fruits"));
                    }
                    break;
                case GRAIN:
                    if ($player->grains < 1) {
                        throw new UserException(clienttranslate("Not enough grains"));
                    }
                    break;
            }
        }

        $this->game->saveUsedObject($currentPlayerId, 2);

        if ($left == ENERGY) {
            $this->game->giveResource($currentPlayerId, [2, ENERGY]);
        } else {
            $this->game->giveResource($currentPlayerId, [1, ENERGY]);
            $this->game->giveResource($currentPlayerId, [1, $left]);
        }
        $this->game->gainResource($currentPlayerId, [1, $right], []);

        $this->bga->notify->all('activatedEffect', new NotificationMessage(clienttranslate('${player_name} uses object ${object} to convert ${left} to ${right}'), [
            'playerId' => $currentPlayerId,
            'player_name' => $this->game->getPlayerName($currentPlayerId),
            'object' => $this->game->getObjectName(2),
            'i18n' => ['object'],
            'player' => $this->game->getPlayer($currentPlayerId),
            'left' => $this->game->getResourcesStr([[1, $left]]),
            'right' => $this->game->getResourcesStr([[1, $right]]),
        ]));

        $this->game->applyCancelObject($currentPlayerId);

        $privateState = $this->game->getPlayerPrivateState($currentPlayerId);
        if ($privateState == ST_PRIVATE_CONFIRM_ACTIVATIONS && $this->game->argActivateEffect($currentPlayerId)['currentEffect'] != null) {
            $this->game->gamestate->nextPrivateState($currentPlayerId, ActivateEffect::class);
        }
    }

    #[CheckAction(false)]
    #[PossibleAction]
    public function actCancelObject(int $currentPlayerId): void {
        $this->game->actCancelObject($currentPlayerId);
    }
}
