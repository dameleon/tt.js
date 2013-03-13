/** "tt.js" -Highspeed SelectorBased Library- author: Kei Takahashi(twitter@dameleon, mail:dameleon[at]gmail.com) license: MIT version: 0.2.0 */
;(function(global, document, isArray, isNodeList, undefined) {
    "use strict";

    var IDENT = "tt",
        querySelectorRe = /^(.+[\#\.\s\[>:,]|[\[:])/,
        loaded = false,
        loadQueue = [],
        delegateListeners = {},
        domTester = document.createElement("div");

    // for old android compatiblity
    // Object.keys - MDN https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys#Compatiblity
    if (!Object.keys) {
        Object.keys=function(){var e=Object.prototype.hasOwnProperty,f=!{toString:null}.propertyIsEnumerable("toString"),c="toString toLocaleString valueOf hasOwnProperty isPrototypeOf propertyIsEnumerable constructor".split(" "),g=c.length;return function(b){if("object"!==typeof b&&"function"!==typeof b||null===b){throw new TypeError("Object.keys called on non-object");}var d=[],a;for(a in b){e.call(b,a);d.push(a);}if(f){for(a=0;a<g;a++){e.call(b,c[a]);d.push(c[a]);}return d;}};}();
    }

    // String.prototype.trim = MDN https://developer.mozilla.org/en/docs/JavaScript/Reference/Global_Objects/String/trim#Compatibility
    if (!String.prototype.trim) {
        String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g,"");};
    }

    // call load callback queue
    document.addEventListener("DOMContentLoaded", function() {
        loaded = true;
        for (var i = 0, iz = loadQueue.length; i < iz; ++i) {
            loadQueue[i]();
        }
    }, false);

    //
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
            } else if (isNodeList(mix) ||
                      (isArray(mix) && mix.length && mix[0].nodeType)) {
                target = mix;
            } else if (mix === document || mix === document.body) {
                target = [document.body];
            } else if (typeof mix === "function") {
                if (loaded) {
                    mix();
                } else {
                    loadQueue.push(mix);
                }
            } else if (mix instanceof TT) {
                return mix;
            } else {
                throw new Error("argument type error");
            }
        }
        return new TT(target || [], selector);
    }

    // ##### object method
    tt.isArray = isArray;

    tt.isNodeList = isNodeList;

    tt.type = function(target, matches) {
        var res = target === null     ? "null" :
                  target === void 0   ? "undefined" :
                  target === global   ? "window" :
                  target === document ? "document" :
                  target.nodeType     ? "node" :
                  isArray(target)     ? "array" :
                  isNodeList(target)  ? "nodelist" : "";

        if (!res) {
            res = typeof target;
            if (res === "object") {
                res = Object.prototype.toString.call(target).
                      toLowerCase().match(/.*\s([a-z]*)\]/)[1];
            }
        }
        if (!matches) {
            return res;
        } else if (isArray(matches)) {
            for (var i = 0, iz = matches.length; i < iz; ++i) {
                if (matches[i] === res) {
                    return true;
                }
            }
            return false;
        } else {
            return matches === res;
        }
    };

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
    };

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

    tt.extend = function() {
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
            if (tt.type(arg) !== "object") {
                continue;
            }
            tt.each(Object.keys(arg), _extend);
        }
        return target;

        function _extend(key, index) {
            if (deep &&
                tt.type(target[key], "object") &&
                tt.type(arg[key], "object")) {
                    tt.extend(target[key], arg[key]);
            } else {
                target[key] = arg[key];
            }
        }
    };


    tt.query2object = function(query) {
        if (!tt.type(query, "string")) {
            return {};
        }
        var result = {},
            pair = query.split("&"),
            i = 0, iz = pair.length;

        for (; i < iz; ++i) {
            var k_v = pair[i].split("=");

            result[k_v[0]] = k_v[1];
        }
        return result;
    };

    tt.param = function(obj) {
        if (!tt.type(obj, "object")) {
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
    };

    tt.triggerEvent = function(node, event, type, bubbles, cancelable) {
        if (!node || !event) {
            throw new Error("Error: argument error");
        }
        if ("string" !== typeof type) {
            type = event;
            event = type === "click" ? "MouseEvents" : "Event";
        }
        var ev = document.createEvent(event);

        ev.initEvent(
                type,
                (bubbles === undefined) ? false : bubbles,
                (cancelable === undefined) ? false : cancelable);
        node.dispatchEvent(ev);
    };

    tt.cssPrefix = function(value, prefix) {
        var res = [];

        prefix = prefix || ["webkit", "moz", "o", "ms", "khtml"];
        tt.each(prefix, function(str, index) {
            res[index] = "-" + str + "-" + value;
        });
        return res;
    };

    tt.cssCamelizer = function(str) {
        if (!str || typeof str !== "string") {
            throw new Error("Error: argument error");
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

    tt.cssHyphenizer = function(str) {
        if (!str || typeof str !== "string") {
            throw new Error("Error: argument error");
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

    tt.tag = function(name, raw) {
        if (!name || typeof name !== "string") {
            throw new Error("Error: argument error");
        }
        var tag = document.createElement(name);

        return raw ? tag : tt(tag) ;
    };

    tt.createEnvData = function(nav) {
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
            (res.androidBrowser || res.androidBrowser && res.chrome) ? ua.match(/android\s(\S.*?)\;/) :
            (res.mobileSafari || res.mobileSafari && res.chrome) ? ua.match(/os\s(\S.*?)\s/) :
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
    };

    tt.env = tt.createEnvData(navigator);

    /***
     * tt.ajax({
     *  async: true,
     *  beforeSend: function(xhr) {},
     *  cache: true,
     *  complete: function(response, xhr) {},
     *  contents: {},
     *  contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
     *  context: document.body,
     *  crossDomain: false,
     *  data: {},
     *  dataType: 'text',
     *  error: function(xhr) {},
     *  headers: {},
     *  jsonp: '',
     *  jsonpCallback: '',
     *  mimeType: '',
     *  processData: true,
     *  success: function(data, status, xhr) {},
     *  timeout: 0,
     *  type: 'GET',
     *  url: '',
     *  user: null,
     *  password: null
     * });
     *
     */
    tt.ajax = function(mix, setting) {
        var timeout,
            xhr = new XMLHttpRequest();

        setting = setting || {};
        if (tt.type(mix, "object")) {
            setting = mix;
        } else if (tt.type(mix, "string")) {
            setting.url = mix;
        } else {
            throw new Error("Error: missing argument");
        }

        setting = tt.extend({
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
                tt.param(setting.data);
            setting.data = null;
        } else {
            setting.data = tt.param(setting.data);
        }

        xhr.onerror = function() {
            _callCallbacks("error");
        };

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                _callCallbacks("success");
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
        if (tt.type(setting.headers, "object")) {
            tt.each(setting.headers, function(key, value) {
                xhr.setRequestHeader(key, value);
            });
        }
        if (setting.dataType) {
            switch (setting.dataType) {
            case "json": xhr.responseType = "application/json"; break;
            case "xml":  xhr.responseType = "application/xml, text/xml"; break;
            case "html": xhr.responseType = "text/html"; break;
            case "text": xhr.responseType = "text/plain"; break;
            default:
                xhr.responseType =
                    (setting.dataType.indexOf("/") > -1) ? setting.dataType : "text/plain";
            }
        }
        if (setting.mimeType) {
            xhr.overrideMimeType(setting.mimeType) ;
        }
        if (setting.beforeSend) {
            setting.beforeSend(xhr);
        }
        if (setting.timeout) {
            timeout = setTimeout(function() {
                xhr.abort();
                _callCallbacks("error");
            }, setting,timeout);
        }

        xhr.send(setting.data);

        return xhr;

        function _callCallbacks(status) {
            var res = xhr.response,
                context = setting.context;

            clearTimeout(timeout);
            switch (status) {
            case "success":
                if (setting.success) {
                    setting.success.apply(context, [xhr.response, xhr.status, xhr]);
                }
                break;
            case "error":
                if (setting.error) {
                    setting.error.apply(context, [xhr.status, xhr]);
                }
                break;
            }
            if (setting.complete) {
                setting.complete(context, [xhr.response, xhr.status, xhr]);
            }
            xhr = null;
        }
    };


    // ##### TT constructor
    function TT(nodes, selector) {
        var i = 0, iz;

        this.selector = selector;
        this.length = iz = nodes.length;
        this._delegates = {};
        this._data = {};
        for (; i < iz; ++i) {
            this[i] = nodes[i];
        }
        return this;
    }

    // ##### class method
    TT.prototype = tt.fn = {
        constructor: TT,

        get: function(index) {
            return this[index || 0];
        },

        toArray: function() {
            var arr = [];

            this.each(function(index) {
                arr[index] = this;
            });
            return arr;
        },

        each: function(fn) {
            var i = 0, iz = this.length;

            for (; i < iz; ++i) {
                fn.call(this[i], i);
            }
            return this;
        },

        match: function(fn) {
            var i = 0, iz = this.length;

            for (; i < iz; ++i) {
                if (fn.call(this[i], i)) {
                    return this[i];
                }
            }
            return null;
        },

        on: function(type, mix, callback) {
            if (tt.type(mix, 'string')) {
                this.delegate(mix, type, callback);
            } else {
                this.bind(type, mix);
            }
            return this;
        },

        off: function(type, mix, callback) {
            if (tt.type(mix, 'string')) {
                this.undelegate(mix, type, callback);
            } else {
                this.unbind(type, mix);
            }
            return this;
        },

        bind: function(type, callback, capture) {
            capture = capture || false;
            this.each(function() {
                this.addEventListener(type, callback, capture);
            }, true);
            return this;
        },

        unbind: function(type, mix) {
            this.each(function() {
                this.removeEventListener(type, mix);
            }, true);
            return this;
        },

        delegate: function(target, type, callback) {
            var delegate = this._delegates[type],
                listener = {
                    target: target,
                    callback: callback
                };

            if (!delegate) {
                delegate = this._delegate[type] = {};
                delegate.listeners = [];
                delegate.handler = function(ev) {
                    var event, eventTarget = ev.target;

                    tt.match(delegate.listeners, function(listener) {
                        var match = tt(listener.target).match(function() {
                            var res = this.compareDocumentPosition(eventTarget);

                            if (res === 0 || res & global.Node.DOCUMENT_POSITION_CONTAINED_BY) {
                                return true;
                            }
                            return false;
                        });

                        if (match) {
                            event = tt.extend({}, ev);
                            event.currentTarget = match;
                            if (typeof listener.callback === "function") {
                                listener.callback(event);
                            } else if ("handleEvent" in listener.callback) {
                                listener.callback.handleEvent(event);
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

        undelegate: function(target, type, callback) {
            var delegate = this._delegates[type],
                listeners = delegate.listeners;

            if (!listeners || listeners.length === 0) {
                return this;
            }
            tt.match(listeners, function(listener, index) {
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

        addClass: (function() {
            var _addClass = domTester.classList ? _addClassByClassList : _addClassByClassName;

            return function(className) {
                _addClass.call(this, className);
                return this;
            };

            function _addClassByClassList(className) {
                this.each(function() {
                    this.classList.add(className);
                });
            }

            function _addClassByClassName(className) {
                var stashName = this[0].className,
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
        })(),

        removeClass: (function() {
            var _removeClass = domTester.classList ? _removeClassByClassList : _removeClassByClassName;

            return function(className) {
                _removeClass.call(this, className);
                return this;
            };

            function _removeClassByClassList(className) {
                this.each(function() {
                    this.classList.remove(className);
                });
            }

            function _removeClassByClassName(className) {
                className = " " + className + " ";
                this.each(function() {
                    this.className = (" " + this.className + " ").replace(className, "");
                });
            }
        })(),

        hasClass: (function() {
            var _hasClass = domTester.classList ? _hasClassByClassList : _hasClassByClassName;

            return function(className) {
                var res;

                res = _hasClass.call(this, className.trim());
                return res ? true : false;
            };

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
        })(),

        toggleClass: function(className, strict) {
            var self = this;

            if (strict) {
                self.each(function() {
                    var ttObj = tt(this);

                    if (ttObj.hasClass(className)) {
                        ttObj.removeClass(className);
                    } else {
                        ttObj.addClass(className);
                    }
                });
            } else {
                if (tt(self[0]).hasClass(className)) {
                    self.removeClass(className);
                } else {
                    self.addClass(className);
                }
            }
            return this;
        },

        find: function(query) {
            var res = [];

            this.each(function() {
                res = res.concat(tt(query, this).toArray());
            });
            return tt(res);
        },

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

        attr: function(mix, value) {
            var self = this, key;

            switch (arguments.length) {
            case 1:
                if (typeof mix === "object") {
                    tt.each(mix, function() {
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
                self.each(function() {
                    if (value === "") {
                        this.removeAttribute(key);
                        return;
                    }
                    this.setAttribute(key, value);
                });
            }
        },

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

        append: function(mix) {
            this.each((typeof mix === "string") ?
                function() { this.insertAdjacentHTML("beforeend", mix); } :
                function() { this.appendChild(mix); });
            return this;
        },

        prepend: function(mix) {
            this.each((typeof mix === "string") ?
                function() { this.insertAdjacentHTML("afterbegin", mix); } :
                function() { this.insertBefore(mix, this.firstChild); }
            );
            return this;
        },

        remove: function() {
            this.each(function() {
                this.parentNode.removeChild(this);
            });
            return this;
        },

        clear: function() {
            this.each(function() {
                while (this.firstChild) {
                    this.removeChild(this.firstChild);
                }
            });
            return this;
        },

        replace: function(mix) {
            this.each((typeof mix === "string") ?
                function() { this.insertAdjacentHTML("beforebegin", mix); } :
                function() { this.parentNode.insertBefore(mix, this); });
            this.remove();
            return this;
        },

        css: function(mix, value) {
            var self = this;

            if (typeof mix === "object") {
                tt.each(mix, function(key, val) {
                    if (val === "") {
                        _removeProperty(key);
                        return;
                    }
                    _setStyle(tt.cssCamelizer(key), val);
                });
            } else if (mix) {
                if (value) {
                    _setStyle(tt.cssCamelizer(mix), value);
                } else if (value === "") {
                    _removeProperty(mix);
                } else {
                    return global.getComputedStyle(this[0]).getPropertyValue(mix);
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

        data: (function() {
            var cond = domTester.dataset,
                _getDataAttr = cond ? _getDataByDataset : _getDataByAttributes,
                _setDataAttr = cond ? _setDataByDataset : _setDataByAttributes;

            return function (mix, value) {
                var self = this,
                    key;

                switch (arguments.length) {
                case 0:
                    return _getDataAttr.call(this);
                case 1:
                    if (typeof mix === "object") {
                        tt.each(mix, function(key, val) {
                            _setDataAttr.call(self, key, val);
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
                this.each(function() {
                    if (val === "") {
                        delete this.dataset[key];
                        return;
                    }
                    this.dataset[key] = val;
                });
            }

            function _getDataByDataset(key) {
                if (!this[0]) {
                    return null;
                }
                return key ? this[0].dataset[key] : this[0].dataset;
            }

            function _setDataByAttributes(key, val) {
                this.attr("data-" + key, val);
            }

            function _getDataByAttributes(key) {
                var res = {},
                    dataName = "data-",
                    node = this[0],
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
        })(),

        show: function(value) {
            var currentValue = this.css("display"),
                beforeValue = this._data.beforeDisplay || null;

            if (currentValue !== "none") {
                return;
            }
            return this.css("display", value || beforeValue || "block");
        },

        hide: function() {
            var currentValue = this.css("display");

            if (currentValue !== "none") {
                this._data.beforeDisplay = currentValue;
            }
            return this.css("display", "none");
        },

        trigger: function(event, type, bubbles, cancelable) {
            this.each(function() {
                tt.triggerEvent(this, event, type, bubbles, cancelable);
            });
            return this;
        },

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

    global[IDENT] = global[IDENT] || tt;
})(
    this,
    document,
    Array.isArray||(Array.isArray=function(a){return Object.prototype.toString.call(a)==="[object Array]";}),
    function(a) {var b=Object.prototype.toString.call(a);return b==="[object NodeList]"||b==="[object HTMLCollection]";}
);

