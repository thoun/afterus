const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
;
const log = isDebug ? console.log.bind(window.console) : function () { };
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
function formatTextIcons(rawText) {
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
function getResourceCode(resource) {
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
function getResourcesQuantityIcons(resources) {
    return formatTextIcons(resources.map(resource => `${resource[0]} ${getResourceCode(resource[1])}`).join(' '));
}

const BgaZoom = await globalThis.importEsmLib('bga-zoom', '1.x');
const BgaJumpTo = await globalThis.importEsmLib('bga-jump-to', '1.x');
// Keep the original cards and animations on local AMD builds.
const [Animations, Cards] = await globalThis.importDojoLibs([
    g_gamethemeurl + 'modules/js/bga-animations.js',
    g_gamethemeurl + 'modules/js/bga-cards.js',
]);
await globalThis.importDojoLibs(['ebg/popindialog']);
const AnimationManager = Animations.AnimationManager;
const BgaSlideAnimation = Animations.BgaSlideAnimation;
const CardManager = Cards.CardManager;
const Deck = Cards.Deck;
const LineStock = Cards.LineStock;
const SlotStock = Cards.SlotStock;

const OPENED_LEFT = 1;
const CLOSED = 2;
const OPENED_RIGHT = 3;
const CARD_WIDTH = 142;
const CARD_HEIGHT = 198;
const FRAME_GROUP_FIX = {
    0: {
        0: {
            7: {
                0: [26, null], // row
            },
        },
    },
    1: {
        1: {
            1: {
                0: [32, null], // row
                1: [19, null], // row
            },
            2: {
                0: [19, null], // row
                2: [7, null], // row
            },
            3: {
                0: [null, 8], // row
                1: [19, null], // row
                2: [8, null], // row
            },
            5: {
                0: [null, 17], // row
                1: [null, 27], // row
            },
            6: {
                0: [null, 18], // row
                1: [null, 35], // row
            },
            7: {
                1: [null, 15], // row
            },
            8: {
                0: [26, null], // row
                1: [23, null], // row
            },
            9: {
                0: [24, null], // row
                1: [40, null], // row
                2: [8, null], // row
            },
            11: {
                0: [null, 6], // row
                1: [10, null], // row
            },
            12: {
                0: [12, null], // row
                2: [4, null], // row
            },
            13: {
                1: [20, null], // row
            },
            14: {
                1: [0, 51], // row
            },
            15: {
                0: [72, 0], // row
                2: [0, 48], // row
            },
            17: {
                0: [null, 8], // row
                2: [15, null], // row
            },
            18: {
                0: [2, null], // row
                1: [9, null], // row
            },
        },
        2: {
            1: {
                0: [32, 13], // row
                1: [31, null], // row
                2: [41, null], // row
            },
            2: {
                0: [-2, null], // row
                1: [null, 15], // row
                2: [-2, null], // row
            },
            3: {
                0: [30, 1], // row
                2: [0, 0], // row
            },
            4: {
                1: [37, null], // row
                2: [12, null], // row
            },
            5: {
                0: [32, 5], // row
                1: [33, null], // row
            },
            6: {
                0: [30, null], // row
                1: [25, null], // row
                2: [39, null], // row
            },
            7: {
                0: [33, null], // row
                1: [42, null], // row
            },
            8: {
                0: [8, 8], // row
                2: [null, 33], // row
            },
            9: {
                0: [31, null], // row
                2: [13, null], // row
            },
            10: {
                0: [28, null], // row
                1: [10, null], // row
                2: [37, null], // row
            },
            11: {
                0: [58, null], // row
                1: [36, null], // row
            },
            12: {
                0: [8, 8], // row
                1: [41, 41], // row
            },
        },
    },
    2: {
        1: {
            1: {
                1: [35, null], // row
            },
            3: {
                2: [17, null], // row
            },
            4: {
                0: [9, null], // row
            },
            5: {
                0: [11, 11], // row
            },
            6: {
                0: [6, null], // row
            },
            7: {
                1: [8, null], // row
            },
            8: {
                0: [32, 4], // row
                1: [null, 37], // row
            },
            9: {
                0: [20, null], // row
                1: [2, null], // row
                2: [25, null], // row
            },
            10: {
                0: [null, 12], // row
            },
            11: {
                1: [null, 0], // row
            },
            12: {
                1: [0, 68], // row
            },
            13: {
                0: [null, 5], // row
            },
            14: {
                0: [39, 0], // row
            },
            15: {
                0: [8, null], // row
                1: [41, null], // row
            },
            16: {
                0: [null, 10], // row
                2: [16, null], // row
            },
            17: {
                0: [8, null], // row
                1: [null, 8], // row
            },
            18: {
                0: [null, 32], // row
            },
        },
        2: {
            1: {
                0: [null, 24], // row
                1: [32, null], // row
                2: [10, null], // row
            },
            2: {
                1: [4, 1], // row
                2: [28, null], // row
            },
            3: {
                0: [null, 20], // row
                1: [40, null], // row
                2: [41, null], // row
            },
            4: {
                0: [null, 20], // row
                1: [40, null], // row
                2: [41, null], // row
            },
            5: {
                0: [2, 32], // row
                1: [22, null], // row
            },
            6: {
                0: [40, 0], // row
                1: [38, 2], // row
            },
            7: {
                0: [32, 1], // row
                1: [40, null], // row
            },
            8: {
                0: [18, null], // row
                1: [10, null], // row
            },
            10: {
                0: [32, null], // row
                1: [40, null], // row
            },
            11: {
                1: [39, 2], // row
                2: [39, null], // row
            },
            12: {
                0: [null, 20], // row
                1: [39, null], // row
                2: [16, null], // row
            },
        },
    },
    3: {
        1: {
            2: {
                2: [4, 58], // row
            },
            5: {
                0: [8, null], // row
            },
            6: {
                2: [15, null], // row
            },
            7: {
                0: [13, 32], // row
            },
            8: {
                0: [32, 2], // row
                2: [47, 39], // row
            },
            9: {
                0: [null, 21], // row
            },
            10: {
                1: [0, 32], // row
            },
            11: {
                1: [0, 48], // row
                2: [6, null], // row
            },
            12: {
                0: [12, 30], // row
                1: [0, 46], // row
            },
            13: {
                2: [0, 56], // row
            },
            15: {
                0: [32, 2], // row
                1: [0, 48], // row
            },
            16: {
                1: [18, null], // row
            },
            17: {
                1: [26, null], // row
            },
            18: {
                1: [null, 14], // row
            },
        },
        2: {
            1: {
                2: [null, 33], // row
            },
            2: {
                0: [null, 24], // row
                1: [28, null], // row
                2: [5, 0], // row
            },
            3: {
                0: [0, 36], // row
                1: [38, null], // row
                2: [null, 36], // row
            },
            4: {
                0: [4, 32], // row
                1: [null, 41], // row
                2: [null, 36], // row
            },
            5: {
                0: [50, 0], // row
                2: [7, 37], // row
            },
            6: {
                0: [null, 3], // row
                1: [8, null], // row
                2: [44, null], // row
            },
            7: {
                0: [19, null], // row
                1: [null, 6], // row
            },
            8: {
                0: [44, 0], // row
                1: [34, null], // row
            },
            9: {
                0: [null, 32], // row
                1: [null, 20], // row
                2: [4, 0], // row
            },
            10: {
                0: [null, 32], // row
                1: [null, 6], // row
            },
            11: {
                0: [27, null], // row
                1: [null, 34], // row
                2: [2, 2], // row
            },
            12: {
                0: [null, 32], // row
            },
        },
    },
    4: {
        1: {
            1: {
                0: [16, 16], // row
                1: [26, null], // row
            },
            4: {
                0: [null, 0], // row
                1: [9, 41], // row
                2: [0, null], // row
            },
            5: {
                0: [null, 20], // row
            },
            6: {
                0: [12, null], // row
                1: [18, null], // row
            },
            10: {
                2: [5, null], // row
            },
            11: {
                1: [0, null], // row
            },
            12: {
                0: [null, 0], // row
                1: [16, null], // row
            },
            14: {
                0: [null, 1], // row
                1: [11, null], // row
                2: [35, null], // row
            },
            15: {
                1: [33, null], // row
            },
            16: {
                1: [9, 42], // row
            },
            17: {
                1: [null, 16], // row
            },
            18: {
                1: [10, null], // row
            },
        },
        2: {
            1: {
                2: [12, null], // row
            },
            2: {
                1: [6, null], // row
            },
            3: {
                0: [16, null], // row
            },
            4: {
                1: [32, null], // row
                2: [34, null], // row
            },
            5: {
                0: [null, 5], // row
                2: [41, null], // row
            },
            6: {
                0: [null, 9], // row
                1: [2, null], // row
            },
            7: {
                0: [null, 28], // row
                1: [null, 15], // row
                2: [41, null], // row
            },
            8: {
                1: [40, null], // row
                2: [6, 6], // row
            },
            9: {
                0: [null, 8], // row
                1: [38, 4], // row
                2: [42, null], // row
            },
            10: {
                1: [21, null], // row
                2: [40, null], // row
            },
            11: {
                0: [null, 26], // row
                1: [17, null], // row
                2: [41, null], // row
            },
            12: {
                1: [40, null], // row
                2: [2, 2], // row
            },
        },
    },
};
class CardsManager extends CardManager {
    constructor(afterus) {
        super(afterus.bga.gameui, {
            getId: (card) => `card-${card.id}`,
            setupDiv: (card, div) => {
                div.dataset.cardId = '' + card.id;
            },
            setupFrontDiv: (card, div) => this.setupFrontDiv(card, div),
            isCardVisible: card => card.type !== null && card.type !== undefined,
            cardWidth: 142,
            cardHeight: 198,
        });
        this.afterus = afterus;
    }
    setupFrontDiv(card, div, ignoreTooltip = false) {
        div.id = `${this.getId(card)}-front`;
        div.dataset.level = '' + card.level;
        div.dataset.type = '' + card.type;
        div.dataset.subType = '' + card.subType;
        div.dataset.playerColor = card.playerId ? '' + this.afterus.getPlayerColor(card.playerId) : '';
        if (card.frames && !div.querySelector('.frame')) {
            this.createFrames(div, card.frames, card.id > 9999);
        }
        if (!ignoreTooltip) {
            const tooltip = this.getTooltip(card);
            if (tooltip) {
                this.afterus.setTooltip(div.id, tooltip);
            }
        }
    }
    createFrame(div, frame, row, index, left = null, debug) {
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
        }
        else if (frame.type == OPENED_RIGHT) {
            frameDiv.classList.add('opened-right');
            if (!frame.left.length) {
                width = 34;
            }
        }
        frameDiv.dataset.row = '' + row;
        frameDiv.dataset.index = '' + index;
        frameDiv.dataset.left = JSON.stringify(frame.left);
        frameDiv.dataset.right = JSON.stringify(frame.right);
        frameDiv.dataset.convertSign = JSON.stringify(frame.convertSign);
        frameDiv.style.setProperty('--width', ` ${width}px`);
        if (left !== null) {
            frameDiv.style.setProperty('--left', ` ${left}px`);
        }
        div.appendChild(frameDiv);
        frameDiv.addEventListener('click', () => {
            const cardDivId = +div.closest('.card').dataset.cardId;
            const cardIndex = this.getCardStock({ id: cardDivId }).getCards().find(c => c.id == cardDivId).locationArg;
            this.afterus.onFrameClicked(row, cardIndex, index);
        });
        if (debug) {
            frameDiv.classList.add('debug');
            frameDiv.innerHTML = `${getResourcesQuantityIcons(frame.left)} ${frame.convertSign ? '&gt;' : ''} ${getResourcesQuantityIcons(frame.right)}`;
        }
        return frameDiv;
    }
    propertyToNumber(div, property) {
        const match = div.style.getPropertyValue(`--${property}`).match(/\d+/);
        return match?.length ? Number(match[0]) : 0;
    }
    createFrames(div, frames, debug) {
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
                frameGroupDiv.dataset.row = '' + row;
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
                        }
                        else if (leftFrameDiv && index == 1 && frames[row].length == 2) {
                            const leftWidth = this.propertyToNumber(leftFrameDiv, 'left') + this.propertyToNumber(leftFrameDiv, 'width');
                            frameDiv.style.setProperty('--left', `${leftWidth + 26}px`);
                        }
                        else if (rightFrameDiv && index == 0 && frames[row].length == 2) {
                            const left = 142 - this.propertyToNumber(rightFrameDiv, 'width');
                            frameDiv.style.setProperty('--left', `${left - this.propertyToNumber(frameDiv, 'width') - 26}px`);
                        }
                    }
                });
            }
        }
    }
    getMonkeyType(type) {
        switch (type) {
            case 0: return _('tamarin');
            case 1: return _('mandrill');
            case 2: return _('orangutan');
            case 3: return _('gorilla');
            case 4: return _('chimpanzee');
        }
    }
    getTooltip(card) {
        if (!card.number) {
            return undefined;
        }
        return `${(card.level > 0 ? _('${type} level ${level}') : '${type}').replace('${type}', `<strong>${this.getMonkeyType(card.type)}</strong>`).replace('${level}', `<strong>${card.level}</strong>`)}<br>
        ${_('Rage gain:')} ${card.rageGain[0]} ${formatTextIcons(getResourceCode(card.rageGain[1]))}<br>
        ${_('Card number:')} ${card.number}`;
    }
    setForHelp(card, divId) {
        const div = document.getElementById(divId);
        div.classList.add('card');
        div.dataset.side = 'front';
        div.innerHTML = `
        <div class="card-sides">
            <div class="card-side front">
            </div>
            <div class="card-side back">
            </div>
        </div>`;
        this.setupFrontDiv(card, div.querySelector('.front'), true);
    }
    // gameui.cardsManager.debugShowAllCards()
    debugShowAllCards() {
        const TEMP = this.afterus.gamedatas.TEMP;
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
                const stock = new LineStock(this, document.getElementById(`all-${typeAndLevel}`));
                Object.entries(TEMP[typeAndLevel]).forEach((entry) => {
                    const card = {
                        ...entry[1],
                        id: 10000 + typeAndLevel * 100 + Number(entry[0]),
                        level,
                        type,
                        subType: Number(entry[0]),
                        playerId: 2343492,
                    };
                    stock.addCard(card);
                });
                document.getElementById(`all-${typeAndLevel}`).querySelectorAll('.frame').forEach(frame => frame.classList.add('remaining'));
            });
        });
    }
}

