declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;

const ANIMATION_MS = 500;
const ACTION_TIMER_DURATION = 5;

const LOCAL_STORAGE_ZOOM_KEY = 'AfterUs-zoom';

const POINT = 5;
const RAGE = 6;
const DIFFERENT = 7;
const PER_TAMARINS = 8;

function formatTextIcons(rawText: string) {
    if (!rawText) {
        return '';
    }
    return rawText
        .replace(/\[Flower\]/ig, '<div class="icon flower"></div>')
        .replace(/\[Fruit\]/ig, '<div class="icon fruit"></div>')
        .replace(/\[Grain\]/ig, '<div class="icon grain"></div>')
        .replace(/\[Energy\]/ig, '<div class="icon energy"></div>')
        .replace(/\[Point\]/ig, '<div class="icon point"></div>')
        .replace(/\[Rage\]/ig, '<div class="icon rage"></div>')
        .replace(/\[Different\]/ig, '<div class="icon different"></div>')
        .replace(/\[Tamarin\]/ig, '<div class="icon tamarin"></div>')
        .replace(/\[Reactivate\]/ig, '<div class="icon reactivate"></div>');
}

function getResourceCode(resource: number) {
    switch (resource) {

        case 1: return '[Flower]';
        case 2: return '[Fruit]';
        case 3: return '[Grain]';
        case 4: return '[Energy]';
        case 5: return '[Point]';
        case 6: return '[Rage]';
        case 7: return '[Different]';
        case 8: return '/ [Tamarin]';
        case 10: return '[Reactivate]';
    }        
}

function getResourcesQuantityIcons(resources: number[][]) {
    return formatTextIcons(resources.map(resource => `${resource[0]} ${getResourceCode(resource[1])}`).join(' '));
}

class AfterUs implements AfterUsGame {
    public cardsManager: CardsManager;

    private zoomManager: ZoomManager;
    private animationManager: AnimationManager;
    private gamedatas: AfterUsGamedatas;
    private tableCenter: TableCenter;
    private playersTables: PlayerTable[] = [];
    private flowerCounters: Counter[] = [];
    private fruitCounters: Counter[] = [];
    private grainCounters: Counter[] = [];
    private energyCounters: Counter[] = [];
    private rageCounters: Counter[] = [];
    
    private TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;

    constructor() {
    }
    
    /*
        setup:

        This method must set up the game user interface according to current game situation specified
        in parameters.

        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)

        "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
    */

    public setup(gamedatas: AfterUsGamedatas) {
        log( "Starting game setup" );
        
        this.gamedatas = gamedatas;

        log('gamedatas', gamedatas);

        this.cardsManager = new CardsManager(this);
        this.animationManager = new AnimationManager(this);
        this.tableCenter = new TableCenter(this, gamedatas);
        this.createPlayerPanels(gamedatas); 
        this.createPlayerTables(gamedatas);
        
        this.zoomManager = new ZoomManager({
            element: document.getElementById('table'),
            smooth: false,
            zoomControls: {
                color: 'white',
            },
            localStorageZoomKey: LOCAL_STORAGE_ZOOM_KEY,
        });

        if (gamedatas.lastTurn) {
            this.notif_lastTurn(false);
        }

        this.setupNotifications();
        this.setupPreferences();

        log( "Ending game setup" );
    }

    ///////////////////////////////////////////////////
    //// Game & client states

    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    public onEnteringState(stateName: string, args: any) {
        log('Entering state: ' + stateName, args.args);

        switch (stateName) {
            case 'orderCards':
                const playerTable = this.getCurrentPlayerTable();
                playerTable.setMovable(true);
                playerTable.setActivableEffectToken(args.args.effects, 'remaining');
                break;
            case 'activateEffect':
            case 'confirmActivations':
                const activateEffectArgs = args.args as EnteringActivateEffectArgs;
                this.getCurrentPlayerTable().setActivableEffect(activateEffectArgs.currentEffect, activateEffectArgs.appliedEffects, activateEffectArgs.remainingEffects, activateEffectArgs.reactivate, activateEffectArgs.possibleEffects);
                break;
            case 'activateEffectToken':
                const activateEffectTokenArgs = args.args as EnteringActivateEffectArgs;
                this.getCurrentPlayerTable().setActivableEffectToken(activateEffectTokenArgs.possibleEffects);
                break;
        }
    }

