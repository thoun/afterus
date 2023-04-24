class TableCenter {
    private hiddenDecks: HiddenDeck<Card>[] = [];    
    private cardCounters: Counter[] = [];    

    private objectsManager: ObjectsManager;
    private objects: LineStock<number>;

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
    }
    
    public setRemaining(deckType: number, deckCount: number) {        
        this.hiddenDecks[deckType].setCardNumber(deckCount);
        this.cardCounters[deckType].setValue(deckCount);
    }
}