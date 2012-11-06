(function(global, document) {
	'use strict';

    if (!global.tt) {
        return;
    }

    var delegateHandler = {
        listeners: {},
        handleEvent: function(ev) {
            var listener = this.listeners[ev.type];

            if (listener !== undefined && listener.length > 0) {
                this.dispatcher(ev);
            }
        },
        dispatcher: function(ev) {
            var type = ev.type;

            tt.match(this.listeners[type], function(listener) {
                var match = tt(listener["node"]).match(function() {
                    var res = this.compareDocumentPosition(ev.target);

                    if (res === 0 || (res & Node.DOCUMENT_POSITION_CONTAINED_BY)) {
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
            var listener = {
                    node: node,
                    fn: fn
                };

            if (this.listeners[type] === undefined) {
                this.listeners[type] = [];
            }
            if (this.listeners[type].length === 0) {
                document.addEventListener(type, this, false);
            }
            this.listeners[type].push(listener);
        },
        removeListener: function(node, type, fn) {
            var self = this,
                listeners = this.listeners[type];

            if (listeners === undefined || listeners.length === 0) {
                return;
            }
            tt.match(listeners, function(listner, index) {
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

})(this, document);
