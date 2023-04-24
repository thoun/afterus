var DEFAULT_ZOOM_LEVELS = [0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
var ZoomManager = /** @class */ (function () {
    /**
     * Place the settings.element in a zoom wrapper and init zoomControls.
     *
     * @param settings: a `ZoomManagerSettings` object
     */
    function ZoomManager(settings) {
        var _this = this;
        var _a, _b, _c, _d, _e;
        this.settings = settings;
        if (!settings.element) {
            throw new DOMException('You need to set the element to wrap in the zoom element');
        }
        this.zoomLevels = (_a = settings.zoomLevels) !== null && _a !== void 0 ? _a : DEFAULT_ZOOM_LEVELS;
        this._zoom = this.settings.defaultZoom || 1;
        if (this.settings.localStorageZoomKey) {
            var zoomStr = localStorage.getItem(this.settings.localStorageZoomKey);
            if (zoomStr) {
                this._zoom = Number(zoomStr);
            }
        }
        this.wrapper = document.createElement('div');
        this.wrapper.id = 'bga-zoom-wrapper';
        this.wrapElement(this.wrapper, settings.element);
        this.wrapper.appendChild(settings.element);
        settings.element.classList.add('bga-zoom-inner');
        if ((_b = settings.smooth) !== null && _b !== void 0 ? _b : true) {
            settings.element.dataset.smooth = 'true';
            settings.element.addEventListener('transitionend', function () { return _this.zoomOrDimensionChanged(); });
        }
        if ((_d = (_c = settings.zoomControls) === null || _c === void 0 ? void 0 : _c.visible) !== null && _d !== void 0 ? _d : true) {
            this.initZoomControls(settings);
        }
        if (this._zoom !== 1) {
            this.setZoom(this._zoom);
        }
        window.addEventListener('resize', function () {
            var _a;
            _this.zoomOrDimensionChanged();
            if ((_a = _this.settings.autoZoom) === null || _a === void 0 ? void 0 : _a.expectedWidth) {
                _this.setAutoZoom();
            }
        });
        if (window.ResizeObserver) {
            new ResizeObserver(function () { return _this.zoomOrDimensionChanged(); }).observe(settings.element);
        }
        if ((_e = this.settings.autoZoom) === null || _e === void 0 ? void 0 : _e.expectedWidth) {
            this.setAutoZoom();
        }
    }
    Object.defineProperty(ZoomManager.prototype, "zoom", {
        /**
         * Returns the zoom level
         */
        get: function () {
            return this._zoom;
        },
        enumerable: false,
        configurable: true
    });
    ZoomManager.prototype.setAutoZoom = function () {
        var _this = this;
        var _a, _b, _c;
        var zoomWrapperWidth = document.getElementById('bga-zoom-wrapper').clientWidth;
        if (!zoomWrapperWidth) {
            setTimeout(function () { return _this.setAutoZoom(); }, 200);
            return;
        }
        var expectedWidth = (_a = this.settings.autoZoom) === null || _a === void 0 ? void 0 : _a.expectedWidth;
        var newZoom = this.zoom;
        while (newZoom > this.zoomLevels[0] && newZoom > ((_c = (_b = this.settings.autoZoom) === null || _b === void 0 ? void 0 : _b.minZoomLevel) !== null && _c !== void 0 ? _c : 0) && zoomWrapperWidth / newZoom < expectedWidth) {
            newZoom = this.zoomLevels[this.zoomLevels.indexOf(newZoom) - 1];
        }
        if (this._zoom == newZoom) {
            if (this.settings.localStorageZoomKey) {
                localStorage.setItem(this.settings.localStorageZoomKey, '' + this._zoom);
            }
        }
        else {
            this.setZoom(newZoom);
        }
    };
    /**
     * Set the zoom level. Ideally, use a zoom level in the zoomLevels range.
     * @param zoom zool level
     */
    ZoomManager.prototype.setZoom = function (zoom) {
        var _a, _b, _c, _d;
        if (zoom === void 0) { zoom = 1; }
        this._zoom = zoom;
        if (this.settings.localStorageZoomKey) {
            localStorage.setItem(this.settings.localStorageZoomKey, '' + this._zoom);
        }
        var newIndex = this.zoomLevels.indexOf(this._zoom);
        (_a = this.zoomInButton) === null || _a === void 0 ? void 0 : _a.classList.toggle('disabled', newIndex === this.zoomLevels.length - 1);
        (_b = this.zoomOutButton) === null || _b === void 0 ? void 0 : _b.classList.toggle('disabled', newIndex === 0);
        this.settings.element.style.transform = zoom === 1 ? '' : "scale(".concat(zoom, ")");
        (_d = (_c = this.settings).onZoomChange) === null || _d === void 0 ? void 0 : _d.call(_c, this._zoom);
        this.zoomOrDimensionChanged();
    };
    /**
     * Call this method for the browsers not supporting ResizeObserver, everytime the table height changes, if you know it.
     * If the browsert is recent enough (>= Safari 13.1) it will just be ignored.
     */
    ZoomManager.prototype.manualHeightUpdate = function () {
        if (!window.ResizeObserver) {
            this.zoomOrDimensionChanged();
        }
    };
    /**
     * Everytime the element dimensions changes, we update the style. And call the optional callback.
     */
    ZoomManager.prototype.zoomOrDimensionChanged = function () {
        var _a, _b;
        this.settings.element.style.width = "".concat(this.wrapper.getBoundingClientRect().width / this._zoom, "px");
        this.wrapper.style.height = "".concat(this.settings.element.getBoundingClientRect().height, "px");
        (_b = (_a = this.settings).onDimensionsChange) === null || _b === void 0 ? void 0 : _b.call(_a, this._zoom);
    };
    /**
     * Simulates a click on the Zoom-in button.
     */
    ZoomManager.prototype.zoomIn = function () {
        if (this._zoom === this.zoomLevels[this.zoomLevels.length - 1]) {
            return;
        }
        var newIndex = this.zoomLevels.indexOf(this._zoom) + 1;
        this.setZoom(newIndex === -1 ? 1 : this.zoomLevels[newIndex]);
    };
    /**
     * Simulates a click on the Zoom-out button.
     */
    ZoomManager.prototype.zoomOut = function () {
        if (this._zoom === this.zoomLevels[0]) {
            return;
        }
        var newIndex = this.zoomLevels.indexOf(this._zoom) - 1;
        this.setZoom(newIndex === -1 ? 1 : this.zoomLevels[newIndex]);
    };
    /**
     * Changes the color of the zoom controls.
     */
    ZoomManager.prototype.setZoomControlsColor = function (color) {
        if (this.zoomControls) {
            this.zoomControls.dataset.color = color;
        }
    };
    /**
     * Set-up the zoom controls
     * @param settings a `ZoomManagerSettings` object.
     */
    ZoomManager.prototype.initZoomControls = function (settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f;
        this.zoomControls = document.createElement('div');
        this.zoomControls.id = 'bga-zoom-controls';
        this.zoomControls.dataset.position = (_b = (_a = settings.zoomControls) === null || _a === void 0 ? void 0 : _a.position) !== null && _b !== void 0 ? _b : 'top-right';
        this.zoomOutButton = document.createElement('button');
        this.zoomOutButton.type = 'button';
        this.zoomOutButton.addEventListener('click', function () { return _this.zoomOut(); });
        if ((_c = settings.zoomControls) === null || _c === void 0 ? void 0 : _c.customZoomOutElement) {
            settings.zoomControls.customZoomOutElement(this.zoomOutButton);
        }
        else {
            this.zoomOutButton.classList.add("bga-zoom-out-icon");
        }
        this.zoomInButton = document.createElement('button');
        this.zoomInButton.type = 'button';
        this.zoomInButton.addEventListener('click', function () { return _this.zoomIn(); });
        if ((_d = settings.zoomControls) === null || _d === void 0 ? void 0 : _d.customZoomInElement) {
            settings.zoomControls.customZoomInElement(this.zoomInButton);
        }
        else {
            this.zoomInButton.classList.add("bga-zoom-in-icon");
        }
        this.zoomControls.appendChild(this.zoomOutButton);
        this.zoomControls.appendChild(this.zoomInButton);
        this.wrapper.appendChild(this.zoomControls);
        this.setZoomControlsColor((_f = (_e = settings.zoomControls) === null || _e === void 0 ? void 0 : _e.color) !== null && _f !== void 0 ? _f : 'black');
    };
    /**
     * Wraps an element around an existing DOM element
     * @param wrapper the wrapper element
     * @param element the existing element
     */
    ZoomManager.prototype.wrapElement = function (wrapper, element) {
        element.parentNode.insertBefore(wrapper, element);
        wrapper.appendChild(element);
    };
    return ZoomManager;
}());
/**
 * Linear slide of the card from origin to destination.
 *
 * @param element the element to animate. The element should be attached to the destination element before the animation starts.
 * @param settings an `AnimationSettings` object
 * @returns a promise when animation ends
 */
function slideAnimation(element, settings) {
    var promise = new Promise(function (success) {
        var _a, _b, _c, _d, _e;
        // should be checked at the beginning of every animation
        if (!shouldAnimate(settings)) {
            success(false);
            return promise;
        }
        var _f = getDeltaCoordinates(element, settings), x = _f.x, y = _f.y;
        var duration = (_a = settings === null || settings === void 0 ? void 0 : settings.duration) !== null && _a !== void 0 ? _a : 500;
        var originalZIndex = element.style.zIndex;
        var originalTransition = element.style.transition;
        element.style.zIndex = "".concat((_b = settings === null || settings === void 0 ? void 0 : settings.zIndex) !== null && _b !== void 0 ? _b : 10);
        element.style.transition = null;
        element.offsetHeight;
        element.style.transform = "translate(".concat(-x, "px, ").concat(-y, "px) rotate(").concat((_c = settings === null || settings === void 0 ? void 0 : settings.rotationDelta) !== null && _c !== void 0 ? _c : 0, "deg)");
        (_d = settings.animationStart) === null || _d === void 0 ? void 0 : _d.call(settings, element);
        var timeoutId = null;
        var cleanOnTransitionEnd = function () {
            var _a;
            element.style.zIndex = originalZIndex;
            element.style.transition = originalTransition;
            (_a = settings.animationEnd) === null || _a === void 0 ? void 0 : _a.call(settings, element);
            success(true);
            element.removeEventListener('transitioncancel', cleanOnTransitionEnd);
            element.removeEventListener('transitionend', cleanOnTransitionEnd);
            document.removeEventListener('visibilitychange', cleanOnTransitionEnd);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
        var cleanOnTransitionCancel = function () {
            var _a;
            element.style.transition = "";
            element.offsetHeight;
            element.style.transform = (_a = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _a !== void 0 ? _a : null;
            element.offsetHeight;
            cleanOnTransitionEnd();
        };
        element.addEventListener('transitioncancel', cleanOnTransitionCancel);
        element.addEventListener('transitionend', cleanOnTransitionEnd);
        document.addEventListener('visibilitychange', cleanOnTransitionCancel);
        element.offsetHeight;
        element.style.transition = "transform ".concat(duration, "ms linear");
        element.offsetHeight;
        element.style.transform = (_e = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _e !== void 0 ? _e : null;
        // safety in case transitionend and transitioncancel are not called
        timeoutId = setTimeout(cleanOnTransitionEnd, duration + 100);
    });
    return promise;
}
function shouldAnimate(settings) {
    var _a;
    return document.visibilityState !== 'hidden' && !((_a = settings === null || settings === void 0 ? void 0 : settings.game) === null || _a === void 0 ? void 0 : _a.instantaneousMode);
}
/**
 * Return the x and y delta, based on the animation settings;
 *
 * @param settings an `AnimationSettings` object
 * @returns a promise when animation ends
 */
function getDeltaCoordinates(element, settings) {
    var _a;
    if (!settings.fromDelta && !settings.fromRect && !settings.fromElement) {
        throw new Error("[bga-animation] fromDelta, fromRect or fromElement need to be set");
    }
    var x = 0;
    var y = 0;
    if (settings.fromDelta) {
        x = settings.fromDelta.x;
        y = settings.fromDelta.y;
    }
    else {
        var originBR = (_a = settings.fromRect) !== null && _a !== void 0 ? _a : settings.fromElement.getBoundingClientRect();
        // TODO make it an option ?
        var originalTransform = element.style.transform;
        element.style.transform = '';
        var destinationBR = element.getBoundingClientRect();
        element.style.transform = originalTransform;
        x = (destinationBR.left + destinationBR.right) / 2 - (originBR.left + originBR.right) / 2;
        y = (destinationBR.top + destinationBR.bottom) / 2 - (originBR.top + originBR.bottom) / 2;
    }
    if (settings.scale) {
        x /= settings.scale;
        y /= settings.scale;
    }
    return { x: x, y: y };
}
function logAnimation(element, settings) {
    console.log(element, element.getBoundingClientRect(), element.style.transform, settings);
    return Promise.resolve(false);
}
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var AnimationManager = /** @class */ (function () {
    /**
     * @param game the BGA game class, usually it will be `this`
     * @param settings: a `AnimationManagerSettings` object
     */
    function AnimationManager(game, settings) {
        this.game = game;
        this.settings = settings;
        this.zoomManager = settings === null || settings === void 0 ? void 0 : settings.zoomManager;
    }
    /**
     * Attach an element to a parent, then play animation from element's origin to its new position.
     *
     * @param element the element to animate
     * @param toElement the destination parent
     * @param fn the animation function
     * @param settings the animation settings
     * @returns a promise when animation ends
     */
    AnimationManager.prototype.attachWithAnimation = function (element, toElement, fn, settings) {
        var _a, _b, _c, _d, _e, _f;
        var fromRect = element.getBoundingClientRect();
        toElement.appendChild(element);
        (_a = settings === null || settings === void 0 ? void 0 : settings.afterAttach) === null || _a === void 0 ? void 0 : _a.call(settings, element, toElement);
        return (_f = fn(element, __assign(__assign({ duration: (_c = (_b = this.settings) === null || _b === void 0 ? void 0 : _b.duration) !== null && _c !== void 0 ? _c : 500, scale: (_e = (_d = this.zoomManager) === null || _d === void 0 ? void 0 : _d.zoom) !== null && _e !== void 0 ? _e : undefined }, settings !== null && settings !== void 0 ? settings : {}), { game: this.game, fromRect: fromRect }))) !== null && _f !== void 0 ? _f : Promise.resolve(false);
    };
    /**
     * Attach an element to a parent with a slide animation.
     *
     * @param card the card informations
     */
    AnimationManager.prototype.attachWithSlideAnimation = function (element, toElement, settings) {
        return this.attachWithAnimation(element, toElement, slideAnimation, settings);
    };
    /**
     * Attach an element to a parent with a slide animation.
     *
     * @param card the card informations
     */
    AnimationManager.prototype.attachWithShowToScreenAnimation = function (element, toElement, settingsOrSettingsArray) {
        var _this = this;
        var cumulatedAnimation = function (element, settings) { return cumulatedAnimations(element, [
            showScreenCenterAnimation,
            pauseAnimation,
            function (element) { return _this.attachWithSlideAnimation(element, toElement); },
        ], settingsOrSettingsArray); };
        return this.attachWithAnimation(element, toElement, cumulatedAnimation, null);
    };
    /**
     * Slide from an element.
     *
     * @param element the element to animate
     * @param fromElement the origin element
     * @param settings the animation settings
     * @returns a promise when animation ends
     */
    AnimationManager.prototype.slideFromElement = function (element, fromElement, settings) {
        var _a, _b, _c, _d, _e;
        return (_e = slideAnimation(element, __assign(__assign({ duration: (_b = (_a = this.settings) === null || _a === void 0 ? void 0 : _a.duration) !== null && _b !== void 0 ? _b : 500, scale: (_d = (_c = this.zoomManager) === null || _c === void 0 ? void 0 : _c.zoom) !== null && _d !== void 0 ? _d : undefined }, settings !== null && settings !== void 0 ? settings : {}), { game: this.game, fromElement: fromElement }))) !== null && _e !== void 0 ? _e : Promise.resolve(false);
    };
    AnimationManager.prototype.getZoomManager = function () {
        return this.zoomManager;
    };
    /**
     * Set the zoom manager, to get the scale of the current game.
     *
     * @param zoomManager the zoom manager
     */
    AnimationManager.prototype.setZoomManager = function (zoomManager) {
        this.zoomManager = zoomManager;
    };
    AnimationManager.prototype.getSettings = function () {
        return this.settings;
    };
    return AnimationManager;
}());
/**
 * The abstract stock. It shouldn't be used directly, use stocks that extends it.
 */
var CardStock = /** @class */ (function () {
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     */
    function CardStock(manager, element, settings) {
        this.manager = manager;
        this.element = element;
        this.cards = [];
        this.selectedCards = [];
        this.selectionMode = 'none';
        manager.addStock(this);
        element === null || element === void 0 ? void 0 : element.classList.add('card-stock' /*, this.constructor.name.split(/(?=[A-Z])/).join('-').toLowerCase()* doesn't work in production because of minification */);
        this.bindClick();
        this.sort = settings === null || settings === void 0 ? void 0 : settings.sort;
    }
    /**
     * @returns the cards on the stock
     */
    CardStock.prototype.getCards = function () {
        return this.cards.slice();
    };
    /**
     * @returns if the stock is empty
     */
    CardStock.prototype.isEmpty = function () {
        return !this.cards.length;
    };
    /**
     * @returns the selected cards
     */
    CardStock.prototype.getSelection = function () {
        return this.selectedCards.slice();
    };
    /**
     * @param card a card
     * @returns if the card is present in the stock
     */
    CardStock.prototype.contains = function (card) {
        var _this = this;
        return this.cards.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
    };
    // TODO keep only one ?
    CardStock.prototype.cardInStock = function (card) {
        var element = document.getElementById(this.manager.getId(card));
        return element ? this.cardElementInStock(element) : false;
    };
    CardStock.prototype.cardElementInStock = function (element) {
        return (element === null || element === void 0 ? void 0 : element.parentElement) == this.element;
    };
    /**
     * @param card a card in the stock
     * @returns the HTML element generated for the card
     */
    CardStock.prototype.getCardElement = function (card) {
        return document.getElementById(this.manager.getId(card));
    };
    /**
     * Checks if the card can be added. By default, only if it isn't already present in the stock.
     *
     * @param card the card to add
     * @param settings the addCard settings
     * @returns if the card can be added
     */
    CardStock.prototype.canAddCard = function (card, settings) {
        return !this.cardInStock(card);
    };
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    CardStock.prototype.addCard = function (card, animation, settings) {
        var _a, _b;
        if (!this.canAddCard(card, settings)) {
            return Promise.resolve(false);
        }
        var promise;
        // we check if card is in stock then we ignore animation
        var currentStock = this.manager.getCardStock(card);
        var index = this.getNewCardIndex(card);
        var settingsWithIndex = __assign({ index: index }, (settings !== null && settings !== void 0 ? settings : {}));
        if (currentStock === null || currentStock === void 0 ? void 0 : currentStock.cardInStock(card)) {
            var element = document.getElementById(this.manager.getId(card));
            promise = this.moveFromOtherStock(card, element, __assign(__assign({}, animation), { fromStock: currentStock }), settingsWithIndex);
            element.dataset.side = ((_a = settingsWithIndex === null || settingsWithIndex === void 0 ? void 0 : settingsWithIndex.visible) !== null && _a !== void 0 ? _a : true) ? 'front' : 'back';
        }
        else if ((animation === null || animation === void 0 ? void 0 : animation.fromStock) && animation.fromStock.cardInStock(card)) {
            var element = document.getElementById(this.manager.getId(card));
            promise = this.moveFromOtherStock(card, element, animation, settingsWithIndex);
        }
        else {
            var element = this.manager.createCardElement(card, ((_b = settingsWithIndex === null || settingsWithIndex === void 0 ? void 0 : settingsWithIndex.visible) !== null && _b !== void 0 ? _b : true));
            promise = this.moveFromElement(card, element, animation, settingsWithIndex);
        }
        this.setSelectableCard(card, this.selectionMode != 'none');
        if (settingsWithIndex.index !== null && settingsWithIndex.index !== undefined) {
            this.cards.splice(index, 0, card);
        }
        else {
            this.cards.push(card);
        }
        if (!promise) {
            console.warn("CardStock.addCard didn't return a Promise");
            return Promise.resolve(false);
        }
        return promise;
    };
    CardStock.prototype.getNewCardIndex = function (card) {
        if (this.sort) {
            var otherCards = this.getCards();
            for (var i = 0; i < otherCards.length; i++) {
                var otherCard = otherCards[i];
                if (this.sort(card, otherCard) < 0) {
                    return i;
                }
            }
            return otherCards.length;
        }
        else {
            return undefined;
        }
    };
    CardStock.prototype.addCardElementToParent = function (cardElement, settings) {
        var _a;
        var parent = (_a = settings === null || settings === void 0 ? void 0 : settings.forceToElement) !== null && _a !== void 0 ? _a : this.element;
        if ((settings === null || settings === void 0 ? void 0 : settings.index) === null || (settings === null || settings === void 0 ? void 0 : settings.index) === undefined || !parent.children.length || (settings === null || settings === void 0 ? void 0 : settings.index) >= parent.children.length) {
            parent.appendChild(cardElement);
        }
        else {
            parent.insertBefore(cardElement, parent.children[settings.index]);
        }
    };
    CardStock.prototype.moveFromOtherStock = function (card, cardElement, animation, settings) {
        var promise;
        this.addCardElementToParent(cardElement, settings);
        cardElement.classList.remove('selectable', 'selected', 'disabled');
        promise = this.animationFromElement(cardElement, animation.fromStock.element, {
            originalSide: animation.originalSide,
            rotationDelta: animation.rotationDelta,
            animation: animation.animation,
        });
        // in the case the card was move inside the same stock we don't remove it
        if (animation.fromStock != this) {
            animation.fromStock.removeCard(card);
        }
        if (!promise) {
            console.warn("CardStock.moveFromOtherStock didn't return a Promise");
            promise = Promise.resolve(false);
        }
        return promise;
    };
    CardStock.prototype.moveFromElement = function (card, cardElement, animation, settings) {
        var promise;
        this.addCardElementToParent(cardElement, settings);
        if (animation) {
            if (animation.fromStock) {
                promise = this.animationFromElement(cardElement, animation.fromStock.element, {
                    originalSide: animation.originalSide,
                    rotationDelta: animation.rotationDelta,
                    animation: animation.animation,
                });
                animation.fromStock.removeCard(card);
            }
            else if (animation.fromElement) {
                promise = this.animationFromElement(cardElement, animation.fromElement, {
                    originalSide: animation.originalSide,
                    rotationDelta: animation.rotationDelta,
                    animation: animation.animation,
                });
            }
        }
        else {
            promise = Promise.resolve(false);
        }
        if (!promise) {
            console.warn("CardStock.moveFromElement didn't return a Promise");
            promise = Promise.resolve(false);
        }
        return promise;
    };
    /**
     * Add an array of cards to the stock.
     *
     * @param cards the cards to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardSettings` object
     * @param shift if number, the number of milliseconds between each card. if true, chain animations
     */
    CardStock.prototype.addCards = function (cards, animation, settings, shift) {
        var _this = this;
        if (shift === void 0) { shift = false; }
        if (shift === true) {
            if (cards.length) {
                this.addCard(cards[0], animation, settings).then(function () { return _this.addCards(cards.slice(1), animation, settings, shift); });
            }
            return;
        }
        if (shift) {
            var _loop_1 = function (i) {
                setTimeout(function () { return _this.addCard(cards[i], animation, settings); }, i * shift);
            };
            for (var i = 0; i < cards.length; i++) {
                _loop_1(i);
            }
        }
        else {
            cards.forEach(function (card) { return _this.addCard(card, animation, settings); });
        }
    };
    /**
     * Remove a card from the stock.
     *
     * @param card the card to remove
     */
    CardStock.prototype.removeCard = function (card) {
        if (this.cardInStock(card)) {
            this.manager.removeCard(card);
        }
        this.cardRemoved(card);
    };
    CardStock.prototype.cardRemoved = function (card) {
        var _this = this;
        var index = this.cards.findIndex(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
        if (index !== -1) {
            this.cards.splice(index, 1);
        }
        if (this.selectedCards.find(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); })) {
            this.unselectCard(card);
        }
    };
    /**
     * Remove a set of card from the stock.
     *
     * @param cards the cards to remove
     */
    CardStock.prototype.removeCards = function (cards) {
        var _this = this;
        cards.forEach(function (card) { return _this.removeCard(card); });
    };
    /**
     * Remove all cards from the stock.
     */
    CardStock.prototype.removeAll = function () {
        var _this = this;
        var cards = this.getCards(); // use a copy of the array as we iterate and modify it at the same time
        cards.forEach(function (card) { return _this.removeCard(card); });
    };
    CardStock.prototype.setSelectableCard = function (card, selectable) {
        var element = this.getCardElement(card);
        element.classList.toggle('selectable', selectable);
    };
    /**
     * Set if the stock is selectable, and if yes if it can be multiple.
     * If set to 'none', it will unselect all selected cards.
     *
     * @param selectionMode the selection mode
     */
    CardStock.prototype.setSelectionMode = function (selectionMode) {
        var _this = this;
        if (selectionMode === 'none') {
            this.unselectAll(true);
        }
        this.cards.forEach(function (card) { return _this.setSelectableCard(card, selectionMode != 'none'); });
        this.element.classList.toggle('selectable', selectionMode != 'none');
        this.selectionMode = selectionMode;
    };
    /**
     * Set selected state to a card.
     *
     * @param card the card to select
     */
    CardStock.prototype.selectCard = function (card, silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        if (this.selectionMode == 'none') {
            return;
        }
        if (this.selectionMode === 'single') {
            this.cards.filter(function (c) { return _this.manager.getId(c) != _this.manager.getId(card); }).forEach(function (c) { return _this.unselectCard(c, true); });
        }
        var element = this.getCardElement(card);
        element.classList.add('selected');
        this.selectedCards.push(card);
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), card);
        }
    };
    /**
     * Set unselected state to a card.
     *
     * @param card the card to unselect
     */
    CardStock.prototype.unselectCard = function (card, silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        var element = this.getCardElement(card);
        element.classList.remove('selected');
        var index = this.selectedCards.findIndex(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
        if (index !== -1) {
            this.selectedCards.splice(index, 1);
        }
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), card);
        }
    };
    /**
     * Select all cards
     */
    CardStock.prototype.selectAll = function (silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        if (this.selectionMode == 'none') {
            return;
        }
        this.cards.forEach(function (c) { return _this.selectCard(c, true); });
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), null);
        }
    };
    /**
     * Unelect all cards
     */
    CardStock.prototype.unselectAll = function (silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        var cards = this.getCards(); // use a copy of the array as we iterate and modify it at the same time
        cards.forEach(function (c) { return _this.unselectCard(c, true); });
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), null);
        }
    };
    CardStock.prototype.bindClick = function () {
        var _this = this;
        var _a;
        (_a = this.element) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function (event) {
            var cardDiv = event.target.closest('.card');
            if (!cardDiv) {
                return;
            }
            var card = _this.cards.find(function (c) { return _this.manager.getId(c) == cardDiv.id; });
            if (!card) {
                return;
            }
            _this.cardClick(card);
        });
    };
    CardStock.prototype.cardClick = function (card) {
        var _this = this;
        var _a;
        if (this.selectionMode != 'none') {
            var alreadySelected = this.selectedCards.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
            if (alreadySelected) {
                this.unselectCard(card);
            }
            else {
                this.selectCard(card);
            }
        }
        (_a = this.onCardClick) === null || _a === void 0 ? void 0 : _a.call(this, card);
    };
    /**
     * @param element The element to animate. The element is added to the destination stock before the animation starts.
     * @param fromElement The HTMLElement to animate from.
     */
    CardStock.prototype.animationFromElement = function (element, fromElement, settings) {
        var _a, _b, _c, _d, _e, _f;
        var side = element.dataset.side;
        if (settings.originalSide && settings.originalSide != side) {
            var cardSides_1 = element.getElementsByClassName('card-sides')[0];
            cardSides_1.style.transition = 'none';
            element.dataset.side = settings.originalSide;
            setTimeout(function () {
                cardSides_1.style.transition = null;
                element.dataset.side = side;
            });
        }
        var animation = (_a = settings.animation) !== null && _a !== void 0 ? _a : slideAnimation;
        return (_f = animation(element, __assign(__assign({ duration: (_c = (_b = this.manager.animationManager.getSettings()) === null || _b === void 0 ? void 0 : _b.duration) !== null && _c !== void 0 ? _c : 500, scale: (_e = (_d = this.manager.animationManager.getZoomManager()) === null || _d === void 0 ? void 0 : _d.zoom) !== null && _e !== void 0 ? _e : undefined }, settings !== null && settings !== void 0 ? settings : {}), { game: this.manager.game, fromElement: fromElement }))) !== null && _f !== void 0 ? _f : Promise.resolve(false);
    };
    /**
     * Set the card to its front (visible) or back (not visible) side.
     *
     * @param card the card informations
     */
    CardStock.prototype.setCardVisible = function (card, visible, settings) {
        this.manager.setCardVisible(card, visible, settings);
    };
    /**
     * Flips the card.
     *
     * @param card the card informations
     */
    CardStock.prototype.flipCard = function (card, settings) {
        this.manager.flipCard(card, settings);
    };
    return CardStock;
}());
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
 * Abstract stock to represent a deck. (pile of cards, with a fake 3d effect of thickness).
 */
