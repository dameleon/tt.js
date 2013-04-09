;(function(global, document, undefined) {
    "use strict";

    var IDENT = "tt",
        querySelectorRe = /^(.+[\#\.\s\[\*>:,]|[\[:])/,
        loaded = false,
        loadQueue = [],
        env = tt_createEnvData(global.navigator),
        domTester = document.createElement("div");

    // call load callback queue
    document.addEventListener("DOMContentLoaded", function() {
        loaded = true;
        for (var i = 0, iz = loadQueue.length; i < iz; ++i) {
            loadQueue[i]();
        }
    }, false);

    // for old android compatiblity
    // Object.keys shim - MDN https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys#Compatiblity
    if (!Object.keys) {
        Object.keys=(function(){var a=Object.prototype.hasOwnProperty,b=!{toString:null}.propertyIsEnumerable("toString"),c=["toString","toLocaleString","valueOf","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","constructor"],d=c.length;return function(e){if("object"!==typeof e&&"function"!==typeof e||null===e){throw new TypeError("Object.keys called on non-object");}var f=[];for(var g in e){if(a.call(e,g)){f.push(g);}}if(b){for(var h=0;d>h;h++){if(a.call(e,c[h])){f.push(c[h]);}}}return f;};})();
    }
    // Array.isArray shim
    if (!Array.isArray) {
        Array.isArray=function(a){return Object.prototype.toString.call(a)==="[object Array]";};
    }
    // String.prototype.trim = MDN https://developer.mozilla.org/en/docs/JavaScript/Reference/Global_Objects/String/trim#Compatibility
    if (!String.prototype.trim) {
        String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g,"");};
    }
    // Node.contains shim
    if (!Node.contains) {
        Node.contains=function(a){var b=this.compareDocumentPosition(a);return (b===0||b&Node.DOCUMENT_POSITION_CONTAINED_BY);};
    }

    /**
     * tt.js main function
     *
     * This function does the following arguments to be passed by
     *
     * ### CSSQueryString, NodeElement, NodeList or its like Array, document or document.body, tt object
     * >> Create tt class object (DOM Operator)
     *
     * ### Function
     * >> If the HTML is already loaded is executed immediately, if not already loaded is executed at the timing of the DOMContentLoaded
     *
     * @class tt
     * @param {String|Function|Node|NodeList|NodeList like Array|document|document.body} mix
     * @param {Node} [options] parent If first params is String, sets the parent of the search target
     * @return {Object|undefined} Return tt object of if first params is Function return undefined
     */
    function tt(mix, parent) {
        var target = null,
            selector = "";

        if (typeof mix === "string") {
            selector = mix;
            parent = parent || document;
            target = querySelectorRe.test(mix) ?
                        parent.querySelectorAll(mix) :
                     mix[0] === "#" ?
                        [parent.getElementById(mix.substring(1, mix.length))] :
                     mix[0] === "." ?
                        parent.getElementsByClassName(mix.substring(1, mix.length)) :
                        parent.getElementsByTagName(mix);
        } else if (mix) {
            if (mix.nodeType === 1) {
                target = [mix];
            } else if (tt_isNodeList(mix) ||
                      (Array.isArray(mix) && mix.length && mix[0].nodeType)) {
                target = mix;
            } else if (mix === document || mix === document.body) {
                target = [document.body];
            } else if (typeof mix === "function") {
                if (loaded) {
                    mix();
                } else {
                    loadQueue.push(mix);
                }
                return;
            } else if (mix instanceof TT) {
                return mix;
            }
        }
        return new TT(target || [], selector);
    }

    ////// static methods
    tt.ajax          = tt_ajax;
    tt.createEnvData = tt_createEnvData;
    tt.camelizer     = tt_camelizer;
    tt.hyphenizer    = tt_hyphenizer;
    tt.cssPrefix     = tt_cssPrefix;
    tt.each          = tt_each;
    tt.extend        = tt_extend;
    tt.env           = env;
    tt.isArray       = Array.isArray;
    tt.isNodeList    = tt_isNodeList;
    tt.match         = tt_match;
    tt.param         = tt_param;
    tt.parseJSON     = tt_parseJSON;
    tt.proxy         = tt_proxy;
    tt.query2object  = tt_query2object;
    tt.tag           = tt_tag;
    tt.triggerEvent  = tt_triggerEvent;
    tt.type          = tt_type;

    //// Iterate functions
    /**
     * Execute iterate a function from array or object
     *
     * @method tt.each
     * @static
     * @param {Array|Object} mix target to pass to a function
     * @param {Function} fn function to execute iteratively
     */
    function tt_each(mix, fn) {
        var arr, key,
            i = 0, iz;

        if (Array.isArray(mix)) {
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
     * Extend target object with each objects
     * If first argument is true, will be recursive copy
     *
     * @method tt.extend
     * @static
     * @param {Object|Bool} any first target object or deep flag
     * @param {Object} [options] override objects
     * @return {Object} result object
     */
    function tt_extend() {
        var args = [].slice.call(arguments),
            i = 1, iz = args.length,
            deep = false,
            arg, target;

        if (args[0] === true) {
            deep = true;
            ++i;
        }
        target = args[(i - 1)] || {};

        for (; i < iz; ++i) {
            arg = args[i];
            if (tt_type(arg) !== "object") {
                continue;
            }
            tt_each(Object.keys(arg), _extend);
        }
        return target;

        function _extend(key, index) {
            if (deep &&
                tt_type(target[key], "object") &&
                tt_type(arg[key], "object")) {
                    tt_extend(target[key], arg[key]);
            } else {
                target[key] = arg[key];
            }
        }
    }

    /**
     * Execute iterate a function from array or object
     *
     * @method tt.match
     * @static
     * @param {Array|Object} mix target to pass to a function
     * @param {Function} fn function to execute iteratively
     */
    function tt_match(mix, fn) {
        var arr,
            key, res = {},
            i = 0, iz;

        if (Array.isArray(mix)) {
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
    }


    //// detect type functions
    /**
     * Detect array strictly
     *
     * @method tt.isNodeList
     * @static
     * @param {Any} target detect target
     * @return {Bool} result
     */
    function tt_isNodeList(mix) {
        var type=Object.prototype.toString.call(mix);

        return type === "[object NodeList]" || type === "[object HTMLCollection]";
    }

    /**
     * Return target type
     * If matches is passed and returns result of comparing target
     *
     * @method tt.type
     * @static
     * @param {Any} target judgment target
     * @param {String|Array} matches List, or string type to be compared
     * @return {Bool} result
     */
    function tt_type(target, matches) {
        var res = target === null       ? "null" :
                  target === void 0     ? "undefined" :
                  target === global     ? "global" :
                  target === document   ? "document" :
                  target.nodeType       ? "node" :
                  Array.isArray(target) ? "array" :
                  tt_isNodeList(target) ? "nodelist" : undefined;

        if (!res) {
            res = typeof target;
            if (res === "object") {
                res = Object.prototype.toString.call(target).toLowerCase().match(/.*\s([a-z]*)\]/)[1];
            }
        }
        if (!matches) {
            return res;
        } else if (Array.isArray(matches)) {
            for (var i = 0, iz = matches.length; i < iz; ++i) {
                if (matches[i] === res) {
                    return true;
                }
            }
            return false;
        } else {
            return matches === res;
        }
    }


    //// useful functions
    /**
     * XMLHttpRequest wrapper method
     *
     * @method tt.ajax
     * @static
     * @param {String|Object} mix request url or setting object
     * @param {Object} [options] setting setting object
     * @return {Object} XMLHttpRequest object
     */
    function tt_ajax(mix, setting) {
        var called = false,
            xhr = new XMLHttpRequest();

        setting = setting || {};
        if (tt_type(mix, "object")) {
            setting = mix;
        } else if (tt_type(mix, "string")) {
            setting.url = mix;
        } else {
            throw new Error("Error: missing argument");
        }

        setting = tt_extend({
            async       : true,
            beforeSend  : null,
            cache       : true,
            complete    : null,
            contentType : "application/x-www-form-urlencoded; charset=UTF-8",
            context     : document.body,
            data        : null,
            dataType    : "text",
            error       : null,
            headers     : null,
            mimeType    : null,
            success     : null,
            timeout     : 0,
            type        : "GET",
            url         : "",
            user        : "",
            password    : ""
        }, setting);

        setting.type = setting.type.toUpperCase();

        if (setting.data && setting.type === "GET") {
            setting.url =
                setting.url +
                setting.url.indexOf("?") > -1 ? "&" : "?" +
                tt_param(setting.data);
            setting.data = null;
        } else {
            setting.data = tt_param(setting.data);
        }

        xhr.onerror = function() {
            _callCallbacks(0);
        };

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                _callCallbacks(xhr.status);
            }
        };

        xhr.open(setting.type,
                 setting.url,
                 setting.async,
                 setting.user,
                 setting.password);

        if (setting.type === "POST") {
            xhr.setRequestHeader("Content-type", setting.contentType);
            xhr.setRequestHeader("Content-length", setting.data.length);
        }
        if (tt_type(setting.headers, "object")) {
            tt_each(setting.headers, function(key, value) {
                xhr.setRequestHeader(key, value);
            });
        }
        if (setting.dataType) {
            try {
                xhr.responseType = setting.dataType;
            } catch (e) {
                xhr.responseType = "text";
            }
        }
        if (setting.mimeType) {
            xhr.overrideMimeType(setting.mimeType) ;
        }
        if (setting.beforeSend) {
            setting.beforeSend(xhr);
        }
        if (setting.timeout) {
            xhr.timeout = setting.timeout;
        }
        xhr.send(setting.data);

        return xhr;

        function _callCallbacks(statusCode) {
            if (called) {
                return;
            }
            called = true;

            var res, context = setting.context;

            if (statusCode >= 200 && statusCode < 400) {
                res = xhr.response || xhr.responseText;
                if (setting.dataType === "json" && tt_type(res, "string")) {
                    res = tt_parseJSON(res);
                }
                if (setting.success) {
                    setting.success.apply(context, [res, statusCode, xhr]);
                }
            } else {
                if (setting.error) {
                    setting.error.apply(context, [xhr, statusCode]);
                }
            }
            if (setting.complete) {
                setting.complete.apply(context, [xhr, statusCode]);
            }
            xhr = null;
        }
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
     *                      versionCode(version number of 4-digit or higher)
     *
     * @method tt.createEnvData
     * @static
     * @param {Navigator} navigator object
     * @return {Object} object
     */
    function tt_createEnvData(nav) {
        var res = {},
            ua = (nav || global.navigator).userAgent.toLowerCase();

        res.android = /android/.test(ua);
        res.ios = /ip(hone|od|ad)/.test(ua);

        if (!res.android && !res.ios) {
            res.windowsPhone = /windows\sphone/.test(ua);
            res.ie = /msie/.test(ua);
        }

        res.chrome = /(chrome|crios)/.test(ua);
        res.firefox = /firefox/.test(ua);
        res.opera = /opera/.test(ua);
        res.androidBrowser = !res.chrome && res.android && /applewebkit/.test(ua);
        res.mobileSafari = !res.chrome && res.ios && /applewebkit/.test(ua);

        res.version =
            (res.androidBrowser || res.android && res.chrome) ? ua.match(/android\s(\S.*?)\;/) :
            (res.mobileSafari || res.ios && res.chrome) ? ua.match(/os\s(\S.*?)\s/) :
            null;
        res.version = res.version ?
            res.ios ?
                res.version[1].replace("_", ".") :
                res.version[1] :
            null;
        res.versionCode = _getVersionCode(res.version);
        res.supportTouch = "ontouchstart" in global;

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
            } else {
                res = +version;
            }
            return res;
        }
    }

    /**
     * Get string CSS camel case from string of CSS hyphen case
     *
     * @method tt.camelizer
     * @static
     * @param {String} str CSS property value
     * @return {String}
     */
    function tt_camelizer(str) {
        if (!str || typeof str !== "string") {
            throw new Error("Argument error");
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
        return res || str;
    }

    /**
     * Get value of CSS with a prefix
     *
     * @method tt.cssPrefix
     * @static
     * @param {String} value CSS value
     * @param {Array} prefix additional prefixes list
     * @return {Array}
     */
    function tt_cssPrefix(value, prefix) {
        var res = [];

        prefix = prefix || ["webkit", "moz", "o", "ms", "khtml"];
        tt_each(prefix, function(str, index) {
            res[index] = "-" + str + "-" + value;
        });
        return res;
    }

    /**
     * Get string CSS hyphen case from string of CSS camel case
     *
     * @method tt.hyphenizer
     * @static
     * @param {String} str CSS property value
     * @return {String}
     */
    function tt_hyphenizer(str) {
        if (!str || typeof str !== "string") {
            throw new Error("Argument error");
        }
        var prefix = ["webkit", "moz", "o", "ms", "khtml"],
            upperRe = /[A-Z]/g,
            upperStr = str.match(upperRe),
            res = "";

        tt_each(str.split(upperRe), function(value, index) {
            if (prefix.indexOf(value) > -1) {
                res += "-" + value;
                return;
            } else if (!index) {
                res += value;
                return;
            }
            res += ("-" + upperStr.shift().toLowerCase() + value);
        });
        return res || str;
    }

    /**
     * Parse query string to object
     *
     * @method tt.query2object
     * @static
     * @param {String} query query string
     * @return {Object} result
     */
    function tt_param(obj) {
        if (!tt_type(obj, "object")) {
            return obj;
        }
        var key, keys = Object.keys(obj),
            i = 0, iz = keys.length,
            results = [];

        for (;i < iz; ++i) {
            key = keys[i];
            results.push(encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]));
        }
        return results.join("&");
    }

    /**
     * Parse string of json to json object
     *
     * @method tt.parseJSON
     * @static
     * @param {String} text parse target string
     * @return {Function} Callback function
     */
    function tt_parseJSON(text) {
        if (!text) {
            return {};
        } else if (typeof text === "object") {
            return text;
        }
        // idea from twitter@uupaa
        var obj;

        try {
            obj = JSON.parse(text);
            return obj;
        } catch (p_o) {}
        try {
            /*jshint evil: true */
            obj = (new Function('return ' + text))();
        } catch (o_q) {
            throw new Error("Can't parse text to json");
        }
        return obj;
    }

    /**
     * Returns a function and arguments hold any context
     *
     * @method tt.proxy
     * @static
     * @param {Function} func
     * @param {Any} context
     * @param {Any} [options] args
     * @return {Function} Callback function
     */
    function tt_proxy() {
        if (arguments.length < 2) {
            throw new Error("Missing argument error");
        }
        var args = [].slice.call(arguments),
            func = args.shift(),
            context = args.shift(),
            tmp;

        if (typeof context === "string") {
            tmp = func[context];
            context = func;
            func = tmp;
        }
        return function() {
            return func.apply(context, args);
        };
    }

    /**
     * Parse query string to object
     *
     * @method tt.query2object
     * @static
     * @param {String} query query string
     * @return {Object} result
     */
    function tt_query2object(query) {
        if (!tt_type(query, "string")) {
            return {};
        }
        if (query[0] === "?") {
            query = query.substr(1, query.length);
        }
        var result = {},
            pair = query.split("&"),
            i = 0, iz = pair.length;

        for (; i < iz; ++i) {
            var k_v = pair[i].split("=");

            result[k_v[0]] = k_v[1];
        }
        return result;
    }

    /**
     * Create Node or tt object which involve it
     *
     * @method tt.tag
     * @static
     * @param {String} query query string
     * @param {Bool} raw
     * @return {Object} result
     */
    function tt_tag(name, createTT) {
        if (!name || typeof name !== "string") {
            throw new Error("Argument error");
        }
        var tag = document.createElement(name);

        return createTT ? tt(tag) : tag;
    }

    /**
     * Trigger event to target element
     *
     * @method tt.triggerEvent
     * @static
     * @param {Node} query string
     * @param {String} query string
     * @param {String} query string
     * @param {Bool} query string
     * @param {Bool} query string
     * @return {Object} result
     */
    function tt_triggerEvent(node, event, type, bubbles, cancelable) {
        if (!node || !event) {
            throw new Error("Missing argument error");
        }
        if (!tt_type(type, "string")) {
            type = event;
            event = type === "click" ? "MouseEvents" : "Event";
        }
        var ev = document.createEvent(event);

        ev.initEvent(type,
                     bubbles !== undefined ? bubbles : true,
                     cancelable !== undefined ? cancelable : true);
        node.dispatchEvent(ev);
    }


    /**
     * tt.js class creater
     *
     * @class TT
     * @constructor
     * @param {Array|NodeList} nodes NodeList or Array incorporates elements
     * @param {String} selector selector text
     */
    function TT(nodes, selector) {
        var i = 0, iz;

        /**
         * Selector text
         *
         * @property selector
         * @type String
         */
        this.selector = selector;

        /**
         * Length of registered elements
         *
         * @property length
         * @type Number
         */
        this.length = iz = nodes.length;

        /**
         * Event registration information of this tt object
         *
         * @property _events
         * @type Object
         * @private
         */
        this._events = {};

        /**
         * Delegate registration information of this tt object
         *
         * @property _delegates
         * @type Object
         * @private
         */
        this._delegates = {};

        /**
         * Data for this tt object
         *
         * @property _data
         * @type Object
         * @private
         */
        this._data = {};

        for (; iz; ++i, --iz) {
            this[i] = nodes[i];
        }
        return this;
    }

    tt.fn = TT.prototype = {
        constructor: TT,

        /**
         * Returns elements
         *
         * @method get
         * @param {Number} index elements index
         * @return {NodeElement} registered NodeElement
         */
        get: function(index) {
            return this[index || 0];
        },

        /**
         * Returns array in elements
         *
         * @method toArray
         * @return {Array} registered elements
         */
        toArray: function() {
            var arr = [];

            this.each(function(index) {
                arr[index] = this;
            });
            return arr;
        },

        /**
         * Call function with context of NodeElement and parameter of elements index number
         *
         * @method each
         * @param {Function} fn Function to be executed repeatedly
         * @return {Object} TT object
         */
        each: function(fn) {
            var i = 0, iz = this.length;

            for (; iz; ++i, --iz) {
                fn.call(this[i], i);
            }
            return this;
        },

        /**
         * Call function with context of NodeElement and parameter of elements index number
         * If it returns true, then this function return context that matches
         *
         * @method match
         * @param {Function} fn Function to be executed repeatedly
         * @return {Object} TT Object
         */
        match: function(fn) {
            var i = 0, iz = this.length;

            for (; iz; ++i, --iz) {
                if (fn.call(this[i], i)) {
                    return this[i];
                }
            }
            return null;
        },

        /**
         * Push element(s) to TT Object
         *
         * @method push
         * @param {Node|NodeList|Array} mix element or elements list
         * @return {Object} TT Object
         */
        push: function(mix) {
            if (mix && mix.nodeType) {
                this[this.length] = mix;
                ++this.length;
            } else if (tt_type(mix, ["array", "nodelist"])) {
                var i = this.length, iz = i + mix.length;

                for (; iz; ++i, --iz) {
                    this[i] = mix[i];
                }
            }
            return this;
        },

        /**
         * Get index of registered element
         *
         * @method indexOf
         * @param {Node} node serach target element
         * @return {Number} index number
         */
        indexOf: function(node) {
            var res = -1;

            this.match(function(index) {
                if (this === node) {
                    res = index;
                    return true;
                }
                return false;
            });
            return res;
        },

        /**
         * Bind events to NodeElement
         *
         * @method on
         * @param {String} type
         * @param {String|Function} mix
         * @param {Function} [options] callback
         * @return {Object} TT Object
         */
        on: function(type, mix, callback) {
            if (tt_type(mix, 'string')) {
                this.delegate(type, mix, callback);
            } else {
                this.bind(type, mix);
            }
            return this;
        },

        /**
         * Un bind events from NodeElement
         *
         * @method off
         * @param {String} type
         * @param {String|Function} mix
         * @param {Function} callback
         * @return {Object} TT Object
         */
        off: function(type, mix, callback) {
            if (tt_type(mix, 'string')) {
                this.undelegate(type, mix, callback);
            } else {
                this.unbind(type, mix);
            }
            return this;
        },

        /**
         * Bind events to NodeElement
         * This is simply wrapper of addEventListener
         *
         * @method bind
         * @param {String} type
         * @param {Function|Object} callback
         * @param {Bool} [options] capture
         * @return {Object} TT Object
         */
        bind: function(type, mix, capture) {
            capture = capture || false;
            var self = this,
                event = this._events[type];

            if (!event) {
                event = this._events[type] = {};
                event.callbacks = [];
                event.handler = function(ev) {
                    var data = ev._tt_data,
                        args = Array.isArray(data) ?
                                [].concat(data) : [];

                    args.unshift(ev);
                    tt_each(event.callbacks, function(callback) {
                        if (typeof callback === "function") {
                            callback.apply(ev.currentTarget, args);
                        } else if (callback && callback.handleEvent) {
                            callback.handleEvent.apply(ev.currentTarget, args);
                        }
                    });
                };
                this.each(function() {
                    this.addEventListener(type, event.handler, capture);
                });
            }
            event.callbacks.push(mix);
            return this;
        },

        /**
         * Un bind events from NodeElement
         * This is simply wrapper of removeEventListener
         *
         * @method unbind
         * @param {String} type
         * @param {Function|Object} mix
         * @return {Object} TT Object
         */
        unbind: function(type, mix) {
            var event = this._events[type],
                index = event ?
                        event.callbacks.indexOf(mix) : -1;

            if (!event || index === -1) {
                return;
            }
            event.callbacks.splice(index, 1);
            if (!event.callbacks.length) {
                this.each(function() {
                    this.removeEventListener(type, event.handler);
                });
            }
            return this;
        },

        /**
         * Bind events to NodeElement
         * To bind the event of delegate type
         *
         * @method delegate
         * @param {String} type
         * @param {String|Object} target
         * @param {Function|Object} callback
         * @return {Object} TT Object
         */
        delegate: function(type, target, callback) {
            var delegate = this._delegates[type],
                listener = {
                    target: target,
                    callback: callback
                };

            if (!delegate) {
                delegate = this._delegates[type] = {};
                delegate.listeners = [];
                delegate.handler = function(ev) {
                    var event,
                        eventTarget = ev.target,
                        args = arguments;

                    tt_match(delegate.listeners, function(listener) {
                        var match = tt(listener.target).match(function() {
                            if (this.contains(eventTarget)) {
                                return true;
                            }
                            return false;
                        });

                        if (match) {
                            if (typeof listener.callback === "function") {
                                listener.callback.apply(match, args);
                            } else if (listener.callback.handleEvent) {
                                listener.callback.handleEvent.apply(match, args);
                            }
                            return true;
                        }
                        return false;
                    });
                };
                this.bind(type, delegate.handler);
            }
            delegate.listeners.push(listener);
            return this;
        },

        /**
         * Un bind events from NodeElement
         * To un bind the event of delegate type
         *
         * @method undelegate
         * @param {String} type
         * @param {String|Function} mix
         * @param {Function} callback
         * @return {Object} TT Object
         */
        undelegate: function(type, target, callback) {
            var delegate = this._delegates[type],
                listeners = delegate.listeners;

            if (!listeners || listeners.length === 0) {
                return this;
            }
            tt_match(listeners, function(listener, index) {
                if (listener.target === target &&
                    listener.callback === callback) {
                        listeners.splice(index, 1);
                        return true;
                }
                return false;
            });
            if (listeners.length === 0) {
                this.unbind(type, delegate.handler);
                delegate = this._delegates[type] = {};
            }
            return this;
        },

        /**
         * Add class name
         *
         * @method addClass
         * @param {String} classname
         * @return {Object} TT object
         */
        addClass: domTester.classList ?
            function(className) {
                return this.each(function() {
                    this.classList.add(className);
                });
            } :
            function _addClassByClassName(className) {
                var stashName = this[0].className,
                    newName = _createName(stashName, className);

                return this.each(function(index) {
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
            },

        /**
         * Remove class name
         *
         * @method removeClass
         * @param {String} classname
         * @return {Object} TT object
         */
        removeClass: domTester.classList ?
            function _removeClassByClassList(className) {
                return this.each(function() {
                    this.classList.remove(className);
                });
            } :
            function _removeClassByClassName(className) {
                className = " " + className;
                return this.each(function() {
                    this.className = (" " + this.className).replace(className, "").trim();
                });
            },

        /**
         * Search class name
         *
         * @method hasClass
         * @param {String} classname
         * @return {Object} TT object
         */
        hasClass: domTester.classList ?
            function _hasClassByClassList(className) {
                return this.match(function() {
                    return this.classList.contains(className);
                });
            } :
            function _hasClassByClassName(className) {
                className = " " + className;
                return this.match(function() {
                    return (" " + this.className).indexOf(className) > -1;
                });
            },

        /**
         * Toggle class name
         *
         * @method toggleClass
         * @param {String} classname
         * @param {Bool} strict
         * @return {Object} TT object
         */
        toggleClass: function(className, strict) {
            var that = this;

            if (strict) {
                that.each(function() {
                    var target = tt(this);

                    if (target.hasClass(className)) {
                        target.removeClass(className);
                    } else {
                        target.addClass(className);
                    }
                });
            } else {
                if (tt(that[0]).hasClass(className)) {
                    that.removeClass(className);
                } else {
                    that.addClass(className);
                }
            }
            return this;
        },

        /**
         * Find elements under registered elements
         *
         * @method find
         * @param {String} query
         * @return {Object} TT object
         */
        find: function(query) {
            var res = [];

            this.each(function() {
                res = res.concat(tt(query, this).toArray());
            });
            return tt(res);
        },

        /**
         * Find NodeElement from registered elements
         *
         * @method contains
         * @param {String|Object} mix QueryString, NodeElement, NodeList
         * @return {Node} matches NodeElement
         */
        contains: function(mix) {
            var res = tt(),
                target = tt(mix);

            this.each(function() {
                var context = this,
                    cond = target.match(function() {
                        return context.contains(this);
                    });

                if (cond) {
                    res.push(this);
                }
            });
            return res;
        },

        /**
         * Set attribute values
         * Get attributes list or attribute value
         *
         * @method attr
         * @param {String} mix QueryString, NodeElement, NodeList
         * @param {String|Object} mix QueryString, NodeElement, NodeList
         * @return {Object|String} Key-value object of attributes or attribute value
         */
        attr: function(mix, value) {
            var that = this;

            switch (arguments.length) {
            case 0:
                var attrs = this[0].attributes, attr;

                mix = {};
                for (var i = 0, iz = attrs.length; i < iz; ++i) {
                    attr = attrs[i];
                    mix[attr.nodeName] = attr.nodeValue;
                }
                return mix;
            case 1:
                if (typeof mix === "object") {
                    tt_each(mix, function(key) {
                        _setAttr(key, mix[key]);
                    });
                } else {
                    return this[0].getAttribute(mix);
                }
                break;
            case 2:
                _setAttr(mix, value);
                break;
            }
            return this;

            function _setAttr(key, value) {
                if (value === undefined || value === null) {
                    value = "";
                }
                that.each(function() {
                    if (value === "") {
                        this.removeAttribute(key);
                        return;
                    }
                    this.setAttribute(key, value);
                });
            }
        },

        /**
         * Replace html in registered elements
         * or get text html in thier
         *
         * @method attr
         * @param {String} mix QueryString, NodeElement, NodeList
         * @param {String|Object} mix QueryString, NodeElement, NodeList
         * @return {Object|String} Key-value object of attributes or attribute value
         */
        html: function(mix) {
            if (mix === undefined || mix === null) {
                return this[0].innerHTML;
            }

            if (mix.nodeType) {
                this.clear().append(mix);
            } else {
                this.each(function() {
                    while (this.firstChild) {
                        this.removeChild(this.firstChild);
                    }
                    this.insertAdjacentHTML("afterbegin", mix);
                });
            }
            return this;
        },

        /**
         * Append NodeElement or text html to registered elements
         *
         * @method append
         * @param {String|Node} mix NodeElement, Text html
         * @return {Object} TT object
         */
        append: function(mix) {
            var useClone = this.length > 1;

            return this.each((typeof mix === "string") ?
                function() { this.insertAdjacentHTML("beforeend", mix); } :
                function() {
					var that = this;

					if (mix.nodeType) {
						this.appendChild(useClone ? mix.cloneNode(true) : mix);
					} else if (mix instanceof TT) {
						mix.each(function() {
							that.appendChild(this);
						});
					}
				});
        },

        /**
         * Prepend NodeElement or text html to registered elements
         *
         * @method prepend
         * @param {String|Node} mix NodeElement, Text html
         * @return {Object} TT object
         */
        prepend: function(mix) {
            var useClone = this.length > 1;

            return this.each((typeof mix === "string") ?
                function() { this.insertAdjacentHTML("afterbegin", mix); } :
				function() {
					var that = this;

					if (mix.nodeType) {
						this.insertBefore(useClone ? mix.cloneNode(true) : mix, this.firstChild);
					} else if (mix instanceof TT) {
						mix.each(function() {
							that.insertBefore(this, that.firstChild);
						});
					}
				});
        },

        /**
         * Remove elements of registered from html
         *
         * @method remove
         * @return {Object} TT object
         */
        remove: function() {
            return this.each(function() {
                this.parentNode.removeChild(this);
            });
        },

        /**
         * Remove child elements of registered elements
         *
         * @method clear
         * @return {Object} TT object
         */
        clear: function() {
            return this.each(function() {
                while (this.firstChild) {
                    this.removeChild(this.firstChild);
                }
            });
        },

        /**
         * Get parent element from registered elements
         *
         * @method parent
         * @param {String|Object} mix Query string for search elements or TT object
         * @return {Object} TT object
         */
        parent: function(mix) {
            var res = tt();

            if (mix) {
                var target = tt(mix).toArray();

                this.each(function() {
                    if (target.indexOf(this.parentNode) > -1) {
                        res.push(this.parentNode);
                    }
                });
            } else {
                this.each(function() {
                    res.push(this.parentNode);
                });
            }
            return res;
        },

        /**
         * Get parent elements of the element back in DOM tree from registered elements
         *
         * @method parents
         * @param {String|Object} mix Query string for search elements or TT object
         * @return {Object} TT object
         */
        parents: function(mix) {
            var that = this,
                res;

            if (mix) {
                res = tt();
                tt(mix).each(function() {
                    var context = this,
                        match = that.match(function() {
                            var pos = context.compareDocumentPosition(this);

                            return (pos & Node.DOCUMENT_POSITION_CONTAINED_BY);
                        });

                    if (match) {
                        res.push(this);
                    }
                });
            } else {
                res = [];
                this.match(function() {
                    var parent;

                    while ((parent = this.parentNode) !== null) {
                        if (res.indexOf(parent) === -1) {
                            res.push(parent);
                        } else {
                            break;
                        }
                    }
                    return false;
                });
                res = tt(res);
            }
            return res;
        },

        /**
         * Get closest element from registered element with query string or target element
         *
         * @method closest
         * @param {String|Object} mix Query string for search elements or TT object
         * @return {Object} TT object
         */
        closest: function(mix) {
            var res = [],
                target;

            if (!mix) {
                return tt();
            }
            target = tt(mix).toArray();
            this.each(function() {
                var element = this;

                while (element) {
                    if (target.indexOf(element) > -1) {
                        if (res.indexOf(element) === -1) {
                            res.push(element);
                        }
                        break;
                    }
                    element = element.parentNode;
                }
            });
            return tt(res);
        },

        /**
         * Get child elements from registered elements
         *
         * @method children
         * @param {String|Object} [mix] QueryString, NodeElement, NodeList
         * @return {Object} tt object of matches child NodeElements
         */
        children: function(mix) {
            var res = tt(),
                target;

            if (mix) {
                target = tt(mix);
                this.each(function() {
                    var children = [].slice.call(this.children),
                        iz = children.length;

                    target.each(function() {
                        var child, i;

                        for (i = 0; i < iz; ++i) {
                            child = children[i];
                            if (this === child) {
                                res.push(child);
                            }
                        }
                    });
                });
            } else {
                this.each(function() {
                    res = res.concat([].slice.call(this.children));
                });
            }
            return res;
        },

        /**
         * Replace elements of registered elements
         *
         * @method replace
         * @param {String|Node} mix text html or NodeElement
         * @return {Object} TT object
         */
        replace: function(mix) {
            this.each((typeof mix === "string") ?
                function() { this.insertAdjacentHTML("beforebegin", mix); } :
                function() { this.parentNode.insertBefore(mix, this); });
            return this.remove();
        },

        /**
         * Set or get css styles
         *
         * @method css
         * @param {String|Object} [options] mix CSS property name, object of CSS style set
         * @param {String|Number} [options] value CSS style value
         * @return {String|Number|CSSStyleDeclaration}
         */
        css: function(mix, value) {
            var that = this;

            if (typeof mix === "object") {
                tt_each(mix, function(key, val) {
                    if (val === "") {
                        _removeProperty(key);
                        return;
                    }
                    _setStyle(tt_camelizer(key), val);
                });
            } else if (mix) {
                if (value) {
                    _setStyle(tt_camelizer(mix), value);
                } else if (value === "") {
                    _removeProperty(mix);
                } else {
                    return global.getComputedStyle(this[0]).getPropertyValue(mix);
                }
            } else {
                return global.getComputedStyle(this[0]);
            }

            return this;

            function _removeProperty(prop) {
                that.each(function() {
                    this.style.removeProperty(prop);
                });
            }

            function _setStyle(prop, val) {
                that.each(function() {
                    this.style[prop] = val;
                });
            }
        },

        /**
         * Set or get element's dataset
         * If the array or object, data type passed to save the _data object instance
         *
         * @method data
         * @param {String|Object} [options] mix CSS property name, object of CSS style set
         * @param {String|Number} [options] value CSS style value
         * @return {String|Number|CSSStyleDeclaration}
         */
        data: (function() {
            var cond = domTester.dataset,
                _getDataAttr = cond ? _getDataByDataset : _getDataByAttributes,
                _setDataAttr = cond ? _setDataByDataset : _setDataByAttributes;

            return function (mix, value) {
                var that = this,
                    key;

                switch (arguments.length) {
                case 0:
                    return _getDataAttr.call(this);
                case 1:
                    if (typeof mix === "object") {
                        tt_each(mix, function(key, val) {
                            _setDataAttr.call(that, key, val);
                        });
                        return this;
                    } else {
                        return _getDataAttr.call(this, mix);
                    }
                    break;
                case 2:
                    _setDataAttr.call(this, mix, value);
                    return this;
                }
            };

            function _setDataByDataset(key, val) {
                var type = tt_type(val),
                    func = null;

                if (val === "" ||
                    type === "undefined" ||
                    type === "null") {
                        if (this._data[key]) {
                            delete this._data[key];
                            return;
                        } else {
                            func = function() { delete this.dataset[key]; };
                        }
                } else if (type === "string" || type === "number") {
                    func = function() { this.dataset[key] = val; };
                } else {
                    this._data[key] = val;
                    return;
                }
                this.each(func);
            }

            function _getDataByDataset(key) {
                if (!this[0]) {
                    return null;
                }
                var node = this[0],
                    res = {};

                if (key) {
                    if (this._data[key]) {
                        return this._data[key] || null;
                    } else {
                        return node.dataset[key] || null;
                    }
                } else {
                    tt_each(node.dataset, function(key, val) {
                        res[key] = val;
                    });
                    tt_extend(res, this._data);
                }
                return res;
            }

            function _setDataByAttributes(key, val) {
                var type = tt_type(val);

                if (tt_type(val, ["string", "number", "undefined", "null"])) {
                    if (val === "" && this._data[key]) {
                        delete this._data[key];
                        return null;
                    }
                    this.attr("data-" + key, val);
                } else {
                    this._data[key] = val;
                }
            }

            function _getDataByAttributes(key) {
                if (!this[0]) {
                    return null;
                }
                var res = {},
                    dataName = "data-",
                    node = this[0],
                    attr, attrs = node.attributes,
                    i = 0, iz = attrs.length;

                if (!node) {
                    return null;
                } else if (this._data[key]) {
                    return this._data[key];
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
                tt_each(this._data, function(key, val) {
                    res[key] = val;
                });
                return res;
            }
        })(),

        /**
         * Set, get "value" attributes value of registered elements
         *
         * @method val
         * @param {String|Number} [value]
         * @return {Object|String|Array} TT object, value or values list
         */
        val: function(value) {
            if (value !== undefined) {
                this.each(function() {
                    if (this.value !== undefined) {
                        this.value = value;
                    }
                });
                return this;
            } else {
                var res = [];

                this.each(function(index) {
                    if (this.value !== undefined) {
                        res[index] = this.value;
                    }
                });
                return this.length > 1 ? res : res[0];
            }
        },

        /**
         * Show elements, if it is hide curretly
         *
         * @method show
         * @param {String|Object} [options] value CSS value of display property
         * @return {Object} tt object
         */
        show: function(value) {
            var currentValue = this.css("display"),
                lastValue = this._data.lastDisplay || null;

            if (currentValue !== "none") {
                return;
            }
            return this.css("display", value || lastValue || "block");
        },

        /**
         * Hide elements, if it is show currently
         *
         * @method hide
         * @return {Object} tt object
         */
        hide: function() {
            var currentValue = this.css("display");

            if (currentValue !== "none") {
                this._data.lastDisplay = currentValue;
            }
            return this.css("display", "none");
        },

        /**
         * Trigger events for registered elements
         *
         * @method trigger
         * @param {String} event event name
         * @param {String} type event type name
         * @param {Bool} [options] bubbles event bubbling flag
         * @param {Bool} [options] cancelable event cancelable flag
         * @return {Object} tt object
         */
        trigger: function() {
            var args = [].slice.call(arguments),
                type = args.shift(),
                ev = document.createEvent("Event");

            ev.initEvent(type, true, true);
            if (args.length > 1) {
                ev._tt_data = args;
            }
            this.each(function() {
                this.dispatchEvent(ev);
            });
            return this;
        },

        /**
         * Get offset position of registered elements
         * Ex.
         *  document.body
         *  +--------------------------
         *  |             |
         *  |            top
         *  |             v
         *  | -- left --> +---------+
         *  |             | Element |
         *  |             +---------+
         *  |
         *
         * @method offset
         * @return {Object|Array} {left: Number, top: Number} or their array
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
        },

        /**
         * Get width from registered elements
         *
         * @method width
         * @param {Number} [index] number of registered elements
         * @return {Number} number of element width
         */
		width: function(index) {
			return this[index || 0].offsetWidth;
		},

        /**
         * Get height from registered elements
         *
         * @method height
         * @param {Number} [index] number of registered elements
         * @return {Number} number of element height
         */
		height: function(index) {
			return this[index || 0].offsetHeight;
		}
    };

    // globalize
    global[IDENT] = global[IDENT] || tt;

})((this.self || global), document);

