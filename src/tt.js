(function(global, document, isArray, isNodeList) {
	'use strict';

	var NS = "tt",
        querySelectorRe = /^.+[\#\.\s\[>]/,
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
        } else if (mix.nodeType === 1 || isNodeList(mix)) {
            target = mix;
        } else if (mix instanceof TT) {
            return mix;
        } else if (typeof mix === "function") {
            loaded ? mix() : queue.push(mix);
            return;
        }

        return new TT(target);
	}

    tt.isArray = isArray;
    tt.isNodeList = isNodeList;

    tt.plugin = function(name, fn) {
        if (TT.prototype[name] !== undefined ||
            typeof name !== "string" ||
            typeof fn !== "function") {

            return;
        }
        TT.prototype[name] = fn;
    }

    tt.each = function(arr, fn) {
        var i = 0, iz = arr.length;

        for (; i < iz; ++i) {
            fn(arr[i], i);
        }
    }

    tt.match = function(arr, fn) {
        var i = 0, iz = arr.length;

        for (; i < iz; ++i) {
            if (fn(arr[i], i)) {
                return arr[i];
            }
        }
        return null;
    }

    tt.then = function(arr, fn, target) {
        var i = 0, iz = arr.length;

        target = target || true;
        for (; i < iz; ++i) {
            if (fn(arr[i], i) === target) {
                return true;
            }
        }
        return false;
    }

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

    tt.extend = function(/* args... */) {
        var arg, args = [].slice.call(arguments),
            result = {},
            i = 0, iz = args.length,
            k = 0, kz, key, keys;

        for (; i < iz; ++i) {
            arg = args[i];
            if (!arg || typeof arg !== "object") {
                continue;
            }
            keys = Object.keys(arg);
            kz = keys.length;
            for (; k < kz; ++k) {
                key = keys[k];
                result[key] = arg[key];
            }
        }
        return result;
    };

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
    }

    tt.env = (function(navigator) {
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
    })(global.navigator);


    function TT(node) {
        var i = 0, iz;

        this.nodes = [];
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
        get: function(num) {
            return this.nodes[num || 0];
        },
        toArray: function() {
            return this.nodes;
        },
        each: function(fn) {
            var i = 0, iz = this.length;

            for (; i < iz; ++i) {
                fn(this.nodes[i], i);
            }
            return this;
        },
        match: function() {
            var i = 0, iz = this.length;

            for (; i < iz; ++i) {
                if (fn(this.nodes[i], i)) {
                    return this[i];
                }
            }
            return null;
        },
        on: function(type, mix, capture) {
            this.each(function(node) {
                node.addEventListener(type, mix, capture);
            }, true);
            return this;
        },
        off: function(type, mix) {
            this.each(function(node) {
                node.removeEventListener(type, mix);
            }, true);
            return this;
        },
        addClass:
            ((tt.env.android && tt.env.versionCode < 3000) ||
             (tt.env.ios && tt.env.versionCode < 5000) ||
             (tt.env.opera)) ?
                _addClassByClassName :
                _addClassByClassList,
        removeClass:
            ((tt.env.android && tt.env.versionCode < 3000) ||
             (tt.env.ios && tt.env.versionCode < 5000) ||
             (tt.env.opera)) ?
                _removeClassByClassName :
                _removeClassByClassList,
        toggleClass: function(className, strict) {
            var self = this;

            strict ? _strictToggle() : _simpleToggle();
            return this;

            function _strictToggle() {
                self.each(function(node) {
                    var ttObj = tt(node);

                    node.className.search(className) >= 0 ?
                    ttObj.removeClass(className) :
                    ttObj.addClass(className);
                });
            }

            function _simpleToggle() {
                if (self.nodes[0].className.search(className) >= 0) {
                    self.removeClass(className);
                } else {
                    self.addClass(className);
                }
            }
        },
        attr: function(key, value) {
            value = value || "";
            this.each(function(node) {
                node.setAttribute(key, value);
            });
            return this;
        },
        html: function(mix, pos) {
            if (mix && mix.nodeType === 1) {
                return this.add(mix);
            }
            pos = pos || "beforeend";
            this.each(function(node) {
                node.innerHTML = "";
                node.insertAdjacentHTML(pos, mix);
            });
            return this;
        },
        add: function(child) {
            this.each(function(node) {
                node.appendChild(child);
            });
            return this;
        },
        remove: function() {
            this.each(function(node) {
                node.parentNode.removeChild(node);
            });
            return this;
        },
        clear: function() {
            this.each(function(node) {
                node.innerHTML = "";
            });
            return this;
        },
        css: function(mix, value) {
            var prop, val,
                self = this,
                css = "";

            if (typeof mix === "object") {
                for (prop in mix) {
                    if (mix[prop] === "") {
                        _removeProperty(prop);
                        return;
                    }
                    _setStyle(prop, mix[prop]);
                }
            } else {
                if (value) {
                    _setStyle(mix, value);
                } else if (value === "") {
                    _removeProperty(mix);
                } else {
                    return global.getComputedStyle(this.nodes[0]).getPropertyValue(mix);
                }
            }

            function _removeProperty(prop) {
                self.each(function(node) {
                    node.style.removeProperty(prop);
                });
            }

            function _setStyle(prop, val) {
                self.each(function(node) {
                    node.style[prop] = val;
                });
            }
        },

        /***
         * <div data-hoge="fuga"></div>
         *
         * tt(mix).data();
         * @return {hoge: "fuga"}
         *
         * tt(mix).data("hoge");
         * @return "fuga"
         *
         * tt(mix).data("hoge", "fugafuga");
         * @effect <div data-hoge="fugafuga"></div>
         * @return this
         *
         * tt(mix).data("hoge", "");
         * @effect <div></div>
         * @return this
         *
         * tt(mix).data({ "hoge": "fugafuga", "piyo": "zonu" });
         * @effect <div data-hoge="fugafuga" data-piyo="zonu"></div>
         * @return this
         */
        data: function() {
            var elem = this.nodes[0];
            var attrs = this.nodes[0].attributes;
            var result = {};
            for (var i = 0, l = attrs.length; i < l; ++i) {
                var attr = attrs[i].name;
                if (!attr.indexOf('data-')) {
                    result[attr.replace(/^data-/, '')] = elem.getAttribute(attr);
                }
            }
            return result;
        },
        show: function() {
            return this.css("display", "block");
        },
        hide: function() {
            return this.css('display', 'none');
        },
        trigger: function(event, type, bubbles, cancelable) {
            this.each(function(node) {
                tt.triggerEvent(node, event, type, bubbles, cancelable);
            });
            return this;
        },
        replace: function(mix) {
            if (mix && mix.nodeType) {
                this.each(function(node) {
                    node.parentNode.insertBefore(mix, target);
                });
            } else {
                this.html(mix, "afterend");
            }
            this.remove();
            return this;
        },
        offset: function() {
            var offset = this.nodes[0].getBoundingClientRect();

            return {
                left: offset.left + window.pageXOffset,
                top: offset.top + window.pageYOffset
            };
        }
    };

    TT.prototype.bind = TT.prototype.on;
    TT.prototype.unbind = TT.prototype.off;

    function _addClassByClassList(className) {
        this.each(function(node) {
            node.classList.add(className);
        });
        return this;
    }

    function _addClassByClassName(className) {
        this.each(function(node) {
            var currentName = node.className.split(" ");

            currentName[currentName.length] = className;
            node.className = currentName.join(" ");
        });
        return this;
    }

    function _removeClassByClassList(className) {
        this.each(function(node) {
            node.classList.remove(className);
        });
        return this;
    }

    function _removeClassByClassName(className) {
        this.each(function(node) {
            node.className = node.className.replace(className ,"");
        });
        return this;
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
