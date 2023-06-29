const OPENED_LEFT = 1;
const CLOSED = 2;
const OPENED_RIGHT = 3;

const CARD_WIDTH = 142;
const CARD_HEIGHT = 198;

class CardsManager extends CardManager<Card> {
    constructor (public game: AfterUsGame) {
        super(game, {
            getId: (card) => `card-${card.id}`,
            setupDiv: (card: Card, div: HTMLElement) => {
                div.dataset.cardId = ''+card.id;
            },
            setupFrontDiv: (card: Card, div: HTMLElement) => this.setupFrontDiv(card, div),
            isCardVisible: card => card.type !== null && card.type !== undefined,
            cardWidth: 142,
            cardHeight: 198,
        });
    }

    private setupFrontDiv(card: Card, div: HTMLElement, ignoreTooltip: boolean = false) { 
        div.id = `${this.getId(card)}-front`;

        div.dataset.level = ''+card.level;
        div.dataset.type = ''+card.type;
        div.dataset.subType = ''+card.subType;
        div.dataset.playerColor = card.playerId ? ''+this.game.getPlayerColor(card.playerId) : '';

        if (card.frames && !div.querySelector('.frame')) {
            this.createFrames(div, card.frames);
        }

        if (!ignoreTooltip) {
            const tooltip = this.getTooltip(card);
            if (tooltip) {
                this.game.setTooltip(div.id, tooltip);
            }
        }
    }

    private createFrame(div: HTMLElement, frame: Frame, row: number, index: number, left: number | null = null) {
        let width = 11 + (Math.max(1, frame.left.length + frame.right.length) * 17) + (frame.convertSign ? 8 : 0);
        if (frame.left.some(resource => resource[1] == PER_TAMARINS)) {
            width += 16;
        }
        if (frame.left.some(resource => resource[1] == DIFFERENT)) {
            width += 3;
        }
        if (frame.right.some(resource => resource[1] == RAGE)) {
            width += 5;
        }

        const frameDiv = document.createElement('div');
        frameDiv.classList.add('frame');
        if (frame.type == OPENED_LEFT) {
            frameDiv.classList.add('opened-left');
        } else if (frame.type == OPENED_RIGHT) {
            frameDiv.classList.add('opened-right');
        }
        frameDiv.dataset.row = ''+row;
        frameDiv.dataset.index = ''+index;
        frameDiv.dataset.left = JSON.stringify(frame.left);
        frameDiv.dataset.right = JSON.stringify(frame.right);
        frameDiv.dataset.convertSign = JSON.stringify(frame.convertSign);
        frameDiv.style.setProperty('--width', ` ${width}px`);
        if (left !== null) {
            frameDiv.style.setProperty('--left', ` ${left}px`);
        }

        div.appendChild(frameDiv);

        frameDiv.addEventListener('click', () => {
            const cardDivId = +(div.closest('.card') as HTMLDivElement).dataset.cardId;
            const cardIndex = this.getCardStock({ id: cardDivId } as Card).getCards().find(c => c.id == cardDivId).locationArg;
            this.game.onFrameClicked(row, cardIndex, index);
        });

        return frameDiv;
    }

    private propertyToNumber(div: HTMLElement, property: string) {
        const match = div.style.getPropertyValue(`--${property}`).match(/\d+/);
        return match?.length ? Number(match[0]) : 0;
    }
    
    private createFrames(div: HTMLElement, frames: Frame[][]) {
        for (let row = 0; row < 3; row++) {
            const frameOpenedLeft = frames[row].find(frame => frame.type == OPENED_LEFT);
            let leftFrameDiv = null;
            if (frameOpenedLeft) {
                leftFrameDiv = this.createFrame(div, frameOpenedLeft, row, 0);
            }
            const frameOpenedRight = frames[row].find(frame => frame.type == OPENED_RIGHT);
            let rightFrameDiv = null;
            if (frameOpenedRight) {
                rightFrameDiv = this.createFrame(div, frameOpenedRight, row, frames[row].length - 1);
            }

            frames[row].forEach((frame, index) => {
                if (frame != frameOpenedLeft && frame != frameOpenedRight) {
                    let left = index == 0 && frames[row].length === 3 ? 7 : 34;
                    const frameDiv = this.createFrame(div, frame, row, index, left);
                    if (index == 0) {
                        leftFrameDiv = frameDiv;
                    }
                    if (leftFrameDiv && rightFrameDiv && index == 1 && frames[row].length == 3) {
                        const leftWidth = this.propertyToNumber(leftFrameDiv, 'left') + this.propertyToNumber(leftFrameDiv, 'width');
                        const space = 142 - leftWidth - this.propertyToNumber(rightFrameDiv, 'width');
                        frameDiv.style.setProperty('--left', `${leftWidth + (space - this.propertyToNumber(frameDiv, 'width')) / 2}px`);
                    } else if (leftFrameDiv && index == 1 && frames[row].length == 2) {
                        const leftWidth = this.propertyToNumber(leftFrameDiv, 'left') + this.propertyToNumber(leftFrameDiv, 'width');
                        frameDiv.style.setProperty('--left', `${leftWidth + 26}px`);
                    } else if (rightFrameDiv && index == 0 && frames[row].length == 2) {
                        const left = 142 - this.propertyToNumber(rightFrameDiv, 'width');
                        frameDiv.style.setProperty('--left', `${left - this.propertyToNumber(frameDiv, 'width') - 26}px`);
                    }
                }
            });
        }
    }

    public getMonkeyType(type: number): string {
        switch (type) {
            case 0: return _('tamarin');
            case 1: return _('mandrill');
            case 2: return _('orangutan');
            case 3: return _('gorilla');
            case 4: return _('chimpanzee');
        }
    }

    private getTooltip(card: Card) {
        if (!card.number) {
            return undefined;
        }

        return `${_('${type} level ${level}').replace('${type}', `<strong>${this.getMonkeyType(card.type)}</strong>`).replace('${level}', `<strong>${card.level}</strong>`)}<br>
        ${_('Rage gain:')} ${card.rageGain[0]} ${formatTextIcons(getResourceCode(card.rageGain[1]))}<br>
        ${_('Card number:')} ${card.number}`;
    }
    
    public setForHelp(card: Card, divId: string): void {
        const div = document.getElementById(divId);
        div.classList.add('card');
        div.dataset.side = 'front';
        div.innerHTML = `
        <div class="card-sides">
            <div class="card-side front">
            </div>
            <div class="card-side back">
            </div>
        </div>`
        this.setupFrontDiv(card, div.querySelector('.front'), true);
    }
}