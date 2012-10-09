(function(global, document, fastEach) {
	'use strict';

    if (global.tt) {
        return;
    }

    var delegateHandler = {
        stash: {
            type: [
                {node: obj, fn: ()}
            ]
        },
        HandleEvent: function(ev) {
            var self = this;

            Object.key(this.stash).forEach(function(type) {
                (ev.type === type) && self.dispatcher(type, ev);
            });
        },
        dispatcher: function(type, ev) {
            var match = null,
                listeners = this.stash[type];

            listeners.forEach(function(listener) {
                match = listener.node.match(function(node) {
                    var res = node.compareDocumentPosition(ev.target);

                    if (res === 0 || res & NODE.DOCUMENT_POSITION_CONTAINED_BY) {
                        return true;
                    }
                    return false;
                });
                match && listeners.fn(ev, match);
            });
        }
    };

    tt.delegate = function(mix, type, fn, parent) {


        parent = parent || document;
        parent.addEventListener(type, function(ev) {
            var tt = tt(mix), match;

            match = tt.match(function(node) {
                var res = node.compareDocumentPosition(ev.target);

                if (res === 0 || res & NODE.DOCUMENT_POSITION_CONTAINED_BY) {
                    return true;
                }
                return false;
            });
            fn(ev, match);
        }, false);
    }

    tt.undelegate = function(mix, type, parent) {

    }

})(this, document);