class ObjectsManager extends CardManager {
    constructor(afterus) {
        super(afterus.bga.gameui, {
            getId: (card) => `object-${card}`,
            setupDiv: (card, div) => {
                div.classList.add('object');
                afterus.setTooltip(div.id, this.getTooltip(card));
            },
            setupFrontDiv: (card, div) => {
                div.dataset.number = '' + card;
            },
            isCardVisible: () => true,
            cardWidth: 142,
            cardHeight: 198,
        });
        this.afterus = afterus;
    }
    getObjectName(number) {
        switch (number) {
            case 1: return _("Mobile phone");
            case 2: return _("Minibar");
            case 3: return _("Ghetto blaster");
            case 4: return _("Game console");
            case 5: return _("Pinball Machine");
            case 6: return _("Computer");
            case 7: return _("Moped");
        }
    }
    getObjectPhase(number) {
        switch (number) {
            case 1: return '1';
            case 2: return _("${a} or ${b}").replace('${a}', '1').replace('${b}', '2');
            case 3: return '1';
            case 4: return '3';
            case 5: return '1';
            case 6: return '1, ' + _("${a} or ${b}").replace('${a}', '2').replace('${b}', '3');
            case 7: return '2';
        }
    }
    getObjectCost(number) {
        switch (number) {
            case 1: return _("${a} or ${b}").replace('${a}', '2').replace('${b}', '3');
            case 2: return '1';
            case 3: return '2';
            case 4: return _("${a} or ${b}").replace('${a}', '3').replace('${b}', '5');
            case 5: return '4';
            case 6: return '5';
            case 7: return _("${a} or ${b}").replace('${a}', '6').replace('${b}', '9');
        }
    }
    getObjectEffect(number) {
        switch (number) {
            case 1: return _("before arranging your Primate Assembly, return 1 of the cards you just drew (level 1 or 2) to the bottom of its corresponding deck on the main board. Next, draw the top card from a deck of your choice (same level as the card you removed) and add it to your Primate Assembly. This card permanently replaces the card you removed from your draw deck. The required [Energy] cost depends on the level of the card you removed: 2 [Energy] for a card of level 1, and 3 [Energy] for a card of level 2. You don't receive the rage bonus in the top right corner of the card you removed.");
            case 2: return _("swap 1 of your resources with 1 resource from the general supply. You may swap resources of any type") + '  ([Flower], [Fruit], ' + _("${a} or ${b}").replace('${a}', '[Grain]').replace('${b}', '[Energy]') + ').';
            case 3: return _("before assigning your Primate Assembly, place 1 of the cards you just draw on your discard pile and draw 1 card from your draw pile to replace it.");
            case 4: return _("when discarding the cards in your Primate Assembly, place 1 of these card back on top of your draw pile instead of discarding it.  This costs 3 [Energy] for an ape of level 1, and 5 [Energy] for an ape of level 2.");
            case 5: return _("before assigning your Primate Assembly, draw a 5th card. You have access to an extra card this round.");
            case 6: return _("immediately score 5 [Point].");
            case 7: return _("attract an ape of your choice and place it on top of your draw pile. This costs 6 [Energy] for an ape of level 1, and 9 [Energy] for an ape of level 2.");
        }
    }
    getTooltip(number) {
        return `
            <div class="object-tooltip">
                <div class="title">${this.getObjectName(number)}</div>
                <div class="phase"><span class="label">${_('Phase:')}</span> ${this.getObjectPhase(number)}</div>
                <div class="cost"><span class="label">${_('Cost:')}</span> ${this.getObjectCost(number)} ${formatTextIcons('[Energy]')}</div>
                <div class="effect"><span class="label">${_('Effect:')}</span> ${formatTextIcons(this.getObjectEffect(number))}</div>
            </div>
        `;
    }
}