var Deck = /** @class */ (function (_super) {
    __extends(Deck, _super);
    function Deck(manager, element, settings) {
        var _this = this;
        var _a, _b, _c, _d;
        _this = _super.call(this, manager, element) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('deck');
        _this.element.style.setProperty('--width', settings.width + 'px');
        _this.element.style.setProperty('--height', settings.height + 'px');
        _this.thicknesses = (_a = settings.thicknesses) !== null && _a !== void 0 ? _a : [0, 2, 5, 10, 20, 30];
        _this.setCardNumber((_b = settings.cardNumber) !== null && _b !== void 0 ? _b : 52);
        _this.autoUpdateCardNumber = (_c = settings.autoUpdateCardNumber) !== null && _c !== void 0 ? _c : true;
        var shadowDirection = (_d = settings.shadowDirection) !== null && _d !== void 0 ? _d : 'bottom-right';
        var shadowDirectionSplit = shadowDirection.split('-');
        var xShadowShift = shadowDirectionSplit.includes('right') ? 1 : (shadowDirectionSplit.includes('left') ? -1 : 0);
        var yShadowShift = shadowDirectionSplit.includes('bottom') ? 1 : (shadowDirectionSplit.includes('top') ? -1 : 0);
        _this.element.style.setProperty('--xShadowShift', '' + xShadowShift);
        _this.element.style.setProperty('--yShadowShift', '' + yShadowShift);
        return _this;
    }
    Deck.prototype.setCardNumber = function (cardNumber) {
        var _this = this;
        this.cardNumber = cardNumber;
        this.element.dataset.empty = (this.cardNumber == 0).toString();
        var thickness = 0;
        this.thicknesses.forEach(function (threshold, index) {
            if (_this.cardNumber >= threshold) {
                thickness = index;
            }
        });
        this.element.style.setProperty('--thickness', thickness + 'px');
    };
    Deck.prototype.addCard = function (card, animation, settings) {
        return _super.prototype.addCard.call(this, card, animation, settings);
    };
    Deck.prototype.cardRemoved = function (card) {
        if (this.autoUpdateCardNumber) {
            this.setCardNumber(this.cardNumber - 1);
        }
        _super.prototype.cardRemoved.call(this, card);
    };
    return Deck;
}(CardStock));
/**
 * A basic stock for a list of cards, based on flex.
 */
