const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;;
const log = isDebug ? console.log.bind(window.console) : function () { };

class CardLine extends SlotStock<Card> {
    public switchCards(switchedCards: Card[]) {
        switchedCards.forEach(card => {
            this.addCard(card);
            this.cards.find(c => c.id == card.id).locationArg = card.locationArg;
            (this.getCardElement(card).querySelector('.front') as HTMLElement).dataset.index = ''+card.locationArg;
        });
    }
}

class PlayerTable {
    public playerId: number;
    public line: CardLine;

    private currentPlayer: boolean;

    constructor(private game: AfterUsGame, player: AfterUsPlayer) {
        this.playerId = Number(player.id);
        this.currentPlayer = this.playerId == this.game.getPlayerId();

        let html = `
        <div id="player-table-${this.playerId}" class="player-table" style="--player-color: #${player.color};">
            <div class="background" data-color="${player.color}">
                <div class="name-wrapper">${player.name}</div>
            </div>
            
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

        const handDiv = document.getElementById(`player-table-${this.playerId}-line`);
        this.line = new CardLine(this.game.cardsManager, handDiv, {
            gap: '0',
            slotsIds: [0, 1, 2, 3],
            mapCardToSlot: card => card.locationArg,
        });
           
        if (this.currentPlayer) {
            /*this.line.onCardClick = (card: Card) => {
                if (handDiv.classList.contains('selectable')) {
                    this.game.onHandCardClick(card);
                    this.line.getCards().forEach(c => this.line.getCardElement(c).classList.toggle('selected', c.id == card.id));
                }
            }
            */
            handDiv.querySelectorAll('[data-slot-id]').forEach((slot, index) => {
                slot.insertAdjacentHTML('afterbegin', `
                    <button id="move-left-${index}" class="move left"></button>
                    <button id="move-right-${index}" class="move right"></button>
                `);

                document.getElementById(`move-left-${index}`).addEventListener('click', () => this.game.moveCard(index, -1));
                document.getElementById(`move-right-${index}`).addEventListener('click', () => this.game.moveCard(index, 1));
            });
            
            this.line.addCards(player.line);
        }
    }

    public setMovable(movable: boolean) {
        document.getElementById(`player-table-${this.playerId}`).classList.toggle('move-phase', movable);
    }
    
    public switchCards(switchedCards: Card[]) {
        this.line.switchCards(switchedCards);
    }

    private getFrames(effect: Effect) {
        const fromClosedFrame = effect.closedFrameIndex !== null && effect.closedFrameIndex !== undefined;
        const lineCards = this.line.getCards();
        const card = lineCards.find(card => card.locationArg == effect.cardIndex);

        const frames = [this.line.getCardElement(card).querySelector(`.frame[data-row="${effect.row}"][data-index="${fromClosedFrame ? effect.closedFrameIndex : card.frames[effect.row].length - 1}"]`)];
        if (!fromClosedFrame) {
            const rightCard = lineCards.find(card => card.locationArg == effect.cardIndex + 1);
            frames.push(this.line.getCardElement(rightCard).querySelector(`.frame[data-row="${effect.row}"][data-index="0"]`));
        }

        return frames;
    }

    private setEffectClass(effect: Effect, frameClass: string) {
        this.getFrames(effect).forEach(frame => frame.classList.add(frameClass));
    }
    
    public setActivableEffect(currentEffect: Effect, appliedEffects: Effect[], remainingEffects: Effect[]) {
        appliedEffects.forEach(effect => this.setEffectClass(effect, 'applied'));
        remainingEffects.forEach(effect => this.setEffectClass(effect, 'remaining'));
        this.setEffectClass(currentEffect, 'current');
    }
    
    public removeActivableEffect() {
        const line = document.getElementById(`player-table-${this.playerId}-line`);
        ['current', 'applied', 'remaining'].forEach(frameClass => line.querySelectorAll('.frame.'+frameClass).forEach(element => element.classList.remove(frameClass)));
    }
}