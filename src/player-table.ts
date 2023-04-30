const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;;
const log = isDebug ? console.log.bind(window.console) : function () { };

class CardLine extends SlotStock<Card> {
    constructor(protected manager: CardManager<Card>, protected element: HTMLElement, settings: SlotStockSettings<Card>, private game: AfterUsGame, protected currentPlayer: boolean) {
        super(manager, element, settings);
        if (this.currentPlayer) {
            this.createSlotButtons();
        }
    }

    public getSlotsIds() {
        return this.slotsIds;
    }

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

    private createSlotButtons() {
        this.element.querySelectorAll('[data-slot-id]').forEach((slot, index) => {
            if (slot.querySelectorAll('button.move').length == 0) {
                slot.insertAdjacentHTML('afterbegin', `
                    <button id="move-left-${index}" class="move left"></button>
                    <button id="move-right-${index}" class="move right"></button>
                `);

                document.getElementById(`move-left-${index}`).addEventListener('click', () => this.game.moveCard(index, -1));
                document.getElementById(`move-right-${index}`).addEventListener('click', () => this.game.moveCard(index, 1));
            }
        });
    }

    protected createSlot(slotId: SlotId) {
        super.createSlot(slotId);
           
        if (this.currentPlayer) {
            this.createSlotButtons();
        }
    }
}

class PlayerTable {
    public playerId: number;
    private deck: HiddenDeck<Card>;
    private deckCounter: Counter;
    private line: CardLine;
    private discard: HiddenDeck<Card>;
    private discardCounter: Counter;

    private currentPlayer: boolean;

