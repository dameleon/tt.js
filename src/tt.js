(function(global, document, isArray, isNodeList) {
	'use strict';

	var NS = "tt",
        querySelectorRe = /^.+[\#\.\s\[>]/,
        loaded = false,
        queue = [];

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
            if (!version) return null;
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

        this.length = 0;
        if (node) {
            if (node.nodeType) {
                this[0] = node;
                this.length = 1;
            } else {
                iz = this.length = node.length;
                for (; i < iz; ++i) {
                    this[i] = node[i];
                }
            }
        }
        return this;
    }

    TT.prototype.get = function(num) {
        return this[num || 0];
    }

    TT.prototype.toArray = function() {
        var arr = [];

        this.each(function(node, index) {
            arr[index] = node;
        });
        return arr;
    }

    TT.prototype.each = function(fn) {
        for (var i = 0; i < this.length; ++i) {
            fn(this[i], i);
        }
        return this;
    }

    TT.prototype.match = function() {
        for (var i = 0; i < this.length; ++i) {
            if (fn(this[i], i)) {
                return this[i];
            }
        }
        return null;
    }

    TT.prototype.on = function(type, mix, capture) {
        this.each(function(node) {
            node.addEventListener(type, mix, capture);
        }, true);
        return this;
    }

    TT.prototype.off = function(type, mix) {
        this.each(function(node) {
            node.removeEventListener(type, mix);
        }, true);
        return this;
    }

    TT.prototype.addClass =
            ((tt.env.android && tt.env.versionCode < 3000) ||
             (tt.env.ios && tt.env.versionCode < 5000) ||
             (tt.env.opera)) ?
                _addClassByClassName :
                _addClassByClassList;

    TT.prototype.removeClass =
            ((tt.env.android && tt.env.versionCode < 3000) ||
             (tt.env.ios && tt.env.versionCode < 5000) ||
             (tt.env.opera)) ?
                _removeClassByClassName :
                _removeClassByClassList;

    TT.prototype.toggleClass = function(className, strict) {
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
            if (self[0].className.search(className) >= 0) {
                self.removeClass(className);
            } else {
                self.addClass(className);
            }
        }
    }

    TT.prototype.attr = function(key, value) {
        value = value || "";
        this.each(function(node) {
            node.setAttribute(key, value);
        });
        return this;
    }

    TT.prototype.html = function(mix) {
        if (mix && mix.nodeType === 1) {
            return this.add(mix);
        }
        this.each(function(node) {
            node.innerHTML = mix;
        });
        return this;
    }

    TT.prototype.add = function(child) {
        this.each(function(node) {
            node.appendChild(child);
        });
        return this;
    }

    TT.prototype.remove = function() {
        this.each(function(node) {
            node.parentNode.removeChild(node);
        });
        return this;
    }

    TT.prototype.clear = function() {
        this.each(function(node) {
            node.innerHTML = "";
        });
        return this;
    }

    TT.prototype.css = function(mix, value) {
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
                //css += prop + ":" + mix[prop] + ";";
            }
            //_setCss(css);
        } else {
            if (value) {
                _setStyle(mix, value);
                // css += mix + ":" + value + ";";
                // _setCss(css);
            } else if (value === "") {
                _removeProperty(mix);
            } else {
                return global.getComputedStyle(this[0]).getPropertyValue(mix);
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

        function _setCss(css) {
            self.each(function(node) {
                node.style.cssText = css;
            });
        }
    }

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
