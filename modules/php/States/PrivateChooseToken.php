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

class PrivateChooseToken extends GameState {
    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: ST_PRIVATE_CHOOSE_TOKEN,
            type: StateType::PRIVATE,
            name: 'privateChooseToken',
            descriptionMyTurn: clienttranslate('Phase 2 : ${you} must choose a token'),
            transitions: ['stay' => ST_PRIVATE_CHOOSE_TOKEN],
        );
    }

    public function getArgs(int $playerId): array {
        return [
            '_private' => [
                $playerId => ['token' => $this->game->getPlayer($playerId)->chosenToken],
            ],
        ];
    }

    #[CheckAction(false)]
    #[PossibleAction]
    public function actChooseToken(#[IntParam(min: 0)] int $type, int $currentPlayerId) {
        if (!in_array($type, [1,2,3,4])) {
            throw new UserException(clienttranslate("Invalid token choice"));
        }

        if ($this->game->getPlayerSelectedToken($currentPlayerId) !== null) {
            $this->game->setPlayerSelectedToken($currentPlayerId, null);
        }

        $this->game->setPlayerSelectedToken($currentPlayerId, $type);

        $this->game->gamestate->setPlayerNonMultiactive($currentPlayerId, RevealTokens::class);
    }

    public function zombie(int $playerId): void {
        $this->actChooseToken($this->getRandomZombieChoice([1, 2, 3, 4]), $playerId);
    }
}