var LineStock = /** @class */ (function (_super) {
    __extends(LineStock, _super);
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     * @param settings a `LineStockSettings` object
     */
    function LineStock(manager, element, settings) {
        var _this = this;
        var _a, _b, _c, _d;
        _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('line-stock');
        element.dataset.center = ((_a = settings === null || settings === void 0 ? void 0 : settings.center) !== null && _a !== void 0 ? _a : true).toString();
        element.style.setProperty('--wrap', (_b = settings === null || settings === void 0 ? void 0 : settings.wrap) !== null && _b !== void 0 ? _b : 'wrap');
        element.style.setProperty('--direction', (_c = settings === null || settings === void 0 ? void 0 : settings.direction) !== null && _c !== void 0 ? _c : 'row');
        element.style.setProperty('--gap', (_d = settings === null || settings === void 0 ? void 0 : settings.gap) !== null && _d !== void 0 ? _d : '8px');
        return _this;
    }
    return LineStock;
}(CardStock));
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
/**
 * A stock with fixed slots (some can be empty)
 */
var SlotStock = /** @class */ (function (_super) {
    __extends(SlotStock, _super);
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     * @param settings a `SlotStockSettings` object
     */
    function SlotStock(manager, element, settings) {
        var _this = this;
        var _a, _b;
        _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        _this.slotsIds = [];
        _this.slots = [];
        element.classList.add('slot-stock');
        _this.mapCardToSlot = settings.mapCardToSlot;
        _this.slotsIds = (_a = settings.slotsIds) !== null && _a !== void 0 ? _a : [];
        _this.slotClasses = (_b = settings.slotClasses) !== null && _b !== void 0 ? _b : [];
        _this.slotsIds.forEach(function (slotId) {
            _this.createSlot(slotId);
        });
        return _this;
    }
    SlotStock.prototype.createSlot = function (slotId) {
        var _a;
        this.slots[slotId] = document.createElement("div");
        this.slots[slotId].dataset.slotId = slotId;
        this.element.appendChild(this.slots[slotId]);
        (_a = this.slots[slotId].classList).add.apply(_a, __spreadArray(['slot'], this.slotClasses, true));
    };
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardToSlotSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    SlotStock.prototype.addCard = function (card, animation, settings) {
        var _a, _b;
        var slotId = (_a = settings === null || settings === void 0 ? void 0 : settings.slot) !== null && _a !== void 0 ? _a : (_b = this.mapCardToSlot) === null || _b === void 0 ? void 0 : _b.call(this, card);
        if (slotId === undefined) {
            throw new Error("Impossible to add card to slot : no SlotId. Add slotId to settings or set mapCardToSlot to SlotCard constructor.");
        }
        if (!this.slots[slotId]) {
            throw new Error("Impossible to add card to slot \"".concat(slotId, "\" : slot \"").concat(slotId, "\" doesn't exists."));
        }
        var newSettings = __assign(__assign({}, settings), { forceToElement: this.slots[slotId] });
        return _super.prototype.addCard.call(this, card, animation, newSettings);
    };
    /**
     * Change the slots ids. Will empty the stock before re-creating the slots.
     *
     * @param slotsIds the new slotsIds. Will replace the old ones.
     */
    SlotStock.prototype.setSlotsIds = function (slotsIds) {
        var _this = this;
        if (slotsIds.length == this.slotsIds.length && slotsIds.every(function (slotId, index) { return _this.slotsIds[index] === slotId; })) {
            // no change
            return;
        }
        this.removeAll();
        this.element.innerHTML = '';
        this.slotsIds = slotsIds !== null && slotsIds !== void 0 ? slotsIds : [];
        this.slotsIds.forEach(function (slotId) {
            _this.createSlot(slotId);
        });
    };
    SlotStock.prototype.cardElementInStock = function (element) {
        return (element === null || element === void 0 ? void 0 : element.parentElement.parentElement) == this.element;
    };
    SlotStock.prototype.canAddCard = function (card, settings) {
        var _a, _b;
        if (!this.cardInStock(card)) {
            return true;
        }
        else {
            var currentCardSlot = this.getCardElement(card).closest('.slot').dataset.slotId;
            var slotId = (_a = settings === null || settings === void 0 ? void 0 : settings.slot) !== null && _a !== void 0 ? _a : (_b = this.mapCardToSlot) === null || _b === void 0 ? void 0 : _b.call(this, card);
            return currentCardSlot != slotId;
        }
    };
    return SlotStock;
}(LineStock));
/**
 * A stock to make cards disappear (to automatically remove discarded cards, or to represent a bag)
 */
