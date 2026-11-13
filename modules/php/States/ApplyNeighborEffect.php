<?php
declare(strict_types=1);

namespace Bga\Games\Afterus\States;

use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\GameFramework\StateType;
use Bga\Games\Afterus\Game;
use Bga\GameFramework\Actions\Types\IntParam;
use Bga\GameFramework\UserException;
use Bga\GameFramework\NotificationMessage;

class ApplyNeighborEffect extends GameState {
    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: ST_PRIVATE_APPLY_NEIGHBOR_EFFECT,
            type: StateType::PRIVATE,
            name: 'applyNeighborEffect',
            descriptionMyTurn: clienttranslate('Phase 2 : ${you} can gain ${gain}'),
            transitions: ['stay' => ST_PRIVATE_APPLY_NEIGHBOR_EFFECT],
        );
    }

    public function zombie(int $playerId, array $args): void {
        $choices = array_values(array_keys(array_filter($args['cost'])));
        if ($choices === []) {
            $this->actCancelNeighborEffect($playerId);
            return;
        }
        $this->actApplyNeighborEffect((int)$this->getRandomZombieChoice($choices), $playerId);
    }

    public function getArgs(int $playerId): array {
        $player = $this->game->getPlayer($playerId);

        $cost = [];
        for ($type = 1; $type <= 4; $type++) {
            $typeField = $this->game->getTypeField($type);
            $cost[$type] = $player->{$typeField} >= 2;
        }
        $gain = '';
        switch ($player->phase2copiedType) {
            case 1: $gain = '2 [Point]'; break;
            case 2: $gain = '2 [Energy]'; break;
            case 3: $gain = '2 [Rage]'; break;
            case 4: $gain = '[Reactivate]'; break;
        }

        return [
            'copiedType' => $player->phase2copiedType,
            'gain' => $gain,
            'cost' => $cost,
        ];
    }

    #[PossibleAction]
    public function actApplyNeighborEffect(#[IntParam(min: 0)] int $type, int $currentPlayerId) {
        $args = $this->getArgs($currentPlayerId);
        if (!$args['cost'][$type]) {
            throw new UserException(clienttranslate("You can't pay for that"));
        }

        $resource = [];
        switch ($args['copiedType']) {
            case 1: $resource = [2, POINT]; break;
            case 2: $resource = [2, ENERGY]; break;
            case 3: $resource = [2, RAGE]; break;
        }

        $reactivate = $args['copiedType'] == 4;
        if ($reactivate) {
            $this->game->saveForUndo($currentPlayerId, true, false);
        }

        $give = [2, $type];
        $this->game->giveResource($currentPlayerId, $give);
        if (!$reactivate) {
            $this->game->gainResource($currentPlayerId, $resource, []);
        }

        $message = $reactivate ?
            clienttranslate('${player_name} spends ${left} to reactivate an effect') :
            clienttranslate('${player_name} spends ${left} to gain ${right} with activated effect');

        $this->bga->notify->all('activatedEffect', new NotificationMessage($message, [
            'playerId' => $currentPlayerId,
            'player_name' => $this->game->getPlayerName($currentPlayerId),
            'player' => $this->game->getPlayer($currentPlayerId),
            'left' => $this->game->getResourcesStr([$give]),
            'right' => $reactivate ? [] : $this->game->getResourcesStr([$resource]),
        ]));

        $this->bga->playerStats->inc('activatedTokens', 1, $currentPlayerId);
        $this->bga->playerStats->inc('activatedTokens'.$args['copiedType'], 1, $currentPlayerId);

        if ($reactivate) {
            $this->game->gamestate->nextPrivateState($currentPlayerId, ActivateEffectToken::class);
            return;
        }

        $this->game->gamestate->nextPrivateState($currentPlayerId, BuyCard::class);
    }

    #[PossibleAction]
    public function actCancelNeighborEffect(int $currentPlayerId) {
        $this->game->DbQuery("UPDATE `player` SET `phase2_copied_type` = NULL WHERE `player_id` = $currentPlayerId");

        $this->game->gamestate->nextPrivateState($currentPlayerId, BuyCard::class);
    }
}
