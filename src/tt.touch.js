;(function(window, document, tt, undefined) {

var supportTouch = 'ontouchstart' in document, // for pc support
	events = {
		touchStart:supportTouch ? 'touchstart' : 'mousedown',
		touchMove: supportTouch ? 'touchmove' : 'mousemove',
		touchEnd:  supportTouch ? 'touchend'   : 'mouseup'
	},
    setting = {
        timeout: 300
    };

var touchHandler = {
        threshold: tt.env.android ? 50 : 30,
        startPoint: null,
        currentTarget: null,
        handleEvent: function(ev) {
            switch (ev.type) {
            case events.touchMove:
                if (this.startPoint) {
                    this._touchMove(ev);
                }
                break;
            case events.touchStart:
                this._touchStart(ev);
                break;
            case events.touchEnd:
                if (this.startPoint) {
                    this._touchEnd(ev);
                }
                break;
            }
        },
        _touchStart: function(ev) {
            var self = this;

            this.startPoint = getPoint(ev);
            this.currentTarget = ev.target;
            setTimeout(function() {
                self._clear();
            }, setting.timeout);
            trigger(this.currentTarget, 'touch', this.startPoint.x, this.startPoint.y);
        },
        _touchMove: function(ev) {

        },
        _touchEnd: function(ev) {
            var currentPoint = getPoint(ev);

            if (this.threshold < Math.abs(this.startPoint.x - currentPoint.x) &&
                this.threshold < Math.abs(this.startPoint.y - currentPoint.y)) {
                    this._clear();
            } else {
                trigger(this.currentTarget, 'tap', currentPoint.x, currentPoint.y);
            }
        },
        _clear: function() {
            this.startPoint = null;
            this.currentTarget = null;
        }
};

document.addEventListener(events.touchStart, touchHandler, false);
//document.addEventListener(events.touchMove, touchHandler, false);
document.addEventListener(events.touchEnd, touchHandler, false);

function getPoint(event) {
	return {
		x: getPage(event, 'pageX'),
		y: getPage(event, 'pageY')
	};
}

function getPage(event, page) {
	return supportTouch ? event.changedTouches[0][page] : event[page];
}

function trigger(element, type, pageX, pageY) {
    setTimeout(function() {
        var event = document.createEvent('Event');

        event.initEvent(type, true, true);
        event.pageX = pageX;
        event.pageY = pageY;
        element.dispatchEvent(event);
    });
}

})(this, document, this.tt);
