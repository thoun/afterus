const OPENED_LEFT = 1;
const CLOSED = 2;
const OPENED_RIGHT = 3;

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
                if (card.playerId) {
                    div.dataset.playerColor = ''+game.getPlayerColor(card.playerId);
                }

                if (card.frames) {
                    this.createFrames(div, card.frames);
                }
            },
        });
    }

    private createFrame(div: HTMLElement, frame: Frame, row: number, index: number, positionIndex: number) {
        let width = 11 + (frame.left.length * 17) + (frame.convertSign ? 8 : 0) + (frame.right.length * 17);

        div.insertAdjacentHTML('beforeend', `
            <div class="frame ${frame.type == OPENED_LEFT ? 'opened-left' : (frame.type == OPENED_RIGHT ? 'opened-right' : '')}" data-row="${row}" data-index="${index}" data-position-index="${positionIndex}" data-left="${JSON.stringify(frame.left)}" data-right="${JSON.stringify(frame.right)}" data-convert-sign="${JSON.stringify(frame.convertSign)}" style="--width: ${width}px"></div>
        `);
    }
    
    private createFrames(div: HTMLElement, frames: Frame[][]) {
        for (let row = 0; row < 3; row++) {
            frames[row].forEach((frame, index) => 
                this.createFrame(div, frame, row, index, frame.type == OPENED_RIGHT ? 2 : (frame.type == CLOSED && frames[row].filter(f => f.type == CLOSED).length == 1 ? 1 : index))
            );
        }
    }
}