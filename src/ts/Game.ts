import { isDebug, log, ANIMATION_MS, LOCAL_STORAGE_ZOOM_KEY, LOCAL_STORAGE_JUMP_TO_FOLDED_KEY, FLOWER, FRUIT, GRAIN, ENERGY, DIFFERENT, PER_TAMARINS, TYPE_FIELD_BY_NUMBER, formatTextIcons, getResourceCode, getResourcesQuantityIcons } from './utils';
import { CardsManager } from './cards';
import { TableCenter } from './table-center';
import { PlayerTable } from './player-table';
import { AnimationManager, BgaZoom, BgaJumpTo } from './libs';

export class Game implements AfterUsGame {
    public cardsManager: CardsManager;
    public animationManager: AnimationManager;

    private zoomManager: BgaZoom.Manager;
    public gamedatas: AfterUsGamedatas;
    private tableCenter: TableCenter;
    private playersTables: PlayerTable[] = [];
    private flowerCounters: Counter[] = [];
    private fruitCounters: Counter[] = [];
    private grainCounters: Counter[] = [];
    private energyCounters: Counter[] = [];
    private rageCounters: Counter[] = [];
    private lastSelectedToken: number | null | undefined = undefined;

    public bga: Bga<AfterUsPlayer, AfterUsGamedatas>;
    
    private TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;