const STATE_TO_PHASE = {
    25: 11, // ST_PRIVATE_ORDER_CARDS
    26: 12, // ST_PRIVATE_ACTIVATE_EFFECT
    40: 21, // ST_MULTIPLAYER_CHOOSE_TOKEN
    //60: 21, // ST_MULTIPLAYER_PHASE2
    80: 0,
    90: 31, // ST_MULTIPLAYER_PHASE3
    95: 0, //ST_END_ROUND
};
const OBJECT_ACTIVE_PHASES = {
    1: [11],
    2: [11, 12, 21],
    3: [11],
    4: [31],
    5: [11],
    6: [11, 12, 21, 31],
    7: [21],
};
const OBJECT_MIN_COST = {
    1: 2,
    2: 1,
    3: 2,
    4: 3,
    5: 4,
    6: 5,
    7: 6,
};
class TableCenter {
    constructor(game, gamedatas) {
        this.game = game;
        this.hiddenDecks = [];
        this.usedObjects = null;
        [1, 2, 3, 4].forEach(monkeyType => [1, 2].forEach(level => {
            const type = monkeyType * 10 + level;
            const count = gamedatas.table[type];
            const block = document.createElement('div');
            block.classList.add('player-block');
            document.getElementById('center-board').insertAdjacentHTML('beforeend', `
                    <div id="hidden-deck-${type}" data-type="${monkeyType}" data-level="${level}"></div>
                `);
            this.hiddenDecks[type] = new Deck(this.game.cardsManager, document.getElementById(`hidden-deck-${type}`), {
                cardNumber: count,
                autoUpdateCardNumber: false,
                topCard: gamedatas.tableTopCard[type],
                counter: {
                    extraClasses: 'round',
                    position: level == 1 ? 'top' : 'bottom',
                },
            });
        }));
        this.objectsManager = new ObjectsManager(this.game);
        this.objects = new LineStock(this.objectsManager, document.getElementById(`objects`));
        this.objects.addCards(gamedatas.objects);
        this.objects.onCardClick = number => this.game.useObject(number);
        const stateId = +gamedatas.gamestate.id;
        if (!this.game.bga.gameui.isSpectator) {
            this.onEnteringState(stateId);
            this.usedObjects = gamedatas.usedObjects;
            this.setUsedClass();
            if (gamedatas.players[this.game.getPlayerId()]) {
                this.setCurrentPlayerEnergy(gamedatas.players[this.game.getPlayerId()].energy);
            }
        }
        else {
            document.getElementById(`objects`).classList.add('spectator-mode');
        }
    }
    setRemaining(deckType, deckCount, deckTopCard) {
        if (deckTopCard) {
            this.hiddenDecks[deckType].addCard(deckTopCard);
        }
        this.hiddenDecks[deckType].setCardNumber(deckCount);
    }
    setObjectPhase(object, phase) {
        this.objects.getCardElement(object).classList.toggle('current-phase', OBJECT_ACTIVE_PHASES[object].includes(phase));
    }
    onEnteringState(stateId) {
        const stateToPhaseIds = Object.keys(STATE_TO_PHASE).map(val => +val);
        stateToPhaseIds.forEach((id, index) => {
            if (stateId >= id && (index == stateToPhaseIds.length - 1 || stateId < stateToPhaseIds[index + 1])) {
                this.objects.getCards().forEach(object => this.setObjectPhase(object, STATE_TO_PHASE[id]));
            }
        });
    }
    setCurrentPlayerEnergy(energy) {
        this.objects.getCards().forEach(object => this.objects.getCardElement(object).classList.toggle('disabled', OBJECT_MIN_COST[object] > energy));
    }
    addUsedObject(object) {
        this.usedObjects.push(object);
        this.setUsedClass();
    }
    newRound() {
        if (!this.usedObjects) {
            return;
        }
        this.usedObjects = [];
        this.setUsedClass();
    }
    setUsedClass() {
        if (!this.usedObjects) {
            return;
        }
        this.objects.getCards().forEach(object => this.objects.getCardElement(object).classList.toggle('used', this.usedObjects.includes(object)));
    }
    replaceLineCardUpdateCounters(table, tableTopCards) {
        Object.entries(table).forEach(entry => {
            const type = Number(entry[0]);
            const count = entry[1];
            this.hiddenDecks[type].setCardNumber(count, tableTopCards[type]);
        });
    }
    addCardForReplaceLine(oldCard, visible) {
        const type = oldCard.type * 10 + oldCard.level;
        return this.hiddenDecks[type].addCard(visible ? { id: oldCard.id } : oldCard, undefined, { visible });
    }
}