    public onLeavingState(stateName: string) {
        log( 'Leaving state: '+stateName );

        switch (stateName) {
           case 'orderCards':
                const playerTable = this.getCurrentPlayerTable();
                playerTable.setMovable(false);
                playerTable.removeActivableEffect();
                break;
            case 'activateEffect':
            case 'activateEffectToken':
                this.getCurrentPlayerTable().removeActivableEffect();
                break;
        }
    }

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    public onUpdateActionButtons(stateName: string, args: any) {
        if (stateName === 'chooseToken') {
            if (!(this as any).isCurrentPlayerActive() && Object.keys(this.gamedatas.players).includes(''+this.getPlayerId())) { // ignore spectators
                (this as any).addActionButton(`cancelChooseToken-button`, _("I changed my mind"), () => this.cancelChooseToken(), null, null, 'gray');
            }
        }

        switch (stateName) {
            case 'orderCards':
                (this as any).addActionButton(`validateCardOrder-button`, _("Validate card order"), () => this.validateCardOrder());
                break;
            case 'activateEffect':
                const activateEffectArgs = args as EnteringActivateEffectArgs;
                const currentEffect = activateEffectArgs.currentEffect;
                if (currentEffect && !activateEffectArgs.reactivate) {
                    if (currentEffect.left.length == 1) {
                        if (currentEffect.left[0][1] == DIFFERENT) {
                            currentEffect.left = [];
                            currentEffect.convertSign = false;
                        } else if (currentEffect.left[0][1] == PER_TAMARINS) {
                            currentEffect.left[0][0] *= activateEffectArgs.tamarins;
                            currentEffect.left[0][1] = POINT;
                        }
                    } else if (currentEffect.left.length == 0) {
                        currentEffect.convertSign = false;
                    }

                    let label;
                    if (!currentEffect.convertSign) {
                        label = _("Gain ${resources}").replace('${resources}', getResourcesQuantityIcons(currentEffect.left.concat(currentEffect.right)));
                    } else {
                        label = _("Spend ${left} to gain ${right}").replace('${left}', getResourcesQuantityIcons(currentEffect.left)).replace('${right}', getResourcesQuantityIcons(currentEffect.right));
                    }
                    (this as any).addActionButton(`activateEffect-button`, label, () => this.activateEffect());
                }
                (this as any).addActionButton(`skipEffect-button`, _("Skip"), () => this.skipEffect());
                break;
            case 'confirmActivations':
                (this as any).addActionButton(`confirmActivations-button`, _("Confirm"), () => this.confirmActivations());
                break;
            case 'chooseToken':
                [1, 2, 3, 4].forEach(type => 
                    (this as any).addActionButton(`chooseToken${type}-button`, `<div class="action-token" data-type="${type}"></div>`, () => this.chooseToken(type))
                );
                break;
            case 'buyCard':
                const buyCardArgs = args as EnteringBuyCardArgs;
                if (buyCardArgs.canUseNeighborToken) {
                    buyCardArgs.neighborTokens.forEach(type => {
                        const label = _("Use effect of ${type}").replace('${type}', `<div class="action-token" data-type="${type}"></div>`);
                        (this as any).addActionButton(`neighborEffect${type}-button`, label, () => this.neighborEffect(type), null, null, 'gray');
                    });
                }

                if (buyCardArgs.canBuyCard) {
                    Object.entries(buyCardArgs.buyCardCost).forEach(buyCardCostForLevel => {
                        const level = +buyCardCostForLevel[0];
                        Object.entries(buyCardCostForLevel[1]).forEach(cardCost => {
                            const type = +cardCost[0];
                            const canBuy = cardCost[1];
                            const label = _("Buy level ${level} ${type} with ${cost} ${resource}")
                                .replace('${level}', `${level}`)
                                .replace('${type}', _(buyCardArgs.type))
                                .replace('${cost}', `${level * 3}`)
                                .replace('${resource}', formatTextIcons(getResourceCode(type)));
                            (this as any).addActionButton(`buyCard${level}-${type}-button`, label, () => this.buyCard(level, type));
                            if (!canBuy) {
                                document.getElementById(`buyCard${level}-${type}-button`).classList.add('disabled');
                            }
                        });
                    });
                }

                (this as any).addActionButton(`endTurn-button`, _("End turn"), () => this.endTurn(), null, null, 'red');
                break;
            case 'applyNeighborEffect':
                const applyNeighborEffectArgs = args as EnteringApplyNeighborEffectArgs;
                Object.entries(applyNeighborEffectArgs.cost).forEach(cardCost => {
                    const type = +cardCost[0];
                    const canBuy = cardCost[1];
                    const label = _("Spend ${left} to gain ${right}")
                        .replace('${left}', getResourcesQuantityIcons([[2, type]]))
                        .replace('${right}', formatTextIcons(applyNeighborEffectArgs.gain));
                    (this as any).addActionButton(`applyNeighborEffect-${type}-button`, label, () => this.applyNeighborEffect(type));
                    if (!canBuy) {
                        document.getElementById(`applyNeighborEffect-${type}-button`).classList.add('disabled');
                    }
                });
                (this as any).addActionButton(`cancelNeighborEffect-button`, _("Cancel"), () => this.cancelNeighborEffect(), null, null, 'gray');
                break;
        }
    }

