<?php
declare(strict_types=1);

namespace Bga\Games\Afterus\States;

use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\GameFramework\Actions\CheckAction;
use Bga\GameFramework\StateType;
use Bga\Games\Afterus\Game;
use Bga\GameFramework\Actions\Types\IntParam;
use Bga\GameFramework\UserException;

class Moped extends GameState {
    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: ST_PRIVATE_MOPED,
            type: StateType::PRIVATE,
            name: 'moped',
            descriptionMyTurn: clienttranslate('You can attract an ape of your choice'),
            transitions: ['stay' => ST_PRIVATE_MOPED],
        );
    }

    #[CheckAction(false)]
    #[PossibleAction]
    public function actUseMoped(#[IntParam(min: 0)] int $type, #[IntParam(min: 0)] int $level, int $currentPlayerId) {
        $cost = $level == 2 ? 9 : 6;
        if ($this->game->getPlayer($currentPlayerId)->energy < $cost) {
            throw new UserException(clienttranslate("Not enough energy"));
        }

        $this->game->saveUsedObject($currentPlayerId, 7);

        $this->game->takeCard($currentPlayerId, $level, $type, [$cost, ENERGY]);

        $this->game->saveForUndo($currentPlayerId, true, true);

        $this->game->applyCancelObject($currentPlayerId);
    }

    #[CheckAction(false)]
    #[PossibleAction]
    public function actCancelObject(int $currentPlayerId): void {
        $this->game->actCancelObject($currentPlayerId);
    }

    public function zombie(int $playerId): void {
        $energy = $this->game->getPlayer($playerId)->energy;
        $choices = [];
        foreach ([1 => 6, 2 => 9] as $level => $cost) {
            if ($energy < $cost) {
                continue;
            }
            foreach ([1, 2, 3, 4] as $type) {
                if ((int)$this->game->cards->countCardInLocation("deck-$type-$level") > 0) {
                    $choices[] = [$type, $level];
                }
            }
        }
        if ($choices === []) {
            $this->actCancelObject($playerId);
            return;
        }
        [$type, $level] = $this->getRandomZombieChoice($choices);
        $this->actUseMoped($type, $level, $playerId);
    }
}
