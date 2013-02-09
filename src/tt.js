/** "tt.js" -Highspeed SelectorBased Library- author: Kei Takahashi(twitter@damele0n, mail:dameleon[at]gmail.com) license: MIT */
;(function(global, document, isArray, isNodeList, undefined) {
	'use strict';

	var NS = "tt",
        querySelectorRe = /^(.+[\#\.\s\[>:,]|[\[:])/,
        loaded = false,
        queue = [];

    // Object.keys - MDN https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys#Compatiblity
    Object.keys || (Object.keys = function(){var e=Object.prototype.hasOwnProperty,f=!{toString:null}.propertyIsEnumerable("toString"),c="toString toLocaleString valueOf hasOwnProperty isPrototypeOf propertyIsEnumerable constructor".split(" "),g=c.length;return function(b){if("object"!==typeof b&&"function"!==typeof b||null===b)throw new TypeError("Object.keys called on non-object");var d=[],a;for(a in b)e.call(b,a)&&d.push(a);if(f)for(a=0;a<g;a++)e.call(b,c[a])&&d.push(c[a]);return d}}());

    document.addEventListener("DOMContentLoaded", function() {
        loaded = true;

        for (var i = 0, iz = queue.length; i < iz; ++i) {
            queue[i]();
        }
    }, false);

    /**
     * Search HTMLElement based on the QueryString, to generate the object "TT"
     *
     * Register functions to be executed immediately after the timing or DOMContentLoaded
     *
     * @name tt
     * @namespace tt
     * @function
     * @param {(String|HTMLElement|Function)} mix
     * @param {HTMLElement} parent
     * @return TT typed Object {Object}
     * @example
     * // Search with getElementById
     * tt("#id");
     *
     * // Search with getElementsByClassName
     * tt(".className");
     *
     * // Search with getElementsByTagName
     * tt("tagName");
     *
     * // Search with querySelectorAll
     * tt("#id > .className[attr=hoge]");
     *
     * // Search with className and parent element
     * // (Recommended way is to use the querySelectorAll with "#id .className")
     * var base = document.getElementById("id");
     * tt(".className", base);
     *
     * @example
     * // Register functions
     * tt(function() {
     *     // Be run immediately or later timing, DOMContentLoaded
     * });
     */
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
                           (isArray(mix) && mix[0] && mix[0].nodeType))) {

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
     * To register the property method for "TT object" (It acts like the defineProperty)
     *
     * It is not possible to override the property existing methods
     *
     * @name plugin
     * @memberof tt
     * @function
     * @param {String} name
     * @param {Function} fn
     * @example
     * tt("pluginName", function() {
     *      // In this function refers to the object itself TT
     *      // if you want continue prototype chain, must always return this
     *      return this;
     * });
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
     * Determination of the Array type
     *
     * @name isArray
     * @memberof tt
     * @function
     * @param {any type} mix
     * @return {Bool} bool
     * @example
     * tt.isArray([]);
     * // return true
     *
     * tt.isArray({});
     * // return false
     */
    tt.isArray = isArray;

    /**
     * Determination of the NodeList
     *
     * @name isNodeList
     * @memberof tt
     * @function
     * @param {any type} mix
     * @return {Bool} bool
     * @example
     * var elements = document.querySelectorAll(".className");
     *
     * tt.isNodeList(elements);
     * // return true
     *
     * tt.isNodeList([]);
     * // return false
     */
    tt.isNodeList = isNodeList;

    /**
     * Passed to the function the elements of an array or object
     *
     * @name each
     * @memberof tt
     * @function
     * @param {(Array|Object)} mix
     * @param {Function} fn
     * @example
     * tt.each([1, 2, 3], function(value, // The value of the element
     *                             key) { // Key name or index of the element
     * });
     */
    tt.each = function(mix, fn) {
        var arr, key,
            i = 0, iz;

        if (isArray(mix)) {
            iz = mix.length;
            for (; i < iz; ++i) {
                fn(mix[i], i);
            }
        } else if (typeof mix === "object") {
            arr = Object.keys(mix);
            iz = arr.length;
            for (; i < iz; ++i) {
                key = arr[i];
                fn(key, mix[key]);
            }
        }
    }

    /**
     * Result of passing the elements of an array or object to the function
     * which returns the element itself is returned true
     *
     * @name match
     * @memberof tt
     * @function
     * @param {(Array|Object)} mix
     * @param {Function} fn
     * @return {any type} One element in the parameter passed
     * @example
     * tt.match([1, 2, 3], function(value,   // The value of the element
     *                              index) { // Key name or index of the element
     *      if (value === 3) {
     *          return true;
     *      }
     *      return false;
     * });
     * // return Number: 3
     */
    tt.match = function(mix, fn) {
        var arr,
            key, res = {},
            i = 0, iz;

        if (isArray(mix)) {
            iz = mix.length;
            for (; i < iz; ++i) {
                if (fn(mix[i], i)) {
                    return mix[i];
                }
            }
        } else if (typeof mix === "object") {
            arr = Object.keys(mix);
            iz = arr.length;
            for (; i < iz; ++i) {
                key = arr[i];
                if (fn(key, mix[key], i)) {
                    res[key] = mix[key];
                    return res;
                }
            }
        }
        return null;
    };

    /**
     * Extend object
     *
     * @name extend
     * @memberof tt
     * @function
     * @param {Object} object
     * @return {Object} object
     * @example
     * var obj01 = { 0: "hoge", 1: "fuga" };
     * var obj02 = { 1: "piyo", 2: "foo" };
     *
     * tt.extend(obj01, obj02);
     * // return { 0: "hoge", 1: "piyo", 2: "foo" }
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
     * Returned in the form of a URL query parameter object
     *
     * pull request from kyo-ago (twitter@kyo_ago)
     *
     * @name query2object
     * @memberof tt
     * @function
     * @param {String} hash
     * @return {Object} object
     * @example
     * tt.query2object("hoge=huga&foo=bar");
     * // return Object: { 'hoge' : 'huga', 'foo' : 'bar' }
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
     * URL query parameters returned in the form of an object
     *
     * pull request from kyo-ago (twitter@kyo_ago)
     *
     * @name param
     * @memberof tt
     * @function
     * @param {Object} object
     * @return {String} string
     * @example
     * tt.param({"hoge": "huga", "foo&bar": "kiyo&piyo"});
     * // reutrn String: "hoge=huga&foo%26bar=kiyo%26piyo"
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
     * Fire an event for the specified element
     *
     * pull request from kyo-ago (twitter@kyo_ago)
     *
     * @name triggerEvent
     * @memberof tt
     * @function
     * @param {HTMLElement} node
     * @param {String} event
     * @param {String} type
     * @param {Bool} bubbles
     * @param {Bool} cancelable
     * @example
     * tt.triggerEvent(HTMLElement, "Event", "originalEvent", false, true);
     * // firing "originalEvent" to HTMLElement
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
     * Returns an array of the result of adding a prefix for the CSS string
     *
     * @name cssPrefix
     * @memberof tt
     * @function
     * @param {String} value
     * @param {Array} prefix
     * @return {Array} array
     * @example
     * tt.cssPrefix("box");
     * // return ["-webkit-box", "-moz-box", "-o-box", "-ms-box"]
     * @example
     * tt.cssPrefix("box", ["webkit", "khtml"]);
     * // return ["-webkit-box", "-khtml-box",]
     */
    tt.cssPrefix = function(value, prefix) {
        var res = [];

        prefix = prefix || ["webkit", "moz", "o", "ms", "khtml"];
        tt.each(prefix, function(str, index) {
            res[index] = "-" + str + "-" + value;
        });
        return res;
    };

    /**
     * Returns a camel case string of CSS hyphen Case
     *
     * @name cssCamelizer
     * @memberof tt
     * @function
     * @param {String} str
     * @return {String} string
     * @example
     * tt.cssCamelizer("-webkit-tap-highlight-color");
     * // return String: "webkitTapHighlightColor"
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
            if (!index) {
                res += value;
                return;
            }
            res += value[0].toUpperCase() + value.substr(1, value.length);
        });
        return res;
    };

    /**
     * Returns a string CSS hyphen case of Camel Case
     *
     * @name cssHyphenizer
     * @memberof tt
     * @function
     * @param {String} str
     * @return {String} string
     * @example
     * tt.cssHyphenizer("webkitTapHighlightColor");
     * // return String: "-webkit-tap-highlight-color"
     */
    tt.cssHyphenizer = function(str) {
        if (typeof str !== "string") {
            throw new Error("arugment type error");
        }
        var prefix = ["webkit", "moz", "o", "ms", "khtml"],
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
     * Create new Element
     *
     * @name tag
     * @memberof tt
     * @function
     * @param {String} element tag name string
     * @param {Bool}   if is true, return raw element
     * @return
     * @example
     * tt.tag("div");
     * // return Object: HTMLDivElement in tt object
     * tt.tag("div", true);
     * // return HTMLElement: div element
     */
    tt.tag = function(name, raw) {
        if (typeof name !== "string") {
            throw new Error("argument type error");
        }
        var tag = document.createElement(name);

        return raw ? tag : tt(tag) ;
    }

    /**
     * Create an object of environmental information based on the information of the navigator
     *
     * Environmental information can be obtained based on the following key
     *
     * Decision os:         ios, android, windowsPhone
     *
     * Decision browsers:   mobileSafari, androidBrowser, chrome, firefox, opera, ie, other
     *
     * version information: (only mobileSafari androidBrowser)
     *
     *                      version(raw data)
     *
     *                      versionCode(version number of the 5-digit)
     *
     * @name createEnvData
     * @memberof tt
     * @function
     * @param {window.navigator} navigator
     * @return {Object} object
     * @example
     * tt.createEnvData(window.navigator);
     * // return Object: {android: bool, ios: bool .., }
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
        res.isCompatible = res.android && res.versionCode < 3000 ||
                           res.ios && res.versionCode < 5000 ||
                           res.opera;

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
     * Object that contains the result of generating the tt.createEnvData
     * @memberof tt
     * @member
     * @see tt.createEnvData
     */
    tt.env = tt.createEnvData(global.navigator);

    /**
     * Constructor of TT Object
     *
     * Creates and returns an object based on HTMLElement or NodeList
     *
     * @name TT
     * @namespace TT
     * @constructor TT
     * @param {HTMLElement|NodeList|NodeList typed Array} node
     * @property {Array} nodes Search result nodes
     * @property {Object} stash temporary data
     * @property {Number} length Search result nodes length
     * @return {Object} TT Object
     */
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
        // Inheritance of prototype object to the correct
        constructor: TT,

        /**
         * Gets the element that has been registered
         *
         * @name get
         * @memberof TT
         * @function
         * @param {Number} element index
         * @return {(HTMLElement|undefined)}
         * @example
         * tt(".hoge").get();
         * // return HTMLElement: return first element
         *
         * tt(".hoge").get(2);
         * // return HTMLElement: return second element
         */
        get: function(index) {
            return this.nodes[index || 0];
        },

        /**
         * Gets an array of the elements that have been registered
         *
         * @name toArray
         * @memberof TT
         * @function
         * @return {Array} elements array
         * @example
         * tt(".hoge").toArray();
         * // return Array: [HTMLElement, HTMLElement] (like NodeList type Array)
         */
        toArray: function() {
            return this.nodes;
        },

        /**
         * The elements that were passed to the function registered to perform
         *
         * @name each
         * @memberof TT
         * @function
         * @param {Function}
         * @return {Object} TT object
         * @example
         * tt(".hoge").each(function(index) { // @args {Number} index: array index
         *                                    // @args {HTMLElement} this: "this" in a function that was registered HTMLElement
         *      if (this.nodeName.toLowerCase() === "div") {
         *          tt(this).html("hogehoge");
         *      }
         * });
         */
        each: function(fn) {
            var i = 0, iz = this.length;

            for (; i < iz; ++i) {
                fn.call(this.nodes[i], i);
            }
            return this;
        },

        /**
         * Return the element that was true based on the results of the elements
         *
         * that were passed to the function is registered and run
         *
         * @name match
         * @memberof TT
         * @function
         * @param {function}
         * @return {(HTMLElement|Null)}
         * @example
         * tt(".hoge").match(function(index) // @args {Number} index: array index
         *                                   // @args {HTMLElement} this: "this" in a function that was registered HTMLElement
         *      if (this.nodeName.toLowerCase() === "div") {
         *          return true;
         *      }
         *      return false;
         * }); // return {HTMLElement} match element
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
         * To register an event on elements
         *
         * @name on
         * @memberof TT
         * @function
         * @param {String} type event type
         * @param {Function|Object} mix Object or function to register
         * @param {Bool} capture useCapture boolean
         * @return {Object} TT object
         * @example
         * tt(".hoge").on("click", function(event) {
         *      var target = tt(event.currentTarget);
         *
         *      target.addClass("selected");
         * }, false);
         */
        on: function(type, mix, capture) {
            capture = capture || false;
            this.each(function() {
                this.addEventListener(type, mix, capture);
            }, true);
            return this;
        },

        /**
         * To delete an event that you registered
         *
         * @name off
         * @memberof TT
         * @function
         * @param {String} type event type
         * @param {Function|Object} mix Function or object, registered
         * @return {Object} TT Object
         * @example
         * tt(".hoge").off("click", fn);
         */
        off: function(type, mix) {
            this.each(function() {
                this.removeEventListener(type, mix);
            }, true);
            return this;
        },

        /**
         * Add the ClassName for the elements that have been registered
         *
         * @name addClass
         * @memberof TT
         * @function
         * @param {String} className className to add
         * @return {Object} TT Object
         * @example
         * tt(".hoge").addClass("fuga");
         */
        addClass: _tt_addclass(),

        /**
         * Remove the ClassName for the elements that have been registered
         *
         * @name removeClass
         * @memberof TT
         * @function
         * @param {String} className remove className to delete
         * @return {Object} TT Object
         * @example
         * tt(".hoge").removeClass("hoge");
         */
        removeClass: _tt_removeclass(),

        /**
         * Search for an element with a classname in the elements that have been registered
         *
         * @name hasClass
         * @memberof TT
         * @function
         * @param {String} className className to search
         * @return {Bool}
         * @example
         * tt(".hoge").hasClass("fuga");
         */
        hasClass: _tt_hasclass(),

        /**
         * Add or remove a classname of the elements that have been registered
         *
         * Performed against className investigation of one single element, in strict mode is inverted
         *
         * @name toggleClass
         * @memberof TT
         * @function
         * @param {String} className className to toggle
         * @param {Bool} strict
         * @return {Object} TT Object
         * @example
         * tt(".hoge").toggleClass("hoge");
         */
        toggleClass: function(className, strict) {
            if (strict) {
                this.each(function() {
                    var ttObj = tt(this);

                    ttObj.hasClass(className) ? ttObj.removeClass(className) : ttObj.addClass(className);
                });
            } else {
                tt(this.nodes[0]).hasClass(className) ?
                    this.removeClass(className) :
                    this.addClass(className);
            }
            return this;
        },

        /**
         * Gets a specified element from the following elements are registered
         *
         * @name find
         * @memberof TT
         * @function
         * @param {String} QueryString
         * @return {Object} TT Object
         * @example
         * tt("hoge").find("fuga");
         */
        find: function(query) {
            var res = [];

            this.each(function() {
                res = res.concat(tt(query, this).toArray());
            });
            return tt(res);
        },

        /**
         * Gets the element that contains the specified elements of the following elements that are registered
         *
         * @name contains
         * @memberof TT
         * @function
         * @param {String|Element|NodeList|NodeList type Array} mix
         * @return {Element|Null}
         * @example
         * tt(".hoge").contains(".fuga");
         */
        contains: function(mix) {
            var res, target = tt(mix);

            res = this.match(function() {
                var parent = this,
                    match = target.match(function() {
                        var pos = parent.compareDocumentPosition(this);

                        return (pos === 0 || (pos & Node.DOCUMENT_POSITION_CONTAINED_BY)) ?
                                    true :
                                    false;
                    });

                return match ? true : false;
            });
            return res;
        },

        /**
         * Set or get the attributes of the elements that have been registered
         *
         * @name attr
         * @memberof TT
         * @function
         * @param {String|Object} mix Search or set attribute key name, Set object data
         * @param {String|Number} value Set attribute value
         * @return {String|Object} attributes value or TT Object
         * @example
         * // ex. div[hoge="fuga"]
         *
         * tt("div").attr("hoge");
         * // return String: "fuga"
         *
         * tt("div").attr("hoge", "piyo");
         * // effect div[hoge="piyo"]
         *
         * tt("div").attr("hoge", "");
         * // effect div[hoge=""]
         *
         * tt("div").attr({hoge: "bar", fuga: "baz"});
         * // effect div[hoge="bar"][fuga="baz"]
         */
        attr: function(mix, value) {
            var self = this, key;

            switch (arguments.length) {
            case 1:
                if (typeof mix === "object") {
                    tt.each(mix, function() {
                        _setAttr(key, mix[key]);
                    });
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
         * Set the HTML of an element that has been registered
         *
         * @name html
         * @memberof TT
         * @function
         * @param {String|HTMLElement} mix HTMLString or Element
         * @return {Object} TT Object
         * @example
         * tt(".hoge").html("something");
         *
         * tt(".hoge").html(HTMLElement);
         */
        html: function(mix) {
            return this.clear().prepend(mix);
        },

        /**
         * append the HTMLElement element that has been registered
         *
         * @name append
         * @memberof TT
         * @function
         * @param {HTMLElement|String} mix HTMLElement or String
         * @return {Object} TT Object
         * @example
         * tt(".hoge").append(HTMLDivElement);
         * tt(".hoge").append("<div>hogehoge</div>");
         */
        append: function(mix) {
            if (typeof mix === "string") {
                var range;

                range = document.createRange();
                range.selectNodeContents(document.body);
                mix = range.createContextualFragment(mix);
            }
            this.each(function() {
                this.appendChild(mix);
            });
            return this;
        },

        /**
         * prepend the HTMLElement element that has been registered
         *
         * @name add
         * @memberof TT
         * @function
         * @param {HTMLElement|String} mix HTMLElement or String
         * @return {Object} TT Object
         * @example
         * tt(".hoge").append(HTMLDivElement);
         * tt(".hoge").append("<div>hogehoge</div>");
         */
        prepend: function(mix) {
            if (typeof mix === "string") {
                var range;

                range = document.createRange();
                range.selectNodeContents(document.body);
                mix = range.createContextualFragment(mix);
            }
            this.each(function() {
                this.insertBefore(mix, this.firstChild);
            });
            return this;
        },

        /**
         * Deleted from HTML Nodetree that are registered
         * In this case, the element itself, which is stored in the object registered
         *
         * @name remove
         * @memberof TT
         * @function
         * @return {Object} TT Object
         * @example
         * tt(".fuga").remove();
         */
        remove: function() {
            this.each(function() {
                this.parentNode.removeChild(this);
            });
            return this;
        },

        /**
         * Clears the contents of the elements that have been registered
         *
         * @name clear
         * @memberof TT
         * @function
         * @return {Object} TT Object
         * tt(".fuga").clear();
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
         * Replace the element that has been registered
         *
         * In this case, the element itself, which is stored in the object registered
         *
         * @name replace
         * @memberof TT
         * @function
         * @param {String|HTMLElement} HTMLString or HTMLElement
         * @return {Object} TT Object
         * @example
         * // ex. div.hoge > div.fuga
         *
         * tt(".fuga").replace("<div class="piyo"></div>");
         * // effect div.hoge > div.piyo
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
         * Set or get the CSS of the elements that have been registered
         *
         * @name css
         * @memberof TT
         * @function
         * @param {String|Object}
         * @param {String|Number}
         * @return {String|Object} CSS value or TT Object
         * @example
         * tt(".hoge").css("display");
         * // return String: CSS display value
         *
         * tt(".hoge").css("display", "none");
         * // set .hoge[style="display:none;"]
         *
         * tt(".hoge").css({ "display": "none", "visibility": "hidden"});
         * // set .hoge[style="display:none;visibility:hidden;"]
         */
        css: function(mix, value) {
            var prop, val,
                self = this,
                css = "";

            if (typeof mix === "object") {
                tt.each(mix, function(key, val) {
                    if (val === "") {
                        _removeProperty(key);
                        return;
                    }
                    _setStyle(tt.cssCamelizer(key), val);
                });
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
         * Set or get the dataset of the elements that have been registered
         *
         * @name data
         * @memberof TT
         * @function
         * @param {String|Object} dataset property name or Set Object
         * @param {String|Number} value
         * @return {String|Number|Object} dataset value, object or TT Object
         * @example
         * ex. div[data-hoge="foo"]
         *
         * tt("div").data();
         * // return Object: {hoge: "foo"} dataset attributes object
         *
         * tt("div").data("hoge");
         * // return String: "foo"
         *
         * tt("div").data("hoge", "bar");
         * // effect div[data-hoge="bar"]
         *
         * tt("div").data({ "hoge": "piyo", "fuga": "baz" });
         * // effect div[data-hoge="piyo"][data-fuga="baz"]
         */
        data: _tt_data(),

        /**
         * Displays the elements that have been registered
         *
         * If you hide in TT.hide, display property set to the original state
         *
         * @name show
         * @memberof TT
         * @function
         * @param {String} CSS display property value
         * @return {Object} TT Object
         * @example
         * tt(".hoge").show();
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
         * Hide the elements that have been registered
         *
         * @name hide
         * @memberof TT
         * @function
         * @return {Object} TT Object
         * @example
         * tt(".hoge").hide();
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
         * Fire the event on an element that has been registered
         *
         * @name trigger
         * @memberof TT
         * @function
         * @param {String} event EventName
         * @param {String} type EventType
         * @param {Bool} Bubbles
         * @param {Bool} cancelable
         * @return {Object} TT Object
         * @example
         * tt(".hoge").trigger("Event", "ontrigger", false, true);
         */
        trigger: function(event, type, bubbles, cancelable) {
            this.each(function() {
                tt.triggerEvent(this, event, type, bubbles, cancelable);
            });
            return this;
        },


        /**
         * Gets the offset position of the elements that have been registered
         *
         * @name offset
         * @memberof TT
         * @function
         * @return {Object|Array} {left: Number, top: Number}
         * @example
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
         * tt("#hoge").offset();
         * // return Object: { left: Number, top: Number }
         *
         * tt(".fuga").offset();
         * // return Array: [{ left: Number, top: Number }, { left: Number, top: Number }]
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
     * Alias for on method
     *
     * @name bind
     * @memberof TT
     * @function
     * @see TT.on
     */
    TT.prototype.bind = TT.prototype.on;

    /**
     * Alias for off method
     *
     * @name unbind
     * @memberof TT
     * @function
     * @see TT.off
     */
    TT.prototype.unbind = TT.prototype.off;

    /**
     * Alias for append method
     *
     * @name add
     * @memberof TT
     * @function
     * @see TT.append
     */
    TT.prototype.add = TT.prototype.append;

    /**
     * Generate the addClass method that takes into account the compatibility
     */
    function _tt_addclass() {
        var _addClass = tt.env.isCompatible ? _addClassByClassName : _addClassByClassList;

        return function(className) {
            _addClass.call(this, className);
            return this;
        }

        function _addClassByClassList(className) {
            this.each(function() {
                this.classList.add(className);
            });
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

            function _createName(currentName, newName) {
                var res = currentName.split(" ");

                res[res.length] = newName;
                return res.join(" ");
            }
        }
    }

    /**
     * Generate the removeClass method that takes into account the compatibility
     */
    function _tt_removeclass() {
        var _removeClass = tt.env.isCompatible ? _removeClassByClassName : _removeClassByClassList;

        return function(className) {
            _removeClass.call(this, className);
            return this;
        }

        function _removeClassByClassList(className) {
            this.each(function() {
                this.classList.remove(className);
            });
        }

        function _removeClassByClassName(className) {
            this.each(function() {
                this.className = (" " + this.className + " ").replace(" " + className + " ", "");
            });
        }
    }

    /**
     * Generate the hasClass method that takes into account the compatibility
     */
    function _tt_hasclass() {
        var _hasClass = tt.env.isCompatible ? _hasClassByClassName : _hasClassByClassList;

        return function(className) {
            var res;

            res = _hasClass.call(this, className.trim());
            return res ? true : false;
        }

        function _hasClassByClassList(className) {
            return this.match(function() {
                return this.classList.contains(className);
            });
        }

        function _hasClassByClassName(className) {
            return this.match(function() {
                return (" " + this.className + " ").indexOf(" " + className + " ") > -1;
            });
        }
    }

    /**
     * Generate the data method that takes into account the compatibility
     */
    function _tt_data() {
        var _getDataAttr = tt.env.isCompatible ? _getDataByAttributes : _getDataByDataset,
            _setDataAttr = tt.env.isCompatible ? _setDataByAttributes : _setDataByDataset;

        return function (mix, value) {
            var self = this,
                key;

            switch (arguments.length) {
            case 0: return _getDataAttr.call(this);
            case 1:
                if (typeof mix === "object") {
                    tt.each(mix, function(key, val) {
                        _setDataAttr.call(self, key, val);
                    });
                    return this;
                } else {
                    return _getDataAttr.call(this, mix);
                }
            case 2:
                _setDataAttr.call(this, mix, value);
                return this;
            }
        }

        function _setDataByDataset(key, val) {
            this.each(function() {
                if (val === "") {
                    delete this.dataset[key];
                    return;
                }
                this.dataset[key] = val;
            });
        }

        function _getDataByDataset(key) {
            if (!this.nodes[0]) {
                return null;
            }
            return key ? this.nodes[0].dataset[key] : this.nodes[0].dataset;
        }

        function _setDataByAttributes(key, val) {
            this.attr("data-" + key, val);
        }

        function _getDataByAttributes(key) {
            var res = {},
                dataName = "data-",
                node = this.nodes[0],
                attr, attrs = node.attributes,
                i = 0, iz = attrs.length;

            if (!node) {
                return null;
            } else if (key) {
                dataName += key;
                return this.attr(dataName);
            }
            for (; i < iz; ++i) {
                attr = attrs[i].name;
                if (attr.indexOf(dataName) > -1) {
                    key = attr.substr(5, attr.length);
                    res[key] = attrs[i].value;
                }
            }
            return res;
        }
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
        var str = Object.prototype.toString.call(target);

        return str === "[object NodeList]" || str === "[object HTMLCollection]";
    }
);
