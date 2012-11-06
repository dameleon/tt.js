;(function(global, document, isArray, isNodeList) {
	'use strict';

	var NS = "tt",
        querySelectorRe = /^(.+[\#\.\s\[>:]|[\[:])/,
        loaded = false,
        queue = [];

    // Object.keys - MDN https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys#Compatiblity
    Object.keys || (Object.keys = function(){var e=Object.prototype.hasOwnProperty,f=!{toString:null}.propertyIsEnumerable("toString"),c="toString toLocaleString valueOf hasOwnProperty isPrototypeOf propertyIsEnumerable constructor".split(" "),g=c.length;return function(b){if("object"!==typeof b&&"function"!==typeof b||null===b)throw new TypeError("Object.keys called on non-object");var d=[],a;for(a in b)e.call(b,a)&&d.push(a);if(f)for(a=0;a<g;a++)e.call(b,c[a])&&d.push(c[a]);return d}}());

    document.addEventListener("DOMContentLoaded", function() {
        var i = 0, iz = queue.length;

        loaded = true;
        for (; i < iz; ++i) {
            queue[i]();
        }
    }, false);

	function tt(mix, parent) {
        var target = null;

        if (typeof mix === "string") {
            parent = parent || document;
            target = querySelectorRe.test(mix) ?
                        parent.querySelectorAll(mix) :
                     mix[0] === "#" ?
                        parent.getElementById(mix.substring(1, mix.length)) :
                     mix[0] === "." ?
                        parent.getElementsByClassName(mix.substring(1, mix.length)) :
                        parent.getElementsByTagName(mix);
        } else if (mix && (mix.nodeType === 1 ||
                           isNodeList(mix) ||
                           (isArray(mix) && mix[0].nodeType))) {

            target = mix;
        } else if (mix instanceof TT) {
            return mix;
        } else if (typeof mix === "function") {
            loaded ? mix() : queue.push(mix);
            return;
        }
        return new TT(target);
	}

    /**
     *
     * tt("pluginName", function() { // @arg this Object: ttObject
     *      // do something
     *      return this; // if you want continue prototype chain, must always return "this"
     * });
     *
     * tt("", {});
     * @throw Error: arguments error
     */
    tt.plugin = function(name, fn) {
        if (TT.prototype[name] ||
            typeof name !== "string" ||
            typeof fn !== "function" ||
            name.length === 0) {

            throw new TypeError("arguments error");
        }
        TT.prototype[name] = fn;
    }

    /**
     *
     * tt.isArray([]);
     * @return true
     *
     * tt.isArray(document.querySelectorAll(".hoge"));
     * @return false
     */
    tt.isArray = isArray;

    /**
     *
     * tt.isArray(document.querySelectorAll(".hoge"));
     * @return true
     *
     * tt.isNodeList([]);
     * @return false
     */
    tt.isNodeList = isNodeList;

    /**
     *
     * tt.each([1, 2, 3], function(value,   // @arg mix:    array value
     *                             index) { // @arg Number: array index
     *      // do something
     * });
     */
    tt.each = function(arr, fn) {
        var i = 0, iz = arr.length;

        for (; i < iz; ++i) {
            fn(arr[i], i);
        }
    }

    /**
     *
     * tt.match([1, 2, 3], function(value,   // @arg mix:    array value
     *                              index) { // @arg Number: array index
     *      if (value === 3) {
     *          return true;
     *      }
     *      return false;
     * });
     * @return Number: 3
     */
    tt.match = function(arr, fn) {
        var i = 0, iz = arr.length;

        for (; i < iz; ++i) {
            if (fn(arr[i], i)) {
                return arr[i];
            }
        }
        return null;
    };

    /**
     * var obj01 = { 0: "hoge", 1: "fuga" };
     * var obj02 = { 1: "piyo", 2: "foo" };
     *
     * tt.extend(obj01, obj02);
     * @return { 0: "hoge", 1: "piyo", 2: "foo" }
     */
    tt.extend = function() {
        var arg, args = arguments,
            i = 0, iz = args.length,
            res = {};

        for (; i < iz; ++i) {
            arg = args[i];
            if (!arg || typeof arg !== "object") {
                continue;
            }
            tt.each(Object.keys(arg), function(key, index) {
                res[key] = arg[key];
            });
        }

        return res;
    };

    /**
     * pull request from kyo-ago (twitter@kyo_ago)
     *
     * tt.query2object("hoge=huga&foo=bar");
     * @reutrn Object: { 'hoge' : 'huga', 'foo' : 'bar' }
     */
    tt.query2object = function(hash) {
        if (!hash) {
            return {};
        }
        var result = {},
            pair = hash.split('&'),
            i = 0, iz = pair.length;

        for (; i < iz; ++i) {
            var k_v = pair[i].split('=');

            result[k_v[0]] = k_v[1];
        }
        return result;
    };

    /**
     * pull request from kyo-ago (twitter@kyo_ago)
     *
     * tt.param({"hoge": "huga", "foo&bar": "kiyo&piyo"});
     * @reutrn String: "hoge=huga&foo%26bar=kiyo%26piyo"
     */
    tt.param = function(obj) {
        var key, keys = Object.keys(obj),
            i = 0, iz = keys.length,
            results = [];

        for (;i < iz; ++i) {
            key = keys[i];
            results.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
        }
        return results.join('&');
    };

    /**
     * pull request from kyo-ago (twitter@kyo_ago)
     *
     * tt.triggerEvent(HTMLElement, "Event", "originalEvent", false, true);
     * @effect firing "originalEvent" to HTMLElement
     */
    tt.triggerEvent = function(node, event, type, bubbles, cancelable) {
        if (!node) {
            return;
        }
        if (!event) {
            throw new Error('require event name');
        }
        if ('string' !== typeof type) {
            type = event;
            event = type === 'click' ? 'MouseEvents' : 'Event';
        }
        var ev = document.createEvent(event);

        ev.initEvent(type, bubbles || true, cancelable || true);
        node.dispatchEvent(ev);
    };

    /**
     *
     * tt.cssPrefix("box");
     * @return ["-webkit-box", "-moz-box", "-o-box", "-ms-box"];
     */
    tt.cssPrefix = function(value, prefix) {
        var res = [];

        prefix = prefix || ["webkit", "moz", "o", "ms"];
        tt.each(prefix, function(str, index) {
            res[index] = "-" + str + "-" + value;
        });
        return res;
    };

    /**
     *
     * tt.cssCamelizer("-webkit-tap-highlight-color");
     * @return String: "webkitTapHighlightColor"
     */
    tt.cssCamelizer = function(str) {
        if (typeof str !== "string") {
            throw new Error("arugment type error");
        }

        var res = "";

        if (str[0] === "-") {
            str = str.substr(1, str.length);
        }
        tt.each(str.split("-"), function(value, index) {
            var first;

            if (!index) {
                res += value;
                return;
            }
            first = value[0].toUpperCase();
            res += first + value.substr(1, value.length);
        });
        return res;
    };

    /**
     *
     * tt.cssHyphenizer("webkitTapHighlightColor");
     * @return String: "-webkit-tap-highlight-color"
     */
    tt.cssHyphenizer = function(str) {
        if (typeof str !== "string") {
            throw new Error("arugment type error");
        }

        var prefix = ["webkit", "moz", "o", "ms"],
            upperRe = /[A-Z]/g,
            upperStr = str.match(upperRe),
            res = "";

        tt.each(str.split(upperRe), function(value, index) {
            if (prefix.indexOf(value) > -1) {
                res += "-" + value;
                return;
            } else if (!index) {
                res += value;
                return;
            }
            res += ("-" + upperStr.shift().toLowerCase() + value);
        });
        return res;
    };

    /**
     *
     * tt(navigator);
     * @return Object: {android: bool, ios: bool .., }
     */
    tt.createEnvData = function(navigator) {
        var res = {},
            ua = navigator.userAgent.toLowerCase();

        res.android = /android/.test(ua);
        res.ios = /ip(hone|od|ad)/.test(ua);
        res.windowsPhone = /windows\sphone/.test(ua);
        res.chrome = /chrome/.test(ua);
        res.firefox = /firefox/.test(ua);
        res.opera = /opera/.test(ua);
        res.ie = /msie/.test(ua);
        res.androidBrowser = res.android && /applewebkit/.test(ua);
        res.mobileSafari = res.ios && /applewebkit/.test(ua);
        res.other = !(res.androidBrowser || res.mobileSafari || res.chrome || res.firefox || res.opera || res.ie);
        res.version =
            (res.androidBrowser || res.chrome) ? ua.match(/android\s(\S.*?)\;/) :
            res.mobileSafari ? ua.match(/os\s(\S.*?)\s/) :
            null;
        res.version = res.version && res.version[1];
        res.versionCode = _getVersionCode(res.version);

        return res;

        function _getVersionCode(version) {
            if (!version) {
                return null;
            }
            var res, digit = 4, diff = 0;

            version = version.replace(/\D/g, "");
            diff = digit - version.length;

            if (diff > 0) {
                res = (+version) * Math.pow(10, diff);
            } else if (diff < 0) {
                res = +(version.substr(0, digit));
            } else {
                res = +version;
            }
            return res;
        }
    }

    /**
     *
     * createEnvData() result object
     */
    tt.env = tt.createEnvData(global.navigator);


    function TT(node) {
        var i = 0, iz;

        this.nodes = [];
        this.stash = {};
        this.length = 0;
        if (node) {
            if (node.nodeType) {
                this.nodes[0] = node;
                this.length = 1;
            } else {
                iz = this.length = node.length;
                for (; i < iz; ++i) {
                    this.nodes[i] = node[i];
                }
            }
        }
        return this;
    }

    TT.prototype = {
        constructor: TT,

        /**
         * <div id="first" class="hoge"></div>
         * <div id="second" class="hoge"></div>
         *
         * tt(".hoge").get();
         * @return HTMLDivElement: div#first
         *
         * tt(".hoge").get(1);
         * @return HTMLDivElement: div#second
         */
        get: function(index) {
            return this.nodes[index || 0];
        },

        /**
         * <div class="hoge"></div>
         * <div class="hoge"></div>
         *
         *  tt(".hoge").toArray();
         *  @return Array: [HTMLDivElement, HTMLDivElement] (nodeList like array)
         */
        toArray: function() {
            return this.nodes;
        },

        /**
         * <div class="hoge"></div>
         *
         * tt(".hoge").each(function(node,    // HTMLElement: search result element
         *                           index) { // Number:      array index
         *      // do something
         * });
         * @return Object: ttObject
         */
        each: function(fn) {
            var i = 0, iz = this.length;

            for (; i < iz; ++i) {
                fn.call(this.nodes[i], i);
            }
            return this;
        },

        /**
         * <div class="hoge"></div>
         *
         * tt(".hoge").match(function(node,    // HTMLElement: search result element
         *                            index) { // Number:      array index
         *      if (node === something) {
         *          return true;
         *      }
         *      return false;
         * });
         * @return HTMLElement: something to match element
         */
        match: function(fn) {
            var i = 0, iz = this.length;

            for (; i < iz; ++i) {
                if (fn.call(this.nodes[i], i)) {
                    return this.nodes[i];
                }
            }
            return null;
        },

        /**
         * <div class="hoge"></div>
         *
         * tt(".hoge").on("click", function(event) {}, useCapture);
         * @return Object: ttObject
         */
        on: function(type, mix, capture) {
            capture = capture || false;
            this.each(function() {
                this.addEventListener(type, mix, capture);
            }, true);
            return this;
        },

        /**
         * <div class="hoge"></div>
         *
         * tt(".hoge").off("click", eventFunction);
         * @return Object: ttObject
         */
        off: function(type, mix) {
            this.each(function() {
                this.removeEventListener(type, mix);
            }, true);
            return this;
        },

        /**
         * <div class="hoge"></div>
         *
         * tt(".hoge").addClass("fuga");
         * @effect <div class="hoge fuga"></div>
         * @return Object: ttObject
         */
        addClass:
            ((tt.env.android && tt.env.versionCode < 3000) ||
             (tt.env.ios && tt.env.versionCode < 5000) ||
             (tt.env.opera)) ?
                _addClassByClassName :
                _addClassByClassList,

        /**
         * <div class="hoge fuga"></div>
         *
         * tt(".hoge").removeClass("fuga");
         * @effect <div class="hoge"></div>
         * @return Object: ttObject
         */
        removeClass:
            ((tt.env.android && tt.env.versionCode < 3000) ||
             (tt.env.ios && tt.env.versionCode < 5000) ||
             (tt.env.opera)) ?
                _removeClassByClassName :
                _removeClassByClassList,

        /**
         * <div class="hoge"></div>
         *
         * tt(".hoge").hasClass("hoge");
         * @return Bool: true
         */
        hasClass:
            ((tt.env.android && tt.env.versionCode < 3000) ||
             (tt.env.ios && tt.env.versionCode < 5000) ||
             (tt.env.opera)) ?
                _hasClassByClassName :
                _hasClassByClassList,

        /**
         * <div class="hoge"></div>
         *
         * tt(".hoge").toggleClass("hoge");
         * @effect <div class=""></div>
         * @return Object: ttObject
         *
         * tt(".hoge").toggleClass("fuga");
         * @effect <div class="hoge fuga"></div>
         */
        toggleClass: function(className, strict) {
            var self = this;

            strict ? _strictToggle() : _simpleToggle();
            return this;

            function _strictToggle() {
                self.each(function() {
                    var ttObj = tt(this);

                    ttObj.hasClass(className) ?
                        ttObj.removeClass(className) :
                        ttObj.addClass(className);
                });
            }

            function _simpleToggle() {
                if (tt(self.nodes[0]).hasClass(className)) {
                    self.removeClass(className);
                } else {
                    self.addClass(className);
                }
            }
        },

        /**
         * <div class="hoge"><div class="fuga"></div></div>
         *
         * tt("hoge").find("fuga");
         * @return Object: ttObject
         */
        find: function(query) {
            var res = [];

            this.each(function() {
                res = res.concat(tt(query, this).toArray());
            });
            return tt(res);
        },

        /**
         *
         * ## sample
         * <div hoge="fuga"></div>
         *
         * tt("div").attr("hoge");
         * @return String: "fuga"
         *
         * tt("div").attr("hoge", "piyo");
         * @effect <div hoge="piyo"></div>
         * @return Object: ttObject
         *
         * tt("div").attr("hoge", "");
         * @effect <div></div>
         * @return Object: ttObject
         *
         * tt("div").attr({hoge: "bar", fuga: "baz"});
         * @effect <div hoge="bar" fuga="baz"></div>
         * @return Object: ttObject
         */
        attr: function(mix, value) {
            var self = this, key;

            switch (arguments.length) {
            case 1:
                if (typeof mix === "object") {
                    for (key in mix) {
                        _setAttr(key, mix[key]);
                    }
                    break;
                } else {
                    return this.nodes[0].getAttribute(mix);
                }
            case 2:
                _setAttr(mix, value);
                break;
            }
            return this;

            function _setAttr(key, value) {
                if (value === undefined || value === null) {
                    value = "";
                }
                self.each(function() {
                    if (value === "") {
                        this.removeAttribute(key);
                        return;
                    }
                    this.setAttribute(key, value);
                });
            }
        },

        /**
         * <div class="hoge">anything</div>
         *
         * tt(".hoge").html("something");
         * @effect <div class="hoge">something</div>
         *
         * tt(".hoge").html("something", "afterend");
         * @effect <div class="hoge">anything</div>something
         *
         * tt(".hoge").html(HTMLDivElement);
         * @effect <div class="hoge"><div></div></div>
         * @see    ttObject.add
         */
        html: function(mix) {
            if (mix && mix.nodeType) {
                this.each(function() {
                    _clearNode(this);
                    this.appendChild(mix);
                });
                return this;
            }

            this.each(function() {
                _clearNode(this);
                this.insertAdjacentHTML("beforeend", mix);
            });
            return this;

            function _clearNode(node) {
                while (node.firstChild) {
                    node.removeChild(node.firstChild);
                }
            }
        },

        /**
         * <div class="hoge"></div>
         *
         * tt(".hoge").add(HTMLDivElement);
         * @effect <div class="hoge"><div></div></div>
         */
        add: function(mix) {
            if (typeof mix === "string") {
                this.each(function() {
                    this.insertAdjacentHTML("beforeend", mix);
                });
                return this;
            }

            this.each(function() {
                this.appendChild(mix);
            });
            return this;
        },

        /**
         * <div class="hoge"><div class="fuga"></div></div>
         *
         * tt(".fuga").remove();
         * @effect <div class="hoge"></div>
         */
        remove: function() {
            this.each(function() {
                this.parentNode.removeChild(this);
            });
            return this;
        },

        /**
         * <div class="hoge">something</div>
         *
         * tt(".fuga").clear();
         * @effect <div class="hoge"></div>
         */
        clear: function() {
            this.each(function() {
                while (this.firstChild) {
                    this.removeChild(this.firstChild);
                }
            });
            return this;
        },

        /**
         * <div class="hoge" style="display:block;"></div>
         *
         * tt(".hoge").css("display");
         * @return String: "block" CSS value
         *
         * tt(".hoge").css("display", "none");
         * @effect <div class="hoge" style="display:none;"></div>
         *
         * tt(".hoge").css({ "display": "none", "visibility": "hidden" [, "CSS property": "CSS value"] });
         * @effect <div class="hoge" style="display:none;visibility:hidden;"></div>
         */
        css: function(mix, value) {
            var prop, val,
                self = this,
                css = "";

            if (typeof mix === "object") {
                for (prop in mix) {
                    if (mix[prop] === "") {
                        _removeProperty(prop);
                        continue;
                    }
                    _setStyle(tt.cssCamelizer(prop), mix[prop]);
                }
            } else {
                if (value) {
                    _setStyle(tt.cssCamelizer(mix), value);
                } else if (value === "") {
                    _removeProperty(mix);
                } else {
                    return global.getComputedStyle(this.nodes[0]).getPropertyValue(mix);
                }
            }

            return this;

            function _removeProperty(prop) {
                self.each(function() {
                    this.style.removeProperty(prop);
                });
            }

            function _setStyle(prop, val) {
                self.each(function() {
                    this.style[prop] = val;
                });
            }
        },

        /**
         * <div data-hoge="fuga"></div>
         *
         * tt(mix).data();
         * @return Object: {hoge: "fuga"} dataset attributes object
         *
         * tt(mix).data("hoge");
         * @return String: "fuga"
         *
         * tt(mix).data("hoge", "fugafuga");
         * @effect <div data-hoge="fugafuga"></div>
         * @return Object: ttObject
         *
         * tt(mix).data("hoge", "");
         * @effect <div></div>
         * @return Object: ttObject
         *
         * tt(mix).data({ "hoge": "fugafuga", "piyo": "zonu" });
         * @effect <div data-hoge="fugafuga" data-piyo="zonu"></div>
         * @return Object: ttObject
         */
        data: function() {
            var self = this,
                args = arguments,
                data = {},
                useCompatible = ((tt.env.android && tt.env.versionCode < 3000) || (tt.env.ios && tt.env.versionCode < 5000) || (tt.env.opera));

            switch (args.length) {
            case 0:
                return useCompatible ?
                            _getAttrByAttributes() :
                            _getAttrByDataSet();
            case 1:
                if (typeof args[0] === "object") {
                    useCompatible ?
                        _setAttrByAttributes(args[0]) :
                        _setAttrByDataSet(args[0]);
                    return this;
                } else {
                    return useCompatible ?
                                _getAttrByAttributes(args[0]) :
                                _getAttrByDataSet(args[0]);
                }
            case 2:
                data[args[0]] = args[1];
                useCompatible ?
                    _setAttrByAttributes(data) :
                    _setAttrByDataSet(data);
                return this;
            }

            function _getAttrByDataSet(name) {
                return name ? self.nodes[0].dataset[name] : self.nodes[0].dataset;
            }

            function _getAttrByAttributes(name) {
                var res = {},
                    node = self.nodes[0],
                    attr, attrs = node.attributes,
                    dataName = "data-",
                    i = 0, iz = attrs.length;

                name && (dataName += name);
                for (; i < iz; ++i) {
                    attr = attrs[i].name;
                    if (attr.indexOf(dataName) > -1) {
                        res[attr.substr(5, attr.length)] = node.getAttribute(attr);
                    }
                }
                return name ? res[name] : res;
            }

            function _setAttrByDataSet(obj) {
                var name;

                for (name in obj) {
                    self.each(function() {
                        var value = obj[name];

                        if (value === "") {
                            delete this.dataset[name];
                            return;
                        }
                        this.dataset[name] = value;
                    });
                }
            }

            function _setAttrByAttributes(obj) {
                var name, value;

                for (name in obj) {
                    self.attr("data-" + name, obj[name]);
                }
            }
        },

        /**
         * <div class="hoge" style="display:none;"></div>
         *
         * tt(".hoge").show();
         * @effect <div class="hoge" style="display:block;"></div>
         * @return Object: ttObject
         */
        show: function(value) {
            var computedStyle = this.css("display"),
                stashedStyle = this.stash["display"];

            if (stashedStyle) {
                delete this.stash["display"];
            }
            if (computedStyle !== "none") {
                return this;
            }
            return this.css("display", value || stashedStyle || "block");
        },

        /**
         * <div class="hoge"></div>
         *
         * tt(".hoge").hide();
         * @effect <div class="hoge" style="display:none;"></div>
         * @return Object: ttObject
         */
        hide: function() {
            var computedStyle = this.css("display");

            if (computedStyle !== "none") {
                this.stash["display"] = computedStyle;
            } else {
                return this;
            }
            return this.css('display', 'none');
        },

        /**
         * <div class="hoge"></div>
         *
         * tt(".hoge").trigger("Event", "ontrigger", false, true);
         * @return Object: ttObject
         */
        trigger: function(event, type, bubbles, cancelable) {
            this.each(function() {
                tt.triggerEvent(this, event, type, bubbles, cancelable);
            });
            return this;
        },

        /**
         *
         * <div class="hoge"><div class="fuga"></div></div>
         *
         * tt(".fuga").replace("<div class="piyo"></div>");
         * @effect <div class="hoge"><div class="piyo"></div></div>
         * @return Object: ttObject
         *
         *
         */
        replace: function(mix) {
            var fn = null;

            if (mix && mix.nodeType) {
                fn = _insertNode;
            } else if (typeof mix === "string") {
                fn = _insertHTML;
            }
            fn && this.each(fn).remove();
            return this;

            function _insertNode() {
                this.parentNode && this.parentNode.insertBefore(mix, this);
            }

            function _insertHTML() {
                this.insertAdjacentHTML("beforebegin", mix);
            }
        },

        /**
         *  document.body
         *  +--------------------------
         *  |             |
         *  |            top
         *  |             v
         *  | -- left --> +----------+
         *  |             | div#hoge |
         *  |             +----------+
         *  |
         *
         * <div id="hoge" class="fuga"></div>
         * <div class="fuga"></div>
         *
         * tt("#hoge").offset();
         * @return Object: { left: Number, top: Number }
         *
         * tt(".fuga").offset();
         * @return Array: [{ left: Number, top: Number }, { left: Number, top: Number }]
         */
        offset: function() {
            var res = [];

            this.each(function(index) {
                var offset = this.getBoundingClientRect();

                res[index] = {
                    left: offset.left + global.pageXOffset,
                    top: offset.top + global.pageYOffset
                };
            });
            return this.length === 1 ? res[0] : res;
        }
    };

    /**
     * Alias to on, off method
     */
    TT.prototype.bind = TT.prototype.on;
    TT.prototype.unbind = TT.prototype.off;


    function _addClassByClassList(className) {
        this.each(function(index) {
            this.classList.add(className);
        });
        return this;
    }

    function _addClassByClassName(className) {
        var stashName = this.nodes[0].className,
            newName = _createName(stashName, className);

        this.each(function(index) {
            if (tt(this).hasClass(className)) {
                return;
            }
            if (index && stashName !== this.className) {
                stashName = this.className;
                newName = _createName(stashName, className);
            }
            this.className = newName;
        });
        return this;

        function _createName(currentName, newName) {
            var res = currentName.split(" ");

            res[res.length] = newName;
            return res.join(" ");
        }
    }

    function _removeClassByClassList(className) {
        this.each(function() {
            this.classList.remove(className);
        });
        return this;
    }

    function _removeClassByClassName(className) {
        this.each(function() {
            this.className = this.className.replace(className ,"");
        });
        return this;
    }

    function _hasClassByClassList(className) {
        var res;

        className = className.trim();
        res = this.match(function() {
            return this.classList.contains(className);
        });
        return res ? true : false;
    }

    function _hasClassByClassName(className) {
        var res;

        className = className.trim();
        res = this.match(function() {
            return (" " + this.className + " ").indexOf(" " + className + " ") > -1;
        });
        return res ? true : false;
    }

    global[NS] = global[NS] || tt;
})(
    this,
    document,
    Array.isArray ||
    function(target) {
        return Object.prototype.toString.call(target) === "[object Array]";
    },
    function(target) {
        return Object.prototype.toString.call(target) === "[object NodeList]";
    }
);
