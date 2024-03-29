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
    deckCount: number;
    discardCount: number;
    deckTopCard?: Card;
    discardTopCard?: Card;
    visibleTopCard?: Card;
    fullDeck?: Card[];
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
    tableTopCard: { [type: number]: Card };
    objects: number[];
    usedObjects?: number[];
    lastTurn: boolean;
}

interface AfterUsGame extends Game {
    cardsManager: CardsManager;
    animationManager: AnimationManager;

    getPlayerId(): number;
    getPlayer(playerId: number): AfterUsPlayer;
    getPlayerColor(playerId: number): string;    
    getCurrentPlayerEnergy(): number;
    getPlayerRage(playerId: number): number;

    setButtonActivation(id: string, type: string, min: number): void;
    setTooltip(id: string, html: string): void;
    moveCard(index: number, direction: number): void;
    onFrameClicked(row: number, cardIndex: number, index: number): void;
    useRage(id: number): void;
    useObject(number: number): void;
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
    undoCount: number;
}

interface EnteringChoseTokenArgs {
    _private?: {
        token: number;
    };
}

interface EnteringBuyCardArgs {
    neighborTokens: { [type: number]: number[] /* playersIds */ };
    canUseNeighborToken: boolean;
    buyCardCost: { [level: number]: { [type: number]: boolean }; };
    canBuyCard: boolean;
    type: string;
    canUseGameConsole: boolean;
}

interface EnteringApplyNeighborEffectArgs {
    gain: string;
    cost: { [type: number]: boolean };
}

interface EnteringEndScoreArgs {
    fullDecks: { [playerId: number]: Card[] };
}

// newRound
interface NotifNewRoundArgs {
    playerId: number;
    cards: Card[];
    deckCount: number;
    deckTopCard?: Card;
}

// switchedCards
interface NotifSwitchedCardsArgs {
    playerId: number;
    movedCards: Card[];
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
    deckTopCard?: Card;
    card?: Card;
}

// endRound
interface NotifEndRoundArgs {
    playerId: number;
}

// useObject
interface NotifUseObjectArgs {
    object: number;
}

// discardedCard
interface NotifRemovedCardArgs extends NotifActivatedEffectArgs {
    card: Card;
    line?: Card[];
}

// addCardToLine
interface NotifAddCardToLineArgs extends NotifActivatedEffectArgs {
    card: Card;
    line: Card[];
    deckCount: number;
    deckTopCard?: Card;
}

// replaceLineCard
interface NotifReplaceLineCardArgs extends NotifActivatedEffectArgs {
    oldCard: Card;
    newCard: Card;
    table: { [type: number]: number };
    tableTopCards: { [type: number]: Card };
}

// replaceLineCardDeck
interface NotifReplaceLineCardDeckArgs extends NotifReplaceLineCardArgs {
    deckCount: number;
    deckTopCard?: Card;
}

// replaceTopDeck
interface NotifReplaceTopDeckArgs extends NotifActivatedEffectArgs {
    card: Card;
}

// refillDeck
interface NotifRefillDeckArgs {
    playerId: number;
    deckCount: number;
}

// cancelLastMoves
interface NotifCancelLastMovesArgs extends NotifActivatedEffectArgs {
    line: Card[];
    removeLastTurn: boolean;
}

// deckTopCard
interface NotifDeckTopCardArgs {
    playerId: number;
    card: Card;
}