class CardLine extends SlotStock {
    constructor(manager, element, settings, game, currentPlayer) {
        super(manager, element, settings);
        this.manager = manager;
        this.element = element;
        this.game = game;
        this.currentPlayer = currentPlayer;
        if (this.currentPlayer) {
            this.createSlotButtons();
        }
    }
    getSlotsIds() {
        return this.slotsIds;
    }
    createSlotButtons() {
        this.element.querySelectorAll('[data-slot-id]').forEach((slot, index) => {
            if (slot.querySelectorAll('button.move').length == 0) {
                slot.insertAdjacentHTML('afterbegin', `
                    <button id="move-left-${index}" class="move left"></button>
                    <button id="move-right-${index}" class="move right"></button>
                `);
                document.getElementById(`move-left-${index}`).addEventListener('click', () => this.game.moveCard(index, -1));
                document.getElementById(`move-right-${index}`).addEventListener('click', () => this.game.moveCard(index, 1));
            }
        });
    }
    createSlot(slotId) {
        super.createSlot(slotId);
        if (this.currentPlayer) {
            this.createSlotButtons();
        }
    }
}
class PlayerTable {
    constructor(game, player) {
        this.game = game;
        this.playerId = Number(player.id);
        this.currentPlayer = this.playerId == this.game.getPlayerId();
        let html = `
        <div id="player-table-${this.playerId}" class="player-table ${this.currentPlayer ? 'current-player' : ''}" style="--player-color: #${player.color};">
            <div class="decks">
                <div id="player-table-${this.playerId}-deck" class="deck-stock">
                    ${this.currentPlayer ? `<div id="player-table-${this.playerId}-see-top-card" class="see-top-card" data-visible="false">${_("See top card")}</div>` : ''}
                </div>
                <div class="name-and-tokens">
                    <div class="name-wrapper">${player.name}</div>
                    <div id="player-table-${this.playerId}-tokens" class="tokens"></div>
                </div>
                <div id="player-table-${this.playerId}-discard" class="discard-stock"></div>
            </div>
            <div id="player-table-${this.playerId}-line"></div>        
        </div>
        `;
        document.getElementById(this.currentPlayer ? 'current-player-table' : 'tables').insertAdjacentHTML('beforeend', html);
        if (this.currentPlayer) {
            const seeTopCardBtn = document.getElementById(`player-table-${this.playerId}-see-top-card`);
            seeTopCardBtn.addEventListener('click', () => {
                if (seeTopCardBtn.dataset.visible == 'true') {
                    this.showVisibleTopCard();
                }
            });
            this.visibleTopCard = player.visibleTopCard;
            this.deckTopCard(player.visibleTopCard);
        }
        this.line = new CardLine(this.game.cardsManager, document.getElementById(`player-table-${this.playerId}-line`), {
            wrap: 'nowrap',
            gap: '0',
            slotsIds: this.getSlotsIds(player.line),
            mapCardToSlot: card => card.locationArg
        }, game, this.currentPlayer);
        this.resetLine(player.line, false);
        html = `
        <div id="player-table-${this.playerId}-tokens-unplayed" class="tokens-unplayed tokens-column">`;
        for (let i = 1; i <= 4; i++) {
            html += `<div class="action-token" ${i == 4 ? `id="player-table-${this.playerId}-action-token"` : ''} data-color="${player.color}" data-type="0"></div>`;
        }
        html += `</div>
        <div id="player-table-${this.playerId}-tokens-played" class="tokens-played tokens-column"></div>
        `;
        document.getElementById(`player-table-${this.playerId}-tokens`).insertAdjacentHTML('beforeend', html);
        this.setSelectedToken(player.chosenToken);
        this.deck = new Deck(this.game.cardsManager, document.getElementById(`player-table-${this.playerId}-deck`), {
            cardNumber: player.deckCount,
            autoUpdateCardNumber: true,
            topCard: player.deckTopCard,
            counter: {
                extraClasses: 'round',
                position: 'top',
            },
        });
        this.discard = new Deck(this.game.cardsManager, document.getElementById(`player-table-${this.playerId}-discard`), {
            cardNumber: player.discardCount,
            autoUpdateCardNumber: true,
            topCard: player.discardTopCard,
            counter: {
                extraClasses: 'round',
                position: 'top',
            },
        });
    }
    getSlotsIds(line) {
        const maxLocationArg = Math.max(3, ...line.map(card => card.locationArg));
        return Array.from(Array(maxLocationArg + 1).keys());
    }
    onRemoveCardClick(card) {
        const pref = this.game.bga.userPreferences.get(202);
        if (pref == 3 || (pref == 2 && card.type == 0)) {
            this.game.useRage(card.id);
        }
        else {
            this.game.bga.gameui.confirmationDialog(_("Are you sure you want to remove this card ?"), () => this.game.useRage(card.id));
        }
    }
    addRageButton(card) {
        const div = this.line.getCardElement(card);
        if (div.querySelector('.rage-button')) {
            return;
        }
        const button = document.createElement('button');
        button.id = `rage-button-${card.id}`;
        button.classList.add('rage-button', 'bgabutton', 'bgabutton_blue');
        button.dataset.playerId = '' + this.playerId;
        button.innerHTML = formatTextIcons('[Rage]');
        div.appendChild(button);
        button.addEventListener('click', () => this.onRemoveCardClick(card));
        this.game.setButtonActivation(button.id, 'rage', 4);
        this.game.setTooltip(button.id, formatTextIcons(_('Remove this card (${cost}) to gain ${gain}').replace('${cost}', '4 [Rage]')).replace('${gain}', getResourcesQuantityIcons([card.rageGain])));
    }
    newRound(cards, deckCount, deckTopCard) {
        this.resetLine(cards, true);
        if (deckTopCard) {
            this.deck.addCard(deckTopCard, undefined, { autoUpdateCardNumber: false, });
        }
        this.deck.setCardNumber(deckCount);
    }
    resetLine(cards, fromDeck) {
        this.line.removeAll();
        this.line.setSlotsIds(this.getSlotsIds(cards));
        if (fromDeck) {
            cards.forEach(card => this.game.cardsManager.updateCardInformations(card));
            this.deck.addCards(cards);
        }
        this.line.addCards(cards);
        cards.forEach(card => this.addRageButton(card));
        this.updateVisibleMoveButtons();
    }
    setMovable(movable) {
        document.getElementById(`player-table-${this.playerId}`).classList.toggle('move-phase', movable);
    }
    switchCards(switchedCards) {
        /*try {*/
        this.line.swapCards(switchedCards);
        /*} catch (e) {
            console.error('error during switchCards', e, JSON.stringify(switchedCards));
        }*/
        switchedCards.forEach(card => this.addRageButton(card));
    }
    getFrames(effect) {
        const fromClosedFrame = effect.closedFrameIndex !== null && effect.closedFrameIndex !== undefined;
        const lineCards = this.line.getCards();
        const card = lineCards.find(card => card.locationArg == effect.cardIndex);
        const frames = [this.line.getCardElement(card).querySelector(`.frame[data-row="${effect.row}"][data-index="${fromClosedFrame ? effect.closedFrameIndex : card.frames[effect.row].length - 1}"]`)];
        if (!fromClosedFrame) {
            const rightCard = lineCards.find(card => card.locationArg == effect.cardIndex + 1);
            frames.push(this.line.getCardElement(rightCard).querySelector(`.frame[data-row="${effect.row}"][data-index="0"]`));
        }
        return frames;
    }
    setEffectClass(effect, frameClasses) {
        this.getFrames(effect).forEach(frame => frame.classList.add(...frameClasses));
    }
    markRemainingFramesDisabled() {
        const line = document.getElementById(`player-table-${this.playerId}-line`);
        line.querySelectorAll('.frame').forEach(element => {
            if (!['selectable', 'current', 'applied', 'remaining'].some(frameClass => element.classList.contains(frameClass))) {
                element.classList.add('disabled');
            }
        });
    }
    setActivableEffect(currentEffect, appliedEffects, remainingEffects, reactivate, possibleEffects) {
        if (currentEffect) {
            const currentClasses = ['current'];
            if (currentEffect.convertSign) {
                currentClasses.push('convert');
            }
            this.setEffectClass(currentEffect, currentClasses);
        }
        if (reactivate) {
            this.setActivableEffectToken(possibleEffects);
        }
        else {
            appliedEffects.forEach(effect => this.setEffectClass(effect, ['applied']));
            remainingEffects.forEach(effect => this.setEffectClass(effect, ['remaining']));
            this.markRemainingFramesDisabled();
        }
    }
    setActivableEffectToken(possibleEffects, className = 'selectable') {
        possibleEffects.forEach(effect => this.setEffectClass(effect, [className]));
        this.markRemainingFramesDisabled();
    }
    removeActivableEffect() {
        const line = document.getElementById(`player-table-${this.playerId}-line`);
        ['selectable', 'disabled', 'current', 'applied', 'remaining'].forEach(frameClass => line.querySelectorAll('.frame.' + frameClass).forEach(element => element.classList.remove(frameClass)));
    }
    setSelectedToken(type) {
        const token = document.getElementById(`player-table-${this.playerId}-action-token`);
        const destination = document.getElementById(`player-table-${this.playerId}-tokens-${type === null ? 'un' : ''}played`);
        if (token.parentElement != destination) {
            this.game.animationManager.attachWithAnimation(new BgaSlideAnimation({ element: token }), destination);
        }
        token.dataset.type = type === null ? '0' : '' + type;
    }
    endRound() {
        this.setSelectedToken(null);
        const cards = this.line.getCards();
        this.discard.addCards(cards.map(card => ({ id: card.id })));
    }
    removeCard(card, line) {
        if (line) {
            this.line.removeAll();
            this.resetLine(line, false);
        }
        else {
            this.line.removeCard(card);
        }
        this.updateVisibleMoveButtons();
    }
    addCardToLine(card, line, deckCount, deckTopCard) {
        this.deck.addCard(card);
        this.resetLine(line, false);
        if (deckTopCard) {
            this.deck.addCard(deckTopCard);
        }
        this.deck.setCardNumber(deckCount);
    }
    discardCard(card) {
        return this.discard.addCard({ id: card.id });
    }
    replaceLineCard(card) {
        const promise = this.line.addCard(card);
        this.addRageButton(card);
        return promise;
    }
    replaceTopDeck(card) {
        this.deck.addCard(card, undefined, { autoUpdateCardNumber: true });
    }
    updateVisibleMoveButtons() {
        const cards = this.line.getCards();
        const slots = document.getElementById(`player-table-${this.playerId}`).querySelectorAll(`.slot`);
        slots.forEach((slot) => {
            const slotId = +slot.dataset.slotId;
            const hasCard = cards.some(card => card.locationArg == slotId);
            slot.querySelectorAll('button.move').forEach(btn => btn.classList.toggle('hidden', !hasCard));
        });
    }
    addButtonsOnCards(getLabel, onClick, minLevel = 0) {
        document.getElementById(`player-table-${this.playerId}-line`).querySelectorAll('[data-slot-id]').forEach((slot, index) => {
            const card = this.line.getCards().find(card => card.locationArg == index);
            if (card && card.level >= minLevel) {
                slot.insertAdjacentHTML('afterbegin', `
                    <button id="use-object-on-card-${index}" class="remove bgabutton bgabutton_blue">${getLabel(card)}</button>
                `);
                document.getElementById(`use-object-on-card-${index}`).addEventListener('click', () => onClick(this.line.getCards().find(card => card.locationArg == index)));
            }
        });
    }
    removeButtonsOnCards() {
        const slots = document.getElementById(`player-table-${this.playerId}`).querySelectorAll(`.slot`);
        slots.forEach(slot => slot.querySelectorAll('button.remove').forEach(btn => btn.remove()));
    }
    refillDeck(deckCount, deckTopCard) {
        if (deckTopCard) {
            this.deck.addCard(deckTopCard, { fromStock: this.discard, });
        }
        this.deck.setCardNumber(deckCount);
        this.discard.removeAll();
        this.discard.setCardNumber(0);
    }
    addCardToDeck(card) {
        this.deck.addCard(card, undefined, { autoUpdateCardNumber: true });
    }
    setLine(line) {
        this.line.removeAll();
        this.line.addCards(line);
        line.forEach(card => this.addRageButton(card));
    }
    deckTopCard(card) {
        this.visibleTopCard = card;
        if (this.currentPlayer) {
            const seeTopCardId = `player-table-${this.playerId}-see-top-card`;
            document.getElementById(seeTopCardId).dataset.visible = Boolean(card).toString();
        }
    }
    showVisibleTopCard() {
        if (!this.visibleTopCard) {
            return;
        }
        const visibleTopCardDialog = new ebg.popindialog();
        visibleTopCardDialog.create('visibleTopCardDialog');
        visibleTopCardDialog.setTitle('');
        let html = `<div id="visible-top-card-popin">
            <h1>${_("See top card")}</h1>
            <div id="visible-top-card"></div>
        </div>`;
        // Show the dialog
        visibleTopCardDialog.setContent(html);
        visibleTopCardDialog.show();
        this.game.cardsManager.setForHelp(this.visibleTopCard, `visible-top-card`);
    }
}

