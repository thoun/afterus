const OPENED_LEFT = 1;
const CLOSED = 2;
const OPENED_RIGHT = 3;

const CARD_WIDTH = 142;
const CARD_HEIGHT = 198;

const FRAME_GROUP_FIX = {
    0: { // type
        0: { // level
            7: { // index
                0: [26, null], // row
            },
        },
    },
    1: { // type
        1: { // level
            1: { // index
                0: [32, null], // row
                1: [19, null], // row
            },
            2: { // index
                0: [19, null], // row
                2: [7, null], // row
            },
            3: { // index
                0: [null, 8], // row
                1: [19, null], // row
                2: [8, null], // row
            },
            5: { // index
                0: [null, 17], // row
                1: [null, 27], // row
            },
            6: { // index
                0: [null, 18], // row
                1: [null, 35], // row
            },
            7: { // index
                1: [null, 15], // row
            },
            8: { // index
                0: [26, null], // row
                1: [23, null], // row
            },
            9: { // index
                0: [24, null], // row
                1: [40, null], // row
                2: [8, null], // row
            },
            11: { // index
                0: [null, 6], // row
                1: [10, null], // row
            },
            12: { // index
                0: [12, null], // row
                2: [4, null], // row
            },
            13: { // index
                1: [20, null], // row
            },
            14: { // index
                1: [0, 51], // row
            },
            15: { // index
                0: [72, 0], // row
                2: [0, 48], // row
            },
            17: { // index
                0: [null, 8], // row
                2: [15, null], // row
            },
            18: { // index
                0: [2, null], // row
                1: [9, null], // row
            },
        },
        2: { // level
            1: { // index
                0: [32, 13], // row
                1: [31, null], // row
                2: [41, null], // row
            },
            2: { // index
                0: [-2, null], // row
                1: [null, 15], // row
                2: [-2, null], // row
            },
            3: { // index
                0: [30, 1], // row
                2: [0, 0], // row
            },
            4: { // index
                1: [37, null], // row
                2: [12, null], // row
            },
            5: { // index
                0: [32, 5], // row
                1: [33, null], // row
            },
            6: { // index
                0: [30, null], // row
                1: [25, null], // row
                2: [39, null], // row
            },
            7: { // index
                0: [33, null], // row
                1: [42, null], // row
            },
            8: { // index
                0: [8, 8], // row
                2: [null, 33], // row
            },
            9: { // index
                0: [31, null], // row
                2: [13, null], // row
            },
            10: { // index
                0: [28, null], // row
                1: [10, null], // row
                2: [37, null], // row
            },
            11: { // index
                0: [58, null], // row
                1: [36, null], // row
            },
            12: { // index
                0: [8, 8], // row
                1: [41, 41], // row
            },
        },
    },
    2: { // type
        1: { // level
            1: { // index
                1: [35, null], // row
            },
            3: { // index
                2: [17, null], // row
            },
            4: { // index
                0: [9, null], // row
            },
            5: { // index
                0: [11, 11], // row
            },
            6: { // index
                0: [6, null], // row
            },
            7: { // index
                1: [8, null], // row
            },
            8: { // index
                0: [32, 4], // row
                1: [null, 37], // row
            },
            9: { // index
                0: [20, null], // row
                1: [2, null], // row
                2: [25, null], // row
            },
            10: { // index
                0: [null, 12], // row
            },
            11: { // index
                1: [null, 0], // row
            },
            12: { // index
                1: [0, 68], // row
            },
            13: { // index
                0: [null, 5], // row
            },
            14: { // index
                0: [39, 0], // row
            },
            15: { // index
                0: [8, null], // row
                1: [41, null], // row
            },
            16: { // index
                0: [null, 10], // row
                2: [16, null], // row
            },
            17: { // index
                0: [8, null], // row
                1: [null, 8], // row
            },
            18: { // index
                0: [null, 32], // row
            },
        },
        2: { // level
            1: { // index
                0: [null, 24], // row
                1: [32, null], // row
                2: [10, null], // row
            },
            2: { // index
                1: [4, 1], // row
                2: [28, null], // row
            },
            3: { // index
                0: [null, 20], // row
                1: [40, null], // row
                2: [41, null], // row
            },
            4: { // index
                0: [null, 20], // row
                1: [40, null], // row
                2: [41, null], // row
            },
            5: { // index
                0: [2, 32], // row
                1: [22, null], // row
            },
            6: { // index
                0: [40, 0], // row
                1: [38, 2], // row
            },
            7: { // index
                0: [32, 1], // row
                1: [40, null], // row
            },
            8: { // index
                0: [18, null], // row
                1: [10, null], // row
            },
            10: { // index
                0: [32, null], // row
                1: [40, null], // row
            },
            11: { // index
                1: [39, 2], // row
                2: [39, null], // row
            },
            12: { // index
                0: [null, 20], // row
                1: [39, null], // row
                2: [16, null], // row
            },
        },
    },
    3: { // type
        1: { // level
            2: { // index
                2: [4, 58], // row
            },
            5: { // index
                0: [8, null], // row
            },
            6: { // index
                2: [15, null], // row
            },
            7: { // index
                0: [13, 32], // row
            },
            8: { // index
                0: [32, 2], // row
                2: [47, 39], // row
            },
            9: { // index
                0: [null, 21], // row
            },
            10: { // index
                1: [0, 32], // row
            },
            11: { // index
                1: [0, 48], // row
                2: [6, null], // row
            },
            12: { // index
                0: [12, 30], // row
                1: [0, 46], // row
            },
            13: { // index
                2: [0, 56], // row
            },
            15: { // index
                0: [32, 2], // row
                1: [0, 48], // row
            },
            16: { // index
                1: [18, null], // row
            },
            17: { // index
                1: [26, null], // row
            },
            18: { // index
                1: [null, 14], // row
            },
        },
        2: { // level
            1: { // index
                2: [null, 33], // row
            },
            2: { // index
                0: [null, 24], // row
                1: [28, null], // row
                2: [5, 0], // row
            },
            3: { // index
                0: [0, 36], // row
                1: [38, null], // row
                2: [null, 36], // row
            },
            4: { // index
                0: [4, 32], // row
                1: [null, 41], // row
                2: [null, 36], // row
            },
            5: { // index
                0: [50, 0], // row
                2: [7, 37], // row
            },
            6: { // index
                0: [null, 3], // row
                1: [8, null], // row
                2: [44, null], // row
            },
            7: { // index
                0: [19, null], // row
                1: [null, 6], // row
            },
            8: { // index
                0: [44, 0], // row
                1: [34, null], // row
            },
            9: { // index
                0: [null, 32], // row
                1: [null, 20], // row
                2: [4, 0], // row
            },
            10: { // index
                0: [null, 32], // row
                1: [null, 6], // row
            },
            11: { // index
                0: [27, null], // row
                1: [null, 34], // row
                2: [2, 2], // row
            },
            12: { // index
                0: [null, 32], // row
            },
        },
    },
    4: { // type
        1: { // level
            1: { // index
                0: [16, 16], // row
                1: [26, null], // row
            },
            4: { // index
                0: [null, 0], // row
                1: [9, 41], // row
                2: [0, null], // row
            },
            5: { // index
                0: [null, 20], // row
            },
            6: { // index
                0: [12, null], // row
                1: [18, null], // row
            },
            10: { // index
                2: [5, null], // row
            },
            11: { // index
                1: [0, null], // row
            },
            12: { // index
                0: [null, 0], // row
                1: [16, null], // row
            },
            14: { // index
                0: [null, 1], // row
                1: [11, null], // row
                2: [35, null], // row
            },
            15: { // index
                1: [33, null], // row
            },
            16: { // index
                1: [9, 42], // row
            },
            17: { // index
                1: [null, 16], // row
            },
            18: { // index
                1: [10, null], // row
            },
        },
        2: { // level
            1: { // index
                2: [12, null], // row
            },
            2: { // index
                1: [6, null], // row
            },
            3: { // index
                0: [16, null], // row
            },
            4: { // index
                1: [32, null], // row
                2: [34, null], // row
            },
            5: { // index
                0: [null, 5], // row
                2: [41, null], // row
            },
            6: { // index
                0: [null, 9], // row
                1: [2, null], // row
            },
            7: { // index
                0: [null, 28], // row
                1: [null, 15], // row
                2: [41, null], // row
            },
            8: { // index
                1: [40, null], // row
                2: [6, 6], // row
            },
            9: { // index
                0: [null, 8], // row
                1: [38, 4], // row
                2: [42, null], // row
            },
            10: { // index
                1: [21, null], // row
                2: [40, null], // row
            },
            11: { // index
                0: [null, 26], // row
                1: [17, null], // row
                2: [41, null], // row
            },
            12: { // index
                1: [40, null], // row
                2: [2, 2], // row
            },
        },
    },
};

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
            this.createFrames(div, card.frames, card.id > 9999);
        }

        if (!ignoreTooltip) {
            const tooltip = this.getTooltip(card);
            if (tooltip) {
                this.game.setTooltip(div.id, tooltip);
            }
        }
    }

    private createFrame(div: HTMLElement, frame: Frame, row: number, index: number, left: number | null = null, debug: boolean) {
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

            if (!frame.left.length) {
                width = 34;
            }
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

        if (debug) {
            frameDiv.classList.add('debug');
            frameDiv.innerHTML = `${getResourcesQuantityIcons(frame.left)} ${frame.convertSign ? '&gt;' : ''} ${getResourcesQuantityIcons(frame.right)}`
        }

        return frameDiv;
    }

    private propertyToNumber(div: HTMLElement, property: string) {
        const match = div.style.getPropertyValue(`--${property}`).match(/\d+/);
        return match?.length ? Number(match[0]) : 0;
    }
    
    private createFrames(div: HTMLElement, frames: Frame[][], debug: boolean) {
        for (let row = 0; row < 3; row++) {
            const frameOpenedLeft = frames[row].find(frame => frame.type == OPENED_LEFT);
            let leftFrameDiv = null;
            if (frameOpenedLeft) {
                leftFrameDiv = this.createFrame(div, frameOpenedLeft, row, 0, null, debug);
            }
            const frameOpenedRight = frames[row].find(frame => frame.type == OPENED_RIGHT);
            let rightFrameDiv = null;
            if (frameOpenedRight) {
                rightFrameDiv = this.createFrame(div, frameOpenedRight, row, frames[row].length - 1, null, debug);
            }

            const minLeft = leftFrameDiv ? this.propertyToNumber(leftFrameDiv, 'width') + 7 : 32;
            const minRight = rightFrameDiv ? this.propertyToNumber(rightFrameDiv, 'width') + 7 : 32;

            const centerFrames = frames[row].filter(frame => frame != frameOpenedLeft && frame != frameOpenedRight);
            if (centerFrames.length) {
                const positionFix = FRAME_GROUP_FIX[div.dataset.type]?.[div.dataset.level]?.[div.dataset.subType]?.[row] ?? [];

                const frameGroupDiv = document.createElement('div');
                frameGroupDiv.classList.add('frame-group');
                frameGroupDiv.dataset.row = ''+row;
                frameGroupDiv.style.setProperty('--left', ` ${positionFix[0] ?? minLeft}px`);
                frameGroupDiv.style.setProperty('--right', ` ${positionFix[1] ?? minRight}px`);

                div.appendChild(frameGroupDiv);

                frames[row].forEach((frame, index) => {
                if (frame != frameOpenedLeft && frame != frameOpenedRight) {
                        let left = index == 0 && frames[row].length === 3 ? 7 : 34;
                        const frameDiv = this.createFrame(frameGroupDiv, frame, row, index, left, debug);
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

        return `${(card.level > 0 ? _('${type} level ${level}') : '${type}').replace('${type}', `<strong>${this.getMonkeyType(card.type)}</strong>`).replace('${level}', `<strong>${card.level}</strong>`)}<br>
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

    // gameui.cardsManager.debugShowAllCards()
    private debugShowAllCards() {
        const TEMP = (this.game as any).gamedatas.TEMP;

        /*document.getElementById(`table`).insertAdjacentHTML(`afterbegin`, `
            <div id="all-0" class="debug"></div>
        `);
        const tamarins = new LineStock<Card>(this, document.getElementById(`all-0`));
        Object.entries(TEMP[0]).forEach((entry: any) => {
            const card = {
                ...entry[1],
                id: 10000 + Number(entry[0]),
                level: 0,
                type: 0,
                subType: Number(entry[0]),
                playerId: 2343492,
            } as Card;
            tamarins.addCard(card);
        });
        document.getElementById(`all-0`).querySelectorAll('.frame').forEach(frame => frame.classList.add('remaining'));*/

        [1, 2, 3, 4].forEach(type => {
            [1, 2].forEach(level => {
                const typeAndLevel = type * 10 + level;
                document.getElementById(`table`).insertAdjacentHTML(`afterbegin`, `
                    <div id="all-${typeAndLevel}" class="debug"></div>
                `);
                const stock = new LineStock<Card>(this, document.getElementById(`all-${typeAndLevel}`));
                Object.entries(TEMP[typeAndLevel]).forEach((entry: any) => {
                    const card = {
                        ...entry[1],
                        id: 10000 + typeAndLevel*100 + Number(entry[0]),
                        level,
                        type,
                        subType: Number(entry[0]),
                        playerId: 2343492,
                    } as Card;
                    stock.addCard(card);
                });
                document.getElementById(`all-${typeAndLevel}`).querySelectorAll('.frame').forEach(frame => frame.classList.add('remaining'));
            });
        });
    }
}