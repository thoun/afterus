<?php
declare(strict_types=1);

namespace Bga\Games\Afterus\States;

use Bga\GameFramework\States\GameState;
use Bga\GameFramework\StateType;
use Bga\Games\Afterus\Game;
use Bga\Games\Afterus\Models\Card;

class NewRound extends GameState {
    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: ST_NEW_ROUND,
            type: StateType::GAME,
            name: 'newRound',
        );
    }

    public function onEnteringState(): string {
        $this->game->DbQuery("UPDATE `player` SET `applied_effects` = '[]', `used_objects` = '[]', `chosen_token` = NULL, `phase2_copied_type` = NULL, phase2_card_bought = FALSE, can_see_top_card = FALSE");

        $playersIds = $this->game->getPlayersIds();
        foreach ($playersIds as $playerId) {
            $line = [];
            for ($i = 0; $i < 4; $i++) {
                $this->game->refillPlayerDeckIfEmpty($playerId);
                $line[] = $this->game->getCardFromDb($this->game->cards->pickCardForLocation('pdeck'.$playerId, 'line'.$playerId, $i));
            }

            $this->bga->notify->all('newRound', '', [
                'playerId' => $playerId,
                'cards' => $line,
                'deckCount' => intval($this->game->cards->countCardInLocation('pdeck'.$playerId)),
                'deckTopCard' => Card::onlyId($this->game->getCardFromDb($this->game->cards->getCardOnTop('pdeck'.$playerId))),
            ]);

            $this->game->cardPickedFromDeck($playerId);
        }

        return Phase1::class;
    }
}
