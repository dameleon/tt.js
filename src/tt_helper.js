(function(global, document, fastEach) {
	'use strict';

    if (!global.tt) {
        return;
    }

    var delegateHandler = {
        listeners: {},
        handleEvent: function(ev) {
            var listeners = this.listeners[ev.type];

            if (listeners !== undefined && listeners.length > 0) {
                this.dispatcher(type, ev);
            }
        },
        dispatcher: function(type, ev) {
            zz.match(this.listeners[type], function(listener) {
                var match = zz(listener["node"]).match(function(node) {
                    var res = node.compareDocumentPosition(ev.target);

                    if (res === 0 || res & NODE.DOCUMENT_POSITION_CONTAINED_BY) {
                        return true;
                    }
                    return false;
                });

                if (match) {
                    listener["fn"](ev, match);
                    return true;
                }
                return false;
            });
        },
        addListener: function(node, type, fn) {
            var listeners = this.listeners[type],
                listener = {
                node: node,
                fn: fn
            };

            if (listeners === undefined) {
                listeners = [];
            }
            if (listeners.length === 0) {
                document.addEventListener(type, this, false);
            }
            listeners.push(listener);
        },
        removeListener: function(node, type, fn) {
            var self = this,
                listeners = this.listeners[type];

            if (listeners === undefined || listeners.length === 0) {
                return;
            }
            zz.match(listeners, function(listner, index) {
                if (listener["node"] !== node || listener["fn"] !== fn) {
                    return false;
                }
                listeners.splice(index, 1);
                if (listeners.length === 0) {
                    document.removeEventListener(type, self);
                }
                return true;
            });
        }
    };

    tt.delegate = function(mix, type, fn) {
        if (!mix ||
            typeof type !== "string" ||
            typeof fn !== "function") {
                return;
        }
        delegateHandler.addListener(mix, type, fn);
    }

    tt.undelegate = function(mix, type) {
        if (!mix || typeof type !== "string") {
            return;
        }
        delegateHandler.removeListener(mix, type);
    }

// keys - MDN https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys#Compatiblity
Object.keys||(Object.keys=function(){var e=Object.prototype.hasOwnProperty,f=!{toString:null}.propertyIsEnumerable("toString"),c="toString toLocaleString valueOf hasOwnProperty isPrototypeOf propertyIsEnumerable constructor".split(" "),g=c.length;return function(b){if("object"!==typeof b&&"function"!==typeof b||null===b)throw new TypeError("Object.keys called on non-object");var d=[],a;for(a in b)e.call(b,a)&&d.push(a);if(f)for(a=0;a<g;a++)e.call(b,c[a])&&d.push(c[a]);return d}}());

})(this, document);
