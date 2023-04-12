class CardsManager extends CardManager<Card> {
    constructor (public game: AfterUsGame) {
        super(game, {
            getId: (card) => `card-${card.id}`,
            setupDiv: (card: Card, div: HTMLElement) => {
                div.dataset.cardId = ''+card.id;
            },
            setupFrontDiv: (card: Card, div: HTMLElement) => { 
                div.dataset.type = ''+card.type;
                div.dataset.subType = ''+card.subType;
                div.dataset.playerColor = ''+game.getPlayerColor(card.playerId);
            },
        });
    }
}