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
        if (typeof mix === "string" || mix.nodeType === 1) {
            return new TT(mix, parent);
        } else if (mix instanceof TT) {
            return mix;
        } else if (typeof mix === "function") {
            loaded ? mix() : queue.push(mix);
        } else if ((isArray(mix) || isNodeList(mix)) &&
                   mix.length > 0 &&
                   mix[0].nodeType === 1) {

            return new TT()._registNode(mix);
        }
	}

    tt.isArray = isArray;
    tt.isNodeList = isNodeList;

    tt.addMethod = function(name, fn) {
        if (tt.prototype[name] !== undefined ||
            typeof name !== "string" ||
            typeof fn !== "function") {
            return;
        }
        tt.prototype[name] = fn;
    }

    tt.each = function(arr, fn) {
        var i = 0, iz = arr.length;

        for (; i < iz; ++i) {
            fn(arr[i]);
        }
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
        res.other = !(res.androidBrowser || res.mobileSafari || res.chrome || res.firefox || res.opera);
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

    function TT(mix, parent) {
        var method, target;

        this.nodeList = [];
        this.length = 0;

        if (querySelectorRe.test(mix)) {    // "#hoge#fuga", "#hoge.fuga", "#hoge[attr='fuga']", "#hoge > .fuga", and more
            method = "querySelectorAll";
        } else if (mix[0] === '#') {        // id
            method = "getElementById";
            mix = mix.substr(1, mix.length);
        } else if (mix[0] === '.') {        // className
            method = "getElementsByClassName";
            mix = mix.substr(1, mix.length);
        } else if (mix.length > 0) {        // tagName
            method = "getElementsByTagName";
        }

        if (method !== undefined) {
            target = (parent || document)[method](mix);
            target && this._registNode(target);
        }

        return this;
    }

    TT.prototype = {
        constractor: TT,
        _registNode: function(node) {
            if (node.nodeType) {
                this.nodeList[0] = node;
                this.length = 1;
            } else {
                for (var i = 0, iz = node.length; i < iz; ++i) {
                    this.nodeList[i] = node[i];
                }
                this.length = iz;
            }
            return this;
        },
        get: function(num) {
            return this.nodeList[num || 0];
        },
        toArray: function() {
            return this.nodeList;
        },
        each: function(fn) {
            for (var i = 0; i < this.length; ++i) {
                fn(this.nodeList[i], i);
            }
            return this;
        },
        match: function() {
            for (var i = 0; i < this.length; ++i) {
                if (fn(this.nodeList[i], i)) {
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

            function _strictToggle() {
                self.each(function(node) {
                    var tt = new tt(node);

                    node.className.seach(className) ?
                        tt.removeClass(className) :
                        tt.addClass(className);
                });
            }

            function _simpleToggle() {
                if (self.nodeList[0].className.search(className)) {
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
        },
        html: function(mix) {
            if (mix && mix.nodeType === 1) {
                return this.add(mix);
            }
            this.each(function(node) {
                node.innerHTML = mix;
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
        },
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
