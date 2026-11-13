<?php
declare(strict_types=1);

namespace Bga\Games\Afterus\States;

use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\GameFramework\Actions\CheckAction;
use Bga\GameFramework\Actions\Types\IntParam;
use Bga\GameFramework\StateType;
use Bga\Games\Afterus\Game;

class ChooseToken extends GameState {
    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: ST_MULTIPLAYER_CHOOSE_TOKEN,
            type: StateType::MULTIPLE_ACTIVE_PLAYER,
            name: 'chooseToken',
            description: clienttranslate('Phase 2 : Waiting for other players'),
            initialPrivate: PrivateChooseToken::class,
            transitions: ['next' => RevealTokens::class],
        );
    }

    public function onEnteringState(): void {
        $this->game->gamestate->setAllPlayersMultiactive();
        $this->game->gamestate->initializePrivateStateForAllActivePlayers();
    }

    public function getArgs(): array {
        $playersIds = $this->game->getPlayersIds();

        $private = [];

        foreach($playersIds as $playerId) {
            $private[$playerId] = [
                'token' => $this->game->getPlayer($playerId)->chosenToken,
            ];
        }

        return [
            '_private' => $private,
        ];
    }

    #[CheckAction(false)]
    #[PossibleAction]
    public function actChooseToken(#[IntParam(min: 0)] int $type, int $currentPlayerId): void {
        (new PrivateChooseToken($this->game))->actChooseToken($type, $currentPlayerId);
    }

    #[CheckAction(false)]
    #[PossibleAction]
    public function actCancelChooseToken(int $currentPlayerId) {
        $this->game->setPlayerSelectedToken($currentPlayerId, null);

        $this->game->gamestate->setPlayersMultiactive([$currentPlayerId], RevealTokens::class, false);
        $this->game->gamestate->initializePrivateState($currentPlayerId);
    }

    public function zombie(int $playerId): void {}
}