    ///////////////////////////////////////////////////
    //// Utility methods


    ///////////////////////////////////////////////////

    public setTooltip(id: string, html: string) {
        (this as any).addTooltipHtml(id, html, this.TOOLTIP_DELAY);
    }
    public setTooltipToClass(className: string, html: string) {
        (this as any).addTooltipHtmlToClass(className, html, this.TOOLTIP_DELAY);
    }

    public getPlayerId(): number {
        return Number((this as any).player_id);
    }

    public getPlayer(playerId: number): AfterUsPlayer {
        return Object.values(this.gamedatas.players).find(player => Number(player.id) == playerId);
    }

    public getPlayerColor(playerId: number): string {
        return this.gamedatas.players[playerId].color;
    }

    public getPlayerRage(playerId: number): number {
        return this.rageCounters[playerId].getValue();
    }

    private getPlayerTable(playerId: number): PlayerTable {
        return this.playersTables.find(playerTable => playerTable.playerId === playerId);
    }

    private getCurrentPlayerTable(): PlayerTable | null {
        return this.playersTables.find(playerTable => playerTable.playerId === this.getPlayerId());
    }

    private setupPreferences() {
        // Extract the ID and value from the UI control
        const onchange = (e) => {
          var match = e.target.id.match(/^preference_[cf]ontrol_(\d+)$/);
          if (!match) {
            return;
          }
          var prefId = +match[1];
          var prefValue = +e.target.value;
          (this as any).prefs[prefId].value = prefValue;
          this.onPreferenceChange(prefId, prefValue);
        }
        
        // Call onPreferenceChange() when any value changes
        dojo.query(".preference_control").connect("onchange", onchange);
        
        // Call onPreferenceChange() now
        dojo.forEach(
          dojo.query("#ingame_menu_content .preference_control"),
          el => onchange({ target: el })
        );
    }
      
    private onPreferenceChange(prefId: number, prefValue: number) {
        switch (prefId) {
            case 201: 
                this.setAutoGain(prefValue == 1);
                break;
        }
    }

    private getOrderedPlayers(gamedatas: AfterUsGamedatas) {
        const players = Object.values(gamedatas.players).sort((a, b) => a.playerNo - b.playerNo);
        const playerIndex = players.findIndex(player => Number(player.id) === Number((this as any).player_id));
        const orderedPlayers = playerIndex > 0 ? [...players.slice(playerIndex), ...players.slice(0, playerIndex)] : players;
        return orderedPlayers;
    }

