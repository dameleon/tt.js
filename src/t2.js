(function(global, document, fastEach) {
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
        if (typeof mix === "string") {
            return new TT(mix, parent);
        } else if (mix.nodeType === 1) {
            return new TT()._registNode(mix);
        } else if (mix instanceof TT) {
            return mix;
        } else if (typeof mix === "function") {
            loaded ? mix() : queue.push(mix);
        }
	}

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

    function TT(query, parent) {
        var method, target;

        this._nodeList = [];

        if (query === undefined) {
            return this;
        } else if (querySelectorRe.test(query)) { // "#hoge#fuga", "#hoge.fuga", "#hoge[attr='fuga']", "#hoge > .fuga", and more
            method = "querySelectorAll";
        } else if (query[0] === '#') {       // id
            method = "getElementById";
            query = query.substr(1, query.length);
        } else if (query[0] === '.') {      // className
            method = "getElementsByClassName";
            query = query.substr(1, query.length);
        } else {                             // tagName
            method = "getElementsByTagName";
        }

        target = (parent || document)[method](query);

        if (target !== null || target.length !== 0) {
            this._registNode(target);
        }
        return this;
    }

    TT.prototype._registNode = function(node) {
        if (node.nodeType) {
            this._nodeList[0] = node;
            return this;
        }
        for (var i = 0, iz = node.length; i < iz; ++i) {
            this._nodeList[i] = node[i];
        }
        return this;
    }

    TT.prototype.get = function(num) {
        return this._nodeList[num || 0];
    }

    TT.prototype.toArray = function() {
        return this._nodeList;
    }

    TT.prototype.each = function(fn, async) {
        var self = this,
            doEach = function() {
                zz.each(self._nodeList, fn);
            };

        if (typeof fn !== "function") {
            return this;
        }
        async ? global.setTimeout(doEach) : doEach();
        return this;
    }

    TT.prototype.match = function(fn) {
        var node, i = 0, iz = this._nodeList.length;

        for (; i < iz; ++i) {
            if (fn(this._nodeList[i])) {
                return this._nodeList[i];
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
    TT.prototype.bind = TT.prototype.on;

    TT.prototype.off = function(type, mix) {
        this.each(function(node) {
            node.removeEventListener(type, mix);
        }, true);
        return this;
    }
    TT.prototype.unbind = TT.prototype.off;

    TT.prototype.addClass = function(className) {
        this.each(function(node) {
            node.classList ?
                node.classList.add(className) :
                node.className = node.className + " " + className;
        });
        return this;
    }

    TT.prototype.removeClass = function(className) {
        this.each(function(node) {
            node.classList ?
                node.classList.remove(className) :
                node.className = node.className.replace(className, "");
        });
        return this;
    }

    TT.prototype.toggleClass = function(className) {
        this._nodeList[0].className.seach(className) ?
            this.removeClass(className) :
            this.addClass(className);
        return this;
    }

    TT.prototype.attr = function(key, value) {
        if (!key) return this;
        value = value || "";

        this.each(function(node) {
            node.setAttribute(key, value);
        });
        return this;
    }

    TT.prototype.html = function(html) {
        if (html.nodeType === 1) {
            this.add(html);
            return this;
        }
        this.each(function(node) {
            node.innerHTML = html;
        });
        return this;
    }

    TT.prototype.add = function(node) {
        this.each(function(node) {
            node.appendChild(node);
        })
        return this;
    }

    TT.prototype.remove = function() {
        this.each(function(node) {
            if (node.parentNode) {
                node.parentNode.removeChild(node);
            }
        });
        return this;
    }

    TT.prototype.clear = function() {
        this.each(function(node) {
            node.innerHTML = "";
        });
        return this;
    }

    global[NS] = global[NS] || tt;

})(this,document);
