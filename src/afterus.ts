declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;

const ANIMATION_MS = 500;
const ACTION_TIMER_DURATION = 5;

const LOCAL_STORAGE_ZOOM_KEY = 'AfterUs-zoom';

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
            case 'chooseCard':
                this.getCurrentPlayerTable()?.setSelectable(true);
                break;
        }
    }

    public onLeavingState(stateName: string) {
        log( 'Leaving state: '+stateName );

        switch (stateName) {
           case 'chooseCard':
                this.getCurrentPlayerTable()?.setSelectable(false);
                break;
        }
    }

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    public onUpdateActionButtons(stateName: string, args: any) {
        if (stateName === 'chooseCard') {
            if (!(this as any).isCurrentPlayerActive() && Object.keys(this.gamedatas.players).includes(''+this.getPlayerId())) { // ignore spectators
                (this as any).addActionButton(`cancelChooseSecretMissions-button`, _("I changed my mind"), () => this.cancelChooseCard(), null, null, 'gray');
            }
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
        }
        
        // Call onPreferenceChange() when any value changes
        dojo.query(".preference_control").connect("onchange", onchange);
        
        // Call onPreferenceChange() now
        dojo.forEach(
          dojo.query("#ingame_menu_content .preference_control"),
          el => onchange({ target: el })
        );
    }

    private getOrderedPlayers(gamedatas: AfterUsGamedatas) {
        const players = Object.values(gamedatas.players).sort((a, b) => a.playerNo - b.playerNo);
        const playerIndex = players.findIndex(player => Number(player.id) === Number((this as any).player_id));
        const orderedPlayers = playerIndex > 0 ? [...players.slice(playerIndex), ...players.slice(0, playerIndex)] : players;
        return orderedPlayers;
    }

    private createPlayerPanels(gamedatas: AfterUsGamedatas) {

        Object.values(gamedatas.players).forEach(player => {
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
            flowerCounter.setValue(player.flower);
            this.flowerCounters[playerId] = flowerCounter;

            const fruitCounter = new ebg.counter();
            fruitCounter.create(`fruit-counter-${player.id}`);
            fruitCounter.setValue(player.fruit);
            this.fruitCounters[playerId] = fruitCounter;

            const grainCounter = new ebg.counter();
            grainCounter.create(`grain-counter-${player.id}`);
            grainCounter.setValue(player.grain);
            this.grainCounters[playerId] = grainCounter;

            const energyCounter = new ebg.counter();
            energyCounter.create(`energy-counter-${player.id}`);
            energyCounter.setValue(player.energy);
            this.energyCounters[playerId] = energyCounter;

            const rageCounter = new ebg.counter();
            rageCounter.create(`rage-counter-${player.id}`);
            rageCounter.setValue(player.rage);
            this.rageCounters[playerId] = rageCounter;
        });
    }

    private createPlayerTables(gamedatas: AfterUsGamedatas) {
        const orderedPlayers = this.getOrderedPlayers(gamedatas);

        orderedPlayers.forEach(player => 
            this.createPlayerTable(gamedatas, Number(player.id))
        );
    }

    private createPlayerTable(gamedatas: AfterUsGamedatas, playerId: number) {
        const table = new PlayerTable(this, gamedatas.players[playerId], gamedatas.costs);
        this.playersTables.push(table);
    }

    private setScore(playerId: number, score: number) {
        (this as any).scoreCtrl[playerId]?.toValue(score);
    }

    public onHandCardClick(card: Card): void {
        this.chooseCard(card.id);
    }
  	
    public chooseCard(id: number) {
        /*if(!(this as any).checkAction('chooseCard')) {
            return;
        }*/

        this.takeAction('chooseCard', {
            id
        });
    }
  	
    public cancelChooseCard() {
        /*if(!(this as any).checkAction('cancelChooseCard')) {
            return;
        }*/

        this.takeAction('cancelChooseCard');
    }

    public takeAction(action: string, data?: any) {
        data = data || {};
        data.lock = true;
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
            ['newRound', 1],
            ['selectedCard', 1],
            ['delayBeforeReveal', ANIMATION_MS],
            ['revealCards', ANIMATION_MS * 2],
            ['placeCardUnder', ANIMATION_MS],
            ['delayAfterLineUnder', ANIMATION_MS * 2],
            ['scoreCard', ANIMATION_MS * 2],
            ['moveTableLine', ANIMATION_MS],
            ['delayBeforeNewRound', ANIMATION_MS],
            ['newCard', 1],
        ];
    
        notifs.forEach((notif) => {
            dojo.subscribe(notif[0], this, `notif_${notif[0]}`);
            (this as any).notifqueue.setSynchronous(notif[0], notif[1]);
        });
    }

    notif_newRound(notif: Notif<NotifNewRoundArgs>) {
        this.playersTables.forEach(table => table.newRound(notif.args.costs));
    }

    notif_selectedCard(notif: Notif<NotifSelectedCardArgs>) {
        const currentPlayer = this.getPlayerId() == notif.args.playerId;
        if (notif.args.card.number || !currentPlayer) {
            if (notif.args.cancel) {
                if (currentPlayer) {
                    this.getCurrentPlayerTable().hand.addCard(notif.args.card);
                } else {
                    this.tableCenter.cancelPlacedCard(notif.args.card);
                }
            } else {
                this.tableCenter.setPlacedCard(notif.args.card, currentPlayer);
            }
        }
    }

    notif_delayBeforeReveal() {}

    notif_revealCards(notif: Notif<NotifRevealCardsArgs>) {
        this.tableCenter.revealCards(notif.args.cards);
    }

    notif_placeCardUnder(notif: Notif<NotifPlayerCardArgs>) {
        this.tableCenter.placeCardUnder(notif.args.playerId, notif.args.card);
    }
    
    notif_delayAfterLineUnder() {}

    notif_scoreCard(notif: Notif<NotifScoredCardArgs>) {
        this.getPlayerTable(notif.args.playerId).placeScoreCard(notif.args.card);

        this.setScore(notif.args.playerId, notif.args.playerScore);
    }

    notif_moveTableLine() {
        this.tableCenter.moveTableLine();
    }

    notif_delayBeforeNewRound() {}

    notif_newCard(notif: Notif<NotifPlayerCardArgs>) {
        this.getCurrentPlayerTable().hand.addCard(notif.args.card);
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

                ['scoredCard', 'cardOver', 'cardUnder', 'addedCard'].forEach(attr => {
                    if ((typeof args[attr] !== 'string' || args[attr][0] !== '<') && args[attr + 'Obj']) {
                        const obj: Card = args[attr + 'Obj'];
                        args[attr] = `<strong data-color="${obj.color}">${obj.number}</strong>`;
                        if (obj.points != 0) {
                            args[attr] += ` <div class="points-circle" data-negative="${(obj.points < 0).toString()}">${obj.points > 0 ? '+' : ''}${obj.points}</div>`;
                        }
                    }
                });

                for (const property in args) {
                    if (['column', 'incScoreColumn', 'incScoreCard', 'roundNumber', 'totalScore', 'roundScore'].includes(property) && args[property][0] != '<') {
                        args[property] = `<strong>${_(args[property])}</strong>`;
                    }
                }
                
            }
        } catch (e) {
            console.error(log,args,"Exception thrown", e.stack);
        }
        return (this as any).inherited(arguments);
    }
}