var VoidStock = /** @class */ (function (_super) {
    __extends(VoidStock, _super);
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     */
    function VoidStock(manager, element) {
        var _this = _super.call(this, manager, element) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('void-stock');
        return _this;
    }
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    VoidStock.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        // center the element
        var cardElement = this.getCardElement(card);
        cardElement.style.left = "".concat((this.element.clientWidth - cardElement.clientWidth) / 2, "px");
        cardElement.style.top = "".concat((this.element.clientHeight - cardElement.clientHeight) / 2, "px");
        if (!promise) {
            console.warn("VoidStock.addCard didn't return a Promise");
            promise = Promise.resolve(false);
        }
        return promise.then(function (result) {
            _this.removeCard(card);
            return result;
        });
    };
    return VoidStock;
}(CardStock));
var HiddenDeck = /** @class */ (function (_super) {
    __extends(HiddenDeck, _super);
    function HiddenDeck(manager, element, settings) {
        var _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('hidden-deck');
        _this.element.appendChild(_this.manager.createCardElement({ id: "".concat(element.id, "-hidden-deck-back") }, false));
        return _this;
    }
    HiddenDeck.prototype.addCard = function (card, animation, settings) {
        var _a;
        var newSettings = __assign(__assign({}, settings), { visible: (_a = settings === null || settings === void 0 ? void 0 : settings.visible) !== null && _a !== void 0 ? _a : false });
        return _super.prototype.addCard.call(this, card, animation, newSettings);
    };
    return HiddenDeck;
}(Deck));
var VisibleDeck = /** @class */ (function (_super) {
    __extends(VisibleDeck, _super);
    function VisibleDeck(manager, element, settings) {
        var _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('visible-deck');
        return _this;
    }
    VisibleDeck.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var currentCard = this.cards[this.cards.length - 1];
        if (currentCard) {
            // we remove the card under, only when the animation is done. TODO use promise result
            setTimeout(function () {
                _this.removeCard(currentCard);
                // counter the autoUpdateCardNumber as the card isn't really removed, we just remove it from the dom so player cannot see it's content.
                if (_this.autoUpdateCardNumber) {
                    _this.setCardNumber(_this.cardNumber + 1);
                }
            }, 600);
        }
        return _super.prototype.addCard.call(this, card, animation, settings);
    };
    return VisibleDeck;
}(Deck));
var AllVisibleDeck = /** @class */ (function (_super) {
    __extends(AllVisibleDeck, _super);
    function AllVisibleDeck(manager, element, settings) {
        var _this = this;
        var _a;
        _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('all-visible-deck');
        element.style.setProperty('--width', settings.width);
        element.style.setProperty('--height', settings.height);
        element.style.setProperty('--shift', (_a = settings.shift) !== null && _a !== void 0 ? _a : '3px');
        return _this;
    }
    AllVisibleDeck.prototype.addCard = function (card, animation, settings) {
        var promise;
        var order = this.cards.length;
        promise = _super.prototype.addCard.call(this, card, animation, settings);
        var cardId = this.manager.getId(card);
        var cardDiv = document.getElementById(cardId);
        cardDiv.style.setProperty('--order', '' + order);
        this.element.style.setProperty('--tile-count', '' + this.cards.length);
        return promise;
    };
    /**
     * Set opened state. If true, all cards will be entirely visible.
     *
     * @param opened indicate if deck must be always opened. If false, will open only on hover/touch
     */
    AllVisibleDeck.prototype.setOpened = function (opened) {
        this.element.classList.toggle('opened', opened);
    };
    AllVisibleDeck.prototype.cardRemoved = function (card) {
        var _this = this;
        _super.prototype.cardRemoved.call(this, card);
        this.cards.forEach(function (c, index) {
            var cardId = _this.manager.getId(c);
            var cardDiv = document.getElementById(cardId);
            cardDiv.style.setProperty('--order', '' + index);
        });
        this.element.style.setProperty('--tile-count', '' + this.cards.length);
    };
    return AllVisibleDeck;
}(CardStock));
var CardManager = /** @class */ (function () {
    /**
     * @param game the BGA game class, usually it will be `this`
     * @param settings: a `CardManagerSettings` object
     */
    function CardManager(game, settings) {
        var _a;
        this.game = game;
        this.settings = settings;
        this.stocks = [];
        this.animationManager = (_a = settings.animationManager) !== null && _a !== void 0 ? _a : new AnimationManager(game);
    }
    CardManager.prototype.addStock = function (stock) {
        this.stocks.push(stock);
    };
    /**
     * @param card the card informations
     * @return the id for a card
     */
    CardManager.prototype.getId = function (card) {
        var _a, _b, _c;
        return (_c = (_b = (_a = this.settings).getId) === null || _b === void 0 ? void 0 : _b.call(_a, card)) !== null && _c !== void 0 ? _c : "card-".concat(card.id);
    };
    CardManager.prototype.createCardElement = function (card, visible) {
        var _a, _b, _c, _d, _e, _f;
        if (visible === void 0) { visible = true; }
        var id = this.getId(card);
        var side = visible ? 'front' : 'back';
        // TODO check if exists
        var element = document.createElement("div");
        element.id = id;
        element.dataset.side = '' + side;
        element.innerHTML = "\n            <div class=\"card-sides\">\n                <div class=\"card-side front\">\n                </div>\n                <div class=\"card-side back\">\n                </div>\n            </div>\n        ";
        element.classList.add('card');
        document.body.appendChild(element);
        (_b = (_a = this.settings).setupDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element);
        (_d = (_c = this.settings).setupFrontDiv) === null || _d === void 0 ? void 0 : _d.call(_c, card, element.getElementsByClassName('front')[0]);
        (_f = (_e = this.settings).setupBackDiv) === null || _f === void 0 ? void 0 : _f.call(_e, card, element.getElementsByClassName('back')[0]);
        document.body.removeChild(element);
        return element;
    };
    /**
     * @param card the card informations
     * @return the HTML element of an existing card
     */
    CardManager.prototype.getCardElement = function (card) {
        return document.getElementById(this.getId(card));
    };
    CardManager.prototype.removeCard = function (card) {
        var _a;
        var id = this.getId(card);
        var div = document.getElementById(id);
        if (!div) {
            return;
        }
        // if the card is in a stock, notify the stock about removal
        (_a = this.getCardStock(card)) === null || _a === void 0 ? void 0 : _a.cardRemoved(card);
        div.id = "deleted".concat(id);
        // TODO this.removeVisibleInformations(div);
        div.remove();
    };
    /**
     * @param card the card informations
     * @return the stock containing the card
     */
    CardManager.prototype.getCardStock = function (card) {
        return this.stocks.find(function (stock) { return stock.contains(card); });
    };
    /**
     * Set the card to its front (visible) or back (not visible) side.
     *
     * @param card the card informations
     */
    CardManager.prototype.setCardVisible = function (card, visible, settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g;
        var element = this.getCardElement(card);
        if (!element) {
            return;
        }
        element.dataset.side = visible ? 'front' : 'back';
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.updateFront) !== null && _a !== void 0 ? _a : true) {
            (_c = (_b = this.settings).setupFrontDiv) === null || _c === void 0 ? void 0 : _c.call(_b, card, element.getElementsByClassName('front')[0]);
        }
        if ((_d = settings === null || settings === void 0 ? void 0 : settings.updateBack) !== null && _d !== void 0 ? _d : false) {
            (_f = (_e = this.settings).setupBackDiv) === null || _f === void 0 ? void 0 : _f.call(_e, card, element.getElementsByClassName('back')[0]);
        }
        if ((_g = settings === null || settings === void 0 ? void 0 : settings.updateData) !== null && _g !== void 0 ? _g : true) {
            // card data has changed
            var stock = this.getCardStock(card);
            var cards = stock.getCards();
            var cardIndex = cards.findIndex(function (c) { return _this.getId(c) === _this.getId(card); });
            if (cardIndex !== -1) {
                stock.cards.splice(cardIndex, 1, card);
            }
        }
    };
    /**
     * Flips the card.
     *
     * @param card the card informations
     */
    CardManager.prototype.flipCard = function (card, settings) {
        var element = this.getCardElement(card);
        var currentlyVisible = element.dataset.side === 'front';
        this.setCardVisible(card, !currentlyVisible, settings);
    };
    return CardManager;
}());
var OPENED_LEFT = 1;
var CLOSED = 2;
var OPENED_RIGHT = 3;
var CardsManager = /** @class */ (function (_super) {
    __extends(CardsManager, _super);
    function CardsManager(game) {
        var _this = _super.call(this, game, {
            getId: function (card) { return "card-".concat(card.id); },
            setupDiv: function (card, div) {
                div.dataset.cardId = '' + card.id;
                var tooltip = _this.getTooltip(card);
                if (tooltip) {
                    _this.game.setTooltip(div.id, tooltip);
                }
            },
            setupFrontDiv: function (card, div) {
                div.dataset.level = '' + card.level;
                div.dataset.type = '' + card.type;
                div.dataset.subType = '' + card.subType;
                if (card.playerId) {
                    div.dataset.playerColor = '' + game.getPlayerColor(card.playerId);
                }
                if (card.frames) {
                    _this.createFrames(div, card.frames);
                }
            },
        }) || this;
        _this.game = game;
        return _this;
    }
    CardsManager.prototype.createFrame = function (div, frame, row, index, left) {
        var _this = this;
        if (left === void 0) { left = null; }
        var width = 11 + (Math.max(1, frame.left.length + frame.right.length) * 17) + (frame.convertSign ? 8 : 0);
        if (frame.left.some(function (resource) { return resource[1] == PER_TAMARINS; })) {
            width += 16;
        }
        if (frame.left.some(function (resource) { return resource[1] == DIFFERENT; })) {
            width += 3;
        }
        if (frame.right.some(function (resource) { return resource[1] == RAGE; })) {
            width += 5;
        }
        var frameDiv = document.createElement('div');
        frameDiv.classList.add('frame');
        if (frame.type == OPENED_LEFT) {
            frameDiv.classList.add('opened-left');
        }
        else if (frame.type == OPENED_RIGHT) {
            frameDiv.classList.add('opened-right');
        }
        frameDiv.dataset.row = '' + row;
        frameDiv.dataset.index = '' + index;
        frameDiv.dataset.left = JSON.stringify(frame.left);
        frameDiv.dataset.right = JSON.stringify(frame.right);
        frameDiv.dataset.convertSign = JSON.stringify(frame.convertSign);
        frameDiv.style.setProperty('--width', " ".concat(width, "px"));
        if (left !== null) {
            frameDiv.style.setProperty('--left', " ".concat(left, "px"));
        }
        div.appendChild(frameDiv);
        frameDiv.addEventListener('click', function () {
            var cardDivId = +div.closest('.card').dataset.cardId;
            var cardIndex = _this.getCardStock({ id: cardDivId }).getCards().find(function (c) { return c.id == cardDivId; }).locationArg;
            _this.game.onFrameClicked(row, cardIndex, index);
        });
        return frameDiv;
    };
    CardsManager.prototype.propertyToNumber = function (div, property) {
        var match = div.style.getPropertyValue("--".concat(property)).match(/\d+/);
        return (match === null || match === void 0 ? void 0 : match.length) ? Number(match[0]) : 0;
    };
    CardsManager.prototype.createFrames = function (div, frames) {
        var _this = this;
        var _loop_2 = function (row) {
            var frameOpenedLeft = frames[row].find(function (frame) { return frame.type == OPENED_LEFT; });
            var leftFrameDiv = null;
            if (frameOpenedLeft) {
                leftFrameDiv = this_1.createFrame(div, frameOpenedLeft, row, 0);
            }
            var frameOpenedRight = frames[row].find(function (frame) { return frame.type == OPENED_RIGHT; });
            var rightFrameDiv = null;
            if (frameOpenedRight) {
                rightFrameDiv = this_1.createFrame(div, frameOpenedRight, row, frames[row].length - 1);
            }
            frames[row].forEach(function (frame, index) {
                if (frame != frameOpenedLeft && frame != frameOpenedRight) {
                    var left = index == 0 && frames[row].length === 3 ? 7 : 34;
                    var frameDiv = _this.createFrame(div, frame, row, index, left);
                    if (index == 0) {
                        leftFrameDiv = frameDiv;
                    }
                    if (index == 1 && frames[row].length == 3) {
                        var leftWidth = _this.propertyToNumber(leftFrameDiv, 'left') + _this.propertyToNumber(leftFrameDiv, 'width');
                        var space = 142 - leftWidth - _this.propertyToNumber(rightFrameDiv, 'width');
                        frameDiv.style.setProperty('--left', "".concat(leftWidth + (space - _this.propertyToNumber(frameDiv, 'width')) / 2, "px"));
                    }
                    else if (leftFrameDiv && index == 1 && frames[row].length == 2) {
                        var leftWidth = _this.propertyToNumber(leftFrameDiv, 'left') + _this.propertyToNumber(leftFrameDiv, 'width');
                        frameDiv.style.setProperty('--left', "".concat(leftWidth + 26, "px"));
                    }
                    else if (rightFrameDiv && index == 0 && frames[row].length == 2) {
                        var left_1 = 142 - _this.propertyToNumber(rightFrameDiv, 'width');
                        frameDiv.style.setProperty('--left', "".concat(left_1 - _this.propertyToNumber(frameDiv, 'width') - 26, "px"));
                    }
                }
            });
        };
        var this_1 = this;
        for (var row = 0; row < 3; row++) {
            _loop_2(row);
        }
    };
    CardsManager.prototype.getMonkeyType = function (type) {
        switch (type) {
            case 0: return _('tamarin');
            case 1: return _('mandrill');
            case 2: return _('orangutan');
            case 3: return _('gorilla');
            case 4: return _('chimpanzee');
        }
    };
    CardsManager.prototype.getTooltip = function (card) {
        if (!card.number) {
            return undefined;
        }
        return "".concat(_('${type} level ${level}').replace('${type}', "<strong>".concat(this.getMonkeyType(card.type), "</strong>")).replace('${level}', "<strong>".concat(card.level, "</strong>")), "<br>\n        ").concat(_('Card number:'), " ").concat(card.number, "\n        <br>TODO card index = ").concat(card.subType);
    };
    return CardsManager;
}(CardManager));
var ObjectsManager = /** @class */ (function (_super) {
    __extends(ObjectsManager, _super);
    function ObjectsManager(game) {
        var _this = _super.call(this, game, {
            getId: function (card) { return "object-".concat(card); },
            setupDiv: function (card, div) {
                div.classList.add('object');
                game.setTooltip(div.id, _this.getTooltip(card));
            },
            setupFrontDiv: function (card, div) {
                div.dataset.number = '' + card;
            },
        }) || this;
        _this.game = game;
        return _this;
    }
    ObjectsManager.prototype.getObjectName = function (number) {
        switch (number) {
            case 1: return _("Mobile phone");
            case 2: return _("Minibar");
            case 3: return _("Ghetto blaster");
            case 4: return _("Game console");
            case 5: return _("Pinball Machine");
            case 6: return _("Computer");
            case 7: return _("Moped");
        }
    };
    ObjectsManager.prototype.getObjectPhase = function (number) {
        switch (number) {
            case 1: return '1';
            case 2: return _("${a} or ${b}").replace('${a}', '1').replace('${b}', '2');
            case 3: return '1';
            case 4: return '3';
            case 5: return '1';
            case 6: return '1, ' + _("${a} or ${b}").replace('${a}', '2').replace('${b}', '3');
            case 7: return '2';
        }
    };
    ObjectsManager.prototype.getObjectCost = function (number) {
        switch (number) {
            case 1: return _("${a} or ${b}").replace('${a}', '2').replace('${b}', '3');
            case 2: return '1';
            case 3: return '2';
            case 4: return _("${a} or ${b}").replace('${a}', '3').replace('${b}', '5');
            case 5: return '4';
            case 6: return '5';
            case 7: return _("${a} or ${b}").replace('${a}', '6').replace('${b}', '9');
        }
    };
    ObjectsManager.prototype.getObjectEffect = function (number) {
        switch (number) {
            case 1: return _("before arranging your Primate Assembly, return 1 of the cards you just drew (level 1 or 2) to the bottom of its corresponding deck on the main board. Next, draw the top card from a deck of your choice (same level as the card you removed) and add it to your Primate Assembly. This card permanently replaces the card you removed from your draw deck. The required [Energy] cost depends on the level of the card you removed: 2 [Energy] for a card of level 1, and 3 [Energy] for a card of level 2. You don't receive the rage bonus in the top right corner of the card you removed.");
            case 2: return _("swap 1 of your resources with 1 resource from the general supply. You may swap resources of any type") + '  ([Flower], [Fruit], ' + _("${a} or ${b}").replace('${a}', '[Grain]').replace('${b}', '[Energy]') + ').';
            case 3: return _("before assigning your Primate Assembly, place 1 of the cards you just draw on your discard pile and draw 1 card from your draw pile to replace it.");
            case 4: return _("when discarding the cards in your Primate Assembly, place 1 of these card back on top of your draw pile instead of discarding it.  This costs 3 [Energy] for an ape of level 1, and 5 [Energy] for an ape of level 2.");
            case 5: return _("before assigning your Primate Assembly, draw a 5th card. You have access to an extra card this round.");
            case 6: return _("immediately score 5 [Point].");
            case 7: return _("attract an ape of your choice and place it on top of your draw pile. This costs 6 [Energy] for an ape of level 1, and 9 [Energy] for an ape of level 2.");
        }
    };
    ObjectsManager.prototype.getTooltip = function (number) {
        return "\n            <div class=\"object-tooltip\">\n                <div class=\"title\">".concat(this.getObjectName(number), "</div>\n                <div class=\"phase\"><span class=\"label\">").concat(_('Phase:'), "</span> ").concat(this.getObjectPhase(number), "</div>\n                <div class=\"cost\"><span class=\"label\">").concat(_('Cost:'), "</span> ").concat(this.getObjectCost(number), " ").concat(formatTextIcons('[Energy]'), "</div>\n                <div class=\"effect\"><span class=\"label\">").concat(_('Effect:'), "</span> ").concat(formatTextIcons(this.getObjectEffect(number)), "</div>\n            </div>\n        ");
    };
    return ObjectsManager;
}(CardManager));
var TableCenter = /** @class */ (function () {
    function TableCenter(game, gamedatas) {
        var _this = this;
        this.game = game;
        this.hiddenDecks = [];
        this.cardCounters = [];
        [1, 2, 3, 4].forEach(function (monkeyType) {
            return [1, 2].forEach(function (level) {
                var type = monkeyType * 10 + level;
                var count = gamedatas.table[type];
                var block = document.createElement('div');
                block.classList.add('player-block');
                document.getElementById('center-board').insertAdjacentHTML('beforeend', "\n                    <div id=\"hidden-deck-".concat(type, "\" data-type=\"").concat(monkeyType, "\" data-level=\"").concat(level, "\">\n                        <div id=\"hidden-deck-").concat(type, "-card-counter\" class=\"card-counter\" data-level=\"").concat(level, "\"></div>\n                    </div>\n                "));
                _this.hiddenDecks[type] = new HiddenDeck(_this.game.cardsManager, document.getElementById("hidden-deck-".concat(type)), {
                    cardNumber: count,
                    width: 142,
                    height: 198,
                });
                _this.cardCounters[type] = new ebg.counter();
                _this.cardCounters[type].create("hidden-deck-".concat(type, "-card-counter"));
                _this.cardCounters[type].setValue(count);
            });
        });
        this.objectsManager = new ObjectsManager(this.game);
        this.objects = new LineStock(this.objectsManager, document.getElementById("objects"));
        this.objects.addCards(gamedatas.objects);
    }
    TableCenter.prototype.setRemaining = function (deckType, deckCount) {
        this.hiddenDecks[deckType].setCardNumber(deckCount);
        this.cardCounters[deckType].setValue(deckCount);
    };
    return TableCenter;
}());
var isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
;
var log = isDebug ? console.log.bind(window.console) : function () { };
var CardLine = /** @class */ (function (_super) {
    __extends(CardLine, _super);
    function CardLine() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CardLine.prototype.switchCards = function (switchedCards) {
        var _this = this;
        switchedCards.forEach(function (card) {
            _this.addCard(card);
            _this.cards.find(function (c) { return c.id == card.id; }).locationArg = card.locationArg;
            _this.getCardElement(card).querySelector('.front').dataset.index = '' + card.locationArg;
        });
    };
    return CardLine;
}(SlotStock));
var PlayerTable = /** @class */ (function () {
    function PlayerTable(game, player) {
        var _this = this;
        this.game = game;
        this.playerId = Number(player.id);
        this.currentPlayer = this.playerId == this.game.getPlayerId();
        var html = "\n        <div id=\"player-table-".concat(this.playerId, "\" class=\"player-table\" style=\"--player-color: #").concat(player.color, ";\">\n            <div class=\"background\" data-color=\"").concat(player.color, "\">\n                <div class=\"name-wrapper\">").concat(player.name, "</div>\n                <div id=\"player-table-").concat(this.playerId, "-action-token\" class=\"action-token\" data-color=\"").concat(player.color, "\"></div>\n            </div>\n            \n        ");
        /*if (this.currentPlayer) {
            html += `
            <div class="block-with-text hand-wrapper">
                <div class="block-label">${_('Your hand')}</div>
                <div id="player-table-${this.playerId}-hand" class="hand cards"></div>
            </div>`;
        }*/
        html += "\n        <div id=\"player-table-".concat(this.playerId, "-line\"></div>\n        </div>\n        ");
        dojo.place(html, document.getElementById('tables'));
        var handDiv = document.getElementById("player-table-".concat(this.playerId, "-line"));
        this.line = new CardLine(this.game.cardsManager, handDiv, {
            gap: '0',
            slotsIds: [0, 1, 2, 3],
            mapCardToSlot: function (card) { return card.locationArg; },
        });
        if (this.currentPlayer) {
            /*this.line.onCardClick = (card: Card) => {
                if (handDiv.classList.contains('selectable')) {
                    this.game.onHandCardClick(card);
                    this.line.getCards().forEach(c => this.line.getCardElement(c).classList.toggle('selected', c.id == card.id));
                }
            }
            */
            handDiv.querySelectorAll('[data-slot-id]').forEach(function (slot, index) {
                slot.insertAdjacentHTML('afterbegin', "\n                    <button id=\"move-left-".concat(index, "\" class=\"move left\"></button>\n                    <button id=\"move-right-").concat(index, "\" class=\"move right\"></button>\n                "));
                document.getElementById("move-left-".concat(index)).addEventListener('click', function () { return _this.game.moveCard(index, -1); });
                document.getElementById("move-right-".concat(index)).addEventListener('click', function () { return _this.game.moveCard(index, 1); });
            });
        }
        this.newRound(player.line);
        this.setSelectedToken(player.chosenToken);
    }
    PlayerTable.prototype.onDiscardCardClick = function (card) {
        var _this = this;
        this.game.confirmationDialog(_("Are you sure you want to discard this card ?"), function () { return _this.game.useRage(card.id); });
    };
    PlayerTable.prototype.newRound = function (cards) {
        var _this = this;
        this.line.addCards(cards);
        cards.forEach(function (card) {
            var div = _this.line.getCardElement(card);
            var button = document.createElement('button');
            button.id = "rage-button-".concat(card.id);
            button.classList.add('rage-button', 'bgabutton', 'bgabutton_blue');
            button.dataset.playerId = '' + _this.playerId;
            button.innerHTML = formatTextIcons('[Rage]');
            button.classList.toggle('disabled', _this.game.getPlayerRage(_this.playerId) < 4);
            div.appendChild(button);
            button.addEventListener('click', function () { return _this.onDiscardCardClick(card); });
            _this.game.setTooltip(button.id, formatTextIcons(_('Discard this card (${cost}) to gain ${gain}').replace('${cost}', '4 [Rage]')).replace('${gain}', getResourcesQuantityIcons([card.rageGain])));
        });
        this.updateVisibleMoveButtons();
    };
    PlayerTable.prototype.setMovable = function (movable) {
        document.getElementById("player-table-".concat(this.playerId)).classList.toggle('move-phase', movable);
    };
    PlayerTable.prototype.switchCards = function (switchedCards) {
        this.line.switchCards(switchedCards);
    };
    PlayerTable.prototype.getFrames = function (effect) {
        var fromClosedFrame = effect.closedFrameIndex !== null && effect.closedFrameIndex !== undefined;
        var lineCards = this.line.getCards();
        var card = lineCards.find(function (card) { return card.locationArg == effect.cardIndex; });
        var frames = [this.line.getCardElement(card).querySelector(".frame[data-row=\"".concat(effect.row, "\"][data-index=\"").concat(fromClosedFrame ? effect.closedFrameIndex : card.frames[effect.row].length - 1, "\"]"))];
        if (!fromClosedFrame) {
            var rightCard = lineCards.find(function (card) { return card.locationArg == effect.cardIndex + 1; });
            frames.push(this.line.getCardElement(rightCard).querySelector(".frame[data-row=\"".concat(effect.row, "\"][data-index=\"0\"]")));
        }
        return frames;
    };
    PlayerTable.prototype.setEffectClass = function (effect, frameClass) {
        this.getFrames(effect).forEach(function (frame) { return frame.classList.add(frameClass); });
    };
    PlayerTable.prototype.markRemainingFramesDisabled = function () {
        var line = document.getElementById("player-table-".concat(this.playerId, "-line"));
        line.querySelectorAll('.frame').forEach(function (element) {
            if (!['selectable', 'current', 'applied', 'remaining'].some(function (frameClass) { return element.classList.contains(frameClass); })) {
                element.classList.add('disabled');
            }
        });
    };
    PlayerTable.prototype.setActivableEffect = function (currentEffect, appliedEffects, remainingEffects, reactivate, possibleEffects) {
        var _this = this;
        if (currentEffect) {
            this.setEffectClass(currentEffect, 'current');
        }
        if (reactivate) {
            this.setActivableEffectToken(possibleEffects);
        }
        else {
            appliedEffects.forEach(function (effect) { return _this.setEffectClass(effect, 'applied'); });
            remainingEffects.forEach(function (effect) { return _this.setEffectClass(effect, 'remaining'); });
            this.markRemainingFramesDisabled();
        }
    };
    PlayerTable.prototype.setActivableEffectToken = function (possibleEffects, className) {
        var _this = this;
        if (className === void 0) { className = 'selectable'; }
        possibleEffects.forEach(function (effect) { return _this.setEffectClass(effect, className); });
        this.markRemainingFramesDisabled();
    };
    PlayerTable.prototype.removeActivableEffect = function () {
        var line = document.getElementById("player-table-".concat(this.playerId, "-line"));
        ['selectable', 'disabled', 'current', 'applied', 'remaining'].forEach(function (frameClass) { return line.querySelectorAll('.frame.' + frameClass).forEach(function (element) { return element.classList.remove(frameClass); }); });
    };
    PlayerTable.prototype.setSelectedToken = function (type) {
        document.getElementById("player-table-".concat(this.playerId, "-action-token")).dataset.type = type === null ? 'null' : '' + type;
    };
    PlayerTable.prototype.endRound = function () {
        this.setSelectedToken(null);
        this.line.removeAll();
    };
    PlayerTable.prototype.updateRage = function (rage) {
        document.getElementById("player-table-".concat(this.playerId)).querySelectorAll('.rage-button').forEach(function (elem) { return elem.classList.toggle('disabled', rage < 4); });
    };
    PlayerTable.prototype.discardCard = function (card, line) {
        if (line) {
            this.line.removeAll();
            this.newRound(line);
        }
        else {
            this.line.removeCard(card);
        }
        this.updateVisibleMoveButtons();
    };
    PlayerTable.prototype.updateVisibleMoveButtons = function () {
        var cards = this.line.getCards();
        var slots = document.getElementById("player-table-".concat(this.playerId)).querySelectorAll(".slot");
        slots.forEach(function (slot) {
            var slotId = +slot.dataset.slotId;
            var hasCard = cards.some(function (card) { return card.locationArg == slotId; });
            slot.querySelectorAll('button.move').forEach(function (btn) { return btn.classList.toggle('hidden', !hasCard); });
        });
    };
    return PlayerTable;
}());
var ANIMATION_MS = 500;
var ACTION_TIMER_DURATION = 5;
var LOCAL_STORAGE_ZOOM_KEY = 'AfterUs-zoom';
var POINT = 5;
var RAGE = 6;
var DIFFERENT = 7;
var PER_TAMARINS = 8;
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
    return formatTextIcons(resources.map(function (resource) { return "".concat(resource[0], " ").concat(getResourceCode(resource[1])); }).join(' '));
}
var AfterUs = /** @class */ (function () {
    function AfterUs() {
        this.playersTables = [];
        this.flowerCounters = [];
        this.fruitCounters = [];
        this.grainCounters = [];
        this.energyCounters = [];
        this.rageCounters = [];
        this.TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;
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
    AfterUs.prototype.setup = function (gamedatas) {
        log("Starting game setup");
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
        log("Ending game setup");
    };
    ///////////////////////////////////////////////////
    //// Game & client states
    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    AfterUs.prototype.onEnteringState = function (stateName, args) {
        log('Entering state: ' + stateName, args.args);
        switch (stateName) {
            case 'orderCards':
                var playerTable = this.getCurrentPlayerTable();
                playerTable.setMovable(true);
                playerTable.setActivableEffectToken(args.args.effects, 'remaining');
                break;
            case 'activateEffect':
            case 'confirmActivations':
                var activateEffectArgs = args.args;
                this.getCurrentPlayerTable().setActivableEffect(activateEffectArgs.currentEffect, activateEffectArgs.appliedEffects, activateEffectArgs.remainingEffects, activateEffectArgs.reactivate, activateEffectArgs.possibleEffects);
                break;
            case 'activateEffectToken':
                var activateEffectTokenArgs = args.args;
                this.getCurrentPlayerTable().setActivableEffectToken(activateEffectTokenArgs.possibleEffects);
                break;
        }
    };
    AfterUs.prototype.onLeavingState = function (stateName) {
        log('Leaving state: ' + stateName);
        switch (stateName) {
            case 'orderCards':
                var playerTable = this.getCurrentPlayerTable();
                playerTable.setMovable(false);
                playerTable.removeActivableEffect();
                break;
            case 'activateEffect':
            case 'activateEffectToken':
                this.getCurrentPlayerTable().removeActivableEffect();
                break;
        }
    };
    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    AfterUs.prototype.onUpdateActionButtons = function (stateName, args) {
        var _this = this;
        if (stateName === 'chooseToken') {
            if (!this.isCurrentPlayerActive() && Object.keys(this.gamedatas.players).includes('' + this.getPlayerId())) { // ignore spectators
                this.addActionButton("cancelChooseToken-button", _("I changed my mind"), function () { return _this.cancelChooseToken(); }, null, null, 'gray');
            }
        }
        switch (stateName) {
            case 'orderCards':
                this.addActionButton("validateCardOrder-button", _("Validate card order"), function () { return _this.validateCardOrder(); });
                break;
            case 'activateEffect':
                var activateEffectArgs = args;
                var currentEffect = activateEffectArgs.currentEffect;
                if (currentEffect && !activateEffectArgs.reactivate) {
                    if (currentEffect.left.length == 1) {
                        if (currentEffect.left[0][1] == DIFFERENT) {
                            currentEffect.left = [];
                            currentEffect.convertSign = false;
                        }
                        else if (currentEffect.left[0][1] == PER_TAMARINS) {
                            currentEffect.left[0][0] *= activateEffectArgs.tamarins;
                            currentEffect.left[0][1] = POINT;
                        }
                    }
                    else if (currentEffect.left.length == 0) {
                        currentEffect.convertSign = false;
                    }
                    var label = void 0;
                    if (!currentEffect.convertSign) {
                        label = _("Gain ${resources}").replace('${resources}', getResourcesQuantityIcons(currentEffect.left.concat(currentEffect.right)));
                    }
                    else {
                        label = _("Spend ${left} to gain ${right}").replace('${left}', getResourcesQuantityIcons(currentEffect.left)).replace('${right}', getResourcesQuantityIcons(currentEffect.right));
                    }
                    this.addActionButton("activateEffect-button", label, function () { return _this.activateEffect(); });
                }
                this.addActionButton("skipEffect-button", _("Skip"), function () { return _this.skipEffect(); });
                break;
            case 'confirmActivations':
                this.addActionButton("confirmActivations-button", _("Confirm"), function () { return _this.confirmActivations(); });
                break;
            case 'chooseToken':
                [1, 2, 3, 4].forEach(function (type) {
                    return _this.addActionButton("chooseToken".concat(type, "-button"), "<div class=\"action-token\" data-type=\"".concat(type, "\"></div>"), function () { return _this.chooseToken(type); });
                });
                break;
            case 'buyCard':
                var buyCardArgs_1 = args;
                if (buyCardArgs_1.canUseNeighborToken) {
                    buyCardArgs_1.neighborTokens.forEach(function (type) {
                        var label = _("Use effect of ${type}").replace('${type}', "<div class=\"action-token\" data-type=\"".concat(type, "\"></div>"));
                        _this.addActionButton("neighborEffect".concat(type, "-button"), label, function () { return _this.neighborEffect(type); }, null, null, 'gray');
                    });
                }
                if (buyCardArgs_1.canBuyCard) {
                    Object.entries(buyCardArgs_1.buyCardCost).forEach(function (buyCardCostForLevel) {
                        var level = +buyCardCostForLevel[0];
                        Object.entries(buyCardCostForLevel[1]).forEach(function (cardCost) {
                            var type = +cardCost[0];
                            var canBuy = cardCost[1];
                            var label = _("Buy level ${level} ${type} with ${cost} ${resource}")
                                .replace('${level}', "".concat(level))
                                .replace('${type}', _(buyCardArgs_1.type))
                                .replace('${cost}', "".concat(level * 3))
                                .replace('${resource}', formatTextIcons(getResourceCode(type)));
                            _this.addActionButton("buyCard".concat(level, "-").concat(type, "-button"), label, function () { return _this.buyCard(level, type); });
                            if (!canBuy) {
                                document.getElementById("buyCard".concat(level, "-").concat(type, "-button")).classList.add('disabled');
                            }
                        });
                    });
                }
                this.addActionButton("endTurn-button", _("End turn"), function () { return _this.endTurn(); }, null, null, 'red');
                break;
            case 'applyNeighborEffect':
                var applyNeighborEffectArgs_1 = args;
                Object.entries(applyNeighborEffectArgs_1.cost).forEach(function (cardCost) {
                    var type = +cardCost[0];
                    var canBuy = cardCost[1];
                    var label = _("Spend ${left} to gain ${right}")
                        .replace('${left}', getResourcesQuantityIcons([[2, type]]))
                        .replace('${right}', formatTextIcons(applyNeighborEffectArgs_1.gain));
                    _this.addActionButton("applyNeighborEffect-".concat(type, "-button"), label, function () { return _this.applyNeighborEffect(type); });
                    if (!canBuy) {
                        document.getElementById("applyNeighborEffect-".concat(type, "-button")).classList.add('disabled');
                    }
                });
                this.addActionButton("cancelNeighborEffect-button", _("Cancel"), function () { return _this.cancelNeighborEffect(); }, null, null, 'gray');
                break;
        }
    };
    ///////////////////////////////////////////////////
    //// Utility methods
    ///////////////////////////////////////////////////
    AfterUs.prototype.setTooltip = function (id, html) {
        this.addTooltipHtml(id, html, this.TOOLTIP_DELAY);
    };
    AfterUs.prototype.setTooltipToClass = function (className, html) {
        this.addTooltipHtmlToClass(className, html, this.TOOLTIP_DELAY);
    };
    AfterUs.prototype.getPlayerId = function () {
        return Number(this.player_id);
    };
    AfterUs.prototype.getPlayer = function (playerId) {
        return Object.values(this.gamedatas.players).find(function (player) { return Number(player.id) == playerId; });
    };
    AfterUs.prototype.getPlayerColor = function (playerId) {
        return this.gamedatas.players[playerId].color;
    };
    AfterUs.prototype.getPlayerRage = function (playerId) {
        return this.rageCounters[playerId].getValue();
    };
    AfterUs.prototype.getPlayerTable = function (playerId) {
        return this.playersTables.find(function (playerTable) { return playerTable.playerId === playerId; });
    };
    AfterUs.prototype.getCurrentPlayerTable = function () {
        var _this = this;
        return this.playersTables.find(function (playerTable) { return playerTable.playerId === _this.getPlayerId(); });
    };
    AfterUs.prototype.setupPreferences = function () {
        var _this = this;
        // Extract the ID and value from the UI control
        var onchange = function (e) {
            var match = e.target.id.match(/^preference_[cf]ontrol_(\d+)$/);
            if (!match) {
                return;
            }
            var prefId = +match[1];
            var prefValue = +e.target.value;
            _this.prefs[prefId].value = prefValue;
            _this.onPreferenceChange(prefId, prefValue);
        };
        // Call onPreferenceChange() when any value changes
        dojo.query(".preference_control").connect("onchange", onchange);
        // Call onPreferenceChange() now
        dojo.forEach(dojo.query("#ingame_menu_content .preference_control"), function (el) { return onchange({ target: el }); });
    };
    AfterUs.prototype.onPreferenceChange = function (prefId, prefValue) {
        switch (prefId) {
            case 201:
                this.setAutoGain(prefValue == 1);
                break;
        }
    };
    AfterUs.prototype.getOrderedPlayers = function (gamedatas) {
        var _this = this;
        var players = Object.values(gamedatas.players).sort(function (a, b) { return a.playerNo - b.playerNo; });
        var playerIndex = players.findIndex(function (player) { return Number(player.id) === Number(_this.player_id); });
        var orderedPlayers = playerIndex > 0 ? __spreadArray(__spreadArray([], players.slice(playerIndex), true), players.slice(0, playerIndex), true) : players;
        return orderedPlayers;
    };
    AfterUs.prototype.createPlayerPanels = function (gamedatas) {
        var _this = this;
        var players = Object.values(gamedatas.players);
        players.forEach(function (player, index) {
            var playerId = Number(player.id);
            var html = "\n            <div class=\"counters\">\n                <div id=\"flower-counter-wrapper-".concat(player.id, "\" class=\"counter\">\n                    <div class=\"icon flower\"></div> \n                    <span id=\"flower-counter-").concat(player.id, "\"></span>\n                </div>\n                <div id=\"fruit-counter-wrapper-").concat(player.id, "\" class=\"counter\">\n                    <div class=\"icon fruit\"></div> \n                    <span id=\"fruit-counter-").concat(player.id, "\"></span>\n                </div>\n                <div id=\"grain-counter-wrapper-").concat(player.id, "\" class=\"counter\">\n                    <div class=\"icon grain\"></div> \n                    <span id=\"grain-counter-").concat(player.id, "\"></span>\n                </div>\n                <div id=\"energy-counter-wrapper-").concat(player.id, "\" class=\"counter\">\n                    <div class=\"icon energy\"></div> \n                    <span id=\"energy-counter-").concat(player.id, "\"></span>\n                </div>\n            </div>\n            <div class=\"counters\">\n                <div id=\"rage-counter-wrapper-").concat(player.id, "\" class=\"counter\">\n                    <div class=\"icon rage\"></div> \n                    <span id=\"rage-counter-").concat(player.id, "\"></span>\n                </div>\n            </div>");
            dojo.place(html, "player_board_".concat(player.id));
            _this.addTooltipHtml("flower-counter-wrapper-".concat(player.id), _("Flowers"));
            _this.addTooltipHtml("fruit-counter-wrapper-".concat(player.id), _("Fruits"));
            _this.addTooltipHtml("grain-counter-wrapper-".concat(player.id), _("Grains"));
            _this.addTooltipHtml("energy-counter-wrapper-".concat(player.id), _("Energy"));
            _this.addTooltipHtml("rage-counter-wrapper-".concat(player.id), _("Rage"));
            var flowerCounter = new ebg.counter();
            flowerCounter.create("flower-counter-".concat(player.id));
            flowerCounter.setValue(player.flowers);
            _this.flowerCounters[playerId] = flowerCounter;
            var fruitCounter = new ebg.counter();
            fruitCounter.create("fruit-counter-".concat(player.id));
            fruitCounter.setValue(player.fruits);
            _this.fruitCounters[playerId] = fruitCounter;
            var grainCounter = new ebg.counter();
            grainCounter.create("grain-counter-".concat(player.id));
            grainCounter.setValue(player.grains);
            _this.grainCounters[playerId] = grainCounter;
            var energyCounter = new ebg.counter();
            energyCounter.create("energy-counter-".concat(player.id));
            energyCounter.setValue(player.energy);
            _this.energyCounters[playerId] = energyCounter;
            var rageCounter = new ebg.counter();
            rageCounter.create("rage-counter-".concat(player.id));
            rageCounter.setValue(player.rage);
            _this.rageCounters[playerId] = rageCounter;
            if (players.length > 2) {
                var leftPlayer = players[index == players.length - 1 ? 0 : index + 1];
                var rightPlayer = players[index == 0 ? players.length - 1 : index - 1];
                var html_1 = "\n                <div class=\"neighbors\">\n                    <div id=\"neighbor-left-".concat(player.id, "\">\n                        \uD83E\uDC44 <span style=\"color: #").concat(leftPlayer.color, ";\">").concat(leftPlayer.name, "</span>\n                    </div>\n                    <div id=\"neighbor-right-").concat(player.id, "\">\n                        <span style=\"color: #").concat(rightPlayer.color, ";\">").concat(rightPlayer.name, "</span> \uD83E\uDC46\n                    </div>\n                </div>");
                dojo.place(html_1, "player_board_".concat(player.id));
                _this.addTooltipHtml("neighbor-left-".concat(player.id), _("Left neighbor"));
                _this.addTooltipHtml("neighbor-right-".concat(player.id), _("Right neighbor"));
            }
        });
    };
    AfterUs.prototype.createPlayerTables = function (gamedatas) {
        var _this = this;
        var orderedPlayers = this.getOrderedPlayers(gamedatas);
        orderedPlayers.forEach(function (player) {
            return _this.createPlayerTable(gamedatas, Number(player.id));
        });
    };
    AfterUs.prototype.createPlayerTable = function (gamedatas, playerId) {
        var table = new PlayerTable(this, gamedatas.players[playerId]);
        this.playersTables.push(table);
    };
    AfterUs.prototype.setScore = function (playerId, score) {
        var _a;
        (_a = this.scoreCtrl[playerId]) === null || _a === void 0 ? void 0 : _a.toValue(score);
    };
    AfterUs.prototype.onFrameClicked = function (row, cardIndex, index) {
        var actionName = ['tokenSelectReactivate', 'phase2'].includes(this.gamedatas.gamestate.name) ?
            'activateEffectToken' :
            'activateEffect';
        this.takeAction(actionName, {
            row: row,
            cardIndex: cardIndex,
            index: index,
        });
    };
    AfterUs.prototype.moveCard = function (index, direction) {
        if (!this.checkAction('moveCard')) {
            return;
        }
        this.takeAction('moveCard', {
            index: index,
            direction: direction < 0,
        });
    };
    AfterUs.prototype.validateCardOrder = function () {
        if (!this.checkAction('validateCardOrder')) {
            return;
        }
        this.takeAction('validateCardOrder');
    };
    AfterUs.prototype.activateEffect = function () {
        if (!this.checkAction('activateEffect')) {
            return;
        }
        this.takeAction('activateEffect');
    };
    AfterUs.prototype.skipEffect = function () {
        if (!this.checkAction('skipEffect')) {
            return;
        }
        this.takeAction('skipEffect');
    };
    AfterUs.prototype.confirmActivations = function () {
        if (!this.checkAction('confirmActivations')) {
            return;
        }
        this.takeAction('confirmActivations');
    };
    AfterUs.prototype.chooseToken = function (type) {
        /*if(!(this as any).checkAction('chooseToken')) {
            return;
        }*/
        this.takeAction('chooseToken', {
            type: type,
        });
    };
    AfterUs.prototype.cancelChooseToken = function () {
        /*if(!(this as any).checkAction('cancelChooseToken')) {
            return;
        }*/
        this.takeAction('cancelChooseToken');
    };
    AfterUs.prototype.neighborEffect = function (type) {
        if (!this.checkAction('neighborEffect')) {
            return;
        }
        this.takeAction('neighborEffect', {
            type: type,
        });
    };
    AfterUs.prototype.applyNeighborEffect = function (type) {
        if (!this.checkAction('applyNeighborEffect')) {
            return;
        }
        this.takeAction('applyNeighborEffect', {
            type: type,
        });
    };
    AfterUs.prototype.cancelNeighborEffect = function () {
        if (!this.checkAction('cancelNeighborEffect')) {
            return;
        }
        this.takeAction('cancelNeighborEffect');
    };
    AfterUs.prototype.buyCard = function (level, type) {
        if (!this.checkAction('buyCard')) {
            return;
        }
        this.takeAction('buyCard', {
            level: level,
            type: type,
        });
    };
    AfterUs.prototype.endTurn = function () {
        if (!this.checkAction('endTurn')) {
            return;
        }
        this.takeAction('endTurn');
    };
    AfterUs.prototype.setAutoGain = function (autoGain) {
        this.takeNoLockAction('setAutoGain', {
            autoGain: autoGain
        });
    };
    AfterUs.prototype.useRage = function (id) {
        this.takeAction('useRage', {
            id: id,
        });
    };
    AfterUs.prototype.takeAction = function (action, data) {
        data = data || {};
        data.lock = true;
        this.ajaxcall("/afterus/afterus/".concat(action, ".html"), data, this, function () { });
    };
    AfterUs.prototype.takeNoLockAction = function (action, data) {
        data = data || {};
        this.ajaxcall("/afterus/afterus/".concat(action, ".html"), data, this, function () { });
    };
    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications
    /*
        setupNotifications:

        In this method, you associate each of your game notifications with your local method to handle it.

        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your pylos.game.php file.

    */
    AfterUs.prototype.setupNotifications = function () {
        //log( 'notifications subscriptions setup' );
        var _this = this;
        var notifs = [
            ['newRound', ANIMATION_MS],
            ['switchedCards', 1],
            ['activatedEffect', 1],
            ['selectedToken', 1],
            ['revealTokens', ANIMATION_MS],
            ['buyCard', ANIMATION_MS],
            ['endRound', ANIMATION_MS],
            ['discardedCard', ANIMATION_MS],
        ];
        notifs.forEach(function (notif) {
            dojo.subscribe(notif[0], _this, "notif_".concat(notif[0]));
            _this.notifqueue.setSynchronous(notif[0], notif[1]);
        });
    };
    AfterUs.prototype.notif_newRound = function (notif) {
        this.getPlayerTable(notif.args.playerId).newRound(notif.args.cards);
    };
    AfterUs.prototype.notif_switchedCards = function (notif) {
        this.getPlayerTable(notif.args.playerId).switchCards([notif.args.card, notif.args.otherCard]);
    };
    AfterUs.prototype.notif_activatedEffect = function (notif) {
        var playerId = notif.args.playerId;
        var player = notif.args.player;
        this.flowerCounters[playerId].toValue(player.flowers);
        this.fruitCounters[playerId].toValue(player.fruits);
        this.grainCounters[playerId].toValue(player.grains);
        this.energyCounters[playerId].toValue(player.energy);
        this.rageCounters[playerId].toValue(player.rage);
        this.setScore(playerId, +player.score);
        this.getPlayerTable(playerId).updateRage(player.rage);
    };
    AfterUs.prototype.notif_selectedToken = function (notif) {
        var currentPlayer = this.getPlayerId() == notif.args.playerId;
        if (notif.args.token || !currentPlayer) {
            this.getPlayerTable(notif.args.playerId).setSelectedToken(notif.args.cancel ? null : notif.args.token);
        }
    };
    AfterUs.prototype.notif_revealTokens = function (notif) {
        var _this = this;
        Object.entries(notif.args.tokens).forEach(function (val) { return _this.getPlayerTable(+val[0]).setSelectedToken(val[1]); });
    };
    AfterUs.prototype.notif_buyCard = function (notif) {
        this.tableCenter.setRemaining(notif.args.deckType, notif.args.deckCount);
        this.notif_activatedEffect(notif);
    };
    AfterUs.prototype.notif_endRound = function (notif) {
        this.getPlayerTable(notif.args.playerId).endRound();
    };
    AfterUs.prototype.notif_discardedCard = function (notif) {
        this.getPlayerTable(notif.args.playerId).discardCard(notif.args.card, notif.args.line);
        this.notif_activatedEffect(notif);
    };
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
    AfterUs.prototype.format_string_recursive = function (log, args) {
        var _a, _b;
        try {
            if (log && args && !args.processed) {
                /*['scoredCard', 'cardOver', 'cardUnder', 'addedCard'].forEach(attr => {
                    if ((typeof args[attr] !== 'string' || args[attr][0] !== '<') && args[attr + 'Obj']) {
                        const obj: Card = args[attr + 'Obj'];
                        args[attr] = `<strong data-color="${obj.color}">${obj.number}</strong>`;
                        if (obj.points != 0) {
                            args[attr] += ` <div class="points-circle" data-negative="${(obj.points < 0).toString()}">${obj.points > 0 ? '+' : ''}${obj.points}</div>`;
                        }
                    }
                });*/
                for (var property in args) {
                    if (['level', 'type'].includes(property) && args[property][0] != '<') {
                        args[property] = "<strong>".concat(_(args[property]), "</strong>");
                    }
                }
                for (var property in args) {
                    if (((_b = (_a = args[property]) === null || _a === void 0 ? void 0 : _a.indexOf) === null || _b === void 0 ? void 0 : _b.call(_a, ']')) > 0) {
                        args[property] = formatTextIcons(_(args[property]));
                    }
                }
                log = formatTextIcons(_(log));
            }
        }
        catch (e) {
            console.error(log, args, "Exception thrown", e.stack);
        }
        return this.inherited(arguments);
    };
    return AfterUs;
}());
define([
    "dojo", "dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    "ebg/stock"
], function (dojo, declare) {
    return declare("bgagame.afterus", ebg.core.gamegui, new AfterUs());
});
