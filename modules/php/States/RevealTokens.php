<?php
declare(strict_types=1);

namespace Bga\Games\Afterus\States;

use Bga\GameFramework\States\GameState;
use Bga\GameFramework\StateType;
use Bga\Games\Afterus\Game;
use Bga\GameFramework\NotificationMessage;

class RevealTokens extends GameState {
    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: ST_REVEAL_TOKENS,
            type: StateType::GAME,
            name: 'revealTokens',
            description: clienttranslate('Revealing chosen tokens...'),
            transitions: [
                'reactivate' => TokenSelectReactivate::class,
                'next' => Phase2::class,
            ],
        );
    }

    public function onEnteringState(): void {
        $tokens = [];
        $playersIds = $this->game->getPlayersIds();
        $playersIdsWithReactivate = [];

        foreach ($playersIds as $playerId) {
            $this->game->giveExtraTime($playerId);
            $token = $this->game->getPlayer($playerId)->chosenToken;
            $tokens[$playerId] = $token;

            $resource = null;

            switch ($token) {
                case 1: $resource = [2, POINT]; break;
                case 2: $resource = [2, ENERGY]; break;
                case 3: $resource = [2, RAGE]; break;
            }

            if ($resource == null) {
                $playersIdsWithReactivate[] = $playerId;
            } else {
                $this->game->gainResource($playerId, $resource, []);

                $this->bga->notify->all('activatedEffect', new NotificationMessage(clienttranslate('${player_name} gains ${resources} with chosen token'), [
                    'playerId' => $playerId,
                    'player_name' => $this->game->getPlayerName($playerId),
                    'player' => $this->game->getPlayer($playerId),
                    'resources' => $this->game->getResourcesStr([$resource]),
                ]));
            }

            $this->bga->playerStats->inc('activatedTokens', 1, $playerId);
            $this->bga->playerStats->inc('activatedTokens'.$token, 1, $playerId);
        }

        $this->bga->notify->all('revealTokens', '', [
            'tokens' => $tokens,
        ]);

        if (count($playersIdsWithReactivate) > 0) {
            $this->game->gamestate->setPlayersMultiactive($playersIdsWithReactivate, 'next', true);
        }
        $this->game->gamestate->nextState(count($playersIdsWithReactivate) > 0 ? 'reactivate' : 'next');

        foreach ($playersIdsWithReactivate as $playerId) {
            $this->game->saveForUndo($playerId, true, false);
        }
    }
}