    private createPlayerPanels(gamedatas: AfterUsGamedatas) {

        const players = Object.values(gamedatas.players);
        players.forEach((player, index) => {
            const playerId = Number(player.id);  

            let html = `
            <div class="counters">
                <div id="flower-counter-wrapper-${player.id}" class="counter">
                    <div class="icon flower"></div> 
                    <span id="flower-counter-${player.id}"></span>
                </div>
                <div id="fruit-counter-wrapper-${player.id}" class="counter">
                    <div class="icon fruit"></div> 
                    <span id="fruit-counter-${player.id}"></span>
                </div>
                <div id="grain-counter-wrapper-${player.id}" class="counter">
                    <div class="icon grain"></div> 
                    <span id="grain-counter-${player.id}"></span>
                </div>
                <div id="energy-counter-wrapper-${player.id}" class="counter">
                    <div class="icon energy"></div> 
                    <span id="energy-counter-${player.id}"></span>
                </div>
            </div>
            <div class="counters">
                <div id="rage-counter-wrapper-${player.id}" class="counter">
                    <div class="icon rage"></div> 
                    <span id="rage-counter-${player.id}"></span>
                </div>
            </div>`;
            dojo.place(html, `player_board_${player.id}`);

            (this as any).addTooltipHtml(`flower-counter-wrapper-${player.id}`, _("Flowers"));
            (this as any).addTooltipHtml(`fruit-counter-wrapper-${player.id}`, _("Fruits"));
            (this as any).addTooltipHtml(`grain-counter-wrapper-${player.id}`, _("Grains"));
            (this as any).addTooltipHtml(`energy-counter-wrapper-${player.id}`, _("Energy"));
            (this as any).addTooltipHtml(`rage-counter-wrapper-${player.id}`, _("Rage"));

            const flowerCounter = new ebg.counter();
            flowerCounter.create(`flower-counter-${player.id}`);
            flowerCounter.setValue(player.flowers);
            this.flowerCounters[playerId] = flowerCounter;

            const fruitCounter = new ebg.counter();
            fruitCounter.create(`fruit-counter-${player.id}`);
            fruitCounter.setValue(player.fruits);
            this.fruitCounters[playerId] = fruitCounter;

            const grainCounter = new ebg.counter();
            grainCounter.create(`grain-counter-${player.id}`);
            grainCounter.setValue(player.grains);
            this.grainCounters[playerId] = grainCounter;

            const energyCounter = new ebg.counter();
            energyCounter.create(`energy-counter-${player.id}`);
            energyCounter.setValue(player.energy);
            this.energyCounters[playerId] = energyCounter;

            const rageCounter = new ebg.counter();
            rageCounter.create(`rage-counter-${player.id}`);
            rageCounter.setValue(player.rage);
            this.rageCounters[playerId] = rageCounter;

            if (players.length > 2) {
                const leftPlayer = players[index == players.length - 1 ? 0 : index + 1];
                const rightPlayer = players[index == 0 ? players.length - 1 : index - 1];
                let html = `
                <div class="neighbors">
                    <div id="neighbor-left-${player.id}">
                        🡄 <span style="color: #${leftPlayer.color};">${leftPlayer.name}</span>
                    </div>
                    <div id="neighbor-right-${player.id}">
                        <span style="color: #${rightPlayer.color};">${rightPlayer.name}</span> 🡆
                    </div>
                </div>`;
                dojo.place(html, `player_board_${player.id}`);
                (this as any).addTooltipHtml(`neighbor-left-${player.id}`, _("Left neighbor"));
                (this as any).addTooltipHtml(`neighbor-right-${player.id}`, _("Right neighbor"));
            }
        });
    }

    private createPlayerTables(gamedatas: AfterUsGamedatas) {
        const orderedPlayers = this.getOrderedPlayers(gamedatas);

        orderedPlayers.forEach(player => 
            this.createPlayerTable(gamedatas, Number(player.id))
        );
    }