class Game {
    constructor(bga) {
        this.playersTables = [];
        this.flowerCounters = [];
        this.fruitCounters = [];
        this.grainCounters = [];
        this.energyCounters = [];
        this.rageCounters = [];
        this.lastSelectedToken = undefined;
        this.TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;
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
    setup(gamedatas) {
        log("Starting game setup");
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
        log("Ending game setup");
    }
    ///////////////////////////////////////////////////
    //// Game & client states
    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    onEnteringState(stateName, args) {
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
                const activateEffectArgs = args.args;
                this.getCurrentPlayerTable().setActivableEffect(activateEffectArgs.currentEffect, activateEffectArgs.appliedEffects, activateEffectArgs.remainingEffects, activateEffectArgs.reactivate, activateEffectArgs.possibleEffects);
                break;
            case 'activateEffectToken':
                const activateEffectTokenArgs = args.args;
                this.getCurrentPlayerTable().setActivableEffectToken(activateEffectTokenArgs.possibleEffects);
                break;
            case 'mobilePhone':
                this.getCurrentPlayerTable().addButtonsOnCards(card => _('Replace this card') + formatTextIcons(` (${card.level + 1} [Energy])`), card => {
                    const keys = [1, 2, 3, 4].map(type => this.cardsManager.getMonkeyType(type));
                    keys.push(_('Cancel'));
                    this.bga.gameui.multipleChoiceDialog(_("Select a deck to draw the level ${level} top card").replace('${level}', card.level), keys, (choice) => {
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
    onEnteringEndScore(args) {
        Object.keys(args.fullDecks).forEach(pId => {
            const playerId = Number(pId);
            this.gamedatas.players[playerId].fullDeck = args.fullDecks[playerId];
            this.addShowFullDeckButton(playerId);
        });
    }
    onLeavingState(stateName) {
        log('Leaving state: ' + stateName);
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
    addCancelLastMoves(withSingle, undoCount) {
        this.bga.gameui.addActionButton(`cancelLastMove-button`, _("Cancel last move"), () => withSingle ? this.cancelLastMove() : this.cancelLastMoves(), null, null, 'gray');
        if (withSingle && undoCount > 1) {
            this.bga.gameui.addActionButton(`cancelLastMoves-button`, _("Cancel last ${moves} moves").replace('${moves}', String(undoCount)), () => this.cancelLastMoves(), null, null, 'gray');
        }
    }
    createChooseTokenButton(type, gray = false) {
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
                    canPay = Math.max(this.flowerCounters[this.getPlayerId()]?.getValue(), this.fruitCounters[this.getPlayerId()]?.getValue(), this.grainCounters[this.getPlayerId()]?.getValue()) >= number;
                    break;
            }
            return `<span class="${canPay ? (gray ? '' : 'ok-can-pay') : 'warning-cant-pay'}">${number}</span>`;
        }).join('/');
        const label = `${this.cardsManager.getMonkeyType(type)} (${costs} ${type == 4 ? [1, 2, 3].map(r => formatTextIcons(getResourceCode(r))).join('/') : formatTextIcons(getResourceCode(type))})`;
        this.bga.gameui.addActionButton(`chooseToken${type}-button`, `
        ${label}<br>
        <div class="action-token" data-type="${type}"></div>
        `, () => this.chooseToken(type), null, null, gray ? 'gray' : undefined);
    }
    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    onUpdateActionButtons(stateName, args) {
        if (stateName === 'chooseToken') {
            if (!this.bga.gameui.isCurrentPlayerActive() && Object.keys(this.gamedatas.players).includes('' + this.getPlayerId())) { // ignore spectators
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
                const activateEffectArgs = args;
                const currentEffect = activateEffectArgs.currentEffect;
                if (currentEffect) {
                    if (activateEffectArgs.reactivate) {
                        this.createFakeButtonForReactivate(currentEffect.left);
                    }
                    else {
                        if (currentEffect.left.length == 1) {
                            if (currentEffect.left[0][1] == DIFFERENT) {
                                currentEffect.left = [];
                                currentEffect.convertSign = false;
                            }
                            else if (currentEffect.left[0][1] == PER_TAMARINS) {
                                currentEffect.left[0] = currentEffect.left[0][0];
                                currentEffect.left[0][0] *= activateEffectArgs.tamarins;
                            }
                        }
                        else if (currentEffect.left.length == 0) {
                            currentEffect.convertSign = false;
                        }
                        let label;
                        if (!currentEffect.convertSign) {
                            label = _("Gain ${resources}").replace('${resources}', getResourcesQuantityIcons(currentEffect.left.concat(currentEffect.right)));
                        }
                        else {
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
                }
                else {
                    this.bga.gameui.addActionButton(`skipEffectToken-button`, _("Skip"), () => this.skipEffectToken());
                }
                break;
            case 'buyCard':
                const buyCardArgs = args;
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
                const applyNeighborEffectArgs = args;
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
                [1, 2, 3, 4].forEach(left => [1, 2, 3 /*, 4*/].filter(right => left != right).forEach(right => {
                    const label = formatTextIcons(getResourceCode(left) + ' >> ' + getResourceCode(right) /* + (' (1 [Energy])')*/);
                    this.bga.gameui.addActionButton(`minibar-${left}-${right}-button`, label, () => this.useMinibar(left, right));
                    if (left == ENERGY) {
                        if (this.getCurrentPlayerEnergy() < 2) {
                            document.getElementById(`minibar-${left}-${right}-button`).classList.add('disabled');
                        }
                    }
                    else {
                        const currentPlayerCounter = this[`${TYPE_FIELD_BY_NUMBER[left]}Counters`][this.getPlayerId()];
                        if (this.getCurrentPlayerEnergy() < 1 || currentPlayerCounter.getValue() < 1) {
                            document.getElementById(`minibar-${left}-${right}-button`).classList.add('disabled');
                        }
                    }
                }));
                this.bga.gameui.addActionButton(`cancelObject-button`, _("Cancel"), () => this.cancelObject(), null, null, 'gray');
                break;
            case 'moped':
                [1, 2].forEach(level => [1, 2, 3, 4].forEach(type => {
                    const cost = level == 2 ? 9 : 6;
                    const label = _("Attract a level ${level} ${type}").replace('${level}', String(level)).replace('${type}', this.cardsManager.getMonkeyType(type)) + formatTextIcons(` (${cost} [Energy])`);
                    this.bga.gameui.addActionButton(`useMoped-${type}-${level}-button`, label, () => this.useMoped(type, level));
                    this.setButtonActivation(`useMoped-${type}-${level}-button`, 'energy', cost);
                }));
                this.bga.gameui.addActionButton(`cancelObject-button`, _("Cancel"), () => this.cancelObject(), null, null, 'gray');
                break;
        }
    }
    createFakeButtonForReactivate(cost) {
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
    setButtonActivation(id, type, min) {
        const button = document.getElementById(id);
        button.setAttribute(`data-activate-at-${type}`, '' + min);
        const currentPlayerCounter = this[`${type}Counters`][this.getPlayerId()];
        if (currentPlayerCounter && currentPlayerCounter.getValue() < min) {
            button.classList.add('disabled');
        }
    }
    setTooltip(id, html) {
        this.bga.gameui.addTooltipHtml(id, html, this.TOOLTIP_DELAY);
    }
    setTooltipToClass(className, html) {
        this.bga.gameui.addTooltipHtmlToClass(className, html, this.TOOLTIP_DELAY);
    }
    getPlayerId() {
        return Number(this.bga.gameui.player_id);
    }
    getPlayer(playerId) {
        return Object.values(this.gamedatas.players).find(player => Number(player.id) == playerId);
    }
    getPlayerColor(playerId) {
        return this.gamedatas.players[playerId].color;
    }
    getPlayerRage(playerId) {
        return this.rageCounters[playerId].getValue();
    }
    getPlayerTable(playerId) {
        return this.playersTables.find(playerTable => playerTable.playerId === playerId);
    }
    getCurrentPlayerTable() {
        return this.playersTables.find(playerTable => playerTable.playerId === this.getPlayerId());
    }
    getCurrentPlayerEnergy() {
        return this.energyCounters[this.getPlayerId()]?.getValue() ?? 0;
    }
    onPreferenceChange(prefId, prefValue) {
        switch (prefId) {
            case 201:
                if (!this.isReadOnly()) {
                    this.setAutoGain(prefValue == 1);
                }
                break;
        }
    }
    isReadOnly() {
        return this.bga.gameui.isSpectator || typeof g_replayFrom != 'undefined' || g_archive_mode;
    }
    getOrderedPlayers(gamedatas) {
        const players = Object.values(gamedatas.players).sort((a, b) => a.playerNo - b.playerNo);
        const playerIndex = players.findIndex(player => Number(player.id) === Number(this.bga.gameui.player_id));
        const orderedPlayers = playerIndex > 0 ? [...players.slice(playerIndex), ...players.slice(0, playerIndex)] : players;
        return orderedPlayers;
    }
    createPlayerPanels(gamedatas) {
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
    addShowFullDeckButton(playerId) {
        this.bga.playerPanels.getElement(playerId).insertAdjacentHTML('beforeend', `<div>
            <button class="bgabutton bgabutton_gray discarded-button" id="show-full-deck-button-${playerId}">${_('Show full deck')}</button>
        </div>`);
        document.getElementById(`show-full-deck-button-${playerId}`).addEventListener('click', () => this.showFullDeck(playerId));
    }
    createPlayerTables(gamedatas) {
        const orderedPlayers = this.getOrderedPlayers(gamedatas);
        orderedPlayers.forEach(player => this.createPlayerTable(gamedatas, Number(player.id)));
    }
    createPlayerTable(gamedatas, playerId) {
        const table = new PlayerTable(this, gamedatas.players[playerId]);
        this.playersTables.push(table);
    }
    setScore(playerId, score) {
        this.bga.playerPanels.getScoreCounter(playerId).toValue(score);
    }
    showFullDeck(playerId) {
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
    onFrameClicked(row, cardIndex, index) {
        const actionName = ['tokenSelectReactivate', 'phase2'].includes(this.gamedatas.gamestate.name) ?
            'actActivateEffectToken' :
            'actActivateEffect';
        this.takeNoLockAction(actionName, {
            row,
            cardIndex,
            index,
        });
    }
    moveCard(index, direction) {
        if (!this.bga.gameui.checkAction('actMoveCard')) {
            return;
        }
        this.takeNoLockAction('actMoveCard', {
            index,
            direction: direction < 0,
        });
    }
    validateCardOrder() {
        if (!this.bga.gameui.checkAction('actValidateCardOrder')) {
            return;
        }
        this.takeNoLockAction('actValidateCardOrder');
    }
    activateEffect() {
        if (!this.bga.gameui.checkAction('actActivateEffect')) {
            return;
        }
        this.takeNoLockAction('actActivateEffect');
    }
    skipEffect() {
        if (!this.bga.gameui.checkAction('actSkipEffect')) {
            return;
        }
        this.takeNoLockAction('actSkipEffect');
    }
    skipEffectToken() {
        if (!this.bga.gameui.checkAction('actSkipEffectToken')) {
            return;
        }
        this.takeNoLockAction('actSkipEffectToken');
    }
    confirmActivations() {
        if (!this.bga.gameui.checkAction('actConfirmActivations')) {
            return;
        }
        this.takeAction('actConfirmActivations');
    }
    cancelLastMove() {
        if (!this.bga.gameui.checkAction('actCancelLastMove')) {
            return;
        }
        this.takeNoLockAction('actCancelLastMove');
    }
    cancelLastMoves() {
        if (!this.bga.gameui.checkAction('actCancelLastMoves')) {
            return;
        }
        this.takeNoLockAction('actCancelLastMoves');
    }
    chooseToken(type) {
        /*if(!this.bga.gameui.checkAction('actChooseToken')) {
            return;
        }*/
        this.takeAction('actChooseToken', {
            type,
        });
    }
    cancelChooseToken() {
        /*if(!this.bga.gameui.checkAction('actCancelChooseToken')) {
            return;
        }*/
        this.takeAction('actCancelChooseToken');
    }
    neighborEffect(type) {
        if (!this.bga.gameui.checkAction('actNeighborEffect')) {
            return;
        }
        this.takeNoLockAction('actNeighborEffect', {
            type,
        });
    }
    applyNeighborEffect(type) {
        if (!this.bga.gameui.checkAction('actApplyNeighborEffect')) {
            return;
        }
        this.takeNoLockAction('actApplyNeighborEffect', {
            type,
        });
    }
    cancelNeighborEffect() {
        if (!this.bga.gameui.checkAction('actCancelNeighborEffect')) {
            return;
        }
        this.takeNoLockAction('actCancelNeighborEffect');
    }
    buyCard(level, type) {
        if (!this.bga.gameui.checkAction('actBuyCard')) {
            return;
        }
        this.takeNoLockAction('actBuyCard', {
            level,
            type,
        });
    }
    endTurn() {
        if (!this.bga.gameui.checkAction('actEndTurn')) {
            return;
        }
        this.takeAction('actEndTurn');
    }
    endGame() {
        if (!this.bga.gameui.checkAction('actEndGame')) {
            return;
        }
        this.takeAction('actEndGame');
    }
    setAutoGain(autoGain) {
        this.takeNoLockAction('actSetAutoGain', {
            autoGain
        }, true);
    }
    useRage(id) {
        this.takeAction('actUseRage', {
            id,
        });
    }
    useObject(number) {
        this.takeNoLockAction('actUseObject', {
            number,
        });
    }
    cancelObject() {
        /*if(!this.bga.gameui.checkAction('actCancelObject')) {
            return;
        }*/
        this.takeNoLockAction('actCancelObject');
    }
    useMobilePhone(id, type) {
        if (!this.bga.gameui.checkAction('actUseMobilePhone')) {
            return;
        }
        this.takeNoLockAction('actUseMobilePhone', {
            id,
            type,
        });
    }
    useMinibar(left, right) {
        if (!this.bga.gameui.checkAction('actUseMinibar')) {
            return;
        }
        this.takeNoLockAction('actUseMinibar', {
            left,
            right,
        });
    }
    useGhettoBlaster(id) {
        if (!this.bga.gameui.checkAction('actUseGhettoBlaster')) {
            return;
        }
        this.takeNoLockAction('actUseGhettoBlaster', {
            id,
        });
    }
    useGameConsole(id) {
        if (!this.bga.gameui.checkAction('actUseGameConsole')) {
            return;
        }
        this.takeNoLockAction('actUseGameConsole', {
            id,
        });
    }
    useMoped(type, level) {
        this.takeNoLockAction('actUseMoped', {
            type,
            level,
        });
    }
    takeAction(action, data) {
        data = data || {};
        this.bga.actions.performAction(action, data, { checkAction: false });
    }
    takeNoLockAction(action, data, invisible = false) {
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
        const notifs = [
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
            dojo.subscribe(notif[0], this, (notifDetails) => {
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
    notif_newRound(args) {
        this.tableCenter.newRound();
        this.getPlayerTable(args.playerId).newRound(args.cards, args.deckCount, args.deckTopCard);
    }
    notif_switchedCards(args) {
        this.getPlayerTable(args.playerId).switchCards(args.movedCards);
    }
    notif_activatedEffect(args) {
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
        ['flower', 'fruit', 'grain', 'energy', 'rage'].forEach(type => document.querySelectorAll(`[data-activate-at-${type}]`).forEach(button => {
            const min = +button.getAttribute(`data-activate-at-${type}`);
            const currentPlayerCounter = this[`${type}Counters`][this.getPlayerId()];
            button.classList.toggle('disabled', currentPlayerCounter && currentPlayerCounter.getValue() < min);
        }));
    }
    notif_selectedToken(args) {
        const currentPlayer = this.getPlayerId() == args.playerId;
        if (args.token || !currentPlayer || args.cancel) {
            this.getPlayerTable(args.playerId).setSelectedToken(args.cancel ? null : args.token);
            if (currentPlayer) {
                this.lastSelectedToken = args.cancel ? null : args.token;
                [1, 2, 3, 4].forEach(type => document.getElementById(`chooseToken${type}-button`)?.classList.toggle('selected-token-button', type == this.lastSelectedToken));
            }
        }
    }
    notif_revealTokens(args) {
        Object.entries(args.tokens).forEach(val => this.getPlayerTable(+val[0]).setSelectedToken(val[1]));
    }
    notif_buyCard(args) {
        this.getPlayerTable(args.playerId).addCardToDeck(args.card);
        this.tableCenter.setRemaining(args.deckType, args.deckCount, args.deckTopCard);
        this.notif_activatedEffect(args);
    }
    notif_endRound(args) {
        this.getPlayerTable(args.playerId).endRound();
    }
    notif_removedCard(args) {
        this.getPlayerTable(args.playerId).removeCard(args.card, args.line);
        this.notif_activatedEffect(args);
    }
    notif_addCardToLine(args) {
        this.getPlayerTable(args.playerId).addCardToLine(args.card, args.line, args.deckCount, args.deckTopCard);
        this.notif_activatedEffect(args);
    }
    async notif_replaceLineCard(args) {
        console.log(args);
        await this.tableCenter.addCardForReplaceLine(args.oldCard, false);
        await this.tableCenter.addCardForReplaceLine(args.newCard, true);
        this.tableCenter.replaceLineCardUpdateCounters(args.table, args.tableTopCards);
        await this.getPlayerTable(args.playerId).replaceLineCard(args.newCard);
        this.notif_activatedEffect(args);
        return true;
    }
    async notif_replaceLineCardDeck(args) {
        const playerTable = this.getPlayerTable(args.playerId);
        await playerTable.discardCard(args.oldCard);
        await playerTable.replaceLineCard(args.newCard);
        this.notif_activatedEffect(args);
    }
    notif_replaceTopDeck(args) {
        this.getPlayerTable(args.playerId).replaceTopDeck(args.card);
        this.notif_activatedEffect(args);
    }
    notif_useObject(args) {
        this.tableCenter.addUsedObject(args.object);
    }
    notif_refillDeck(args) {
        this.getPlayerTable(args.playerId).refillDeck(args.deckCount);
    }
    notif_cancelLastMoves(args) {
        this.getPlayerTable(args.playerId).setLine(args.line);
        this.notif_activatedEffect(args);
        if (args.removeLastTurn) {
            document.getElementById('last-round')?.remove();
        }
    }
    notif_deckTopCard(args) {
        this.getPlayerTable(args.playerId).deckTopCard(args.card);
    }
    /**
     * Show last turn banner.
     */
    notif_lastTurn(animate = true) {
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
    bgaFormatText(log, args) {
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
        }
        catch (e) {
            console.error(log, args, "Exception thrown", e.stack);
        }
        return { log, args };
    }
}

export { Game };
