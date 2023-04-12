/**
 * Your game interfaces
 */

interface Card {
    id: number;
    location: string;
    locationArg: number;
    playerId: number;
    type: number; // 0: base monkey, else 1-4
    level: number; // 0: base monkey, else 1-2
    subType: number;
    number: number;
}

interface AfterUsPlayer extends Player {
    playerNo: number;
    line: Card[];
}

interface AfterUsGamedatas {
    current_player_id: string;
    decision: {decision_type: string};
    game_result_neutralized: string;
    gamestate: Gamestate;
    gamestates: { [gamestateId: number]: Gamestate };
    neutralized_player_id: string;
    notifications: {last_packet_id: string, move_nbr: string}
    playerorder: (string | number)[];
    players: { [playerId: number]: AfterUsPlayer };
    tablespeed: string;

    // Add here variables you set up in getAllDatas
    selected: Card[];
    table: Card[];
    costs: number[];
    objectives: number[];
}

interface AfterUsGame extends Game {
    cardsManager: CardsManager;

    getPlayerId(): number;
    getPlayer(playerId: number): AfterUsPlayer;
    getPlayerColor(playerId: number): string;

    setTooltip(id: string, html: string): void;
    onHandCardClick(card: Card): void;
}

interface EnteringChooseMarketCardArgs {
    canPlaceOnLine: Card[];
    canAddToLine: boolean;
    canAddToHand: boolean;
    mustClose: boolean;
    canClose: boolean;
}

interface EnteringPlayCardArgs {
    canPlaceOnLine: Card[];
    canClose: boolean;
    onlyClose: boolean;
}

interface EnteringPlayHandCardArgs {
    canPlaceOnLine: Card[];
}

// newRound
interface NotifNewRoundArgs {
    costs: number[];
}

// selectedCard
interface NotifSelectedCardArgs {
    playerId: number;
    card: Card;
    cancel: boolean;
} 

// revealCards
interface NotifRevealCardsArgs {
    cards: Card[];
}

// placeCardUnder
interface NotifPlayerCardArgs {
    card: Card;
    playerId: number;
}

interface NotifScoredCardArgs extends NotifPlayerCardArgs {
    playerScore: number;
    incScore: number;
}

interface NotifNewObjectivesArgs {
    objectives: number[];
}
