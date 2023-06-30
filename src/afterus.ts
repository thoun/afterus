declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;
declare const g_replayFrom;
declare const g_archive_mode;

const ANIMATION_MS = 500;
const ACTION_TIMER_DURATION = 5;

const LOCAL_STORAGE_ZOOM_KEY = 'AfterUs-zoom';
const LOCAL_STORAGE_JUMP_TO_FOLDED_KEY = 'AfterUs-jump-to-folded';

const FLOWER = 1;
const FRUIT = 2;
const GRAIN = 3;
const ENERGY = 4;
const POINT = 5;
const RAGE = 6;
const DIFFERENT = 7;
const PER_TAMARINS = 8;

const TYPE_FIELD_BY_NUMBER = [
    null,
    'flower',
    'fruit',
    'grain',
    'energy',
    'point',
    'rage',
];

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
    public animationManager: AnimationManager;

    private zoomManager: ZoomManager;
    private gamedatas: AfterUsGamedatas;
    private tableCenter: TableCenter;
    private playersTables: PlayerTable[] = [];
    private flowerCounters: Counter[] = [];
    private fruitCounters: Counter[] = [];
    private grainCounters: Counter[] = [];
    private energyCounters: Counter[] = [];
    private rageCounters: Counter[] = [];
    private lastSelectedToken: number | null | undefined = undefined;
    
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
            zoomLevels: [0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1, 1.25, 1.5],
            onDimensionsChange: () => {
                const tablesAndCenter = document.getElementById('tables-and-center');
                const doubleColumnBefore = tablesAndCenter.classList.contains('double-column');
                const doubleColumnAfter = tablesAndCenter.clientWidth > 1600;
                if (doubleColumnBefore != doubleColumnAfter) {
                    tablesAndCenter.classList.toggle('double-column', doubleColumnAfter);
                    const currentPlayerTable = document.querySelector('.player-table.current-player');
                    if (currentPlayerTable) {
                        document.getElementById(doubleColumnAfter ? 'tables' : 'current-player-table').insertAdjacentElement('afterbegin', currentPlayerTable);
                    }
                }
            },
        });
        new JumpToManager(this, {
            localStorageFoldedKey: LOCAL_STORAGE_JUMP_TO_FOLDED_KEY,
            topEntries: [
                new JumpToEntry(_('Main board'), 'table-center', { 'color': '#a19b7b' })
            ],
            defaultFolded: true,
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
    private setGamestatePrivateDescription(stateId: number, property: string = '') {
        const originalState = this.gamedatas.gamestates[stateId];
        if (this.gamedatas.gamestate.descriptionmyturn != originalState['descriptionmyturn' + property]) {
            this.gamedatas.gamestate.descriptionmyturn = originalState['descriptionmyturn' + property]; 
            (this as any).updatePageTitle();
        }
    }

    public onEnteringState(stateName: string, args: any) {
        log('Entering state: ' + stateName, args.args);
        if (!(this as any).isSpectator) {
            this.tableCenter.onEnteringState(+args.id);
        }

        switch (stateName) {
            case 'orderCards':
                const playerTable = this.getCurrentPlayerTable();
                playerTable.setMovable(true);
                playerTable.setActivableEffectToken(args.args.effects, 'remaining');
                break;
            case 'activateEffect':
            case 'confirmActivations':
            case 'confirmActivationsPhase2':
                const activateEffectArgs = args.args as EnteringActivateEffectArgs;
                this.getCurrentPlayerTable().setActivableEffect(activateEffectArgs.currentEffect, activateEffectArgs.appliedEffects, activateEffectArgs.remainingEffects, activateEffectArgs.reactivate, activateEffectArgs.possibleEffects);
                break;
            case 'activateEffectToken':
                const activateEffectTokenArgs = args.args as EnteringActivateEffectArgs;
                this.getCurrentPlayerTable().setActivableEffectToken(activateEffectTokenArgs.possibleEffects);
                break;

            case 'mobilePhone':
                this.getCurrentPlayerTable().addButtonsOnCards(card => _('Replace this card') + formatTextIcons(` (${card.level + 1} [Energy])`), card => {
                    const keys = [1, 2, 3, 4].map(type => this.cardsManager.getMonkeyType(type));
                    keys.push(_('Cancel'));
                    (this as any).multipleChoiceDialog(_("Select a deck to draw the level ${level} top card").replace('${level}', card.level), keys, (choice: string) => {
                        if (Number(choice) != 4) { // != cancel
                            this.useMobilePhone(card.id, Number(choice) + 1);
                        }
                    });
                    const cancelBtn = document.getElementById('choice_btn_4');
                    if (cancelBtn) {
                        cancelBtn.classList.add('bgabutton_gray');
                        cancelBtn.classList.remove('bgabutton_blue');
                    }
                }, 1);
                break;
            case 'ghettoBlaster':
                this.getCurrentPlayerTable().addButtonsOnCards(() => _('Replace this card') + formatTextIcons(' (2 [Energy])'), card => this.useGhettoBlaster(card.id));
                break;
            case 'gameConsole':
                this.getCurrentPlayerTable().addButtonsOnCards(card => _('Place this card top of draw pile') + formatTextIcons(` (${card.level * 2 + 1} [Energy])`), card => this.useGameConsole(card.id), 1);
                break;
            case 'endScore':
                this.onEnteringEndScore(args.args);
                break;
        }
    }

    private onEnteringEndScore(args: EnteringEndScoreArgs) {
        Object.keys(args.fullDecks).forEach(pId => {
            const playerId = Number(pId);
            this.gamedatas.players[playerId].fullDeck = args.fullDecks[playerId];
            this.addShowFullDeckButton(playerId);
        });
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
            case 'chooseToken':
                this.lastSelectedToken = undefined;
                break;

            case 'mobilePhone':
            case 'ghettoBlaster':
            case 'gameConsole':
                this.getCurrentPlayerTable().removeButtonsOnCards();
                break;
        }
    }

    private addCancelLastMoves(withSingle: boolean, undoCount: number) {
        (this as any).addActionButton(`cancelLastMove-button`, _("Cancel last move"), () => withSingle ? this.cancelLastMove() : this.cancelLastMoves(), null, null, 'gray');

        if (withSingle && undoCount > 1) {
            (this as any).addActionButton(`cancelLastMoves-button`, _("Cancel last ${moves} moves").replace('${moves}', undoCount), () => this.cancelLastMoves(), null, null, 'gray');
        }
    }

    private createChooseTokenButton(type: number, gray: boolean = false) {
        const costs = [3, 6].map(number => {
            let canPay = false;
            switch (type) {
                case FLOWER: 
                    canPay = this.flowerCounters[this.getPlayerId()]?.getValue() >= number;
                    break;
                case FRUIT: 
                    canPay = this.fruitCounters[this.getPlayerId()]?.getValue() >= number;
                    break;
                case GRAIN: 
                    canPay = this.grainCounters[this.getPlayerId()]?.getValue() >= number;
                    break;
                case 4: 
                    canPay = Math.max(
                        this.flowerCounters[this.getPlayerId()]?.getValue(),
                        this.fruitCounters[this.getPlayerId()]?.getValue(),
                        this.grainCounters[this.getPlayerId()]?.getValue()
                    ) >= number;
                    break;
            }
            return `<span class="${canPay ? (gray ? '' : 'ok-can-pay') : 'warning-cant-pay'}">${number}</span>`;
        }).join('/');

        const label = `${this.cardsManager.getMonkeyType(type)} (${costs} ${type == 4 ? [1,2,3].map(r => formatTextIcons(getResourceCode(r))).join('/') : formatTextIcons(getResourceCode(type))})`;
        (this as any).addActionButton(`chooseToken${type}-button`, `
        ${label}<br>
        <div class="action-token" data-type="${type}"></div>
        `, () => this.chooseToken(type), null, null, gray ? 'gray' : undefined);
    }

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    public onUpdateActionButtons(stateName: string, args: any) {
        if (stateName === 'chooseToken') {
            if (!(this as any).isCurrentPlayerActive() && Object.keys(this.gamedatas.players).includes(''+this.getPlayerId())) { // ignore spectators
                [1, 2, 3, 4].forEach(type => this.createChooseTokenButton(type, true));
                document.getElementById(`chooseToken${this.lastSelectedToken !== undefined ? this.lastSelectedToken : args._private?.token}-button`)?.classList.add('selected-token-button');
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
                if (currentEffect) {
                    if (activateEffectArgs.reactivate) {
                        this.createFakeButtonForReactivate();
                    } else {
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
                        document.getElementById(`activateEffect-button`).classList.add(currentEffect.convertSign ? 'button-convert' : 'button-gain');
                    }
                }
                (this as any).addActionButton(`skipEffect-button`, _("Skip"), () => this.skipEffect());
                this.addCancelLastMoves(true, args.undoCount);
                break;
            case 'confirmActivations':
            case 'confirmActivationsPhase2':
                (this as any).addActionButton(`confirmActivations-button`, _("Confirm"), () => this.confirmActivations());
                this.addCancelLastMoves(stateName == 'confirmActivations', args.undoCount);
                break;
            case 'privateChooseToken':
                [1, 2, 3, 4].forEach(type => this.createChooseTokenButton(type));
                break;
            case 'activateEffectToken':
                this.createFakeButtonForReactivate();
                break;
            case 'buyCard':
                const buyCardArgs = args as EnteringBuyCardArgs;
                
                if (!buyCardArgs.canBuyCard) {
                    this.setGamestatePrivateDescription(61, buyCardArgs.canUseNeighborToken ? 'OnlyEffect' : 'OnlyEnd');
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

                if (buyCardArgs.canUseNeighborToken) {
                    buyCardArgs.neighborTokens.forEach(type => {
                        const label = _("Use effect of ${type}").replace('${type}', `<div class="action-token" data-type="${type}"></div>`);
                        (this as any).addActionButton(`neighborEffect${type}-button`, label, () => this.neighborEffect(type), null, null, 'gray');
                    });
                }

                let endTurnLabel = _("End turn");
                const canUseGameConsole = buyCardArgs.canUseGameConsole;
                if (canUseGameConsole) {
                    (this as any).addActionButton(`endTurnGameConsole-button`, endTurnLabel + ' (' + _("use Game Console") + ')', () => this.useObject(4), null, null, 'red');
                    endTurnLabel += ' (' + _("without using Game Console") + ')';
                }
                (this as any).addActionButton(`endTurn-button`, endTurnLabel, () => this.endTurn(), null, null, 'red');
                break;
            case 'applyNeighborEffect':
                const applyNeighborEffectArgs = args as EnteringApplyNeighborEffectArgs;
                Object.entries(applyNeighborEffectArgs.cost).forEach(cardCost => {
                    const type = +cardCost[0];
                    //const canBuy = cardCost[1];
                    const label = _("Spend ${left} to gain ${right}")
                        .replace('${left}', getResourcesQuantityIcons([[2, type]]))
                        .replace('${right}', formatTextIcons(applyNeighborEffectArgs.gain));
                    (this as any).addActionButton(`applyNeighborEffect-${type}-button`, label, () => this.applyNeighborEffect(type));
                    /*if (!canBuy) {
                        document.getElementById(`applyNeighborEffect-${type}-button`).classList.add('disabled');
                    }*/
                    this.setButtonActivation(`applyNeighborEffect-${type}-button`, TYPE_FIELD_BY_NUMBER[type], 2);
                });
                (this as any).addActionButton(`cancelNeighborEffect-button`, _("Cancel"), () => this.cancelNeighborEffect(), null, null, 'gray');
                break;

            case 'mobilePhone':
            case 'ghettoBlaster':
            case 'gameConsole':
                (this as any).addActionButton(`cancelObject-button`, _("Cancel"), () => this.cancelObject(), null, null, 'gray');
                break;
            case 'minibar':
                [1, 2, 3, 4].forEach(left => 
                    [1, 2, 3/*, 4*/].filter(right => left != right).forEach(right => {
                        const label = formatTextIcons(getResourceCode(left) + ' >> ' + getResourceCode(right)/* + (' (1 [Energy])')*/);
                        (this as any).addActionButton(`minibar-${left}-${right}-button`, label, () => this.useMinibar(left, right));
                        if (left == ENERGY) {
                            if (this.getCurrentPlayerEnergy() < 2) {
                                document.getElementById(`minibar-${left}-${right}-button`).classList.add('disabled');
                            }
                        } else {
                            const currentPlayerCounter: Counter = this[`${TYPE_FIELD_BY_NUMBER[left]}Counters`][this.getPlayerId()];
                            if (this.getCurrentPlayerEnergy() < 1 || currentPlayerCounter.getValue() < 1) {
                                document.getElementById(`minibar-${left}-${right}-button`).classList.add('disabled');
                            }
                        }
                        
                    })
                );

                (this as any).addActionButton(`cancelObject-button`, _("Cancel"), () => this.cancelObject(), null, null, 'gray');
                break;
            case 'moped':
                [1, 2].forEach(level => 
                    [1, 2, 3, 4].forEach(type => {
                        const cost = level == 2 ? 9 : 6;
                        const label = _("Attract a level ${level} ${type}").replace('${level}', level).replace('${type}', this.cardsManager.getMonkeyType(type)) + formatTextIcons(` (${cost} [Energy])`);
                        (this as any).addActionButton(`useMoped-${type}-${level}-button`, label, () => this.useMoped(type, level))
                        this.setButtonActivation(`useMoped-${type}-${level}-button`, 'energy', cost);
                    })
                );
                (this as any).addActionButton(`cancelObject-button`, _("Cancel"), () => this.cancelObject(), null, null, 'gray');
                break;
        }
    }

    createFakeButtonForReactivate() {
        (this as any).addActionButton(`fakeReactivate-button`, _("Click on a frame to reactivate it"), null);
        document.getElementById(`fakeReactivate-button`).classList.add('disabled');
    }

    ///////////////////////////////////////////////////
    //// Utility methods


    ///////////////////////////////////////////////////

    public setButtonActivation(id: string, type: string, min: number): void {
        const button = document.getElementById(id);
        button.setAttribute(`data-activate-at-${type}`, ''+min);
        const currentPlayerCounter: Counter = this[`${type}Counters`][this.getPlayerId()];
        if (currentPlayerCounter && currentPlayerCounter.getValue() < min) {
            button.classList.add('disabled');
        }
    }

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

    public getCurrentPlayerEnergy(): number {
        return this.energyCounters[this.getPlayerId()]?.getValue() ?? 0;
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
                if (!this.isReadOnly()) {
                    this.setAutoGain(prefValue == 1);
                }
                break;
        }
    }

    private isReadOnly() {
        return (this as any).isSpectator || typeof g_replayFrom != 'undefined' || g_archive_mode;
    }

    private getOrderedPlayers(gamedatas: AfterUsGamedatas) {
        const players = Object.values(gamedatas.players).sort((a, b) => a.playerNo - b.playerNo);
        const playerIndex = players.findIndex(player => Number(player.id) === Number((this as any).player_id));
        const orderedPlayers = playerIndex > 0 ? [...players.slice(playerIndex), ...players.slice(0, playerIndex)] : players;
        return orderedPlayers;
    }

    private createPlayerPanels(gamedatas: AfterUsGamedatas) {
        document.querySelectorAll('#player_boards .player_score i.fa-star').forEach(elem => {
            elem.classList.remove('fa', 'fa-star');
            elem.classList.add('icon', 'point');
        });

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
            
            if (player.fullDeck) {
                this.addShowFullDeckButton(playerId);
            }

            
        });
    }
    
    private addShowFullDeckButton(playerId: number) {
        dojo.place(`<div>
        <button class="bgabutton bgabutton_gray discarded-button" id="show-full-deck-button-${playerId}">${_('Show full deck')}</button>
        </div>`, `player_board_${playerId}`);
        document.getElementById(`show-full-deck-button-${playerId}`).addEventListener('click', () => this.showFullDeck(playerId));
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

    private showFullDeck(playerId: number) {
        const fullDeckDialog = new ebg.popindialog();
        fullDeckDialog.create('showFullDeckDialog');
        fullDeckDialog.setTitle('');
        
        let html = `<div id="full-deck-popin">
            <h1>${_("Full deck")}</h1>
            <div id="full-deck-cards"></div>
        </div>`;
        
        // Show the dialog
        fullDeckDialog.setContent(html);

        fullDeckDialog.show();

        this.gamedatas.players[playerId].fullDeck.forEach(card => {
            const div = document.createElement('div');
            div.id = `full-deck-card-${card.id}`;
            document.getElementById('full-deck-cards').appendChild(div),
            this.cardsManager.setForHelp(card, div.id);
        });
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
  	
    public cancelLastMove() {
        if(!(this as any).checkAction('cancelLastMove')) {
            return;
        }

        this.takeAction('cancelLastMove');
    }
  	
    public cancelLastMoves() {
        if(!(this as any).checkAction('cancelLastMoves')) {
            return;
        }

        this.takeAction('cancelLastMoves');
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

    public useObject(number: number): void {
        this.takeAction('useObject', {
            number,
        });
    }

    public cancelObject(): void {
        if(!(this as any).checkAction('cancelObject')) {
            return;
        }

        this.takeAction('cancelObject');
    }

    public useMobilePhone(id: number, type: number): void {
        if(!(this as any).checkAction('useMobilePhone')) {
            return;
        }

        this.takeAction('useMobilePhone', {
            id,
            type,
        });
    }

    public useMinibar(left: number, right: number): void {
        if(!(this as any).checkAction('useMinibar')) {
            return;
        }

        this.takeAction('useMinibar', {
            left,
            right,
        });
    }

    public useGhettoBlaster(id: number): void {
        if(!(this as any).checkAction('useGhettoBlaster')) {
            return;
        }

        this.takeAction('useGhettoBlaster', {
            id,
        });
    }

    public useGameConsole(id: number): void {
        if(!(this as any).checkAction('useGameConsole')) {
            return;
        }

        this.takeAction('useGameConsole', {
            id,
        });
    }

    public useMoped(type: number, level: number): void {
        if(!(this as any).checkAction('useMoped')) {
            return;
        }

        this.takeAction('useMoped', {
            type,
            level,
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
            ['addCardToLine', ANIMATION_MS],
            ['replaceLineCard', ANIMATION_MS * 2],
            ['replaceTopDeck', ANIMATION_MS],
            ['refillDeck', ANIMATION_MS],
            ['lastTurn', 1],
            ['useObject', 1],
            ['cancelLastMoves', 1],
            ['deckTopCard', 1],
        ];
    
        notifs.forEach((notif) => {
            dojo.subscribe(notif[0], this, (notifDetails: Notif<any>) => {
                log(`notif_${notif[0]}`, notifDetails.args);

                const promise = this[`notif_${notif[0]}`](notifDetails.args);

                // tell the UI notification ends, if the function returned a promise
                promise?.then(() => (this as any).notifqueue.onSynchronousNotificationEnd());
            });
            (this as any).notifqueue.setSynchronous(notif[0], notif[1]);
        });

        if (isDebug) {
            notifs.forEach((notif) => {
                if (!this[`notif_${notif[0]}`]) {
                    console.warn(`notif_${notif[0]} function is not declared, but listed in setupNotifications`);
                }
            });

            Object.getOwnPropertyNames(AfterUs.prototype).filter(item => item.startsWith('notif_')).map(item => item.slice(6)).forEach(item => {
                if (!notifs.some(notif => notif[0] == item)) {
                    console.warn(`notif_${item} function is declared, but not listed in setupNotifications`);
                }
            });
        }
    }

    notif_newRound(args: NotifNewRoundArgs) {
        this.tableCenter.newRound();
        this.getPlayerTable(args.playerId).newRound(args.cards, args.deckCount, args.deckTopCard);
    }

    notif_switchedCards(args: NotifSwitchedCardsArgs) {
        this.getPlayerTable(args.playerId).switchCards(args.movedCards);
    }

    notif_activatedEffect(args: NotifActivatedEffectArgs) {
        const playerId = args.playerId;
        const player = args.player;
        this.flowerCounters[playerId].toValue(player.flowers);
        this.fruitCounters[playerId].toValue(player.fruits);
        this.grainCounters[playerId].toValue(player.grains);
        this.energyCounters[playerId].toValue(player.energy);
        this.rageCounters[playerId].toValue(player.rage);
        this.setScore(playerId, +player.score);
        if (playerId == this.getPlayerId()) {
            this.tableCenter.setCurrentPlayerEnergy(player.energy);
        }

        ['flower', 'fruit', 'grain', 'energy', 'rage'].forEach(type => 
            document.querySelectorAll(`[data-activate-at-${type}]`).forEach(button => {
                const min = +button.getAttribute(`data-activate-at-${type}`);
                const currentPlayerCounter: Counter = this[`${type}Counters`][this.getPlayerId()];
                button.classList.toggle('disabled', currentPlayerCounter && currentPlayerCounter.getValue() < min);
            })
        );
    }

    notif_selectedToken(args: NotifSelectedTokenArgs) {
        const currentPlayer = this.getPlayerId() == args.playerId;
        if (args.token || !currentPlayer || args.cancel) {
            this.getPlayerTable(args.playerId).setSelectedToken(args.cancel ? null : args.token);
            if (currentPlayer) {
                this.lastSelectedToken = args.cancel ? null : args.token;
                [1, 2, 3, 4].forEach(type => 
                    document.getElementById(`chooseToken${type}-button`)?.classList.toggle('selected-token-button', type == this.lastSelectedToken)
                );
            }
        }
    }

    notif_revealTokens(args: NotifRevealTokensArgs) {
        Object.entries(args.tokens).forEach(val => this.getPlayerTable(+val[0]).setSelectedToken(val[1]));
    }

    notif_buyCard(args: NotifBuyCardArgs) {
        this.getPlayerTable(args.playerId).addCardToDeck(args.card);
        this.tableCenter.setRemaining(args.deckType, args.deckCount, args.deckTopCard);
        this.notif_activatedEffect(args);
    }

    notif_endRound(args: NotifEndRoundArgs) {
        this.getPlayerTable(args.playerId).endRound();
    }  

    notif_discardedCard(args: NotifDiscardedCardArgs) {
        this.getPlayerTable(args.playerId).discardCard(args.card, args.line);
        this.notif_activatedEffect(args);
    }  

    notif_addCardToLine(args: NotifAddCardToLineArgs) {
        this.getPlayerTable(args.playerId).addCardToLine(args.card, args.line, args.deckCount, args.deckTopCard);
        this.notif_activatedEffect(args);
    }   

    async notif_replaceLineCard(args: NotifReplaceLineCardArgs) {
        await this.tableCenter.addCardForReplaceLine(args.oldCard, false);
        await this.tableCenter.addCardForReplaceLine(args.newCard, true);
        this.tableCenter.replaceLineCardUpdateCounters(args.table, args.tableTopCards);
        await this.getPlayerTable(args.playerId).replaceLineCard(args.newCard);
        this.notif_activatedEffect(args);
    } 

    notif_replaceTopDeck(args: NotifReplaceTopDeckArgs) {
        this.getPlayerTable(args.playerId).replaceTopDeck(args.card);
        this.notif_activatedEffect(args);
    }

    notif_useObject(args: NotifUseObjectArgs) {
        this.tableCenter.addUsedObject(args.object);
    }

    notif_refillDeck(args: NotifRefillDeckArgs) {
        this.getPlayerTable(args.playerId).refillDeck(args.deckCount);
    }  

    notif_cancelLastMoves(args: NotifCancelLastMovesArgs) {
        this.getPlayerTable(args.playerId).setLine(args.line);
        this.notif_activatedEffect(args);
    }

    notif_deckTopCard(args: NotifDeckTopCardArgs) {
        this.getPlayerTable(args.playerId).deckTopCard(args.card);
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
                for (const property in args) {
                    if (['level', 'type', 'object'].includes(property) && args[property][0] != '<') {
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