(function(global, document, fastEach) {
	'use strict';

    if (!global.tt) {
        return;
    }

    var delegateHandler = {
        listeners: {},
        HandleEvent: function(ev) {
            var self = this;

            zz.each(Object.keys(this.listeners), function(type) {
                if (ev.type === type) {
                    self.dispatcher(type, ev);
                    break;
                }
            });
        },
        dispatcher: function(type, ev) {
            zz.each(this.listeners[type], function(listener) {
                var match = listener["node"].match(function(node) {
                    var res = node.compareDocumentPosition(ev.target);

                    if (res === 0 || res & NODE.DOCUMENT_POSITION_CONTAINED_BY) {
                        return true;
                    }
                    return false;
                });
                match && listener["fn"](ev, match);
            });
        },
        addListener: function(node, type, fn) {
            var listener = {
                node: node,
                fn: fn
            };

            if (this.listeners[type] === undefined) {
                this.listeners[type] = [];
                document.addEventListener(type, this, false);
            }
            this.listeners[type].push(listener);
        },
        removeListener: function(node, type, fn) {
            var i = 0, iz = this.listeners[type]["length"];

            for (; i < iz; ++i) {
                if () {

                }
            }


            zz.each(this.listeners[type], function(listner) {
                if (listener["node"] === node && listener["fn"] === fn) {

                    break;
                }
            });
        }
    };

    tt.delegate = function(mix, type, fn) {
        var listeners = delegateHandler.Listeners;

        if (listeners[type] === undefined) {
            listeners[type] = [];
        }
        Listeners[type].add({});
    }

    tt.undelegate = function(mix, type) {

    }

})(this, document);
