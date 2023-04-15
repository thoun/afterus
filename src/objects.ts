class ObjectsManager extends CardManager<number> {
    constructor (public game: AfterUsGame) {
        super(game, {
            getId: (card) => `object-${card}`,
            setupDiv: (card: number, div: HTMLElement) => { 
                div.classList.add('object');
                game.setTooltip(div.id, this.getTooltip(card));
            },
            setupFrontDiv: (card: number, div: HTMLElement) => { 
                div.dataset.number = ''+card;

            },
        });
    }

    private getTooltip(number: number): string {
        let message = '';
        switch (number) {
            case 1: message = _("(+2) if you have 1 or 3 orange cards."); break;
            case 2: message = _("(-2) if orange cards are in the scoring column with either value (1) or value (2)."); break;
            case 3: message = _("(+2) if you have 2 or 4 blue cards."); break;
            case 4: message = _("(+2) if blue is the colour you have the most cards of (or if blue is tied)."); break;
            case 5: message = _("(-2) if you are the player with the least pink cards (or are tied for the least pink cards)."); break;
            case 6: message = _("(+2) if you are the player with the most pink cards (or are tied for the most pink cards)."); break;
            case 7: message = _("(+2) if no colour is on the right of the green column."); break;
        }

        message = message.replaceAll(/\(([+-]?\d)\)/g, (a, b) => { console.log(a, b); 
            return `<div class="points-circle" data-negative="${Number(b) < 0}">${b}</div>`; 
        });
        //points-circle
        console.log(message);

        return message;
        
    }
}