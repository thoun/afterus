export const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;;
export const log = isDebug ? console.log.bind(window.console) : function () { };

export const ANIMATION_MS = 500;
export const ACTION_TIMER_DURATION = 5;

export const LOCAL_STORAGE_ZOOM_KEY = 'AfterUs-zoom';
export const LOCAL_STORAGE_JUMP_TO_FOLDED_KEY = 'AfterUs-jump-to-folded';

export const FLOWER = 1;
export const FRUIT = 2;
export const GRAIN = 3;
export const ENERGY = 4;
export const POINT = 5;
export const RAGE = 6;
export const DIFFERENT = 7;
export const PER_TAMARINS = 8;

export const TYPE_FIELD_BY_NUMBER = [
    null,
    'flower',
    'fruit',
    'grain',
    'energy',
    'point',
    'rage',
];

export function formatTextIcons(rawText: string) {
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

export function getResourceCode(resource: number) {
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

export function getResourcesQuantityIcons(resources: number[][]) {
    return formatTextIcons(resources.map(resource => `${resource[0]} ${getResourceCode(resource[1])}`).join(' '));
}