    constructor(private game: AfterUsGame, player: AfterUsPlayer) {
        this.playerId = Number(player.id);
        this.currentPlayer = this.playerId == this.game.getPlayerId();

        let html = `
        <div id="player-table-${this.playerId}" class="player-table ${this.currentPlayer ? 'current-player' : ''}" style="--player-color: #${player.color};">
            <div class="decks">
                <div id="player-table-${this.playerId}-deck" class="deck-stock">
                    <div id="player-table-${this.playerId}-deck-counter" class="deck-counter"></div>
                    ${this.currentPlayer ? `<div id="player-table-${this.playerId}-see-top-card" class="see-top-card" data-visible="false">${_("See top card")}</div>` : ''}
                </div>
                <div class="name-and-tokens">
                    <div class="name-wrapper">${player.name}</div>
                    <div id="player-table-${this.playerId}-tokens" class="tokens"></div>
                </div>
                <div id="player-table-${this.playerId}-discard" class="discard-stock">
                    <div id="player-table-${this.playerId}-discard-counter" class="deck-counter"></div>
                </div>
            </div>
            <div id="player-table-${this.playerId}-line"></div>        
        </div>
        `;
        dojo.place(html, document.getElementById(this.currentPlayer ? 'current-player-table' : 'tables'));

        this.line = new CardLine(this.game.cardsManager, document.getElementById(`player-table-${this.playerId}-line`), {
            wrap: 'nowrap',
            gap: '0',
            slotsIds: Array.from(Array(Math.max(...player.line.map(card => card.locationArg)) + 1).keys()),
            mapCardToSlot: card => card.locationArg
        }, game, this.currentPlayer);
            
        this.newRound(player.line, false);

        html = `
        <div id="player-table-${this.playerId}-tokens-unplayed" class="tokens-unplayed tokens-column">`;
        for (let i = 1; i <= 4; i++) {
            html += `<div class="action-token" ${i == 4 ? `id="player-table-${this.playerId}-action-token"` : ''} data-color="${player.color}" data-type="0"></div>`;
        }
        html += `</div>
        <div id="player-table-${this.playerId}-tokens-played" class="tokens-played tokens-column"></div>
        `;

        
        dojo.place(html, document.getElementById(`player-table-${this.playerId}-tokens`));
    

        this.setSelectedToken(player.chosenToken);

        this.deck = new HiddenDeck<Card>(this.game.cardsManager, document.getElementById(`player-table-${this.playerId}-deck`), {
            cardNumber: player.deckCount,
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            autoUpdateCardNumber: false,
        });
        this.deckCounter = new ebg.counter();
        this.deckCounter.create(`player-table-${this.playerId}-deck-counter`);
        this.deckCounter.setValue(player.deckCount);

        this.discard = new HiddenDeck<Card>(this.game.cardsManager, document.getElementById(`player-table-${this.playerId}-discard`), {
            cardNumber: player.discardCount,
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            autoUpdateCardNumber: false,
        });
        this.discardCounter = new ebg.counter();
        this.discardCounter.create(`player-table-${this.playerId}-discard-counter`);
        this.discardCounter.setValue(player.discardCount);

        this.deckTopCard(player.topCard);
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

    private addRageButton(card: Card) {
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
    }
    
    public newRound(cards: Card[], fromDeck: boolean) {         
        this.line.removeAll();
        this.line.setSlotsIds(Array.from(Array(Math.max(...cards.map(card => card.locationArg)) + 1).keys()));

        if (fromDeck) {
            this.deck.addCards(cards);
        }
        this.line.addCards(cards);
        cards.forEach(card => this.addRageButton(card));
        this.updateVisibleMoveButtons();
        if (fromDeck) {
            this.setDeckCount(this.deckCounter.getValue() - cards.length);
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
        const token = document.getElementById(`player-table-${this.playerId}-action-token`);
        const destination = document.getElementById(`player-table-${this.playerId}-tokens-${type === null ? 'un' : ''}played`);
        if (token.parentElement != destination) {
            this.game.animationManager.attachWithSlideAnimation(token, destination);
        }
        token.dataset.type = type === null ? '0' : ''+type;
    }
    
    public endRound() {
        this.setSelectedToken(null);
        const cards = this.line.getCards();
        this.discard.addCards(cards);
        this.setDiscardCount(this.discardCounter.getValue() + cards.length);
    }
    
    public discardCard(card: Card, line?: Card[]) {
        this.discard.addCard(card);
        this.setDiscardCount(this.discardCounter.getValue() + 1);

        if (line) {
            this.line.removeAll();
            this.newRound(line, false);
        } else {
            this.line.removeCard(card);
        }

        this.updateVisibleMoveButtons();
        
    }

    public addCardToLine(card: Card, line: Card[]) {
        this.deck.addCard(card);
        /*if (card.locationArg > this.line.getSlotsIds().length) {
            this.line.setSlotsIds() = new CardLine(this.game.cardsManager, handDiv, {
                gap: '0',
                slotsIds: [0, 1, 2, 3],
                mapCardToSlot: card => card.locationArg,
            });
        }*/
        this.newRound(line, false);
        this.setDeckCount(this.deckCounter.getValue() - 1);
    }
    
    public replaceLineCard(card: Card) {
        this.line.addCard(card);
    }

    public replaceTopDeck(card: Card) {
        this.deck.addCard(card);
        this.setDeckCount(this.deckCounter.getValue() + 1);
    }

    private updateVisibleMoveButtons() {
        const cards = this.line.getCards();

        const slots = document.getElementById(`player-table-${this.playerId}`).querySelectorAll(`.slot`);
        slots.forEach((slot: HTMLElement) => {
            const slotId = +slot.dataset.slotId;
            const hasCard = cards.some(card => card.locationArg == slotId);
            slot.querySelectorAll('button.move').forEach(btn => btn.classList.toggle('hidden', !hasCard));
        });
    }
    
    public addButtonsOnCards(getLabel: (card: Card) => string, onClick: (card: any) => void, minLevel: number = 0) {
        document.getElementById(`player-table-${this.playerId}-line`).querySelectorAll('[data-slot-id]').forEach((slot, index) => {
            const card = this.line.getCards().find(card => card.locationArg == index);
            if (card && card.level >= minLevel) {
                slot.insertAdjacentHTML('afterbegin', `
                    <button id="use-object-on-card-${index}" class="remove bgabutton bgabutton_blue">${getLabel(card)}</button>
                `);

                document.getElementById(`use-object-on-card-${index}`).addEventListener('click', () => onClick(this.line.getCards().find(card => card.locationArg == index)));
            }
        });
    }
    
    public removeButtonsOnCards() {
        const slots = document.getElementById(`player-table-${this.playerId}`).querySelectorAll(`.slot`);
        slots.forEach(slot => slot.querySelectorAll('button.remove').forEach(btn => btn.remove()));
    }

    private setDeckCount(count: number) {
        this.deck.setCardNumber(count);
        this.deckCounter.toValue(count);

    }

    private setDiscardCount(count: number) {
        this.discard.setCardNumber(count);
        this.discardCounter.toValue(count);
    }

    public refillDeck(deckCount: number) {
        this.setDeckCount(deckCount);
        this.setDiscardCount(0);
    }
    
    public addCardToDeck(card: Card) {
        this.deck.addCard(card);
        this.setDeckCount(this.deckCounter.getValue() + 1);
    }

    public setLine(line: Card[]) {
        this.line.removeAll();
        this.line.addCards(line);
    }
    
    public deckTopCard(card: Card | null) {
        let html = undefined;
        if (card && this.currentPlayer) {
            html = `<div>${_("Card on top of your deck:")}</div>
            <div id="card-deck-top" data-side="front" class="card">
                <div class="card-sides">
                    <div class="card-side front" data-level="${card.level}" data-type="${card.type}" data-sub-type="${card.subType}" data-player-color="${this.game.getPlayerColor(this.playerId)}"></div>
                </div>
            </div>`;
        }

        if (this.currentPlayer) {
            const seeTopCardId = `player-table-${this.playerId}-see-top-card`;
            document.getElementById(seeTopCardId).dataset.visible = Boolean(html).toString();
            if (html) {
                this.game.setTooltip(seeTopCardId, html);
            } else {
                (this.game as any).removeTooltip(seeTopCardId);
            }
        }
    }
}