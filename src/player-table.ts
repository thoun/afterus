const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;;
const log = isDebug ? console.log.bind(window.console) : function () { };

class CardLine extends SlotStock<Card> {
    public switchCards(switchedCards: Card[]) {
        const removedCards = this.getCards().filter(card => switchedCards.some(c => c.id == card.id));
        const origins = removedCards.map(card => this.getCardElement(card).parentElement);

        if (origins.length == switchedCards.length) {
            removedCards.forEach(card => this.removeCard(card));
            switchedCards.forEach((card, index) => {
                this.addCard(card, {
                    fromElement: origins[index],
                });
                this.cards.find(c => c.id == card.id).locationArg = card.locationArg;
                (this.getCardElement(card).querySelector('.front') as HTMLElement).dataset.index = ''+card.locationArg;
            });
        }
    }
}

class PlayerTable {
    public playerId: number;
    private line: CardLine;

    private currentPlayer: boolean;

    constructor(private game: AfterUsGame, player: AfterUsPlayer) {
        this.playerId = Number(player.id);
        this.currentPlayer = this.playerId == this.game.getPlayerId();

        let html = `
        <div id="player-table-${this.playerId}" class="player-table" style="--player-color: #${player.color};">
            <div class="background" data-color="${player.color}">
                <div class="name-wrapper">${player.name}</div>
                <div id="player-table-${this.playerId}-action-token" class="action-token" data-color="${player.color}"></div>
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
        }
            
        this.newRound(player.line);
        this.setSelectedToken(player.chosenToken);
    }

    private onDiscardCardClick(card: Card) {
        const pref = Number((this.game as any).prefs[202]?.value);
        if (pref == 3 || (pref == 2 && card.type == 0)) {
            this.game.useRage(card.id);
        } else {
            (this.game as any).confirmationDialog(
                _("Are you sure you want to discard this card ?"), 
                () => this.game.useRage(card.id)
            );
        }
    }
    
    public newRound(cards: Card[]) {            
        this.line.addCards(cards);
        cards.forEach(card => {
            const div = this.line.getCardElement(card);
            const button = document.createElement('button');
            button.id = `rage-button-${card.id}`;
            button.classList.add('rage-button', 'bgabutton', 'bgabutton_blue');
            button.dataset.playerId = ''+this.playerId;
            button.innerHTML = formatTextIcons('[Rage]');
            div.appendChild(button);
            button.addEventListener('click', () => this.onDiscardCardClick(card));
            this.game.setButtonActivation(button.id, 'rage', 4);
            this.game.setTooltip(button.id, formatTextIcons(_('Discard this card (${cost}) to gain ${gain}').replace('${cost}', '4 [Rage]')).replace('${gain}', getResourcesQuantityIcons([card.rageGain])));
        });
        this.updateVisibleMoveButtons();
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

    private markRemainingFramesDisabled() {
        const line = document.getElementById(`player-table-${this.playerId}-line`);
        line.querySelectorAll('.frame').forEach(element => {
            if (!['selectable', 'current', 'applied', 'remaining'].some(frameClass => element.classList.contains(frameClass))) {
                element.classList.add('disabled');
            }
        });
    }
    
    public setActivableEffect(currentEffect: Effect, appliedEffects: Effect[], remainingEffects: Effect[], reactivate: boolean, possibleEffects: Effect[]) {
        if (currentEffect) {
            this.setEffectClass(currentEffect, 'current');
        }
        if (reactivate) {
            this.setActivableEffectToken(possibleEffects);
        } else {
            appliedEffects.forEach(effect => this.setEffectClass(effect, 'applied'));
            remainingEffects.forEach(effect => this.setEffectClass(effect, 'remaining'));
            this.markRemainingFramesDisabled();
        }
    }

    public setActivableEffectToken(possibleEffects: Effect[], className = 'selectable') {
        possibleEffects.forEach(effect => this.setEffectClass(effect, className));
        this.markRemainingFramesDisabled();
    }
    
    public removeActivableEffect() {
        const line = document.getElementById(`player-table-${this.playerId}-line`);
        ['selectable', 'disabled', 'current', 'applied', 'remaining'].forEach(frameClass => line.querySelectorAll('.frame.'+frameClass).forEach(element => element.classList.remove(frameClass)));
    }
    
    public setSelectedToken(type: number | null) {
        document.getElementById(`player-table-${this.playerId}-action-token`).dataset.type = type === null ? 'null' : ''+type;
    }
    
    public endRound() {
        this.setSelectedToken(null);
        this.line.removeAll();
    }
    
    public discardCard(card: Card, line?: Card[]) {
        if (line) {
            this.line.removeAll();
            this.newRound(line);
        } else {
            this.line.removeCard(card);
        }

        this.updateVisibleMoveButtons();
        
    }

    private updateVisibleMoveButtons() {
        const cards = this.line.getCards();

        const slots =  document.getElementById(`player-table-${this.playerId}`).querySelectorAll(`.slot`);
        slots.forEach((slot: HTMLElement) => {
            const slotId = +slot.dataset.slotId;
            const hasCard = cards.some(card => card.locationArg == slotId);
            slot.querySelectorAll('button.move').forEach(btn => btn.classList.toggle('hidden', !hasCard));
        });
    }
}