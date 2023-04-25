/**
 * Your game interfaces
 */

interface Frame {
    type: number;
    left: number[][];
    right: number[][];
    convertSign: boolean;
}

interface Effect extends Frame {
    row: number;
    cardIndex: number;
    closedFrameIndex: number | null;
}

interface Card {
    id: number;
    location: string;
    locationArg: number;
    playerId: number;
    type: number; // 0: base monkey, else 1-4
    level: number; // 0: base monkey, else 1-2
    subType: number;
    number: number;
    frames: Frame[][];
    rageGain: number[];
}

interface AfterUsPlayer extends Player {
    playerNo: number;
    line: Card[];
    flowers: number;
    fruits: number;
    grains: number;
    energy: number;
    rage: number;
    chosenToken: number | null;
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
    table: { [type: number]: number };
    objects: number[];
    lastTurn: boolean;
}

interface AfterUsGame extends Game {
    cardsManager: CardsManager;

    getPlayerId(): number;
    getPlayer(playerId: number): AfterUsPlayer;
    getPlayerColor(playerId: number): string;    
    getPlayerRage(playerId: number): number;

    setTooltip(id: string, html: string): void;
    moveCard(index: number, direction: number): void;
    onFrameClicked(row: number, cardIndex: number, index: number): void;
    useRage(id: number): void;
}

interface EnteringOrderCardsArgs {
    effects: Effect[];
}

interface EnteringActivateEffectArgs {
    tamarins: number;
    effects: Effect[];
    remainingEffects: Effect[];
    appliedEffects: Effect[];
    currentEffect: Effect;
    reactivate: boolean;
    possibleEffects?: Effect[];
}

interface EnteringChoseTokenArgs {
    _private?: {
        token: number;
    };
}

interface EnteringBuyCardArgs {
    neighborTokens: number[];
    canUseNeighborToken: boolean;
    buyCardCost: { [level: number]: { [type: number]: boolean }; };
    canBuyCard: boolean;
    type: string;
}

interface EnteringApplyNeighborEffectArgs {
    gain: string;
    cost: { [type: number]: boolean };
}

// newRound
interface NotifNewRoundArgs {
    playerId: number;
    cards: Card[];
}

// switchedCards
interface NotifSwitchedCardsArgs {
    playerId: number;
    card: Card;
    otherCard: Card;
    index: number;
    otherCardIndex: number;
} 

// activatedEffect
interface NotifActivatedEffectArgs {
    playerId: number;
    player: AfterUsPlayer;
}

// selectedToken
interface NotifSelectedTokenArgs {
    playerId: number;
    token: number;
    cancel: boolean;
} 

// revealTokens
interface NotifRevealTokensArgs {
    tokens: { [playerId: number]: number };
}

// buyCard
interface NotifBuyCardArgs extends NotifActivatedEffectArgs {
    deckType: number;
    deckCount: number;
}

// endRound
interface NotifEndRoundArgs {
    playerId: number;
}

// discardedCard
interface NotifDiscardedCardArgs extends NotifActivatedEffectArgs {
    card: Card;
    line?: Card[];
}
