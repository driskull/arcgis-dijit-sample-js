// http://dojotoolkit.org/reference-guide/1.9/quickstart/writingWidgets.html
define([
    // For emitting events
    "dojo/Evented",

    // needed to create a class
    "dojo/_base/declare",
    "dojo/_base/lang",

    // widget class
    "dijit/_WidgetBase",

    // accessibility click
    "dijit/a11yclick",

    // templated widget
    "dijit/_TemplatedMixin",

    // handle events
    "dojo/on",

    // load template
    "dojo/text!application/templates/FullScreenMap.html",

    // localization
    "dojo/i18n!application/nls/FullScreenMap",

    // dom manipulation
    "dojo/dom-style",
    "dojo/dom-class",
    "dojo/dom-attr",

    // wait for dom to be ready
    "dojo/domReady!"
],
    function (
        // make sure these are arranged in the same order as above
        Evented,
        declare, lang,
        _WidgetBase, a11yclick, _TemplatedMixin,
        on,
        dijitTemplate,
        i18n,
        domStyle, domClass, domAttr
    ) {
    return declare("modules.FullScreenMap", [_WidgetBase, _TemplatedMixin, Evented], {
        // my html template string
        templateString: dijitTemplate,

        // default options
        options: {
            map: null,
            visible: true,
            container: null
        },

        // lifecycle: 1
        constructor: function (options, srcRefNode) {
            // css classes
            this.css = {
                fs: "fs",
                toggle: "toggle",
                exit: "exit",
                enter: "enter"
            };
            // language
            this._i18n = i18n;
            // mix in settings and defaults
            var defaults = lang.mixin({}, this.options, options);
            // widget node
            this.domNode = srcRefNode;
            // set map property
            this.set("map", defaults.map);
            this.set("visible", defaults.visible);
            this.set("container", defaults.container);
            // watch for changes
            this.watch("visible", this._visible);
        },
        // _TemplatedMixin implements buildRendering() for you. Use this to override
        // buildRendering: function() {},
        // called after buildRendering() is finished
        postCreate: function () {
            // own this accessible click event button
            this.own(on(this.buttonNode, a11yclick, lang.hitch(this, this.toggle)));
        },
        // start widget. called by user
        startup: function () {
            // set visibility
            this._visible();
            // map not defined
            if (!this.get("map")) {
                console.log("map required");
                this.destroy();
                return;
            }
            if (!this.get("container")) {
                this.set("container", this.map.container);
            }
            // when map is loaded
            if (this.map.loaded) {
                this._init();
            } else {
                on.once(this.map, "load", lang.hitch(this, function () {
                    this._init();
                }));
            }
        },
        // connections/subscriptions will be cleaned up during the destroy() lifecycle phase
        destroy: function () {
            this.inherited(arguments);
        },
        show: function () {
            this.set("visible", true);
        },
        hide: function () {
            this.set("visible", false);
        },
        /* ---------------- */
        /* Public Functions */
        /* ---------------- */
        toggle: function () {
            this._toggleFullscreen();
        },
        refresh: function () {
            var w, h;
            // determine fullscreen state
            var state = false;
            // container node
            var container = this.get("container");
            // if an element is fullscreen
            if (
                document.fullscreenElement ||
                document.mozFullScreenElement ||
                document.webkitFullscreenElement ||
                document.msFullscreenElement
            ) {
                state = true;
            }
            // set fullscreen status
            this.set("fullscreen", state);
            // if fullscreen is set
            if (state) {
                w = "100%";
                h = "100%";
                domClass.add(this.buttonNode, this.css.exit);
                domClass.remove(this.buttonNode, this.css.enter);
                domAttr.set(this.buttonNode, "title", this._i18n.exit);
            } else {
                w = "";
                h = "";
                domClass.add(this.buttonNode, this.css.enter);
                domClass.remove(this.buttonNode, this.css.exit);
                domAttr.set(this.buttonNode, "title", this._i18n.enter);
            }
            // set map width and height
            domStyle.set(container, {
                width: w,
                height: h
            });
            // resize map
            this.map.resize();
        },
        /* ---------------- */
        /* Private Functions */
        /* ---------------- */
        _init: function () {
            // fullscreeen change event
            var evtName;
            // node to put into fullscreen
            var node = this.get("container");
            // enter/exit fullscreen event
            if (node.requestFullscreen) {
                evtName = "fullscreenchange";
            } else if (node.mozRequestFullScreen) {
                evtName = "mozfullscreenchange";
            } else if (node.webkitRequestFullScreen) {
                evtName = "webkitfullscreenchange";
            } else if (node.msRequestFullscreen) {
                evtName = "msfullscreenchange";
            }
            if (evtName) {
                this.own(on(document, evtName, lang.hitch(this, this.refresh)));
            }
            this.set("loaded", true);
            // emit event
            this.emit("load", {});
        },
        _visible: function () {
            if (this.get("visible")) {
                domStyle.set(this.domNode, "display", "block");
            } else {
                domStyle.set(this.domNode, "display", "none");
            }
        },
        _toggleFullscreen: function () {
            if (this.get("fullscreen")) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            } else {
                var node = this.get("container");
                if (node.requestFullscreen) {
                    node.requestFullscreen();
                } else if (node.mozRequestFullScreen) {
                    node.mozRequestFullScreen();
                } else if (node.webkitRequestFullScreen) {
                    node.webkitRequestFullScreen();
                } else if (node.msRequestFullScreen) {
                    node.msRequestFullScreens();
                }
            }
        }
    });
});