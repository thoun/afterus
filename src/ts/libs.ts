const BgaZoom: typeof globalThis.BgaZoom = await globalThis.importEsmLib('bga-zoom', '1.x');
const BgaJumpTo: typeof globalThis.BgaJumpTo = await globalThis.importEsmLib('bga-jump-to', '1.x');

// Keep the original cards and animations on local AMD builds.
const [Animations, Cards] = await globalThis.importDojoLibs([
    g_gamethemeurl + 'modules/js/bga-animations.js',
    g_gamethemeurl + 'modules/js/bga-cards.js',
]);
await globalThis.importDojoLibs(['ebg/popindialog']);

export const AnimationManager: typeof LegacyBga.AnimationManager = Animations.AnimationManager;
export type AnimationManager = LegacyBga.AnimationManager;
export const BgaSlideAnimation: typeof LegacyBga.BgaSlideAnimation = Animations.BgaSlideAnimation;
export const CardManager: typeof LegacyBga.CardManager = Cards.CardManager;
export type CardManager<T> = LegacyBga.CardManager<T>;
export const Deck: typeof LegacyBga.Deck = Cards.Deck;
export type Deck<T> = LegacyBga.Deck<T>;
export const LineStock: typeof LegacyBga.LineStock = Cards.LineStock;
export type LineStock<T> = LegacyBga.LineStock<T>;
export const SlotStock: typeof LegacyBga.SlotStock = Cards.SlotStock;
export type SlotStock<T> = LegacyBga.SlotStock<T>;
export type SlotStockSettings<T> = LegacyBga.SlotStockSettings<T>;
export type SlotId = LegacyBga.SlotId;

export { BgaZoom, BgaJumpTo };
