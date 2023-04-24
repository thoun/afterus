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
                div.dataset.level = ''+card.level;
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

        const frameDiv = document.createElement('div');
        frameDiv.classList.add('frame');
        if (frame.type == OPENED_LEFT) {
            frameDiv.classList.add('opened-left');
        } else if (frame.type == OPENED_RIGHT) {
            frameDiv.classList.add('opened-right');
        }
        frameDiv.dataset.row = ''+row;
        frameDiv.dataset.index = ''+index;
        frameDiv.dataset.positionIndex = ''+positionIndex;
        frameDiv.dataset.left = JSON.stringify(frame.left);
        frameDiv.dataset.right = JSON.stringify(frame.right);
        frameDiv.dataset.convertSign = JSON.stringify(frame.convertSign);
        frameDiv.style.setProperty('--width', ` ${width}px`);

        div.appendChild(frameDiv);

        frameDiv.addEventListener('click', () => {
            const cardDivId = +(div.closest('.card') as HTMLDivElement).dataset.cardId;
            const cardIndex = this.getCardStock({ id: cardDivId } as Card).getCards().find(c => c.id == cardDivId).locationArg;
            this.game.onFrameClicked(row, cardIndex, index);
        });
    }
    
    private createFrames(div: HTMLElement, frames: Frame[][]) {
        for (let row = 0; row < 3; row++) {
            frames[row].forEach((frame, index) => 
                this.createFrame(div, frame, row, index, frame.type == OPENED_RIGHT ? 2 : (frame.type == CLOSED && frames[row].filter(f => f.type == CLOSED).length == 1 ? 1 : index))
            );
        }
    }
}