    private createPlayerTable(gamedatas: AfterUsGamedatas, playerId: number) {
        const table = new PlayerTable(this, gamedatas.players[playerId]);
        this.playersTables.push(table);
    }

    private setScore(playerId: number, score: number) {
        (this as any).scoreCtrl[playerId]?.toValue(score);
    }

    public onFrameClicked(row: number, cardIndex: number, index: number): void {
        const actionName = ['tokenSelectReactivate', 'phase2'].includes(this.gamedatas.gamestate.name) ? 
            'activateEffectToken' : 
            'activateEffect';
        this.takeAction(actionName, {
            row, 
            cardIndex,
            index,
        });
    }
  	
    public moveCard(index: number, direction: number) {
        if(!(this as any).checkAction('moveCard')) {
            return;
        }

        this.takeAction('moveCard', {
            index, 
            direction: direction < 0,
        });
    }
  	
    public validateCardOrder() {
        if(!(this as any).checkAction('validateCardOrder')) {
            return;
        }

        this.takeAction('validateCardOrder');
    }
  	
    public activateEffect() {
        if(!(this as any).checkAction('activateEffect')) {
            return;
        }

        this.takeAction('activateEffect');
    }
  	
    public skipEffect() {
        if(!(this as any).checkAction('skipEffect')) {
            return;
        }

        this.takeAction('skipEffect');
    }
  	
    public confirmActivations() {
        if(!(this as any).checkAction('confirmActivations')) {
            return;
        }

        this.takeAction('confirmActivations');
    }
  	
    public chooseToken(type: number) {
        /*if(!(this as any).checkAction('chooseToken')) {
            return;
        }*/

        this.takeAction('chooseToken', {
            type, 
        });
    }
  	
    public cancelChooseToken() {
        /*if(!(this as any).checkAction('cancelChooseToken')) {
            return;
        }*/

        this.takeAction('cancelChooseToken');
    }
  	
    public neighborEffect(type: number) {
        if(!(this as any).checkAction('neighborEffect')) {
            return;
        }

        this.takeAction('neighborEffect', {
            type,
        });
    }
  	
    public applyNeighborEffect(type: number) {
        if(!(this as any).checkAction('applyNeighborEffect')) {
            return;
        }

        this.takeAction('applyNeighborEffect', {
            type,
        });
    }
  	
    public cancelNeighborEffect() {
        if(!(this as any).checkAction('cancelNeighborEffect')) {
            return;
        }

        this.takeAction('cancelNeighborEffect');
    }
  	
    public buyCard(level: number, type: number) {
        if(!(this as any).checkAction('buyCard')) {
            return;
        }

        this.takeAction('buyCard', {
            level,
            type,
        });
    }
  	
    public endTurn() {
        if(!(this as any).checkAction('endTurn')) {
            return;
        }

        this.takeAction('endTurn');
    }

    public setAutoGain(autoGain: boolean) {
        this.takeNoLockAction('setAutoGain', {
            autoGain
        });
    }

    public useRage(id: number): void {
        this.takeAction('useRage', {
            id,
        });
    }

    public takeAction(action: string, data?: any) {
        data = data || {};
        data.lock = true;
        (this as any).ajaxcall(`/afterus/afterus/${action}.html`, data, this, () => {});
    }
    public takeNoLockAction(action: string, data?: any) {
        data = data || {};
        (this as any).ajaxcall(`/afterus/afterus/${action}.html`, data, this, () => {});
    }

    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications

    /*
        setupNotifications:

        In this method, you associate each of your game notifications with your local method to handle it.

        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your pylos.game.php file.

    */
    setupNotifications() {
        //log( 'notifications subscriptions setup' );

        const notifs = [
            ['newRound', ANIMATION_MS],
            ['switchedCards', 1],
            ['activatedEffect', 1],
            ['selectedToken', 1],
            ['revealTokens', ANIMATION_MS],
            ['buyCard', ANIMATION_MS],
            ['endRound', ANIMATION_MS],
            ['discardedCard', ANIMATION_MS],
            ['lastTurn', 1],
        ];
    
        notifs.forEach((notif) => {
            dojo.subscribe(notif[0], this, `notif_${notif[0]}`);
            (this as any).notifqueue.setSynchronous(notif[0], notif[1]);
        });
    }

