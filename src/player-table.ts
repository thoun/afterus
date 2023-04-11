const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;;
const log = isDebug ? console.log.bind(window.console) : function () { };

class PlayerTable {
    public playerId: number;
    public line: LineStock<Card>;

    private currentPlayer: boolean;

    constructor(private game: AfterUsGame, player: AfterUsPlayer, costs: number[]) {
        this.playerId = Number(player.id);
        this.currentPlayer = this.playerId == this.game.getPlayerId();

        let html = `
        <div id="player-table-${this.playerId}" class="player-table" style="--player-color: #${player.color};">
            <div class="background" data-color="${player.color}"></div>
            <div class="name-wrapper">${player.name}</div>
        `;
        /*if (this.currentPlayer) {
            html += `
            <div class="block-with-text hand-wrapper">
                <div class="block-label">${_('Your hand')}</div>
                <div id="player-table-${this.playerId}-hand" class="hand cards"></div>
            </div>`;
        }*/
        html += `
        <div id="player-table-${this.playerId}-line"></div>
        </div>
        `;
        dojo.place(html, document.getElementById('tables'));

        /*if (this.currentPlayer) {*/
            const handDiv = document.getElementById(`player-table-${this.playerId}-line`);
            this.line = new SlotStock<Card>(this.game.cardsManager, handDiv, {
                slotsIds: [0, 1, 2, 3],
                mapCardToSlot: card => card.locationArg,
            });
            this.line.onCardClick = (card: Card) => {
                if (handDiv.classList.contains('selectable')) {
                    this.game.onHandCardClick(card);
                    this.line.getCards().forEach(c => this.line.getCardElement(c).classList.toggle('selected', c.id == card.id));
                }
            }
            
            this.line.addCards(player.line);
        /*}*/
        
        /*this.setCosts(costs);

        for (let i=0; i<5; i++) {
            const scoreDiv = document.getElementById(`player-table-${this.playerId}-score${i}-cards`);
            this.scores[i] = new LineStock<Card>(this.game.cardsManager, scoreDiv, {
                direction: 'column',
            });
            scoreDiv.style.setProperty('--card-overlap', '125px');
            this.scores[i].addCards(player.scoresCards[i]);
        }*/
    } 
    
    public setSelectable(selectable: boolean) {
        document.getElementById(`player-table-${this.playerId}-hand`).classList.toggle('selectable', selectable);
    }

    public newRound(costs: number[]): void {
        for (let i=0; i<5; i++) {
            if (this.currentPlayer) {
                this.hand.addCards(this.scores[i].getCards());
            } else {
                this.scores[i].removeAll();
            }
        }

        this.setCosts(costs);
    }
    
    public setCosts(costs: number[]): void {
        for (let i=0; i<5; i++) {
            document.getElementById(`player-table-${this.playerId}-score${i}`).dataset.cost = ''+costs[i];
        }
    }
    
    public placeScoreCard(card: Card) {
        this.scores[card.locationArg].addCard(card);
    }
}