    constructor(bga: Bga<AfterUsPlayer, AfterUsGamedatas>) {
        this.bga = bga;
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

        this.bga.gameArea.getElement().insertAdjacentHTML('beforeend', `
            <div id="table">
                <div id="tables-and-center">
                    <div id="current-player-table"></div>
                    <div id="table-center">
                        <div id="objects" class="card-line"></div>
                        <div id="center-board"></div>
                    </div>
                    <div id="tables"></div>
                </div>
            </div>
        `);
        
        this.gamedatas = gamedatas;

        log('gamedatas', gamedatas);

        this.animationManager = new AnimationManager(this.bga.gameui);
        this.cardsManager = new CardsManager(this);
        this.tableCenter = new TableCenter(this, gamedatas);
        this.createPlayerPanels(gamedatas); 
        this.createPlayerTables(gamedatas);
        
        this.zoomManager = new BgaZoom.Manager({
            element: document.getElementById('table'),
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
        new BgaJumpTo.Manager({
            localStorageFoldedKey: LOCAL_STORAGE_JUMP_TO_FOLDED_KEY,
            entries: [
                new BgaJumpTo.Entry(_('Main board'), 'table-center', {
                    color: '#a19b7b',
                    backgroundImage: `url('${this.bga.images.getImgUrl('table-center.jpg')}')`,
                    backgroundSize: 'cover',
                }),
                ...BgaJumpTo.BgaPlayerEntries(this.bga, {
                    playerOrder: this.getOrderedPlayers(gamedatas).map(player => Number(player.id)),
                }),
            ],
            defaultFolded: true,
        });

        if (gamedatas.lastTurn) {
            this.notif_lastTurn(false);
        }

        this.setupNotifications();
        this.bga.userPreferences.onChange = (prefId, prefValue) => this.onPreferenceChange(prefId, prefValue);

        log( "Ending game setup" );
    }

    ///////////////////////////////////////////////////
    //// Game & client states

    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    public onEnteringState(stateName: string, args: any) {
        log('Entering state: ' + stateName, args.args);
        if (!this.bga.gameui.isSpectator) {
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
                    this.bga.gameui.multipleChoiceDialog(_("Select a deck to draw the level ${level} top card").replace('${level}', card.level), keys, (choice: string) => {
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
        this.bga.gameui.addActionButton(`cancelLastMove-button`, _("Cancel last move"), () => withSingle ? this.cancelLastMove() : this.cancelLastMoves(), null, null, 'gray');

        if (withSingle && undoCount > 1) {
            this.bga.gameui.addActionButton(`cancelLastMoves-button`, _("Cancel last ${moves} moves").replace('${moves}', String(undoCount)), () => this.cancelLastMoves(), null, null, 'gray');
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
        this.bga.gameui.addActionButton(`chooseToken${type}-button`, `
        ${label}<br>
        <div class="action-token" data-type="${type}"></div>
        `, () => this.chooseToken(type), null, null, gray ? 'gray' : undefined);
    }

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    public onUpdateActionButtons(stateName: string, args: any) {
        if (stateName === 'chooseToken') {
            if (!this.bga.gameui.isCurrentPlayerActive() && Object.keys(this.gamedatas.players).includes(''+this.getPlayerId())) { // ignore spectators
                [1, 2, 3, 4].forEach(type => this.createChooseTokenButton(type, true));
                document.getElementById(`chooseToken${this.lastSelectedToken !== undefined ? this.lastSelectedToken : args._private?.token}-button`)?.classList.add('selected-token-button');
                this.bga.gameui.addActionButton(`cancelChooseToken-button`, _("I changed my mind"), () => this.cancelChooseToken(), null, null, 'gray');
            }
        }

        switch (stateName) {
            case 'orderCards':
                this.bga.gameui.addActionButton(`validateCardOrder-button`, _("Validate card order"), () => this.validateCardOrder());
                break;
            case 'activateEffect':
                const activateEffectArgs = args as EnteringActivateEffectArgs;
                const currentEffect = activateEffectArgs.currentEffect;
                if (currentEffect) {
                    if (activateEffectArgs.reactivate) {
                        this.createFakeButtonForReactivate(currentEffect.left);
                    } else {
                        if (currentEffect.left.length == 1) {
                            if (currentEffect.left[0][1] == DIFFERENT) {
                                currentEffect.left = [];
                                currentEffect.convertSign = false;
                            } else if (currentEffect.left[0][1] == PER_TAMARINS) {
                                currentEffect.left[0] = currentEffect.left[0][0] as any;
                                currentEffect.left[0][0] *= activateEffectArgs.tamarins;
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
                        this.bga.gameui.addActionButton(`activateEffect-button`, label, () => this.activateEffect());
                        document.getElementById(`activateEffect-button`).classList.add(currentEffect.convertSign ? 'button-convert' : 'button-gain');
                    }
                }
                this.bga.gameui.addActionButton(`skipEffect-button`, _("Skip"), () => this.skipEffect());
                this.addCancelLastMoves(true, args.undoCount);
                break;
            case 'confirmActivations':
            case 'confirmActivationsPhase2':
                this.bga.gameui.addActionButton(`confirmActivations-button`, _("Confirm"), () => this.confirmActivations());
                this.addCancelLastMoves(stateName == 'confirmActivations', args.undoCount);
                break;
            case 'privateChooseToken':
                [1, 2, 3, 4].forEach(type => this.createChooseTokenButton(type));
                break;
            case 'activateEffectToken':
                if (args.possibleEffects.length) {
                    this.createFakeButtonForReactivate([]);
                } else {
                    this.bga.gameui.addActionButton(`skipEffectToken-button`, _("Skip"), () => this.skipEffectToken());
                }
                break;
            case 'buyCard':
                const buyCardArgs = args as EnteringBuyCardArgs;
                
                if (!buyCardArgs.canBuyCard) {
                    this.bga.statusBar.setTitle(buyCardArgs.canUseNeighborToken
                        ? _('Phase 2 : ${you} can activate an effect')
                        : _('Phase 2 : ${you} must end your turn'));
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
                            this.bga.gameui.addActionButton(`buyCard${level}-${type}-button`, label, () => this.buyCard(level, type));
                            if (!canBuy) {
                                document.getElementById(`buyCard${level}-${type}-button`).classList.add('disabled');
                            }
                        });
                    });
                }

                if (buyCardArgs.canUseNeighborToken) {
                    Object.entries(buyCardArgs.neighborTokens).forEach(entry => {
                        const type = Number(entry[0]);
                        const playersIds = entry[1];
                        const players = playersIds.map(playerId => this.getPlayer(playerId)).map(player => `<span style="color: #${player.color};">${player.name}</span>`).join('/');
                        const label = _("Use effect of ${player} token ${type}").replace('${type}', `<div class="action-token" data-type="${type}"></div>`).replace('${player}', players);
                        this.bga.gameui.addActionButton(`neighborEffect${type}-button`, label, () => this.neighborEffect(type), null, null, 'gray');
                    });
                }

                let endTurnLabel = _("End turn");
                const canUseGameConsole = buyCardArgs.canUseGameConsole;
                if (canUseGameConsole) {
                    this.bga.gameui.addActionButton(`endTurnGameConsole-button`, endTurnLabel + ' (' + _("use Game Console") + ')', () => this.useObject(4), null, null, 'red');
                    endTurnLabel += ' (' + _("without using Game Console") + ')';
                }
                this.bga.gameui.addActionButton(`endTurn-button`, endTurnLabel, () => this.endTurn(), null, null, 'red');
                break;
            case 'applyNeighborEffect':
                const applyNeighborEffectArgs = args as EnteringApplyNeighborEffectArgs;
                Object.entries(applyNeighborEffectArgs.cost).forEach(cardCost => {
                    const type = +cardCost[0];
                    //const canBuy = cardCost[1];
                    const label = _("Spend ${left} to gain ${right}")
                        .replace('${left}', getResourcesQuantityIcons([[2, type]]))
                        .replace('${right}', formatTextIcons(applyNeighborEffectArgs.gain));
                    this.bga.gameui.addActionButton(`applyNeighborEffect-${type}-button`, label, () => this.applyNeighborEffect(type));
                    /*if (!canBuy) {
                        document.getElementById(`applyNeighborEffect-${type}-button`).classList.add('disabled');
                    }*/
                    this.setButtonActivation(`applyNeighborEffect-${type}-button`, TYPE_FIELD_BY_NUMBER[type], 2);
                });
                this.bga.gameui.addActionButton(`cancelNeighborEffect-button`, _("Cancel"), () => this.cancelNeighborEffect(), null, null, 'gray');
                break;
            case 'privateBeforeEndGame':
                this.bga.gameui.addActionButton(`endGame-button`, _("End game"), () => this.endGame(), null, null, 'red');
                break;

            case 'mobilePhone':
            case 'ghettoBlaster':
            case 'gameConsole':
                this.bga.gameui.addActionButton(`cancelObject-button`, _("Cancel"), () => this.cancelObject(), null, null, 'gray');
                break;
            case 'minibar':
                [1, 2, 3, 4].forEach(left => 
                    [1, 2, 3/*, 4*/].filter(right => left != right).forEach(right => {
                        const label = formatTextIcons(getResourceCode(left) + ' >> ' + getResourceCode(right)/* + (' (1 [Energy])')*/);
                        this.bga.gameui.addActionButton(`minibar-${left}-${right}-button`, label, () => this.useMinibar(left, right));
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

                this.bga.gameui.addActionButton(`cancelObject-button`, _("Cancel"), () => this.cancelObject(), null, null, 'gray');
                break;
            case 'moped':
                [1, 2].forEach(level => 
                    [1, 2, 3, 4].forEach(type => {
                        const cost = level == 2 ? 9 : 6;
                        const label = _("Attract a level ${level} ${type}").replace('${level}', String(level)).replace('${type}', this.cardsManager.getMonkeyType(type)) + formatTextIcons(` (${cost} [Energy])`);
                        this.bga.gameui.addActionButton(`useMoped-${type}-${level}-button`, label, () => this.useMoped(type, level))
                        this.setButtonActivation(`useMoped-${type}-${level}-button`, 'energy', cost);
                    })
                );
                this.bga.gameui.addActionButton(`cancelObject-button`, _("Cancel"), () => this.cancelObject(), null, null, 'gray');
                break;
        }
    }

    createFakeButtonForReactivate(cost: number[][]) {
        let label = _("Click on a frame to reactivate it");
        if (cost.length) {
            label += ` (${getResourcesQuantityIcons(cost)})`;
        }
        this.bga.gameui.addActionButton(`fakeReactivate-button`, label, null);
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
        this.bga.gameui.addTooltipHtml(id, html, this.TOOLTIP_DELAY);
    }
    public setTooltipToClass(className: string, html: string) {
        this.bga.gameui.addTooltipHtmlToClass(className, html, this.TOOLTIP_DELAY);
    }

    public getPlayerId(): number {
        return Number(this.bga.gameui.player_id);
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
        return this.bga.gameui.isSpectator || typeof g_replayFrom != 'undefined' || g_archive_mode;
    }

    private getOrderedPlayers(gamedatas: AfterUsGamedatas) {
        const players = Object.values(gamedatas.players).sort((a, b) => a.playerNo - b.playerNo);
        const playerIndex = players.findIndex(player => Number(player.id) === Number(this.bga.gameui.player_id));
        const orderedPlayers = playerIndex > 0 ? [...players.slice(playerIndex), ...players.slice(0, playerIndex)] : players;
        return orderedPlayers;
    }

    private createPlayerPanels(gamedatas: AfterUsGamedatas) {
        document.querySelectorAll('#player_boards .player_score i.fa-star').forEach(elem => {
            elem.classList.remove('fa', 'fa-star');
            elem.classList.add('icon', 'point');
        });

        const players = Object.values(gamedatas.players).sort((a, b) => a.playerNo - b.playerNo);
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
                    <span id="rage-counter-${player.id}"></span> / 12
                </div>
            </div>`;
            this.bga.playerPanels.getElement(playerId).insertAdjacentHTML('beforeend', html);

            this.bga.gameui.addTooltipHtml(`flower-counter-wrapper-${player.id}`, _("Flowers"));
            this.bga.gameui.addTooltipHtml(`fruit-counter-wrapper-${player.id}`, _("Fruits"));
            this.bga.gameui.addTooltipHtml(`grain-counter-wrapper-${player.id}`, _("Grains"));
            this.bga.gameui.addTooltipHtml(`energy-counter-wrapper-${player.id}`, _("Energy"));
            this.bga.gameui.addTooltipHtml(`rage-counter-wrapper-${player.id}`, `${_("Rage")}<br>${_("Click the button on the top-right corner of a card in your line to use Rage")}`);

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
                this.bga.playerPanels.getElement(playerId).insertAdjacentHTML('beforeend', html);
                this.bga.gameui.addTooltipHtml(`neighbor-left-${player.id}`, _("Left neighbor"));
                this.bga.gameui.addTooltipHtml(`neighbor-right-${player.id}`, _("Right neighbor"));
            }
            
            if (player.fullDeck) {
                this.addShowFullDeckButton(playerId);
            }
        });
    }
    
    private addShowFullDeckButton(playerId: number) {
        this.bga.playerPanels.getElement(playerId).insertAdjacentHTML('beforeend', `<div>
            <button class="bgabutton bgabutton_gray discarded-button" id="show-full-deck-button-${playerId}">${_('Show full deck')}</button>
        </div>`);
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
        this.bga.playerPanels.getScoreCounter(playerId).toValue(score);
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
            'actActivateEffectToken' :
            'actActivateEffect';
        this.takeNoLockAction(actionName, {
            row, 
            cardIndex,
            index,
        });
    }
  	
    public moveCard(index: number, direction: number) {
        if(!this.bga.gameui.checkAction('actMoveCard')) {
            return;
        }

        this.takeNoLockAction('actMoveCard', {
            index, 
            direction: direction < 0,
        });
    }
  	
    public validateCardOrder() {
        if(!this.bga.gameui.checkAction('actValidateCardOrder')) {
            return;
        }

        this.takeNoLockAction('actValidateCardOrder');
    }
  	
    public activateEffect() {
        if(!this.bga.gameui.checkAction('actActivateEffect')) {
            return;
        }

        this.takeNoLockAction('actActivateEffect');
    }
  	
    public skipEffect() {
        if(!this.bga.gameui.checkAction('actSkipEffect')) {
            return;
        }

        this.takeNoLockAction('actSkipEffect');
    }
  	
    public skipEffectToken() {
        if(!this.bga.gameui.checkAction('actSkipEffectToken')) {
            return;
        }

        this.takeNoLockAction('actSkipEffectToken');
    }
  	
    public confirmActivations() {
        if(!this.bga.gameui.checkAction('actConfirmActivations')) {
            return;
        }

        this.takeAction('actConfirmActivations');
    }
  	
    public cancelLastMove() {
        if(!this.bga.gameui.checkAction('actCancelLastMove')) {
            return;
        }

        this.takeNoLockAction('actCancelLastMove');
    }
  	
    public cancelLastMoves() {
        if(!this.bga.gameui.checkAction('actCancelLastMoves')) {
            return;
        }

        this.takeNoLockAction('actCancelLastMoves');
    }
  	
    public chooseToken(type: number) {
        /*if(!this.bga.gameui.checkAction('actChooseToken')) {
            return;
        }*/

        this.takeAction('actChooseToken', {
            type, 
        });
    }
  	
    public cancelChooseToken() {
        /*if(!this.bga.gameui.checkAction('actCancelChooseToken')) {
            return;
        }*/

        this.takeAction('actCancelChooseToken');
    }
  	
    public neighborEffect(type: number) {
        if(!this.bga.gameui.checkAction('actNeighborEffect')) {
            return;
        }

        this.takeNoLockAction('actNeighborEffect', {
            type,
        });
    }
  	
    public applyNeighborEffect(type: number) {
        if(!this.bga.gameui.checkAction('actApplyNeighborEffect')) {
            return;
        }

        this.takeNoLockAction('actApplyNeighborEffect', {
            type,
        });
    }
  	
    public cancelNeighborEffect() {
        if(!this.bga.gameui.checkAction('actCancelNeighborEffect')) {
            return;
        }

        this.takeNoLockAction('actCancelNeighborEffect');
    }
  	
    public buyCard(level: number, type: number) {
        if(!this.bga.gameui.checkAction('actBuyCard')) {
            return;
        }

        this.takeNoLockAction('actBuyCard', {
            level,
            type,
        });
    }
  	
    public endTurn() {
        if(!this.bga.gameui.checkAction('actEndTurn')) {
            return;
        }

        this.takeAction('actEndTurn');
    }
  	
    public endGame() {
        if(!this.bga.gameui.checkAction('actEndGame')) {
            return;
        }

        this.takeAction('actEndGame');
    }

    public setAutoGain(autoGain: boolean) {
        this.takeNoLockAction('actSetAutoGain', {
            autoGain
        }, true);
    }

    public useRage(id: number): void {
        this.takeAction('actUseRage', {
            id,
        });
    }

    public useObject(number: number): void {
        this.takeNoLockAction('actUseObject', {
            number,
        });
    }

    public cancelObject(): void {
        /*if(!this.bga.gameui.checkAction('actCancelObject')) {
            return;
        }*/

        this.takeNoLockAction('actCancelObject');
    }

    public useMobilePhone(id: number, type: number): void {
        if(!this.bga.gameui.checkAction('actUseMobilePhone')) {
            return;
        }

        this.takeNoLockAction('actUseMobilePhone', {
            id,
            type,
        });
    }

    public useMinibar(left: number, right: number): void {
        if(!this.bga.gameui.checkAction('actUseMinibar')) {
            return;
        }

        this.takeNoLockAction('actUseMinibar', {
            left,
            right,
        });
    }

    public useGhettoBlaster(id: number): void {
        if(!this.bga.gameui.checkAction('actUseGhettoBlaster')) {
            return;
        }

        this.takeNoLockAction('actUseGhettoBlaster', {
            id,
        });
    }

    public useGameConsole(id: number): void {
        if(!this.bga.gameui.checkAction('actUseGameConsole')) {
            return;
        }

        this.takeNoLockAction('actUseGameConsole', {
            id,
        });
    }

    public useMoped(type: number, level: number): void {
        this.takeNoLockAction('actUseMoped', {
            type,
            level,
        });
    }

    public takeAction(action: string, data?: any) {
        data = data || {};
        this.bga.actions.performAction(action, data, { checkAction: false });
    }
    public takeNoLockAction(action: string, data?: any, invisible: boolean = false) {
        if (!invisible && this.bga.gameui.isCurrentPlayerActive()) {   
            document.getElementById("gameaction_status").innerHTML = __("lang_mainsite", "Updating game situation ...");
            document.getElementById("pagemaintitle_wrap").style.display = "none";
            document.getElementById("gameaction_status_wrap").style.display = "block";
        }

        data = data || {};
        this.bga.actions.performAction(action, data, { checkAction: false, lock: false });
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

        const notifs: [string, number | undefined][] = [
            ['newRound', ANIMATION_MS],
            ['switchedCards', 1],
            ['activatedEffect', 1],
            ['selectedToken', 1],
            ['revealTokens', ANIMATION_MS],
            ['buyCard', ANIMATION_MS],
            ['endRound', ANIMATION_MS],
            ['removedCard', ANIMATION_MS],
            ['addCardToLine', ANIMATION_MS],
            ['replaceLineCard', ANIMATION_MS * 2],
            ['replaceLineCardDeck', undefined],
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
                promise?.then(() => this.bga.gameui.notifqueue.onSynchronousNotificationEnd());
            });
            this.bga.gameui.notifqueue.setSynchronous(notif[0], notif[1]);
        });

        if (isDebug) {
            notifs.forEach((notif) => {
                if (!this[`notif_${notif[0]}`]) {
                    console.warn(`notif_${notif[0]} function is not declared, but listed in setupNotifications`);
                }
            });

            Object.getOwnPropertyNames(Game.prototype).filter(item => item.startsWith('notif_')).map(item => item.slice(6)).forEach(item => {
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

    notif_removedCard(args: NotifRemovedCardArgs) {
        this.getPlayerTable(args.playerId).removeCard(args.card, args.line);
        this.notif_activatedEffect(args);
    }  

    notif_addCardToLine(args: NotifAddCardToLineArgs) {
        this.getPlayerTable(args.playerId).addCardToLine(args.card, args.line, args.deckCount, args.deckTopCard);
        this.notif_activatedEffect(args);
    }   

    async notif_replaceLineCard(args: NotifReplaceLineCardArgs): Promise<boolean> {
        console.log(args)
        await this.tableCenter.addCardForReplaceLine(args.oldCard, false);
        await this.tableCenter.addCardForReplaceLine(args.newCard, true);
        this.tableCenter.replaceLineCardUpdateCounters(args.table, args.tableTopCards);
        await this.getPlayerTable(args.playerId).replaceLineCard(args.newCard);
        this.notif_activatedEffect(args);
        return true;
    }  

    async notif_replaceLineCardDeck(args: NotifReplaceLineCardArgs) {
        const playerTable = this.getPlayerTable(args.playerId);
        await playerTable.discardCard(args.oldCard);
        await playerTable.replaceLineCard(args.newCard);
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

        if (args.removeLastTurn) {
            document.getElementById('last-round')?.remove();
        }
    }

    notif_deckTopCard(args: NotifDeckTopCardArgs) {
        this.getPlayerTable(args.playerId).deckTopCard(args.card);
    }
    
    /** 
     * Show last turn banner.
     */ 
    notif_lastTurn(animate: boolean = true) {
        document.getElementById('page-title').insertAdjacentHTML('beforeend', `<div id="last-round">
            <span class="last-round-text ${animate ? 'animate' : ''}">${_("This is the final round!")}</span>
        </div>`);
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
    public bgaFormatText(log: string, args: any): { log: string; args: any } {
        try {
            if (log && args && !args.processed) {
                for (const property in args) {
                    if (['level', 'type', 'object'].includes(property) && args[property] != null && args[property][0] != '<') {
                        args[property] = `<strong>${_(args[property])}</strong>`;
                    }
                }

                for (const property in args) {
                    if (args[property]?.indexOf?.(']') > 0) {
                        args[property] = formatTextIcons(_(args[property]));
                    }
                }

                log = formatTextIcons(log);
            }
        } catch (e) {
            console.error(log,args,"Exception thrown", e.stack);
        }
        return { log, args };
    }
}