    notif_newRound(notif: Notif<NotifNewRoundArgs>) {
        this.getPlayerTable(notif.args.playerId).newRound(notif.args.cards);
    }

    notif_switchedCards(notif: Notif<NotifSwitchedCardsArgs>) {
        this.getPlayerTable(notif.args.playerId).switchCards(notif.args.movedCards);
    }

    notif_activatedEffect(notif: Notif<NotifActivatedEffectArgs>) {
        const playerId = notif.args.playerId;
        const player = notif.args.player;
        this.flowerCounters[playerId].toValue(player.flowers);
        this.fruitCounters[playerId].toValue(player.fruits);
        this.grainCounters[playerId].toValue(player.grains);
        this.energyCounters[playerId].toValue(player.energy);
        this.rageCounters[playerId].toValue(player.rage);
        this.setScore(playerId, +player.score);
        this.getPlayerTable(playerId).updateRage(player.rage);
    }

    notif_selectedToken(notif: Notif<NotifSelectedTokenArgs>) {
        const currentPlayer = this.getPlayerId() == notif.args.playerId;
        if (notif.args.token || !currentPlayer) {
            this.getPlayerTable(notif.args.playerId).setSelectedToken(notif.args.cancel ? null : notif.args.token);
        }
    }

    notif_revealTokens(notif: Notif<NotifRevealTokensArgs>) {
        Object.entries(notif.args.tokens).forEach(val => this.getPlayerTable(+val[0]).setSelectedToken(val[1]));
    }

    notif_buyCard(notif: Notif<NotifBuyCardArgs>) {
        this.tableCenter.setRemaining(notif.args.deckType, notif.args.deckCount);
        this.notif_activatedEffect(notif);
    }

    notif_endRound(notif: Notif<NotifEndRoundArgs>) {
        this.getPlayerTable(notif.args.playerId).endRound();
    }  

    notif_discardedCard(notif: Notif<NotifDiscardedCardArgs>) {
        this.getPlayerTable(notif.args.playerId).discardCard(notif.args.card, notif.args.line);
        this.notif_activatedEffect(notif);
    }  
    
    /** 
     * Show last turn banner.
     */ 
    notif_lastTurn(animate: boolean = true) {
        dojo.place(`<div id="last-round">
            <span class="last-round-text ${animate ? 'animate' : ''}">${_("This is the final round!")}</span>
        </div>`, 'page-title');
    }

    /*private getColorName(color: number) {
        switch (color) {
            case 1: return _('Orange');
            case 2: return _('Pink');
            case 3: return _('Blue');
            case 4: return _('Green');
            case 5: return _('Purple');
        }
    }*/

    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    public format_string_recursive(log: string, args: any) {
        try {
            if (log && args && !args.processed) {

                /*['scoredCard', 'cardOver', 'cardUnder', 'addedCard'].forEach(attr => {
                    if ((typeof args[attr] !== 'string' || args[attr][0] !== '<') && args[attr + 'Obj']) {
                        const obj: Card = args[attr + 'Obj'];
                        args[attr] = `<strong data-color="${obj.color}">${obj.number}</strong>`;
                        if (obj.points != 0) {
                            args[attr] += ` <div class="points-circle" data-negative="${(obj.points < 0).toString()}">${obj.points > 0 ? '+' : ''}${obj.points}</div>`;
                        }
                    }
                });*/

                for (const property in args) {
                    if (['level', 'type'].includes(property) && args[property][0] != '<') {
                        args[property] = `<strong>${_(args[property])}</strong>`;
                    }
                }

                for (const property in args) {
                    if (args[property]?.indexOf?.(']') > 0) {
                        args[property] = formatTextIcons(_(args[property]));
                    }
                }

                log = formatTextIcons(_(log));
            }
        } catch (e) {
            console.error(log,args,"Exception thrown", e.stack);
        }
        return (this as any).inherited(arguments);
    }
}