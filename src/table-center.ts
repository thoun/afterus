const STATE_TO_PHASE = {
    25: 11, // ST_PRIVATE_ORDER_CARDS
    26: 12, // ST_PRIVATE_ACTIVATE_EFFECT
    40: 21, // ST_MULTIPLAYER_CHOOSE_TOKEN
    //60: 21, // ST_MULTIPLAYER_PHASE2
    80: 0,
    90: 31, // ST_MULTIPLAYER_PHASE3
    95: 0, //ST_END_ROUND
};

const OBJECT_ACTIVE_PHASES = {
    1: [11],
    2: [11, 12, 21],
    3: [11],
    4: [31],
    5: [11],
    6: [11, 12, 21, 31],
    7: [21],
};

const OBJECT_MIN_COST = {
    1: 2,
    2: 1,
    3: 2,
    4: 3,
    5: 4,
    6: 5,
    7: 6,
};

class TableCenter {
    private hiddenDecks: HiddenDeck<Card>[] = [];    
    private cardCounters: Counter[] = [];    

    private objectsManager: ObjectsManager;
    private objects: LineStock<number>;
    private usedObjects: number[];

    constructor(private game: AfterUsGame, gamedatas: AfterUsGamedatas) {

        [1, 2, 3, 4].forEach(monkeyType =>
            [1, 2].forEach(level => {
                const type = monkeyType * 10 + level;
                const count = gamedatas.table[type];

                const block = document.createElement('div');
                block.classList.add('player-block');
        
                document.getElementById('center-board').insertAdjacentHTML('beforeend', `
                    <div id="hidden-deck-${type}" data-type="${monkeyType}" data-level="${level}">
                        <div id="hidden-deck-${type}-card-counter" class="card-counter" data-level="${level}"></div>
                    </div>
                `);

                this.hiddenDecks[type] = new HiddenDeck<Card>(this.game.cardsManager, document.getElementById(`hidden-deck-${type}`), {
                    cardNumber: count,
                    width: 142,
                    height: 198,
                });
                        
                this.cardCounters[type] = new ebg.counter();
                this.cardCounters[type].create(`hidden-deck-${type}-card-counter`);
                this.cardCounters[type].setValue(count);
            })
        );
        
        this.objectsManager = new ObjectsManager(this.game);
        this.objects = new LineStock<number>(this.objectsManager, document.getElementById(`objects`));
        this.objects.addCards(gamedatas.objects);
        this.objects.onCardClick = number => this.game.useObject(number);

        this.usedObjects = gamedatas.usedObjects;
        this.setUsedClass();

        const stateId = +gamedatas.gamestate.id;
        this.onEnteringState(stateId);

        if (gamedatas.players[this.game.getPlayerId()]) {
            this.setCurrentPlayerEnergy(gamedatas.players[this.game.getPlayerId()].energy);
        }
    }
    
    public setRemaining(deckType: number, deckCount: number) {        
        this.hiddenDecks[deckType].setCardNumber(deckCount);
        this.cardCounters[deckType].setValue(deckCount);
    }

    private setObjectPhase(object: number, phase: number) {
        this.objects.getCardElement(object).classList.toggle('current-phase', OBJECT_ACTIVE_PHASES[object].includes(phase));
    }
    
    public onEnteringState(stateId: number) {
        const stateToPhaseIds = Object.keys(STATE_TO_PHASE).map(val => +val);
        stateToPhaseIds.forEach((id, index) => {
            if (stateId >= id && (index == stateToPhaseIds.length - 1 || stateId < stateToPhaseIds[index + 1])) {
                this.objects.getCards().forEach(object => this.setObjectPhase(object, STATE_TO_PHASE[id]));
            }
        });
    }
    
    public setCurrentPlayerEnergy(energy: number) {
        this.objects.getCards().forEach(object => this.objects.getCardElement(object).classList.toggle('disabled', OBJECT_MIN_COST[object] > energy));
    }
    
    public addUsedObject(object: number) {
        this.usedObjects.push(object);
        this.setUsedClass();
    }
    
    public newRound() {
        this.usedObjects = [];
        this.setUsedClass();
    }

    private setUsedClass() {
        this.objects.getCards().forEach(object => this.objects.getCardElement(object).classList.toggle('used', this.usedObjects.includes(object)));
    }
}