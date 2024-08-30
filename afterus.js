var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var DEFAULT_ZOOM_LEVELS = [0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
function throttle(callback, delay) {
    var last;
    var timer;
    return function () {
        var context = this;
        var now = +new Date();
        var args = arguments;
        if (last && now < last + delay) {
            clearTimeout(timer);
            timer = setTimeout(function () {
                last = now;
                callback.apply(context, args);
            }, delay);
        }
        else {
            last = now;
            callback.apply(context, args);
        }
    };
}
var advThrottle = function (func, delay, options) {
    if (options === void 0) { options = { leading: true, trailing: false }; }
    var timer = null, lastRan = null, trailingArgs = null;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (timer) { //called within cooldown period
            lastRan = this; //update context
            trailingArgs = args; //save for later
            return;
        }
        if (options.leading) { // if leading
            func.call.apply(// if leading
            func, __spreadArray([this], args, false)); //call the 1st instance
        }
        else { // else it's trailing
            lastRan = this; //update context
            trailingArgs = args; //save for later
        }
        var coolDownPeriodComplete = function () {
            if (options.trailing && trailingArgs) { // if trailing and the trailing args exist
                func.call.apply(// if trailing and the trailing args exist
                func, __spreadArray([lastRan], trailingArgs, false)); //invoke the instance with stored context "lastRan"
                lastRan = null; //reset the status of lastRan
                trailingArgs = null; //reset trailing arguments
                timer = setTimeout(coolDownPeriodComplete, delay); //clear the timout
            }
            else {
                timer = null; // reset timer
            }
        };
        timer = setTimeout(coolDownPeriodComplete, delay);
    };
};
var ZoomManager = /** @class */ (function () {
    /**
     * Place the settings.element in a zoom wrapper and init zoomControls.
     *
     * @param settings: a `ZoomManagerSettings` object
     */
    function ZoomManager(settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f;
        this.settings = settings;
        if (!settings.element) {
            throw new DOMException('You need to set the element to wrap in the zoom element');
        }
        this._zoomLevels = (_a = settings.zoomLevels) !== null && _a !== void 0 ? _a : DEFAULT_ZOOM_LEVELS;
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
            settings.element.addEventListener('transitionend', advThrottle(function () { return _this.zoomOrDimensionChanged(); }, this.throttleTime, { leading: true, trailing: true, }));
        }
        if ((_d = (_c = settings.zoomControls) === null || _c === void 0 ? void 0 : _c.visible) !== null && _d !== void 0 ? _d : true) {
            this.initZoomControls(settings);
        }
        if (this._zoom !== 1) {
            this.setZoom(this._zoom);
        }
        this.throttleTime = (_e = settings.throttleTime) !== null && _e !== void 0 ? _e : 100;
        window.addEventListener('resize', advThrottle(function () {
            var _a;
            _this.zoomOrDimensionChanged();
            if ((_a = _this.settings.autoZoom) === null || _a === void 0 ? void 0 : _a.expectedWidth) {
                _this.setAutoZoom();
            }
        }, this.throttleTime, { leading: true, trailing: true, }));
        if (window.ResizeObserver) {
            new ResizeObserver(advThrottle(function () { return _this.zoomOrDimensionChanged(); }, this.throttleTime, { leading: true, trailing: true, })).observe(settings.element);
        }
        if ((_f = this.settings.autoZoom) === null || _f === void 0 ? void 0 : _f.expectedWidth) {
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
    Object.defineProperty(ZoomManager.prototype, "zoomLevels", {
        /**
         * Returns the zoom levels
         */
        get: function () {
            return this._zoomLevels;
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
        while (newZoom > this._zoomLevels[0] && newZoom > ((_c = (_b = this.settings.autoZoom) === null || _b === void 0 ? void 0 : _b.minZoomLevel) !== null && _c !== void 0 ? _c : 0) && zoomWrapperWidth / newZoom < expectedWidth) {
            newZoom = this._zoomLevels[this._zoomLevels.indexOf(newZoom) - 1];
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
     * Sets the available zoomLevels and new zoom to the provided values.
     * @param zoomLevels the new array of zoomLevels that can be used.
     * @param newZoom if provided the zoom will be set to this value, if not the last element of the zoomLevels array will be set as the new zoom
     */
    ZoomManager.prototype.setZoomLevels = function (zoomLevels, newZoom) {
        if (!zoomLevels || zoomLevels.length <= 0) {
            return;
        }
        this._zoomLevels = zoomLevels;
        var zoomIndex = newZoom && zoomLevels.includes(newZoom) ? this._zoomLevels.indexOf(newZoom) : this._zoomLevels.length - 1;
        this.setZoom(this._zoomLevels[zoomIndex]);
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
        var newIndex = this._zoomLevels.indexOf(this._zoom);
        (_a = this.zoomInButton) === null || _a === void 0 ? void 0 : _a.classList.toggle('disabled', newIndex === this._zoomLevels.length - 1);
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
     * Unsafe method as this is not protected by throttle. Surround with  `advThrottle(() => this.zoomOrDimensionChanged(), this.throttleTime, { leading: true, trailing: true, })` to avoid spamming recomputation.
     */
    ZoomManager.prototype.zoomOrDimensionChanged = function () {
        var _a, _b;
        this.settings.element.style.width = "".concat(this.wrapper.offsetWidth / this._zoom, "px");
        this.wrapper.style.height = "".concat(this.settings.element.offsetHeight * this._zoom, "px");
        (_b = (_a = this.settings).onDimensionsChange) === null || _b === void 0 ? void 0 : _b.call(_a, this._zoom);
    };
    /**
     * Simulates a click on the Zoom-in button.
     */
    ZoomManager.prototype.zoomIn = function () {
        if (this._zoom === this._zoomLevels[this._zoomLevels.length - 1]) {
            return;
        }
        var newIndex = this._zoomLevels.indexOf(this._zoom) + 1;
        this.setZoom(newIndex === -1 ? 1 : this._zoomLevels[newIndex]);
    };
    /**
     * Simulates a click on the Zoom-out button.
     */
    ZoomManager.prototype.zoomOut = function () {
        if (this._zoom === this._zoomLevels[0]) {
            return;
        }
        var newIndex = this._zoomLevels.indexOf(this._zoom) - 1;
        this.setZoom(newIndex === -1 ? 1 : this._zoomLevels[newIndex]);
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
 * Jump to entry.
 */
var JumpToEntry = /** @class */ (function () {
    function JumpToEntry(
    /**
     * Label shown on the entry. For players, it's player name.
     */
    label, 
    /**
     * HTML Element id, to scroll into view when clicked.
     */
    targetId, 
    /**
     * Any element that is useful to customize the link.
     * Basic ones are 'color' and 'colorback'.
     */
    data) {
        if (data === void 0) { data = {}; }
        this.label = label;
        this.targetId = targetId;
        this.data = data;
    }
    return JumpToEntry;
}());
var JumpToManager = /** @class */ (function () {
    function JumpToManager(game, settings) {
        var _a, _b, _c;
        this.game = game;
        this.settings = settings;
        var entries = __spreadArray(__spreadArray([], ((_a = settings === null || settings === void 0 ? void 0 : settings.topEntries) !== null && _a !== void 0 ? _a : []), true), ((_b = settings === null || settings === void 0 ? void 0 : settings.playersEntries) !== null && _b !== void 0 ? _b : this.createEntries(Object.values(game.gamedatas.players))), true);
        this.createPlayerJumps(entries);
        var folded = (_c = settings === null || settings === void 0 ? void 0 : settings.defaultFolded) !== null && _c !== void 0 ? _c : false;
        if (settings === null || settings === void 0 ? void 0 : settings.localStorageFoldedKey) {
            var localStorageValue = localStorage.getItem(settings.localStorageFoldedKey);
            if (localStorageValue) {
                folded = localStorageValue == 'true';
            }
        }
        document.getElementById('bga-jump-to_controls').classList.toggle('folded', folded);
    }
    JumpToManager.prototype.createPlayerJumps = function (entries) {
        var _this = this;
        var _a, _b, _c, _d;
        document.getElementById("game_play_area_wrap").insertAdjacentHTML('afterend', "\n        <div id=\"bga-jump-to_controls\">        \n            <div id=\"bga-jump-to_toggle\" class=\"bga-jump-to_link ".concat((_b = (_a = this.settings) === null || _a === void 0 ? void 0 : _a.entryClasses) !== null && _b !== void 0 ? _b : '', " toggle\" style=\"--color: ").concat((_d = (_c = this.settings) === null || _c === void 0 ? void 0 : _c.toggleColor) !== null && _d !== void 0 ? _d : 'black', "\">\n                \u21D4\n            </div>\n        </div>"));
        document.getElementById("bga-jump-to_toggle").addEventListener('click', function () { return _this.jumpToggle(); });
        entries.forEach(function (entry) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            var html = "<div id=\"bga-jump-to_".concat(entry.targetId, "\" class=\"bga-jump-to_link ").concat((_b = (_a = _this.settings) === null || _a === void 0 ? void 0 : _a.entryClasses) !== null && _b !== void 0 ? _b : '', "\">");
            if ((_d = (_c = _this.settings) === null || _c === void 0 ? void 0 : _c.showEye) !== null && _d !== void 0 ? _d : true) {
                html += "<div class=\"eye\"></div>";
            }
            if (((_f = (_e = _this.settings) === null || _e === void 0 ? void 0 : _e.showAvatar) !== null && _f !== void 0 ? _f : true) && ((_g = entry.data) === null || _g === void 0 ? void 0 : _g.id)) {
                var cssUrl = (_h = entry.data) === null || _h === void 0 ? void 0 : _h.avatarUrl;
                if (!cssUrl) {
                    var img = document.getElementById("avatar_".concat(entry.data.id));
                    var url = img === null || img === void 0 ? void 0 : img.src;
                    // ? Custom image : Bga Image
                    //url = url.replace('_32', url.indexOf('data/avatar/defaults') > 0 ? '' : '_184');
                    if (url) {
                        cssUrl = "url('".concat(url, "')");
                    }
                }
                if (cssUrl) {
                    html += "<div class=\"bga-jump-to_avatar\" style=\"--avatar-url: ".concat(cssUrl, ";\"></div>");
                }
            }
            html += "\n                <span class=\"bga-jump-to_label\">".concat(entry.label, "</span>\n            </div>");
            //
            document.getElementById("bga-jump-to_controls").insertAdjacentHTML('beforeend', html);
            var entryDiv = document.getElementById("bga-jump-to_".concat(entry.targetId));
            Object.getOwnPropertyNames((_j = entry.data) !== null && _j !== void 0 ? _j : []).forEach(function (key) {
                entryDiv.dataset[key] = entry.data[key];
                entryDiv.style.setProperty("--".concat(key), entry.data[key]);
            });
            entryDiv.addEventListener('click', function () { return _this.jumpTo(entry.targetId); });
        });
        var jumpDiv = document.getElementById("bga-jump-to_controls");
        jumpDiv.style.marginTop = "-".concat(Math.round(jumpDiv.getBoundingClientRect().height / 2), "px");
    };
    JumpToManager.prototype.jumpToggle = function () {
        var _a;
        var jumpControls = document.getElementById('bga-jump-to_controls');
        jumpControls.classList.toggle('folded');
        if ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.localStorageFoldedKey) {
            localStorage.setItem(this.settings.localStorageFoldedKey, jumpControls.classList.contains('folded').toString());
        }
    };
    JumpToManager.prototype.jumpTo = function (targetId) {
        document.getElementById(targetId).scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    };
    JumpToManager.prototype.getOrderedPlayers = function (unorderedPlayers) {
        var _this = this;
        var players = unorderedPlayers.sort(function (a, b) { return Number(a.playerNo) - Number(b.playerNo); });
        var playerIndex = players.findIndex(function (player) { return Number(player.id) === Number(_this.game.player_id); });
        var orderedPlayers = playerIndex > 0 ? __spreadArray(__spreadArray([], players.slice(playerIndex), true), players.slice(0, playerIndex), true) : players;
        return orderedPlayers;
    };
    JumpToManager.prototype.createEntries = function (players) {
        var orderedPlayers = this.getOrderedPlayers(players);
        return orderedPlayers.map(function (player) { return new JumpToEntry(player.name, "player-table-".concat(player.id), {
            'color': '#' + player.color,
            'colorback': player.color_back ? '#' + player.color_back : null,
            'id': player.id,
        }); });
    };
    return JumpToManager;
}());
var BgaAnimation = /** @class */ (function () {
    function BgaAnimation(animationFunction, settings) {
        this.animationFunction = animationFunction;
        this.settings = settings;
        this.played = null;
        this.result = null;
        this.playWhenNoAnimation = false;
    }
    return BgaAnimation;
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
 * Just use playSequence from animationManager
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function attachWithAnimation(animationManager, animation) {
    var _a;
    var settings = animation.settings;
    var element = settings.animation.settings.element;
    var fromRect = element.getBoundingClientRect();
    settings.animation.settings.fromRect = fromRect;
    settings.attachElement.appendChild(element);
    (_a = settings.afterAttach) === null || _a === void 0 ? void 0 : _a.call(settings, element, settings.attachElement);
    return animationManager.play(settings.animation);
}
var BgaAttachWithAnimation = /** @class */ (function (_super) {
    __extends(BgaAttachWithAnimation, _super);
    function BgaAttachWithAnimation(settings) {
        var _this = _super.call(this, attachWithAnimation, settings) || this;
        _this.playWhenNoAnimation = true;
        return _this;
    }
    return BgaAttachWithAnimation;
}(BgaAnimation));
/**
 * Just use playSequence from animationManager
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function cumulatedAnimations(animationManager, animation) {
    return animationManager.playSequence(animation.settings.animations);
}
var BgaCumulatedAnimation = /** @class */ (function (_super) {
    __extends(BgaCumulatedAnimation, _super);
    function BgaCumulatedAnimation(settings) {
        var _this = _super.call(this, cumulatedAnimations, settings) || this;
        _this.playWhenNoAnimation = true;
        return _this;
    }
    return BgaCumulatedAnimation;
}(BgaAnimation));
/**
 * Linear slide of the element from origin to destination.
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function slideAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a, _b, _c, _d;
        var settings = animation.settings;
        var element = settings.element;
        var _e = getDeltaCoordinates(element, settings), x = _e.x, y = _e.y;
        var duration = (_a = settings === null || settings === void 0 ? void 0 : settings.duration) !== null && _a !== void 0 ? _a : 500;
        var originalZIndex = element.style.zIndex;
        var originalTransition = element.style.transition;
        element.style.zIndex = "".concat((_b = settings === null || settings === void 0 ? void 0 : settings.zIndex) !== null && _b !== void 0 ? _b : 10);
        element.style.transition = null;
        element.offsetHeight;
        element.style.transform = "translate(".concat(-x, "px, ").concat(-y, "px) rotate(").concat((_c = settings === null || settings === void 0 ? void 0 : settings.rotationDelta) !== null && _c !== void 0 ? _c : 0, "deg)");
        var timeoutId = null;
        var cleanOnTransitionEnd = function () {
            element.style.zIndex = originalZIndex;
            element.style.transition = originalTransition;
            success();
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
        element.style.transform = (_d = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _d !== void 0 ? _d : null;
        // safety in case transitionend and transitioncancel are not called
        timeoutId = setTimeout(cleanOnTransitionEnd, duration + 100);
    });
    return promise;
}
var BgaSlideAnimation = /** @class */ (function (_super) {
    __extends(BgaSlideAnimation, _super);
    function BgaSlideAnimation(settings) {
        return _super.call(this, slideAnimation, settings) || this;
    }
    return BgaSlideAnimation;
}(BgaAnimation));
/**
 * Linear slide of the element from origin to destination.
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function slideToAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a, _b, _c, _d;
        var settings = animation.settings;
        var element = settings.element;
        var _e = getDeltaCoordinates(element, settings), x = _e.x, y = _e.y;
        var duration = (_a = settings === null || settings === void 0 ? void 0 : settings.duration) !== null && _a !== void 0 ? _a : 500;
        var originalZIndex = element.style.zIndex;
        var originalTransition = element.style.transition;
        element.style.zIndex = "".concat((_b = settings === null || settings === void 0 ? void 0 : settings.zIndex) !== null && _b !== void 0 ? _b : 10);
        var timeoutId = null;
        var cleanOnTransitionEnd = function () {
            element.style.zIndex = originalZIndex;
            element.style.transition = originalTransition;
            success();
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
        element.addEventListener('transitioncancel', cleanOnTransitionEnd);
        element.addEventListener('transitionend', cleanOnTransitionEnd);
        document.addEventListener('visibilitychange', cleanOnTransitionCancel);
        element.offsetHeight;
        element.style.transition = "transform ".concat(duration, "ms linear");
        element.offsetHeight;
        element.style.transform = "translate(".concat(-x, "px, ").concat(-y, "px) rotate(").concat((_c = settings === null || settings === void 0 ? void 0 : settings.rotationDelta) !== null && _c !== void 0 ? _c : 0, "deg) scale(").concat((_d = settings.scale) !== null && _d !== void 0 ? _d : 1, ")");
        // safety in case transitionend and transitioncancel are not called
        timeoutId = setTimeout(cleanOnTransitionEnd, duration + 100);
    });
    return promise;
}
var BgaSlideToAnimation = /** @class */ (function (_super) {
    __extends(BgaSlideToAnimation, _super);
    function BgaSlideToAnimation(settings) {
        return _super.call(this, slideToAnimation, settings) || this;
    }
    return BgaSlideToAnimation;
}(BgaAnimation));
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
function logAnimation(animationManager, animation) {
    var settings = animation.settings;
    var element = settings.element;
    if (element) {
        console.log(animation, settings, element, element.getBoundingClientRect(), element.style.transform);
    }
    else {
        console.log(animation, settings);
    }
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
        if (!game) {
            throw new Error('You must set your game as the first parameter of AnimationManager');
        }
    }
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
    /**
     * Returns if the animations are active. Animation aren't active when the window is not visible (`document.visibilityState === 'hidden'`), or `game.instantaneousMode` is true.
     *
     * @returns if the animations are active.
     */
    AnimationManager.prototype.animationsActive = function () {
        return document.visibilityState !== 'hidden' && !this.game.instantaneousMode;
    };
    /**
     * Plays an animation if the animations are active. Animation aren't active when the window is not visible (`document.visibilityState === 'hidden'`), or `game.instantaneousMode` is true.
     *
     * @param animation the animation to play
     * @returns the animation promise.
     */
    AnimationManager.prototype.play = function (animation) {
        return __awaiter(this, void 0, void 0, function () {
            var settings, _a;
            var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            return __generator(this, function (_o) {
                switch (_o.label) {
                    case 0:
                        animation.played = animation.playWhenNoAnimation || this.animationsActive();
                        if (!animation.played) return [3 /*break*/, 2];
                        settings = animation.settings;
                        (_b = settings.animationStart) === null || _b === void 0 ? void 0 : _b.call(settings, animation);
                        (_c = settings.element) === null || _c === void 0 ? void 0 : _c.classList.add((_d = settings.animationClass) !== null && _d !== void 0 ? _d : 'bga-animations_animated');
                        animation.settings = __assign(__assign({}, animation.settings), { duration: (_f = (_e = this.settings) === null || _e === void 0 ? void 0 : _e.duration) !== null && _f !== void 0 ? _f : 500, scale: (_h = (_g = this.zoomManager) === null || _g === void 0 ? void 0 : _g.zoom) !== null && _h !== void 0 ? _h : undefined });
                        _a = animation;
                        return [4 /*yield*/, animation.animationFunction(this, animation)];
                    case 1:
                        _a.result = _o.sent();
                        (_k = (_j = animation.settings).animationEnd) === null || _k === void 0 ? void 0 : _k.call(_j, animation);
                        (_l = settings.element) === null || _l === void 0 ? void 0 : _l.classList.remove((_m = settings.animationClass) !== null && _m !== void 0 ? _m : 'bga-animations_animated');
                        return [3 /*break*/, 3];
                    case 2: return [2 /*return*/, Promise.resolve(animation)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Plays multiple animations in parallel.
     *
     * @param animations the animations to play
     * @returns a promise for all animations.
     */
    AnimationManager.prototype.playParallel = function (animations) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, Promise.all(animations.map(function (animation) { return _this.play(animation); }))];
            });
        });
    };
    /**
     * Plays multiple animations in sequence (the second when the first ends, ...).
     *
     * @param animations the animations to play
     * @returns a promise for all animations.
     */
    AnimationManager.prototype.playSequence = function (animations) {
        return __awaiter(this, void 0, void 0, function () {
            var result, others;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!animations.length) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.play(animations[0])];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, this.playSequence(animations.slice(1))];
                    case 2:
                        others = _a.sent();
                        return [2 /*return*/, __spreadArray([result], others, true)];
                    case 3: return [2 /*return*/, Promise.resolve([])];
                }
            });
        });
    };
    /**
     * Plays multiple animations with a delay between each animation start.
     *
     * @param animations the animations to play
     * @param delay the delay (in ms)
     * @returns a promise for all animations.
     */
    AnimationManager.prototype.playWithDelay = function (animations, delay) {
        return __awaiter(this, void 0, void 0, function () {
            var promise;
            var _this = this;
            return __generator(this, function (_a) {
                promise = new Promise(function (success) {
                    var promises = [];
                    var _loop_1 = function (i) {
                        setTimeout(function () {
                            promises.push(_this.play(animations[i]));
                            if (i == animations.length - 1) {
                                Promise.all(promises).then(function (result) {
                                    success(result);
                                });
                            }
                        }, i * delay);
                    };
                    for (var i = 0; i < animations.length; i++) {
                        _loop_1(i);
                    }
                });
                return [2 /*return*/, promise];
            });
        });
    };
    /**
     * Attach an element to a parent, then play animation from element's origin to its new position.
     *
     * @param animation the animation function
     * @param attachElement the destination parent
     * @returns a promise when animation ends
     */
    AnimationManager.prototype.attachWithAnimation = function (animation, attachElement) {
        var attachWithAnimation = new BgaAttachWithAnimation({
            animation: animation,
            attachElement: attachElement
        });
        return this.play(attachWithAnimation);
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
        this.settings = settings;
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
     * @returns the selected cards
     */
    CardStock.prototype.isSelected = function (card) {
        var _this = this;
        return this.selectedCards.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
    };
    /**
     * @param card a card
     * @returns if the card is present in the stock
     */
    CardStock.prototype.contains = function (card) {
        var _this = this;
        return this.cards.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
    };
    /**
     * @param card a card in the stock
     * @returns the HTML element generated for the card
     */
    CardStock.prototype.getCardElement = function (card) {
        return this.manager.getCardElement(card);
    };
    /**
     * Checks if the card can be added. By default, only if it isn't already present in the stock.
     *
     * @param card the card to add
     * @param settings the addCard settings
     * @returns if the card can be added
     */
    CardStock.prototype.canAddCard = function (card, settings) {
        return !this.contains(card);
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
        var _this = this;
        var _a, _b, _c;
        if (!this.canAddCard(card, settings)) {
            return Promise.resolve(false);
        }
        var promise;
        // we check if card is in a stock
        var originStock = this.manager.getCardStock(card);
        var index = this.getNewCardIndex(card);
        var settingsWithIndex = __assign({ index: index }, (settings !== null && settings !== void 0 ? settings : {}));
        var updateInformations = (_a = settingsWithIndex.updateInformations) !== null && _a !== void 0 ? _a : true;
        if (originStock === null || originStock === void 0 ? void 0 : originStock.contains(card)) {
            var element = this.getCardElement(card);
            promise = this.moveFromOtherStock(card, element, __assign(__assign({}, animation), { fromStock: originStock }), settingsWithIndex);
            if (!updateInformations) {
                element.dataset.side = ((_b = settingsWithIndex === null || settingsWithIndex === void 0 ? void 0 : settingsWithIndex.visible) !== null && _b !== void 0 ? _b : this.manager.isCardVisible(card)) ? 'front' : 'back';
            }
        }
        else if ((animation === null || animation === void 0 ? void 0 : animation.fromStock) && animation.fromStock.contains(card)) {
            var element = this.getCardElement(card);
            promise = this.moveFromOtherStock(card, element, animation, settingsWithIndex);
        }
        else {
            var element = this.manager.createCardElement(card, ((_c = settingsWithIndex === null || settingsWithIndex === void 0 ? void 0 : settingsWithIndex.visible) !== null && _c !== void 0 ? _c : this.manager.isCardVisible(card)));
            promise = this.moveFromElement(card, element, animation, settingsWithIndex);
        }
        if (settingsWithIndex.index !== null && settingsWithIndex.index !== undefined) {
            this.cards.splice(index, 0, card);
        }
        else {
            this.cards.push(card);
        }
        if (updateInformations) { // after splice/push
            this.manager.updateCardInformations(card);
        }
        if (!promise) {
            console.warn("CardStock.addCard didn't return a Promise");
            promise = Promise.resolve(false);
        }
        if (this.selectionMode !== 'none') {
            // make selectable only at the end of the animation
            promise.then(function () { var _a; return _this.setSelectableCard(card, (_a = settingsWithIndex.selectable) !== null && _a !== void 0 ? _a : true); });
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
        var element = animation.fromStock.contains(card) ? this.manager.getCardElement(card) : animation.fromStock.element;
        var fromRect = element.getBoundingClientRect();
        this.addCardElementToParent(cardElement, settings);
        this.removeSelectionClassesFromElement(cardElement);
        promise = this.animationFromElement(cardElement, fromRect, {
            originalSide: animation.originalSide,
            rotationDelta: animation.rotationDelta,
            animation: animation.animation,
        });
        // in the case the card was move inside the same stock we don't remove it
        if (animation.fromStock && animation.fromStock != this) {
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
                promise = this.animationFromElement(cardElement, animation.fromStock.element.getBoundingClientRect(), {
                    originalSide: animation.originalSide,
                    rotationDelta: animation.rotationDelta,
                    animation: animation.animation,
                });
                animation.fromStock.removeCard(card);
            }
            else if (animation.fromElement) {
                promise = this.animationFromElement(cardElement, animation.fromElement.getBoundingClientRect(), {
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
    CardStock.prototype.addCards = function (cards_1, animation_1, settings_1) {
        return __awaiter(this, arguments, void 0, function (cards, animation, settings, shift) {
            var promises, result, others, _loop_2, i, results;
            var _this = this;
            if (shift === void 0) { shift = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.manager.animationsActive()) {
                            shift = false;
                        }
                        promises = [];
                        if (!(shift === true)) return [3 /*break*/, 4];
                        if (!cards.length) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.addCard(cards[0], animation, settings)];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, this.addCards(cards.slice(1), animation, settings, shift)];
                    case 2:
                        others = _a.sent();
                        return [2 /*return*/, result || others];
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        if (typeof shift === 'number') {
                            _loop_2 = function (i) {
                                setTimeout(function () { return promises.push(_this.addCard(cards[i], animation, settings)); }, i * shift);
                            };
                            for (i = 0; i < cards.length; i++) {
                                _loop_2(i);
                            }
                        }
                        else {
                            promises = cards.map(function (card) { return _this.addCard(card, animation, settings); });
                        }
                        _a.label = 5;
                    case 5: return [4 /*yield*/, Promise.all(promises)];
                    case 6:
                        results = _a.sent();
                        return [2 /*return*/, results.some(function (result) { return result; })];
                }
            });
        });
    };
    /**
     * Remove a card from the stock.
     *
     * @param card the card to remove
     * @param settings a `RemoveCardSettings` object
     */
    CardStock.prototype.removeCard = function (card, settings) {
        if (this.contains(card) && this.element.contains(this.getCardElement(card))) {
            this.manager.removeCard(card, settings);
        }
        this.cardRemoved(card, settings);
    };
    /**
     * Notify the stock that a card is removed.
     *
     * @param card the card to remove
     * @param settings a `RemoveCardSettings` object
     */
    CardStock.prototype.cardRemoved = function (card, settings) {
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
     * @param settings a `RemoveCardSettings` object
     */
    CardStock.prototype.removeCards = function (cards, settings) {
        var _this = this;
        cards.forEach(function (card) { return _this.removeCard(card, settings); });
    };
    /**
     * Remove all cards from the stock.
     * @param settings a `RemoveCardSettings` object
     */
    CardStock.prototype.removeAll = function (settings) {
        var _this = this;
        var cards = this.getCards(); // use a copy of the array as we iterate and modify it at the same time
        cards.forEach(function (card) { return _this.removeCard(card, settings); });
    };
    /**
     * Set if the stock is selectable, and if yes if it can be multiple.
     * If set to 'none', it will unselect all selected cards.
     *
     * @param selectionMode the selection mode
     * @param selectableCards the selectable cards (all if unset). Calls `setSelectableCards` method
     */
    CardStock.prototype.setSelectionMode = function (selectionMode, selectableCards) {
        var _this = this;
        if (selectionMode !== this.selectionMode) {
            this.unselectAll(true);
        }
        this.cards.forEach(function (card) { return _this.setSelectableCard(card, selectionMode != 'none'); });
        this.element.classList.toggle('bga-cards_selectable-stock', selectionMode != 'none');
        this.selectionMode = selectionMode;
        if (selectionMode === 'none') {
            this.getCards().forEach(function (card) { return _this.removeSelectionClasses(card); });
        }
        else {
            this.setSelectableCards(selectableCards !== null && selectableCards !== void 0 ? selectableCards : this.getCards());
        }
    };
    CardStock.prototype.setSelectableCard = function (card, selectable) {
        if (this.selectionMode === 'none') {
            return;
        }
        var element = this.getCardElement(card);
        var selectableCardsClass = this.getSelectableCardClass();
        var unselectableCardsClass = this.getUnselectableCardClass();
        if (selectableCardsClass) {
            element.classList.toggle(selectableCardsClass, selectable);
        }
        if (unselectableCardsClass) {
            element.classList.toggle(unselectableCardsClass, !selectable);
        }
        if (!selectable && this.isSelected(card)) {
            this.unselectCard(card, true);
        }
    };
    /**
     * Set the selectable class for each card.
     *
     * @param selectableCards the selectable cards. If unset, all cards are marked selectable. Default unset.
     */
    CardStock.prototype.setSelectableCards = function (selectableCards) {
        var _this = this;
        if (this.selectionMode === 'none') {
            return;
        }
        var selectableCardsIds = (selectableCards !== null && selectableCards !== void 0 ? selectableCards : this.getCards()).map(function (card) { return _this.manager.getId(card); });
        this.cards.forEach(function (card) {
            return _this.setSelectableCard(card, selectableCardsIds.includes(_this.manager.getId(card)));
        });
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
        var element = this.getCardElement(card);
        var selectableCardsClass = this.getSelectableCardClass();
        if (!element.classList.contains(selectableCardsClass)) {
            return;
        }
        if (this.selectionMode === 'single') {
            this.cards.filter(function (c) { return _this.manager.getId(c) != _this.manager.getId(card); }).forEach(function (c) { return _this.unselectCard(c, true); });
        }
        var selectedCardsClass = this.getSelectedCardClass();
        element.classList.add(selectedCardsClass);
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
        var selectedCardsClass = this.getSelectedCardClass();
        element.classList.remove(selectedCardsClass);
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
    CardStock.prototype.animationFromElement = function (element, fromRect, settings) {
        return __awaiter(this, void 0, void 0, function () {
            var side, cardSides_1, animation, result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        side = element.dataset.side;
                        if (settings.originalSide && settings.originalSide != side) {
                            cardSides_1 = element.getElementsByClassName('card-sides')[0];
                            cardSides_1.style.transition = 'none';
                            element.dataset.side = settings.originalSide;
                            setTimeout(function () {
                                cardSides_1.style.transition = null;
                                element.dataset.side = side;
                            });
                        }
                        animation = settings.animation;
                        if (animation) {
                            animation.settings.element = element;
                            animation.settings.fromRect = fromRect;
                        }
                        else {
                            animation = new BgaSlideAnimation({ element: element, fromRect: fromRect });
                        }
                        return [4 /*yield*/, this.manager.animationManager.play(animation)];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, (_a = result === null || result === void 0 ? void 0 : result.played) !== null && _a !== void 0 ? _a : false];
                }
            });
        });
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
    /**
     * @returns the class to apply to selectable cards. Use class from manager is unset.
     */
    CardStock.prototype.getSelectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectableCardClass) === undefined ? this.manager.getSelectableCardClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectableCardClass;
    };
    /**
     * @returns the class to apply to selectable cards. Use class from manager is unset.
     */
    CardStock.prototype.getUnselectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.unselectableCardClass) === undefined ? this.manager.getUnselectableCardClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.unselectableCardClass;
    };
    /**
     * @returns the class to apply to selected cards. Use class from manager is unset.
     */
    CardStock.prototype.getSelectedCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectedCardClass) === undefined ? this.manager.getSelectedCardClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectedCardClass;
    };
    CardStock.prototype.removeSelectionClasses = function (card) {
        this.removeSelectionClassesFromElement(this.getCardElement(card));
    };
    CardStock.prototype.removeSelectionClassesFromElement = function (cardElement) {
        var selectableCardsClass = this.getSelectableCardClass();
        var unselectableCardsClass = this.getUnselectableCardClass();
        var selectedCardsClass = this.getSelectedCardClass();
        cardElement.classList.remove(selectableCardsClass, unselectableCardsClass, selectedCardsClass);
    };
    return CardStock;
}());
var SlideAndBackAnimation = /** @class */ (function (_super) {
    __extends(SlideAndBackAnimation, _super);
    function SlideAndBackAnimation(manager, element, tempElement) {
        var distance = (manager.getCardWidth() + manager.getCardHeight()) / 2;
        var angle = Math.random() * Math.PI * 2;
        var fromDelta = {
            x: distance * Math.cos(angle),
            y: distance * Math.sin(angle),
        };
        return _super.call(this, {
            animations: [
                new BgaSlideToAnimation({ element: element, fromDelta: fromDelta, duration: 250 }),
                new BgaSlideAnimation({ element: element, fromDelta: fromDelta, duration: 250, animationEnd: tempElement ? (function () { return element.remove(); }) : undefined }),
            ]
        }) || this;
    }
    return SlideAndBackAnimation;
}(BgaCumulatedAnimation));
/**
 * Abstract stock to represent a deck. (pile of cards, with a fake 3d effect of thickness). *
 * Needs cardWidth and cardHeight to be set in the card manager.
 */
var Deck = /** @class */ (function (_super) {
    __extends(Deck, _super);
    function Deck(manager, element, settings) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        var _this = _super.call(this, manager, element) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('deck');
        var cardWidth = _this.manager.getCardWidth();
        var cardHeight = _this.manager.getCardHeight();
        if (cardWidth && cardHeight) {
            _this.element.style.setProperty('--width', "".concat(cardWidth, "px"));
            _this.element.style.setProperty('--height', "".concat(cardHeight, "px"));
        }
        else {
            throw new Error("You need to set cardWidth and cardHeight in the card manager to use Deck.");
        }
        _this.thicknesses = (_a = settings.thicknesses) !== null && _a !== void 0 ? _a : [0, 2, 5, 10, 20, 30];
        _this.setCardNumber((_b = settings.cardNumber) !== null && _b !== void 0 ? _b : 52);
        _this.autoUpdateCardNumber = (_c = settings.autoUpdateCardNumber) !== null && _c !== void 0 ? _c : true;
        _this.autoRemovePreviousCards = (_d = settings.autoRemovePreviousCards) !== null && _d !== void 0 ? _d : true;
        var shadowDirection = (_e = settings.shadowDirection) !== null && _e !== void 0 ? _e : 'bottom-right';
        var shadowDirectionSplit = shadowDirection.split('-');
        var xShadowShift = shadowDirectionSplit.includes('right') ? 1 : (shadowDirectionSplit.includes('left') ? -1 : 0);
        var yShadowShift = shadowDirectionSplit.includes('bottom') ? 1 : (shadowDirectionSplit.includes('top') ? -1 : 0);
        _this.element.style.setProperty('--xShadowShift', '' + xShadowShift);
        _this.element.style.setProperty('--yShadowShift', '' + yShadowShift);
        if (settings.topCard) {
            _this.addCard(settings.topCard, undefined);
        }
        else if (settings.cardNumber > 0) {
            console.warn("Deck is defined with ".concat(settings.cardNumber, " cards but no top card !"));
        }
        if (settings.counter && ((_f = settings.counter.show) !== null && _f !== void 0 ? _f : true)) {
            if (settings.cardNumber === null || settings.cardNumber === undefined) {
                throw new Error("You need to set cardNumber if you want to show the counter");
            }
            else {
                _this.createCounter((_g = settings.counter.position) !== null && _g !== void 0 ? _g : 'bottom', (_h = settings.counter.extraClasses) !== null && _h !== void 0 ? _h : 'round', settings.counter.counterId);
                if ((_j = settings.counter) === null || _j === void 0 ? void 0 : _j.hideWhenEmpty) {
                    _this.element.querySelector('.bga-cards_deck-counter').classList.add('hide-when-empty');
                }
            }
        }
        _this.setCardNumber((_k = settings.cardNumber) !== null && _k !== void 0 ? _k : 52);
        return _this;
    }
    Deck.prototype.createCounter = function (counterPosition, extraClasses, counterId) {
        var left = counterPosition.includes('right') ? 100 : (counterPosition.includes('left') ? 0 : 50);
        var top = counterPosition.includes('bottom') ? 100 : (counterPosition.includes('top') ? 0 : 50);
        this.element.style.setProperty('--bga-cards-deck-left', "".concat(left, "%"));
        this.element.style.setProperty('--bga-cards-deck-top', "".concat(top, "%"));
        this.element.insertAdjacentHTML('beforeend', "\n            <div ".concat(counterId ? "id=\"".concat(counterId, "\"") : '', " class=\"bga-cards_deck-counter ").concat(extraClasses, "\"></div>\n        "));
    };
    /**
     * Get the the cards number.
     *
     * @returns the cards number
     */
    Deck.prototype.getCardNumber = function () {
        return this.cardNumber;
    };
    /**
     * Set the the cards number.
     *
     * @param cardNumber the cards number
     */
    Deck.prototype.setCardNumber = function (cardNumber, topCard) {
        var _this = this;
        if (topCard === void 0) { topCard = null; }
        if (topCard) {
            this.addCard(topCard);
        }
        this.cardNumber = cardNumber;
        this.element.dataset.empty = (this.cardNumber == 0).toString();
        var thickness = 0;
        this.thicknesses.forEach(function (threshold, index) {
            if (_this.cardNumber >= threshold) {
                thickness = index;
            }
        });
        this.element.style.setProperty('--thickness', "".concat(thickness, "px"));
        var counterDiv = this.element.querySelector('.bga-cards_deck-counter');
        if (counterDiv) {
            counterDiv.innerHTML = "".concat(cardNumber);
        }
    };
    Deck.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var _a, _b;
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.autoUpdateCardNumber) !== null && _a !== void 0 ? _a : this.autoUpdateCardNumber) {
            this.setCardNumber(this.cardNumber + 1);
        }
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        if ((_b = settings === null || settings === void 0 ? void 0 : settings.autoRemovePreviousCards) !== null && _b !== void 0 ? _b : this.autoRemovePreviousCards) {
            promise.then(function () {
                var previousCards = _this.getCards().slice(0, -1); // remove last cards
                _this.removeCards(previousCards, { autoUpdateCardNumber: false });
            });
        }
        return promise;
    };
    Deck.prototype.cardRemoved = function (card, settings) {
        var _a;
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.autoUpdateCardNumber) !== null && _a !== void 0 ? _a : this.autoUpdateCardNumber) {
            this.setCardNumber(this.cardNumber - 1);
        }
        _super.prototype.cardRemoved.call(this, card, settings);
    };
    Deck.prototype.getTopCard = function () {
        var cards = this.getCards();
        return cards.length ? cards[cards.length - 1] : null;
    };
    /**
     * Shows a shuffle animation on the deck
     *
     * @param animatedCardsMax number of animated cards for shuffle animation.
     * @param fakeCardSetter a function to generate a fake card for animation. Required if the card id is not based on a numerci `id` field, or if you want to set custom card back
     * @returns promise when animation ends
     */
    Deck.prototype.shuffle = function () {
        return __awaiter(this, arguments, void 0, function (animatedCardsMax, fakeCardSetter) {
            var animatedCards, elements, i, newCard, newElement;
            var _this = this;
            if (animatedCardsMax === void 0) { animatedCardsMax = 10; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.manager.animationsActive()) {
                            return [2 /*return*/, Promise.resolve(false)]; // we don't execute as it's just visual temporary stuff
                        }
                        animatedCards = Math.min(10, animatedCardsMax, this.getCardNumber());
                        if (!(animatedCards > 1)) return [3 /*break*/, 2];
                        elements = [this.getCardElement(this.getTopCard())];
                        for (i = elements.length; i <= animatedCards; i++) {
                            newCard = {};
                            if (fakeCardSetter) {
                                fakeCardSetter(newCard, i);
                            }
                            else {
                                newCard.id = -100000 + i;
                            }
                            newElement = this.manager.createCardElement(newCard, false);
                            newElement.dataset.tempCardForShuffleAnimation = 'true';
                            this.element.prepend(newElement);
                            elements.push(newElement);
                        }
                        return [4 /*yield*/, this.manager.animationManager.playWithDelay(elements.map(function (element) { return new SlideAndBackAnimation(_this.manager, element, element.dataset.tempCardForShuffleAnimation == 'true'); }), 50)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 2: return [2 /*return*/, Promise.resolve(false)];
                }
            });
        });
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
        var _a, _b, _c, _d;
        var _this = _super.call(this, manager, element, settings) || this;
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
        var _a, _b;
        var _this = _super.call(this, manager, element, settings) || this;
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
    SlotStock.prototype.canAddCard = function (card, settings) {
        var _a, _b;
        if (!this.contains(card)) {
            return true;
        }
        else {
            var currentCardSlot = this.getCardElement(card).closest('.slot').dataset.slotId;
            var slotId = (_a = settings === null || settings === void 0 ? void 0 : settings.slot) !== null && _a !== void 0 ? _a : (_b = this.mapCardToSlot) === null || _b === void 0 ? void 0 : _b.call(this, card);
            return currentCardSlot != slotId;
        }
    };
    /**
     * Swap cards inside the slot stock.
     *
     * @param cards the cards to swap
     * @param settings for `updateInformations` and `selectable`
     */
    SlotStock.prototype.swapCards = function (cards, settings) {
        var _this = this;
        if (!this.mapCardToSlot) {
            throw new Error('You need to define SlotStock.mapCardToSlot to use SlotStock.swapCards');
        }
        var promises = [];
        var elements = cards.map(function (card) { return _this.manager.getCardElement(card); });
        var elementsRects = elements.map(function (element) { return element.getBoundingClientRect(); });
        var cssPositions = elements.map(function (element) { return element.style.position; });
        // we set to absolute so it doesn't mess with slide coordinates when 2 div are at the same place
        elements.forEach(function (element) { return element.style.position = 'absolute'; });
        cards.forEach(function (card, index) {
            var _a, _b;
            var cardElement = elements[index];
            var promise;
            var slotId = (_a = _this.mapCardToSlot) === null || _a === void 0 ? void 0 : _a.call(_this, card);
            _this.slots[slotId].appendChild(cardElement);
            cardElement.style.position = cssPositions[index];
            var cardIndex = _this.cards.findIndex(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
            if (cardIndex !== -1) {
                _this.cards.splice(cardIndex, 1, card);
            }
            if ((_b = settings === null || settings === void 0 ? void 0 : settings.updateInformations) !== null && _b !== void 0 ? _b : true) { // after splice/push
                _this.manager.updateCardInformations(card);
            }
            _this.removeSelectionClassesFromElement(cardElement);
            promise = _this.animationFromElement(cardElement, elementsRects[index], {});
            if (!promise) {
                console.warn("CardStock.animationFromElement didn't return a Promise");
                promise = Promise.resolve(false);
            }
            promise.then(function () { var _a; return _this.setSelectableCard(card, (_a = settings === null || settings === void 0 ? void 0 : settings.selectable) !== null && _a !== void 0 ? _a : true); });
            promises.push(promise);
        });
        return Promise.all(promises);
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
     * @param settings a `AddCardToVoidStockSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    VoidStock.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var _a;
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        // center the element
        var cardElement = this.getCardElement(card);
        var originalLeft = cardElement.style.left;
        var originalTop = cardElement.style.top;
        cardElement.style.left = "".concat((this.element.clientWidth - cardElement.clientWidth) / 2, "px");
        cardElement.style.top = "".concat((this.element.clientHeight - cardElement.clientHeight) / 2, "px");
        if (!promise) {
            console.warn("VoidStock.addCard didn't return a Promise");
            promise = Promise.resolve(false);
        }
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.remove) !== null && _a !== void 0 ? _a : true) {
            return promise.then(function (result) {
                _this.removeCard(card);
                return result;
            });
        }
        else {
            cardElement.style.left = originalLeft;
            cardElement.style.top = originalTop;
            return promise;
        }
    };
    return VoidStock;
}(CardStock));
function sortFunction() {
    var sortedFields = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sortedFields[_i] = arguments[_i];
    }
    return function (a, b) {
        for (var i = 0; i < sortedFields.length; i++) {
            var direction = 1;
            var field = sortedFields[i];
            if (field[0] == '-') {
                direction = -1;
                field = field.substring(1);
            }
            else if (field[0] == '+') {
                field = field.substring(1);
            }
            var type = typeof a[field];
            if (type === 'string') {
                var compare = a[field].localeCompare(b[field]);
                if (compare !== 0) {
                    return compare;
                }
            }
            else if (type === 'number') {
                var compare = (a[field] - b[field]) * direction;
                if (compare !== 0) {
                    return compare * direction;
                }
            }
        }
        return 0;
    };
}
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
        this.updateFrontTimeoutId = [];
        this.updateBackTimeoutId = [];
        this.animationManager = (_a = settings.animationManager) !== null && _a !== void 0 ? _a : new AnimationManager(game);
    }
    /**
     * Returns if the animations are active. Animation aren't active when the window is not visible (`document.visibilityState === 'hidden'`), or `game.instantaneousMode` is true.
     *
     * @returns if the animations are active.
     */
    CardManager.prototype.animationsActive = function () {
        return this.animationManager.animationsActive();
    };
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
        if (this.getCardElement(card)) {
            throw new Error('This card already exists ' + JSON.stringify(card));
        }
        var element = document.createElement("div");
        element.id = id;
        element.dataset.side = '' + side;
        element.innerHTML = "\n            <div class=\"card-sides\">\n                <div id=\"".concat(id, "-front\" class=\"card-side front\">\n                </div>\n                <div id=\"").concat(id, "-back\" class=\"card-side back\">\n                </div>\n            </div>\n        ");
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
    /**
     * Remove a card.
     *
     * @param card the card to remove
     * @param settings a `RemoveCardSettings` object
     */
    CardManager.prototype.removeCard = function (card, settings) {
        var _a;
        var id = this.getId(card);
        var div = document.getElementById(id);
        if (!div) {
            return false;
        }
        div.id = "deleted".concat(id);
        div.remove();
        // if the card is in a stock, notify the stock about removal
        (_a = this.getCardStock(card)) === null || _a === void 0 ? void 0 : _a.cardRemoved(card, settings);
        return true;
    };
    /**
     * Returns the stock containing the card.
     *
     * @param card the card informations
     * @return the stock containing the card
     */
    CardManager.prototype.getCardStock = function (card) {
        return this.stocks.find(function (stock) { return stock.contains(card); });
    };
    /**
     * Return if the card passed as parameter is suppose to be visible or not.
     * Use `isCardVisible` from settings if set, else will check if `card.type` is defined
     *
     * @param card the card informations
     * @return the visiblility of the card (true means front side should be displayed)
     */
    CardManager.prototype.isCardVisible = function (card) {
        var _a, _b, _c, _d;
        return (_c = (_b = (_a = this.settings).isCardVisible) === null || _b === void 0 ? void 0 : _b.call(_a, card)) !== null && _c !== void 0 ? _c : ((_d = card.type) !== null && _d !== void 0 ? _d : false);
    };
    /**
     * Set the card to its front (visible) or back (not visible) side.
     *
     * @param card the card informations
     * @param visible if the card is set to visible face. If unset, will use isCardVisible(card)
     * @param settings the flip params (to update the card in current stock)
     */
    CardManager.prototype.setCardVisible = function (card, visible, settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        var element = this.getCardElement(card);
        if (!element) {
            return;
        }
        var isVisible = visible !== null && visible !== void 0 ? visible : this.isCardVisible(card);
        element.dataset.side = isVisible ? 'front' : 'back';
        var stringId = JSON.stringify(this.getId(card));
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.updateFront) !== null && _a !== void 0 ? _a : true) {
            if (this.updateFrontTimeoutId[stringId]) { // make sure there is not a delayed animation that will overwrite the last flip request
                clearTimeout(this.updateFrontTimeoutId[stringId]);
                delete this.updateFrontTimeoutId[stringId];
            }
            var updateFrontDelay = (_b = settings === null || settings === void 0 ? void 0 : settings.updateFrontDelay) !== null && _b !== void 0 ? _b : 500;
            if (!isVisible && updateFrontDelay > 0 && this.animationsActive()) {
                this.updateFrontTimeoutId[stringId] = setTimeout(function () { var _a, _b; return (_b = (_a = _this.settings).setupFrontDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element.getElementsByClassName('front')[0]); }, updateFrontDelay);
            }
            else {
                (_d = (_c = this.settings).setupFrontDiv) === null || _d === void 0 ? void 0 : _d.call(_c, card, element.getElementsByClassName('front')[0]);
            }
        }
        if ((_e = settings === null || settings === void 0 ? void 0 : settings.updateBack) !== null && _e !== void 0 ? _e : false) {
            if (this.updateBackTimeoutId[stringId]) { // make sure there is not a delayed animation that will overwrite the last flip request
                clearTimeout(this.updateBackTimeoutId[stringId]);
                delete this.updateBackTimeoutId[stringId];
            }
            var updateBackDelay = (_f = settings === null || settings === void 0 ? void 0 : settings.updateBackDelay) !== null && _f !== void 0 ? _f : 0;
            if (isVisible && updateBackDelay > 0 && this.animationsActive()) {
                this.updateBackTimeoutId[stringId] = setTimeout(function () { var _a, _b; return (_b = (_a = _this.settings).setupBackDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element.getElementsByClassName('back')[0]); }, updateBackDelay);
            }
            else {
                (_h = (_g = this.settings).setupBackDiv) === null || _h === void 0 ? void 0 : _h.call(_g, card, element.getElementsByClassName('back')[0]);
            }
        }
        if ((_j = settings === null || settings === void 0 ? void 0 : settings.updateData) !== null && _j !== void 0 ? _j : true) {
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
     * @param settings the flip params (to update the card in current stock)
     */
    CardManager.prototype.flipCard = function (card, settings) {
        var element = this.getCardElement(card);
        var currentlyVisible = element.dataset.side === 'front';
        this.setCardVisible(card, !currentlyVisible, settings);
    };
    /**
     * Update the card informations. Used when a card with just an id (back shown) should be revealed, with all data needed to populate the front.
     *
     * @param card the card informations
     */
    CardManager.prototype.updateCardInformations = function (card, settings) {
        var newSettings = __assign(__assign({}, (settings !== null && settings !== void 0 ? settings : {})), { updateData: true });
        this.setCardVisible(card, undefined, newSettings);
    };
    /**
     * @returns the card with set in the settings (undefined if unset)
     */
    CardManager.prototype.getCardWidth = function () {
        var _a;
        return (_a = this.settings) === null || _a === void 0 ? void 0 : _a.cardWidth;
    };
    /**
     * @returns the card height set in the settings (undefined if unset)
     */
    CardManager.prototype.getCardHeight = function () {
        var _a;
        return (_a = this.settings) === null || _a === void 0 ? void 0 : _a.cardHeight;
    };
    /**
     * @returns the class to apply to selectable cards. Default 'bga-cards_selectable-card'.
     */
    CardManager.prototype.getSelectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectableCardClass) === undefined ? 'bga-cards_selectable-card' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectableCardClass;
    };
    /**
     * @returns the class to apply to selectable cards. Default 'bga-cards_disabled-card'.
     */
    CardManager.prototype.getUnselectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.unselectableCardClass) === undefined ? 'bga-cards_disabled-card' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.unselectableCardClass;
    };
    /**
     * @returns the class to apply to selected cards. Default 'bga-cards_selected-card'.
     */
    CardManager.prototype.getSelectedCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectedCardClass) === undefined ? 'bga-cards_selected-card' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectedCardClass;
    };
    return CardManager;
}());
var OPENED_LEFT = 1;
var CLOSED = 2;
var OPENED_RIGHT = 3;
var CARD_WIDTH = 142;
var CARD_HEIGHT = 198;
var FRAME_GROUP_FIX = {
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
var CardsManager = /** @class */ (function (_super) {
    __extends(CardsManager, _super);
    function CardsManager(game) {
        var _this = _super.call(this, game, {
            getId: function (card) { return "card-".concat(card.id); },
            setupDiv: function (card, div) {
                div.dataset.cardId = '' + card.id;
            },
            setupFrontDiv: function (card, div) { return _this.setupFrontDiv(card, div); },
            isCardVisible: function (card) { return card.type !== null && card.type !== undefined; },
            cardWidth: 142,
            cardHeight: 198,
        }) || this;
        _this.game = game;
        return _this;
    }
    CardsManager.prototype.setupFrontDiv = function (card, div, ignoreTooltip) {
        if (ignoreTooltip === void 0) { ignoreTooltip = false; }
        div.id = "".concat(this.getId(card), "-front");
        div.dataset.level = '' + card.level;
        div.dataset.type = '' + card.type;
        div.dataset.subType = '' + card.subType;
        div.dataset.playerColor = card.playerId ? '' + this.game.getPlayerColor(card.playerId) : '';
        if (card.frames && !div.querySelector('.frame')) {
            this.createFrames(div, card.frames, card.id > 9999);
        }
        if (!ignoreTooltip) {
            var tooltip = this.getTooltip(card);
            if (tooltip) {
                this.game.setTooltip(div.id, tooltip);
            }
        }
    };
    CardsManager.prototype.createFrame = function (div, frame, row, index, left, debug) {
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
            if (!frame.left.length) {
                width = 34;
            }
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
        if (debug) {
            frameDiv.classList.add('debug');
            frameDiv.innerHTML = "".concat(getResourcesQuantityIcons(frame.left), " ").concat(frame.convertSign ? '&gt;' : '', " ").concat(getResourcesQuantityIcons(frame.right));
        }
        return frameDiv;
    };
    CardsManager.prototype.propertyToNumber = function (div, property) {
        var match = div.style.getPropertyValue("--".concat(property)).match(/\d+/);
        return (match === null || match === void 0 ? void 0 : match.length) ? Number(match[0]) : 0;
    };
    CardsManager.prototype.createFrames = function (div, frames, debug) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f;
        var _loop_3 = function (row) {
            var frameOpenedLeft = frames[row].find(function (frame) { return frame.type == OPENED_LEFT; });
            var leftFrameDiv = null;
            if (frameOpenedLeft) {
                leftFrameDiv = this_1.createFrame(div, frameOpenedLeft, row, 0, null, debug);
            }
            var frameOpenedRight = frames[row].find(function (frame) { return frame.type == OPENED_RIGHT; });
            var rightFrameDiv = null;
            if (frameOpenedRight) {
                rightFrameDiv = this_1.createFrame(div, frameOpenedRight, row, frames[row].length - 1, null, debug);
            }
            var minLeft = leftFrameDiv ? this_1.propertyToNumber(leftFrameDiv, 'width') + 7 : 32;
            var minRight = rightFrameDiv ? this_1.propertyToNumber(rightFrameDiv, 'width') + 7 : 32;
            var centerFrames = frames[row].filter(function (frame) { return frame != frameOpenedLeft && frame != frameOpenedRight; });
            if (centerFrames.length) {
                var positionFix = (_d = (_c = (_b = (_a = FRAME_GROUP_FIX[div.dataset.type]) === null || _a === void 0 ? void 0 : _a[div.dataset.level]) === null || _b === void 0 ? void 0 : _b[div.dataset.subType]) === null || _c === void 0 ? void 0 : _c[row]) !== null && _d !== void 0 ? _d : [];
                var frameGroupDiv_1 = document.createElement('div');
                frameGroupDiv_1.classList.add('frame-group');
                frameGroupDiv_1.dataset.row = '' + row;
                frameGroupDiv_1.style.setProperty('--left', " ".concat((_e = positionFix[0]) !== null && _e !== void 0 ? _e : minLeft, "px"));
                frameGroupDiv_1.style.setProperty('--right', " ".concat((_f = positionFix[1]) !== null && _f !== void 0 ? _f : minRight, "px"));
                div.appendChild(frameGroupDiv_1);
                frames[row].forEach(function (frame, index) {
                    if (frame != frameOpenedLeft && frame != frameOpenedRight) {
                        var left = index == 0 && frames[row].length === 3 ? 7 : 34;
                        var frameDiv = _this.createFrame(frameGroupDiv_1, frame, row, index, left, debug);
                        if (index == 0) {
                            leftFrameDiv = frameDiv;
                        }
                        if (leftFrameDiv && rightFrameDiv && index == 1 && frames[row].length == 3) {
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
            }
        };
        var this_1 = this;
        for (var row = 0; row < 3; row++) {
            _loop_3(row);
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
        return "".concat((card.level > 0 ? _('${type} level ${level}') : '${type}').replace('${type}', "<strong>".concat(this.getMonkeyType(card.type), "</strong>")).replace('${level}', "<strong>".concat(card.level, "</strong>")), "<br>\n        ").concat(_('Rage gain:'), " ").concat(card.rageGain[0], " ").concat(formatTextIcons(getResourceCode(card.rageGain[1])), "<br>\n        ").concat(_('Card number:'), " ").concat(card.number);
    };
    CardsManager.prototype.setForHelp = function (card, divId) {
        var div = document.getElementById(divId);
        div.classList.add('card');
        div.dataset.side = 'front';
        div.innerHTML = "\n        <div class=\"card-sides\">\n            <div class=\"card-side front\">\n            </div>\n            <div class=\"card-side back\">\n            </div>\n        </div>";
        this.setupFrontDiv(card, div.querySelector('.front'), true);
    };
    // gameui.cardsManager.debugShowAllCards()
    CardsManager.prototype.debugShowAllCards = function () {
        var _this = this;
        var TEMP = this.game.gamedatas.TEMP;
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
        [1, 2, 3, 4].forEach(function (type) {
            [1, 2].forEach(function (level) {
                var typeAndLevel = type * 10 + level;
                document.getElementById("table").insertAdjacentHTML("afterbegin", "\n                    <div id=\"all-".concat(typeAndLevel, "\" class=\"debug\"></div>\n                "));
                var stock = new LineStock(_this, document.getElementById("all-".concat(typeAndLevel)));
                Object.entries(TEMP[typeAndLevel]).forEach(function (entry) {
                    var card = __assign(__assign({}, entry[1]), { id: 10000 + typeAndLevel * 100 + Number(entry[0]), level: level, type: type, subType: Number(entry[0]), playerId: 2343492 });
                    stock.addCard(card);
                });
                document.getElementById("all-".concat(typeAndLevel)).querySelectorAll('.frame').forEach(function (frame) { return frame.classList.add('remaining'); });
            });
        });
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
            isCardVisible: function () { return true; },
            cardWidth: 142,
            cardHeight: 198,
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
var STATE_TO_PHASE = {
    25: 11, // ST_PRIVATE_ORDER_CARDS
    26: 12, // ST_PRIVATE_ACTIVATE_EFFECT
    40: 21, // ST_MULTIPLAYER_CHOOSE_TOKEN
    //60: 21, // ST_MULTIPLAYER_PHASE2
    80: 0,
    90: 31, // ST_MULTIPLAYER_PHASE3
    95: 0, //ST_END_ROUND
};
var OBJECT_ACTIVE_PHASES = {
    1: [11],
    2: [11, 12, 21],
    3: [11],
    4: [31],
    5: [11],
    6: [11, 12, 21, 31],
    7: [21],
};
var OBJECT_MIN_COST = {
    1: 2,
    2: 1,
    3: 2,
    4: 3,
    5: 4,
    6: 5,
    7: 6,
};
var TableCenter = /** @class */ (function () {
    function TableCenter(game, gamedatas) {
        var _this = this;
        this.game = game;
        this.hiddenDecks = [];
        this.usedObjects = null;
        [1, 2, 3, 4].forEach(function (monkeyType) {
            return [1, 2].forEach(function (level) {
                var type = monkeyType * 10 + level;
                var count = gamedatas.table[type];
                var block = document.createElement('div');
                block.classList.add('player-block');
                document.getElementById('center-board').insertAdjacentHTML('beforeend', "\n                    <div id=\"hidden-deck-".concat(type, "\" data-type=\"").concat(monkeyType, "\" data-level=\"").concat(level, "\"></div>\n                "));
                _this.hiddenDecks[type] = new Deck(_this.game.cardsManager, document.getElementById("hidden-deck-".concat(type)), {
                    cardNumber: count,
                    autoUpdateCardNumber: false,
                    topCard: gamedatas.tableTopCard[type],
                    counter: {
                        extraClasses: 'round',
                        position: level == 1 ? 'top' : 'bottom',
                    },
                });
            });
        });
        this.objectsManager = new ObjectsManager(this.game);
        this.objects = new LineStock(this.objectsManager, document.getElementById("objects"));
        this.objects.addCards(gamedatas.objects);
        this.objects.onCardClick = function (number) { return _this.game.useObject(number); };
        var stateId = +gamedatas.gamestate.id;
        if (!this.game.isSpectator) {
            this.onEnteringState(stateId);
            this.usedObjects = gamedatas.usedObjects;
            this.setUsedClass();
            if (gamedatas.players[this.game.getPlayerId()]) {
                this.setCurrentPlayerEnergy(gamedatas.players[this.game.getPlayerId()].energy);
            }
        }
        else {
            document.getElementById("objects").classList.add('spectator-mode');
        }
    }
    TableCenter.prototype.setRemaining = function (deckType, deckCount, deckTopCard) {
        if (deckTopCard) {
            this.hiddenDecks[deckType].addCard(deckTopCard);
        }
        this.hiddenDecks[deckType].setCardNumber(deckCount);
    };
    TableCenter.prototype.setObjectPhase = function (object, phase) {
        this.objects.getCardElement(object).classList.toggle('current-phase', OBJECT_ACTIVE_PHASES[object].includes(phase));
    };
    TableCenter.prototype.onEnteringState = function (stateId) {
        var _this = this;
        var stateToPhaseIds = Object.keys(STATE_TO_PHASE).map(function (val) { return +val; });
        stateToPhaseIds.forEach(function (id, index) {
            if (stateId >= id && (index == stateToPhaseIds.length - 1 || stateId < stateToPhaseIds[index + 1])) {
                _this.objects.getCards().forEach(function (object) { return _this.setObjectPhase(object, STATE_TO_PHASE[id]); });
            }
        });
    };
    TableCenter.prototype.setCurrentPlayerEnergy = function (energy) {
        var _this = this;
        this.objects.getCards().forEach(function (object) { return _this.objects.getCardElement(object).classList.toggle('disabled', OBJECT_MIN_COST[object] > energy); });
    };
    TableCenter.prototype.addUsedObject = function (object) {
        this.usedObjects.push(object);
        this.setUsedClass();
    };
    TableCenter.prototype.newRound = function () {
        if (!this.usedObjects) {
            return;
        }
        this.usedObjects = [];
        this.setUsedClass();
    };
    TableCenter.prototype.setUsedClass = function () {
        var _this = this;
        if (!this.usedObjects) {
            return;
        }
        this.objects.getCards().forEach(function (object) { return _this.objects.getCardElement(object).classList.toggle('used', _this.usedObjects.includes(object)); });
    };
    TableCenter.prototype.replaceLineCardUpdateCounters = function (table, tableTopCards) {
        var _this = this;
        Object.entries(table).forEach(function (entry) {
            var type = Number(entry[0]);
            var count = entry[1];
            _this.hiddenDecks[type].setCardNumber(count, tableTopCards[type]);
        });
    };
    TableCenter.prototype.addCardForReplaceLine = function (oldCard, visible) {
        var type = oldCard.type * 10 + oldCard.level;
        return this.hiddenDecks[type].addCard(visible ? { id: oldCard.id } : oldCard, undefined, { visible: visible });
    };
    return TableCenter;
}());
var isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
;
var log = isDebug ? console.log.bind(window.console) : function () { };
var CardLine = /** @class */ (function (_super) {
    __extends(CardLine, _super);
    function CardLine(manager, element, settings, game, currentPlayer) {
        var _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        _this.game = game;
        _this.currentPlayer = currentPlayer;
        if (_this.currentPlayer) {
            _this.createSlotButtons();
        }
        return _this;
    }
    CardLine.prototype.getSlotsIds = function () {
        return this.slotsIds;
    };
    CardLine.prototype.createSlotButtons = function () {
        var _this = this;
        this.element.querySelectorAll('[data-slot-id]').forEach(function (slot, index) {
            if (slot.querySelectorAll('button.move').length == 0) {
                slot.insertAdjacentHTML('afterbegin', "\n                    <button id=\"move-left-".concat(index, "\" class=\"move left\"></button>\n                    <button id=\"move-right-").concat(index, "\" class=\"move right\"></button>\n                "));
                document.getElementById("move-left-".concat(index)).addEventListener('click', function () { return _this.game.moveCard(index, -1); });
                document.getElementById("move-right-".concat(index)).addEventListener('click', function () { return _this.game.moveCard(index, 1); });
            }
        });
    };
    CardLine.prototype.createSlot = function (slotId) {
        _super.prototype.createSlot.call(this, slotId);
        if (this.currentPlayer) {
            this.createSlotButtons();
        }
    };
    return CardLine;
}(SlotStock));
var PlayerTable = /** @class */ (function () {
    function PlayerTable(game, player) {
        var _this = this;
        this.game = game;
        this.playerId = Number(player.id);
        this.currentPlayer = this.playerId == this.game.getPlayerId();
        var html = "\n        <div id=\"player-table-".concat(this.playerId, "\" class=\"player-table ").concat(this.currentPlayer ? 'current-player' : '', "\" style=\"--player-color: #").concat(player.color, ";\">\n            <div class=\"decks\">\n                <div id=\"player-table-").concat(this.playerId, "-deck\" class=\"deck-stock\">\n                    ").concat(this.currentPlayer ? "<div id=\"player-table-".concat(this.playerId, "-see-top-card\" class=\"see-top-card\" data-visible=\"false\">").concat(_("See top card"), "</div>") : '', "\n                </div>\n                <div class=\"name-and-tokens\">\n                    <div class=\"name-wrapper\">").concat(player.name, "</div>\n                    <div id=\"player-table-").concat(this.playerId, "-tokens\" class=\"tokens\"></div>\n                </div>\n                <div id=\"player-table-").concat(this.playerId, "-discard\" class=\"discard-stock\"></div>\n            </div>\n            <div id=\"player-table-").concat(this.playerId, "-line\"></div>        \n        </div>\n        ");
        dojo.place(html, document.getElementById(this.currentPlayer ? 'current-player-table' : 'tables'));
        if (this.currentPlayer) {
            var seeTopCardBtn_1 = document.getElementById("player-table-".concat(this.playerId, "-see-top-card"));
            seeTopCardBtn_1.addEventListener('click', function () {
                if (seeTopCardBtn_1.dataset.visible == 'true') {
                    _this.showVisibleTopCard();
                }
            });
            this.visibleTopCard = player.visibleTopCard;
            this.deckTopCard(player.visibleTopCard);
        }
        this.line = new CardLine(this.game.cardsManager, document.getElementById("player-table-".concat(this.playerId, "-line")), {
            wrap: 'nowrap',
            gap: '0',
            slotsIds: this.getSlotsIds(player.line),
            mapCardToSlot: function (card) { return card.locationArg; }
        }, game, this.currentPlayer);
        this.resetLine(player.line, false);
        html = "\n        <div id=\"player-table-".concat(this.playerId, "-tokens-unplayed\" class=\"tokens-unplayed tokens-column\">");
        for (var i = 1; i <= 4; i++) {
            html += "<div class=\"action-token\" ".concat(i == 4 ? "id=\"player-table-".concat(this.playerId, "-action-token\"") : '', " data-color=\"").concat(player.color, "\" data-type=\"0\"></div>");
        }
        html += "</div>\n        <div id=\"player-table-".concat(this.playerId, "-tokens-played\" class=\"tokens-played tokens-column\"></div>\n        ");
        dojo.place(html, document.getElementById("player-table-".concat(this.playerId, "-tokens")));
        this.setSelectedToken(player.chosenToken);
        this.deck = new Deck(this.game.cardsManager, document.getElementById("player-table-".concat(this.playerId, "-deck")), {
            cardNumber: player.deckCount,
            autoUpdateCardNumber: true,
            topCard: player.deckTopCard,
            counter: {
                extraClasses: 'round',
                position: 'top',
            },
        });
        this.discard = new Deck(this.game.cardsManager, document.getElementById("player-table-".concat(this.playerId, "-discard")), {
            cardNumber: player.discardCount,
            autoUpdateCardNumber: true,
            topCard: player.discardTopCard,
            counter: {
                extraClasses: 'round',
                position: 'top',
            },
        });
    }
    PlayerTable.prototype.getSlotsIds = function (line) {
        var maxLocationArg = Math.max.apply(Math, __spreadArray([3], line.map(function (card) { return card.locationArg; }), false));
        return Array.from(Array(maxLocationArg + 1).keys());
    };
    PlayerTable.prototype.onRemoveCardClick = function (card) {
        var _this = this;
        var _a;
        var pref = Number((_a = this.game.prefs[202]) === null || _a === void 0 ? void 0 : _a.value);
        if (pref == 3 || (pref == 2 && card.type == 0)) {
            this.game.useRage(card.id);
        }
        else {
            this.game.confirmationDialog(_("Are you sure you want to remove this card ?"), function () { return _this.game.useRage(card.id); });
        }
    };
    PlayerTable.prototype.addRageButton = function (card) {
        var _this = this;
        var div = this.line.getCardElement(card);
        if (div.querySelector('.rage-button')) {
            return;
        }
        var button = document.createElement('button');
        button.id = "rage-button-".concat(card.id);
        button.classList.add('rage-button', 'bgabutton', 'bgabutton_blue');
        button.dataset.playerId = '' + this.playerId;
        button.innerHTML = formatTextIcons('[Rage]');
        div.appendChild(button);
        button.addEventListener('click', function () { return _this.onRemoveCardClick(card); });
        this.game.setButtonActivation(button.id, 'rage', 4);
        this.game.setTooltip(button.id, formatTextIcons(_('Remove this card (${cost}) to gain ${gain}').replace('${cost}', '4 [Rage]')).replace('${gain}', getResourcesQuantityIcons([card.rageGain])));
    };
    PlayerTable.prototype.newRound = function (cards, deckCount, deckTopCard) {
        this.resetLine(cards, true);
        if (deckTopCard) {
            this.deck.addCard(deckTopCard, undefined, { autoUpdateCardNumber: false, });
        }
        this.deck.setCardNumber(deckCount);
    };
    PlayerTable.prototype.resetLine = function (cards, fromDeck) {
        var _this = this;
        this.line.removeAll();
        this.line.setSlotsIds(this.getSlotsIds(cards));
        if (fromDeck) {
            cards.forEach(function (card) { return _this.game.cardsManager.updateCardInformations(card); });
            this.deck.addCards(cards);
        }
        this.line.addCards(cards);
        cards.forEach(function (card) { return _this.addRageButton(card); });
        this.updateVisibleMoveButtons();
    };
    PlayerTable.prototype.setMovable = function (movable) {
        document.getElementById("player-table-".concat(this.playerId)).classList.toggle('move-phase', movable);
    };
    PlayerTable.prototype.switchCards = function (switchedCards) {
        var _this = this;
        /*try {*/
        this.line.swapCards(switchedCards);
        /*} catch (e) {
            console.error('error during switchCards', e, JSON.stringify(switchedCards));
        }*/
        switchedCards.forEach(function (card) { return _this.addRageButton(card); });
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
    PlayerTable.prototype.setEffectClass = function (effect, frameClasses) {
        this.getFrames(effect).forEach(function (frame) {
            var _a;
            return (_a = frame.classList).add.apply(_a, frameClasses);
        });
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
            var currentClasses = ['current'];
            if (currentEffect.convertSign) {
                currentClasses.push('convert');
            }
            this.setEffectClass(currentEffect, currentClasses);
        }
        if (reactivate) {
            this.setActivableEffectToken(possibleEffects);
        }
        else {
            appliedEffects.forEach(function (effect) { return _this.setEffectClass(effect, ['applied']); });
            remainingEffects.forEach(function (effect) { return _this.setEffectClass(effect, ['remaining']); });
            this.markRemainingFramesDisabled();
        }
    };
    PlayerTable.prototype.setActivableEffectToken = function (possibleEffects, className) {
        var _this = this;
        if (className === void 0) { className = 'selectable'; }
        possibleEffects.forEach(function (effect) { return _this.setEffectClass(effect, [className]); });
        this.markRemainingFramesDisabled();
    };
    PlayerTable.prototype.removeActivableEffect = function () {
        var line = document.getElementById("player-table-".concat(this.playerId, "-line"));
        ['selectable', 'disabled', 'current', 'applied', 'remaining'].forEach(function (frameClass) { return line.querySelectorAll('.frame.' + frameClass).forEach(function (element) { return element.classList.remove(frameClass); }); });
    };
    PlayerTable.prototype.setSelectedToken = function (type) {
        var token = document.getElementById("player-table-".concat(this.playerId, "-action-token"));
        var destination = document.getElementById("player-table-".concat(this.playerId, "-tokens-").concat(type === null ? 'un' : '', "played"));
        if (token.parentElement != destination) {
            this.game.animationManager.attachWithAnimation(new BgaSlideAnimation({ element: token }), destination);
        }
        token.dataset.type = type === null ? '0' : '' + type;
    };
    PlayerTable.prototype.endRound = function () {
        this.setSelectedToken(null);
        var cards = this.line.getCards();
        this.discard.addCards(cards.map(function (card) { return ({ id: card.id }); }));
    };
    PlayerTable.prototype.removeCard = function (card, line) {
        if (line) {
            this.line.removeAll();
            this.resetLine(line, false);
        }
        else {
            this.line.removeCard(card);
        }
        this.updateVisibleMoveButtons();
    };
    PlayerTable.prototype.addCardToLine = function (card, line, deckCount, deckTopCard) {
        this.deck.addCard(card);
        this.resetLine(line, false);
        if (deckTopCard) {
            this.deck.addCard(deckTopCard);
        }
        this.deck.setCardNumber(deckCount);
    };
    PlayerTable.prototype.discardCard = function (card) {
        return this.discard.addCard({ id: card.id });
    };
    PlayerTable.prototype.replaceLineCard = function (card) {
        var promise = this.line.addCard(card);
        this.addRageButton(card);
        return promise;
    };
    PlayerTable.prototype.replaceTopDeck = function (card) {
        this.deck.addCard(card, undefined, { autoUpdateCardNumber: true });
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
    PlayerTable.prototype.addButtonsOnCards = function (getLabel, onClick, minLevel) {
        var _this = this;
        if (minLevel === void 0) { minLevel = 0; }
        document.getElementById("player-table-".concat(this.playerId, "-line")).querySelectorAll('[data-slot-id]').forEach(function (slot, index) {
            var card = _this.line.getCards().find(function (card) { return card.locationArg == index; });
            if (card && card.level >= minLevel) {
                slot.insertAdjacentHTML('afterbegin', "\n                    <button id=\"use-object-on-card-".concat(index, "\" class=\"remove bgabutton bgabutton_blue\">").concat(getLabel(card), "</button>\n                "));
                document.getElementById("use-object-on-card-".concat(index)).addEventListener('click', function () { return onClick(_this.line.getCards().find(function (card) { return card.locationArg == index; })); });
            }
        });
    };
    PlayerTable.prototype.removeButtonsOnCards = function () {
        var slots = document.getElementById("player-table-".concat(this.playerId)).querySelectorAll(".slot");
        slots.forEach(function (slot) { return slot.querySelectorAll('button.remove').forEach(function (btn) { return btn.remove(); }); });
    };
    PlayerTable.prototype.refillDeck = function (deckCount, deckTopCard) {
        if (deckTopCard) {
            this.deck.addCard(deckTopCard, { fromStock: this.discard, });
        }
        this.deck.setCardNumber(deckCount);
        this.discard.removeAll();
        this.discard.setCardNumber(0);
    };
    PlayerTable.prototype.addCardToDeck = function (card) {
        this.deck.addCard(card, undefined, { autoUpdateCardNumber: true });
    };
    PlayerTable.prototype.setLine = function (line) {
        var _this = this;
        this.line.removeAll();
        this.line.addCards(line);
        line.forEach(function (card) { return _this.addRageButton(card); });
    };
    PlayerTable.prototype.deckTopCard = function (card) {
        this.visibleTopCard = card;
        if (this.currentPlayer) {
            var seeTopCardId = "player-table-".concat(this.playerId, "-see-top-card");
            document.getElementById(seeTopCardId).dataset.visible = Boolean(card).toString();
        }
    };
    PlayerTable.prototype.showVisibleTopCard = function () {
        if (!this.visibleTopCard) {
            return;
        }
        var visibleTopCardDialog = new ebg.popindialog();
        visibleTopCardDialog.create('visibleTopCardDialog');
        visibleTopCardDialog.setTitle('');
        var html = "<div id=\"visible-top-card-popin\">\n            <h1>".concat(_("See top card"), "</h1>\n            <div id=\"visible-top-card\"></div>\n        </div>");
        // Show the dialog
        visibleTopCardDialog.setContent(html);
        visibleTopCardDialog.show();
        this.game.cardsManager.setForHelp(this.visibleTopCard, "visible-top-card");
    };
    return PlayerTable;
}());
var ANIMATION_MS = 500;
var ACTION_TIMER_DURATION = 5;
var LOCAL_STORAGE_ZOOM_KEY = 'AfterUs-zoom';
var LOCAL_STORAGE_JUMP_TO_FOLDED_KEY = 'AfterUs-jump-to-folded';
var FLOWER = 1;
var FRUIT = 2;
var GRAIN = 3;
var ENERGY = 4;
var POINT = 5;
var RAGE = 6;
var DIFFERENT = 7;
var PER_TAMARINS = 8;
var TYPE_FIELD_BY_NUMBER = [
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
        this.lastSelectedToken = undefined;
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
            zoomLevels: [0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1, 1.25, 1.5],
            onDimensionsChange: function () {
                var tablesAndCenter = document.getElementById('tables-and-center');
                var doubleColumnBefore = tablesAndCenter.classList.contains('double-column');
                var doubleColumnAfter = tablesAndCenter.clientWidth > 1600;
                if (doubleColumnBefore != doubleColumnAfter) {
                    tablesAndCenter.classList.toggle('double-column', doubleColumnAfter);
                    var currentPlayerTable = document.querySelector('.player-table.current-player');
                    if (currentPlayerTable) {
                        document.getElementById(doubleColumnAfter ? 'tables' : 'current-player-table').insertAdjacentElement('afterbegin', currentPlayerTable);
                    }
                }
            },
        });
        new JumpToManager(this, {
            localStorageFoldedKey: LOCAL_STORAGE_JUMP_TO_FOLDED_KEY,
            topEntries: [
                new JumpToEntry(_('Main board'), 'table-center', { 'color': '#a19b7b' })
            ],
            defaultFolded: true,
        });
        if (gamedatas.lastTurn) {
            this.notif_lastTurn(false);
        }
        this.setupNotifications();
        this.setupPreferences();
        log("Ending game setup");
    };
    ///////////////////////////////////////////////////
    //// Game & client states
    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    AfterUs.prototype.setGamestatePrivateDescription = function (stateId, property) {
        if (property === void 0) { property = ''; }
        var originalState = this.gamedatas.gamestates[stateId];
        if (this.gamedatas.gamestate.descriptionmyturn != originalState['descriptionmyturn' + property]) {
            this.gamedatas.gamestate.descriptionmyturn = originalState['descriptionmyturn' + property];
            this.updatePageTitle();
        }
    };
    AfterUs.prototype.onEnteringState = function (stateName, args) {
        var _this = this;
        log('Entering state: ' + stateName, args.args);
        if (!this.isSpectator) {
            this.tableCenter.onEnteringState(+args.id);
        }
        switch (stateName) {
            case 'orderCards':
                var playerTable = this.getCurrentPlayerTable();
                playerTable.setMovable(true);
                playerTable.setActivableEffectToken(args.args.effects, 'remaining');
                break;
            case 'activateEffect':
            case 'confirmActivations':
            case 'confirmActivationsPhase2':
                var activateEffectArgs = args.args;
                this.getCurrentPlayerTable().setActivableEffect(activateEffectArgs.currentEffect, activateEffectArgs.appliedEffects, activateEffectArgs.remainingEffects, activateEffectArgs.reactivate, activateEffectArgs.possibleEffects);
                break;
            case 'activateEffectToken':
                var activateEffectTokenArgs = args.args;
                this.getCurrentPlayerTable().setActivableEffectToken(activateEffectTokenArgs.possibleEffects);
                break;
            case 'mobilePhone':
                this.getCurrentPlayerTable().addButtonsOnCards(function (card) { return _('Replace this card') + formatTextIcons(" (".concat(card.level + 1, " [Energy])")); }, function (card) {
                    var keys = [1, 2, 3, 4].map(function (type) { return _this.cardsManager.getMonkeyType(type); });
                    keys.push(_('Cancel'));
                    _this.multipleChoiceDialog(_("Select a deck to draw the level ${level} top card").replace('${level}', card.level), keys, function (choice) {
                        if (Number(choice) != 4) { // != cancel
                            _this.useMobilePhone(card.id, Number(choice) + 1);
                        }
                    });
                    var cancelBtn = document.getElementById('choice_btn_4');
                    if (cancelBtn) {
                        cancelBtn.classList.add('bgabutton_gray');
                        cancelBtn.classList.remove('bgabutton_blue');
                    }
                }, 1);
                break;
            case 'ghettoBlaster':
                this.getCurrentPlayerTable().addButtonsOnCards(function () { return _('Replace this card') + formatTextIcons(' (2 [Energy])'); }, function (card) { return _this.useGhettoBlaster(card.id); });
                break;
            case 'gameConsole':
                this.getCurrentPlayerTable().addButtonsOnCards(function (card) { return _('Place this card top of draw pile') + formatTextIcons(" (".concat(card.level * 2 + 1, " [Energy])")); }, function (card) { return _this.useGameConsole(card.id); }, 1);
                break;
            case 'endScore':
                this.onEnteringEndScore(args.args);
                break;
        }
    };
    AfterUs.prototype.onEnteringEndScore = function (args) {
        var _this = this;
        Object.keys(args.fullDecks).forEach(function (pId) {
            var playerId = Number(pId);
            _this.gamedatas.players[playerId].fullDeck = args.fullDecks[playerId];
            _this.addShowFullDeckButton(playerId);
        });
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
            case 'chooseToken':
                this.lastSelectedToken = undefined;
                break;
            case 'mobilePhone':
            case 'ghettoBlaster':
            case 'gameConsole':
                this.getCurrentPlayerTable().removeButtonsOnCards();
                break;
        }
    };
    AfterUs.prototype.addCancelLastMoves = function (withSingle, undoCount) {
        var _this = this;
        this.addActionButton("cancelLastMove-button", _("Cancel last move"), function () { return withSingle ? _this.cancelLastMove() : _this.cancelLastMoves(); }, null, null, 'gray');
        if (withSingle && undoCount > 1) {
            this.addActionButton("cancelLastMoves-button", _("Cancel last ${moves} moves").replace('${moves}', undoCount), function () { return _this.cancelLastMoves(); }, null, null, 'gray');
        }
    };
    AfterUs.prototype.createChooseTokenButton = function (type, gray) {
        var _this = this;
        if (gray === void 0) { gray = false; }
        var costs = [3, 6].map(function (number) {
            var _a, _b, _c, _d, _e, _f;
            var canPay = false;
            switch (type) {
                case FLOWER:
                    canPay = ((_a = _this.flowerCounters[_this.getPlayerId()]) === null || _a === void 0 ? void 0 : _a.getValue()) >= number;
                    break;
                case FRUIT:
                    canPay = ((_b = _this.fruitCounters[_this.getPlayerId()]) === null || _b === void 0 ? void 0 : _b.getValue()) >= number;
                    break;
                case GRAIN:
                    canPay = ((_c = _this.grainCounters[_this.getPlayerId()]) === null || _c === void 0 ? void 0 : _c.getValue()) >= number;
                    break;
                case 4:
                    canPay = Math.max((_d = _this.flowerCounters[_this.getPlayerId()]) === null || _d === void 0 ? void 0 : _d.getValue(), (_e = _this.fruitCounters[_this.getPlayerId()]) === null || _e === void 0 ? void 0 : _e.getValue(), (_f = _this.grainCounters[_this.getPlayerId()]) === null || _f === void 0 ? void 0 : _f.getValue()) >= number;
                    break;
            }
            return "<span class=\"".concat(canPay ? (gray ? '' : 'ok-can-pay') : 'warning-cant-pay', "\">").concat(number, "</span>");
        }).join('/');
        var label = "".concat(this.cardsManager.getMonkeyType(type), " (").concat(costs, " ").concat(type == 4 ? [1, 2, 3].map(function (r) { return formatTextIcons(getResourceCode(r)); }).join('/') : formatTextIcons(getResourceCode(type)), ")");
        this.addActionButton("chooseToken".concat(type, "-button"), "\n        ".concat(label, "<br>\n        <div class=\"action-token\" data-type=\"").concat(type, "\"></div>\n        "), function () { return _this.chooseToken(type); }, null, null, gray ? 'gray' : undefined);
    };
    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    AfterUs.prototype.onUpdateActionButtons = function (stateName, args) {
        var _this = this;
        var _a, _b;
        if (stateName === 'chooseToken') {
            if (!this.isCurrentPlayerActive() && Object.keys(this.gamedatas.players).includes('' + this.getPlayerId())) { // ignore spectators
                [1, 2, 3, 4].forEach(function (type) { return _this.createChooseTokenButton(type, true); });
                (_b = document.getElementById("chooseToken".concat(this.lastSelectedToken !== undefined ? this.lastSelectedToken : (_a = args._private) === null || _a === void 0 ? void 0 : _a.token, "-button"))) === null || _b === void 0 ? void 0 : _b.classList.add('selected-token-button');
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
                        var label = void 0;
                        if (!currentEffect.convertSign) {
                            label = _("Gain ${resources}").replace('${resources}', getResourcesQuantityIcons(currentEffect.left.concat(currentEffect.right)));
                        }
                        else {
                            label = _("Spend ${left} to gain ${right}").replace('${left}', getResourcesQuantityIcons(currentEffect.left)).replace('${right}', getResourcesQuantityIcons(currentEffect.right));
                        }
                        this.addActionButton("activateEffect-button", label, function () { return _this.activateEffect(); });
                        document.getElementById("activateEffect-button").classList.add(currentEffect.convertSign ? 'button-convert' : 'button-gain');
                    }
                }
                this.addActionButton("skipEffect-button", _("Skip"), function () { return _this.skipEffect(); });
                this.addCancelLastMoves(true, args.undoCount);
                break;
            case 'confirmActivations':
            case 'confirmActivationsPhase2':
                this.addActionButton("confirmActivations-button", _("Confirm"), function () { return _this.confirmActivations(); });
                this.addCancelLastMoves(stateName == 'confirmActivations', args.undoCount);
                break;
            case 'privateChooseToken':
                [1, 2, 3, 4].forEach(function (type) { return _this.createChooseTokenButton(type); });
                break;
            case 'activateEffectToken':
                if (args.possibleEffects.length) {
                    this.createFakeButtonForReactivate([]);
                }
                else {
                    this.addActionButton("skipEffectToken-button", _("Skip"), function () { return _this.skipEffectToken(); });
                }
                break;
            case 'buyCard':
                var buyCardArgs_1 = args;
                if (!buyCardArgs_1.canBuyCard) {
                    this.setGamestatePrivateDescription(61, buyCardArgs_1.canUseNeighborToken ? 'OnlyEffect' : 'OnlyEnd');
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
                if (buyCardArgs_1.canUseNeighborToken) {
                    Object.entries(buyCardArgs_1.neighborTokens).forEach(function (entry) {
                        var type = Number(entry[0]);
                        var playersIds = entry[1];
                        var players = playersIds.map(function (playerId) { return _this.getPlayer(playerId); }).map(function (player) { return "<span style=\"color: #".concat(player.color, ";\">").concat(player.name, "</span>"); }).join('/');
                        var label = _("Use effect of ${player} token ${type}").replace('${type}', "<div class=\"action-token\" data-type=\"".concat(type, "\"></div>")).replace('${player}', players);
                        _this.addActionButton("neighborEffect".concat(type, "-button"), label, function () { return _this.neighborEffect(type); }, null, null, 'gray');
                    });
                }
                var endTurnLabel = _("End turn");
                var canUseGameConsole = buyCardArgs_1.canUseGameConsole;
                if (canUseGameConsole) {
                    this.addActionButton("endTurnGameConsole-button", endTurnLabel + ' (' + _("use Game Console") + ')', function () { return _this.useObject(4); }, null, null, 'red');
                    endTurnLabel += ' (' + _("without using Game Console") + ')';
                }
                this.addActionButton("endTurn-button", endTurnLabel, function () { return _this.endTurn(); }, null, null, 'red');
                break;
            case 'applyNeighborEffect':
                var applyNeighborEffectArgs_1 = args;
                Object.entries(applyNeighborEffectArgs_1.cost).forEach(function (cardCost) {
                    var type = +cardCost[0];
                    //const canBuy = cardCost[1];
                    var label = _("Spend ${left} to gain ${right}")
                        .replace('${left}', getResourcesQuantityIcons([[2, type]]))
                        .replace('${right}', formatTextIcons(applyNeighborEffectArgs_1.gain));
                    _this.addActionButton("applyNeighborEffect-".concat(type, "-button"), label, function () { return _this.applyNeighborEffect(type); });
                    /*if (!canBuy) {
                        document.getElementById(`applyNeighborEffect-${type}-button`).classList.add('disabled');
                    }*/
                    _this.setButtonActivation("applyNeighborEffect-".concat(type, "-button"), TYPE_FIELD_BY_NUMBER[type], 2);
                });
                this.addActionButton("cancelNeighborEffect-button", _("Cancel"), function () { return _this.cancelNeighborEffect(); }, null, null, 'gray');
                break;
            case 'privateBeforeEndGame':
                this.addActionButton("endGame-button", _("End game"), function () { return _this.endGame(); }, null, null, 'red');
                break;
            case 'mobilePhone':
            case 'ghettoBlaster':
            case 'gameConsole':
                this.addActionButton("cancelObject-button", _("Cancel"), function () { return _this.cancelObject(); }, null, null, 'gray');
                break;
            case 'minibar':
                [1, 2, 3, 4].forEach(function (left) {
                    return [1, 2, 3 /*, 4*/].filter(function (right) { return left != right; }).forEach(function (right) {
                        var label = formatTextIcons(getResourceCode(left) + ' >> ' + getResourceCode(right) /* + (' (1 [Energy])')*/);
                        _this.addActionButton("minibar-".concat(left, "-").concat(right, "-button"), label, function () { return _this.useMinibar(left, right); });
                        if (left == ENERGY) {
                            if (_this.getCurrentPlayerEnergy() < 2) {
                                document.getElementById("minibar-".concat(left, "-").concat(right, "-button")).classList.add('disabled');
                            }
                        }
                        else {
                            var currentPlayerCounter = _this["".concat(TYPE_FIELD_BY_NUMBER[left], "Counters")][_this.getPlayerId()];
                            if (_this.getCurrentPlayerEnergy() < 1 || currentPlayerCounter.getValue() < 1) {
                                document.getElementById("minibar-".concat(left, "-").concat(right, "-button")).classList.add('disabled');
                            }
                        }
                    });
                });
                this.addActionButton("cancelObject-button", _("Cancel"), function () { return _this.cancelObject(); }, null, null, 'gray');
                break;
            case 'moped':
                [1, 2].forEach(function (level) {
                    return [1, 2, 3, 4].forEach(function (type) {
                        var cost = level == 2 ? 9 : 6;
                        var label = _("Attract a level ${level} ${type}").replace('${level}', level).replace('${type}', _this.cardsManager.getMonkeyType(type)) + formatTextIcons(" (".concat(cost, " [Energy])"));
                        _this.addActionButton("useMoped-".concat(type, "-").concat(level, "-button"), label, function () { return _this.useMoped(type, level); });
                        _this.setButtonActivation("useMoped-".concat(type, "-").concat(level, "-button"), 'energy', cost);
                    });
                });
                this.addActionButton("cancelObject-button", _("Cancel"), function () { return _this.cancelObject(); }, null, null, 'gray');
                break;
        }
    };
    AfterUs.prototype.createFakeButtonForReactivate = function (cost) {
        var label = _("Click on a frame to reactivate it");
        if (cost.length) {
            label += " (".concat(getResourcesQuantityIcons(cost), ")");
        }
        this.addActionButton("fakeReactivate-button", label, null);
        document.getElementById("fakeReactivate-button").classList.add('disabled');
    };
    ///////////////////////////////////////////////////
    //// Utility methods
    ///////////////////////////////////////////////////
    AfterUs.prototype.setButtonActivation = function (id, type, min) {
        var button = document.getElementById(id);
        button.setAttribute("data-activate-at-".concat(type), '' + min);
        var currentPlayerCounter = this["".concat(type, "Counters")][this.getPlayerId()];
        if (currentPlayerCounter && currentPlayerCounter.getValue() < min) {
            button.classList.add('disabled');
        }
    };
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
    AfterUs.prototype.getCurrentPlayerEnergy = function () {
        var _a, _b;
        return (_b = (_a = this.energyCounters[this.getPlayerId()]) === null || _a === void 0 ? void 0 : _a.getValue()) !== null && _b !== void 0 ? _b : 0;
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
                if (!this.isReadOnly()) {
                    this.setAutoGain(prefValue == 1);
                }
                break;
        }
    };
    AfterUs.prototype.isReadOnly = function () {
        return this.isSpectator || typeof g_replayFrom != 'undefined' || g_archive_mode;
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
        document.querySelectorAll('#player_boards .player_score i.fa-star').forEach(function (elem) {
            elem.classList.remove('fa', 'fa-star');
            elem.classList.add('icon', 'point');
        });
        var players = Object.values(gamedatas.players);
        players.forEach(function (player, index) {
            var playerId = Number(player.id);
            var html = "\n            <div class=\"counters\">\n                <div id=\"flower-counter-wrapper-".concat(player.id, "\" class=\"counter\">\n                    <div class=\"icon flower\"></div> \n                    <span id=\"flower-counter-").concat(player.id, "\"></span>\n                </div>\n                <div id=\"fruit-counter-wrapper-").concat(player.id, "\" class=\"counter\">\n                    <div class=\"icon fruit\"></div> \n                    <span id=\"fruit-counter-").concat(player.id, "\"></span>\n                </div>\n                <div id=\"grain-counter-wrapper-").concat(player.id, "\" class=\"counter\">\n                    <div class=\"icon grain\"></div> \n                    <span id=\"grain-counter-").concat(player.id, "\"></span>\n                </div>\n                <div id=\"energy-counter-wrapper-").concat(player.id, "\" class=\"counter\">\n                    <div class=\"icon energy\"></div> \n                    <span id=\"energy-counter-").concat(player.id, "\"></span>\n                </div>\n            </div>\n            <div class=\"counters\">\n                <div id=\"rage-counter-wrapper-").concat(player.id, "\" class=\"counter\">\n                    <div class=\"icon rage\"></div> \n                    <span id=\"rage-counter-").concat(player.id, "\"></span> / 12\n                </div>\n            </div>");
            dojo.place(html, "player_board_".concat(player.id));
            _this.addTooltipHtml("flower-counter-wrapper-".concat(player.id), _("Flowers"));
            _this.addTooltipHtml("fruit-counter-wrapper-".concat(player.id), _("Fruits"));
            _this.addTooltipHtml("grain-counter-wrapper-".concat(player.id), _("Grains"));
            _this.addTooltipHtml("energy-counter-wrapper-".concat(player.id), _("Energy"));
            _this.addTooltipHtml("rage-counter-wrapper-".concat(player.id), "".concat(_("Rage"), "<br>").concat(_("Click the button on the top-right corner of a card in your line to use Rage")));
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
            if (player.fullDeck) {
                _this.addShowFullDeckButton(playerId);
            }
        });
    };
    AfterUs.prototype.addShowFullDeckButton = function (playerId) {
        var _this = this;
        dojo.place("<div>\n        <button class=\"bgabutton bgabutton_gray discarded-button\" id=\"show-full-deck-button-".concat(playerId, "\">").concat(_('Show full deck'), "</button>\n        </div>"), "player_board_".concat(playerId));
        document.getElementById("show-full-deck-button-".concat(playerId)).addEventListener('click', function () { return _this.showFullDeck(playerId); });
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
    AfterUs.prototype.showFullDeck = function (playerId) {
        var _this = this;
        var fullDeckDialog = new ebg.popindialog();
        fullDeckDialog.create('showFullDeckDialog');
        fullDeckDialog.setTitle('');
        var html = "<div id=\"full-deck-popin\">\n            <h1>".concat(_("Full deck"), "</h1>\n            <div id=\"full-deck-cards\"></div>\n        </div>");
        // Show the dialog
        fullDeckDialog.setContent(html);
        fullDeckDialog.show();
        this.gamedatas.players[playerId].fullDeck.forEach(function (card) {
            var div = document.createElement('div');
            div.id = "full-deck-card-".concat(card.id);
            document.getElementById('full-deck-cards').appendChild(div),
                _this.cardsManager.setForHelp(card, div.id);
        });
    };
    AfterUs.prototype.onFrameClicked = function (row, cardIndex, index) {
        var actionName = ['tokenSelectReactivate', 'phase2'].includes(this.gamedatas.gamestate.name) ?
            'activateEffectToken' :
            'activateEffect';
        this.takeNoLockAction(actionName, {
            row: row,
            cardIndex: cardIndex,
            index: index,
        });
    };
    AfterUs.prototype.moveCard = function (index, direction) {
        if (!this.checkAction('moveCard')) {
            return;
        }
        this.takeNoLockAction('moveCard', {
            index: index,
            direction: direction < 0,
        });
    };
    AfterUs.prototype.validateCardOrder = function () {
        if (!this.checkAction('validateCardOrder')) {
            return;
        }
        this.takeNoLockAction('validateCardOrder');
    };
    AfterUs.prototype.activateEffect = function () {
        if (!this.checkAction('activateEffect')) {
            return;
        }
        this.takeNoLockAction('activateEffect');
    };
    AfterUs.prototype.skipEffect = function () {
        if (!this.checkAction('skipEffect')) {
            return;
        }
        this.takeNoLockAction('skipEffect');
    };
    AfterUs.prototype.skipEffectToken = function () {
        if (!this.checkAction('skipEffectToken')) {
            return;
        }
        this.takeNoLockAction('skipEffectToken');
    };
    AfterUs.prototype.confirmActivations = function () {
        if (!this.checkAction('confirmActivations')) {
            return;
        }
        this.takeAction('confirmActivations');
    };
    AfterUs.prototype.cancelLastMove = function () {
        if (!this.checkAction('cancelLastMove')) {
            return;
        }
        this.takeNoLockAction('cancelLastMove');
    };
    AfterUs.prototype.cancelLastMoves = function () {
        if (!this.checkAction('cancelLastMoves')) {
            return;
        }
        this.takeNoLockAction('cancelLastMoves');
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
        this.takeNoLockAction('neighborEffect', {
            type: type,
        });
    };
    AfterUs.prototype.applyNeighborEffect = function (type) {
        if (!this.checkAction('applyNeighborEffect')) {
            return;
        }
        this.takeNoLockAction('applyNeighborEffect', {
            type: type,
        });
    };
    AfterUs.prototype.cancelNeighborEffect = function () {
        if (!this.checkAction('cancelNeighborEffect')) {
            return;
        }
        this.takeNoLockAction('cancelNeighborEffect');
    };
    AfterUs.prototype.buyCard = function (level, type) {
        if (!this.checkAction('buyCard')) {
            return;
        }
        this.takeNoLockAction('buyCard', {
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
    AfterUs.prototype.endGame = function () {
        if (!this.checkAction('endGame')) {
            return;
        }
        this.takeAction('endGame');
    };
    AfterUs.prototype.setAutoGain = function (autoGain) {
        this.takeNoLockAction('setAutoGain', {
            autoGain: autoGain
        }, true);
    };
    AfterUs.prototype.useRage = function (id) {
        this.takeAction('useRage', {
            id: id,
        });
    };
    AfterUs.prototype.useObject = function (number) {
        this.takeNoLockAction('useObject', {
            number: number,
        });
    };
    AfterUs.prototype.cancelObject = function () {
        /*if(!(this as any).checkAction('cancelObject')) {
            return;
        }*/
        this.takeNoLockAction('cancelObject');
    };
    AfterUs.prototype.useMobilePhone = function (id, type) {
        if (!this.checkAction('useMobilePhone')) {
            return;
        }
        this.takeNoLockAction('useMobilePhone', {
            id: id,
            type: type,
        });
    };
    AfterUs.prototype.useMinibar = function (left, right) {
        if (!this.checkAction('useMinibar')) {
            return;
        }
        this.takeNoLockAction('useMinibar', {
            left: left,
            right: right,
        });
    };
    AfterUs.prototype.useGhettoBlaster = function (id) {
        if (!this.checkAction('useGhettoBlaster')) {
            return;
        }
        this.takeNoLockAction('useGhettoBlaster', {
            id: id,
        });
    };
    AfterUs.prototype.useGameConsole = function (id) {
        if (!this.checkAction('useGameConsole')) {
            return;
        }
        this.takeNoLockAction('useGameConsole', {
            id: id,
        });
    };
    AfterUs.prototype.useMoped = function (type, level) {
        this.takeNoLockAction('useMoped', {
            type: type,
            level: level,
        });
    };
    AfterUs.prototype.takeAction = function (action, data) {
        data = data || {};
        data.lock = true;
        this.ajaxcall("/afterus/afterus/".concat(action, ".html"), data, this, function () { });
    };
    AfterUs.prototype.takeNoLockAction = function (action, data, invisible) {
        if (invisible === void 0) { invisible = false; }
        if (!invisible && this.isCurrentPlayerActive()) {
            $("gameaction_status").innerHTML = __("lang_mainsite", "Updating game situation ...");
            dojo.style("pagemaintitle_wrap", "display", "none");
            dojo.style("gameaction_status_wrap", "display", "block");
        }
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
        notifs.forEach(function (notif) {
            dojo.subscribe(notif[0], _this, function (notifDetails) {
                log("notif_".concat(notif[0]), notifDetails.args);
                var promise = _this["notif_".concat(notif[0])](notifDetails.args);
                // tell the UI notification ends, if the function returned a promise
                promise === null || promise === void 0 ? void 0 : promise.then(function () { return _this.notifqueue.onSynchronousNotificationEnd(); });
            });
            _this.notifqueue.setSynchronous(notif[0], notif[1]);
        });
        if (isDebug) {
            notifs.forEach(function (notif) {
                if (!_this["notif_".concat(notif[0])]) {
                    console.warn("notif_".concat(notif[0], " function is not declared, but listed in setupNotifications"));
                }
            });
            Object.getOwnPropertyNames(AfterUs.prototype).filter(function (item) { return item.startsWith('notif_'); }).map(function (item) { return item.slice(6); }).forEach(function (item) {
                if (!notifs.some(function (notif) { return notif[0] == item; })) {
                    console.warn("notif_".concat(item, " function is declared, but not listed in setupNotifications"));
                }
            });
        }
    };
    AfterUs.prototype.notif_newRound = function (args) {
        this.tableCenter.newRound();
        this.getPlayerTable(args.playerId).newRound(args.cards, args.deckCount, args.deckTopCard);
    };
    AfterUs.prototype.notif_switchedCards = function (args) {
        this.getPlayerTable(args.playerId).switchCards(args.movedCards);
    };
    AfterUs.prototype.notif_activatedEffect = function (args) {
        var _this = this;
        var playerId = args.playerId;
        var player = args.player;
        this.flowerCounters[playerId].toValue(player.flowers);
        this.fruitCounters[playerId].toValue(player.fruits);
        this.grainCounters[playerId].toValue(player.grains);
        this.energyCounters[playerId].toValue(player.energy);
        this.rageCounters[playerId].toValue(player.rage);
        this.setScore(playerId, +player.score);
        if (playerId == this.getPlayerId()) {
            this.tableCenter.setCurrentPlayerEnergy(player.energy);
        }
        ['flower', 'fruit', 'grain', 'energy', 'rage'].forEach(function (type) {
            return document.querySelectorAll("[data-activate-at-".concat(type, "]")).forEach(function (button) {
                var min = +button.getAttribute("data-activate-at-".concat(type));
                var currentPlayerCounter = _this["".concat(type, "Counters")][_this.getPlayerId()];
                button.classList.toggle('disabled', currentPlayerCounter && currentPlayerCounter.getValue() < min);
            });
        });
    };
    AfterUs.prototype.notif_selectedToken = function (args) {
        var _this = this;
        var currentPlayer = this.getPlayerId() == args.playerId;
        if (args.token || !currentPlayer || args.cancel) {
            this.getPlayerTable(args.playerId).setSelectedToken(args.cancel ? null : args.token);
            if (currentPlayer) {
                this.lastSelectedToken = args.cancel ? null : args.token;
                [1, 2, 3, 4].forEach(function (type) { var _a; return (_a = document.getElementById("chooseToken".concat(type, "-button"))) === null || _a === void 0 ? void 0 : _a.classList.toggle('selected-token-button', type == _this.lastSelectedToken); });
            }
        }
    };
    AfterUs.prototype.notif_revealTokens = function (args) {
        var _this = this;
        Object.entries(args.tokens).forEach(function (val) { return _this.getPlayerTable(+val[0]).setSelectedToken(val[1]); });
    };
    AfterUs.prototype.notif_buyCard = function (args) {
        this.getPlayerTable(args.playerId).addCardToDeck(args.card);
        this.tableCenter.setRemaining(args.deckType, args.deckCount, args.deckTopCard);
        this.notif_activatedEffect(args);
    };
    AfterUs.prototype.notif_endRound = function (args) {
        this.getPlayerTable(args.playerId).endRound();
    };
    AfterUs.prototype.notif_removedCard = function (args) {
        this.getPlayerTable(args.playerId).removeCard(args.card, args.line);
        this.notif_activatedEffect(args);
    };
    AfterUs.prototype.notif_addCardToLine = function (args) {
        this.getPlayerTable(args.playerId).addCardToLine(args.card, args.line, args.deckCount, args.deckTopCard);
        this.notif_activatedEffect(args);
    };
    AfterUs.prototype.notif_replaceLineCard = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log(args);
                        return [4 /*yield*/, this.tableCenter.addCardForReplaceLine(args.oldCard, false)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.tableCenter.addCardForReplaceLine(args.newCard, true)];
                    case 2:
                        _a.sent();
                        this.tableCenter.replaceLineCardUpdateCounters(args.table, args.tableTopCards);
                        return [4 /*yield*/, this.getPlayerTable(args.playerId).replaceLineCard(args.newCard)];
                    case 3:
                        _a.sent();
                        this.notif_activatedEffect(args);
                        return [2 /*return*/, true];
                }
            });
        });
    };
    AfterUs.prototype.notif_replaceLineCardDeck = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var playerTable;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        playerTable = this.getPlayerTable(args.playerId);
                        return [4 /*yield*/, playerTable.discardCard(args.oldCard)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, playerTable.replaceLineCard(args.newCard)];
                    case 2:
                        _a.sent();
                        this.notif_activatedEffect(args);
                        return [2 /*return*/];
                }
            });
        });
    };
    AfterUs.prototype.notif_replaceTopDeck = function (args) {
        this.getPlayerTable(args.playerId).replaceTopDeck(args.card);
        this.notif_activatedEffect(args);
    };
    AfterUs.prototype.notif_useObject = function (args) {
        this.tableCenter.addUsedObject(args.object);
    };
    AfterUs.prototype.notif_refillDeck = function (args) {
        this.getPlayerTable(args.playerId).refillDeck(args.deckCount);
    };
    AfterUs.prototype.notif_cancelLastMoves = function (args) {
        var _a;
        this.getPlayerTable(args.playerId).setLine(args.line);
        this.notif_activatedEffect(args);
        if (args.removeLastTurn) {
            (_a = document.getElementById('last-round')) === null || _a === void 0 ? void 0 : _a.remove();
        }
    };
    AfterUs.prototype.notif_deckTopCard = function (args) {
        this.getPlayerTable(args.playerId).deckTopCard(args.card);
    };
    /**
     * Show last turn banner.
     */
    AfterUs.prototype.notif_lastTurn = function (animate) {
        if (animate === void 0) { animate = true; }
        dojo.place("<div id=\"last-round\">\n            <span class=\"last-round-text ".concat(animate ? 'animate' : '', "\">").concat(_("This is the final round!"), "</span>\n        </div>"), 'page-title');
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
                for (var property in args) {
                    if (['level', 'type', 'object'].includes(property) && args[property][0] != '<') {
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
