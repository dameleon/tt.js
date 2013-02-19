/** "tt.js" -Highspeed SelectorBased Library- author: Kei Takahashi(twitter@dameleon, mail:dameleon[at]gmail.com) license: MIT version: 0.2.0 */
;(function(window, document, isArray, isNodeList, undefined) {
	'use strict';

	var IDENT = 'tt',
		querySelectorRe = /^(.+[\#\.\s\[>:,]|[\[:])/,
		loaded = false,
		loadQueue = [],
		delegateListeners = {};

	// for old android compatiblity
	// Object.keys - MDN https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys#Compatiblity
	Object.keys||(Object.keys=function(){var e=Object.prototype.hasOwnProperty,f=!{toString:null}.propertyIsEnumerable("toString"),c="toString toLocaleString valueOf hasOwnProperty isPrototypeOf propertyIsEnumerable constructor".split(" "),g=c.length;return function(b){if("object"!==typeof b&&"function"!==typeof b||null===b)throw new TypeError("Object.keys called on non-object");var d=[],a;for(a in b)e.call(b,a)&&d.push(a);if(f)for(a=0;a<g;a++)e.call(b,c[a])&&d.push(c[a]);return d}}());

	// String.prototype.trim = MDN https://developer.mozilla.org/en/docs/JavaScript/Reference/Global_Objects/String/trim#Compatibility
	String.prototype.trim||(String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g,'')}());

	// call load callback queue
	document.addEventListener('DOMContentLoaded', function() {
		loaded = true;
		for (var i = 0, iz = loadQueue.length; i < iz; ++i) {
			loadQueue[i]();
		}
	}, false);

	//
	function tt(mix, parent) {
		var target = null,
			selector = '';

		if (typeof mix === 'string') {
			selector = mix;
			parent = parent || document;
			if (querySelectorRe.test(mix)) {
				target = parent.querySelectorAll(mix);
			} else if (mix[0] === '#') {
				target = [parent.getElementById(mix.substring(1, mix.length))];
			} else if (mix[0] === '.') {
				target = parent.getElementsByClassName(mix.substring(1, mix.length));
			} else {
				target = parent.getElementsByTagName(mix);
			}
		} else if (mix) {
			if (mix.nodeType === 1) {
				target = [mix];
			} else if (isNodeList(mix) ||
					  (isArray(mix) && mix.length && mix[0].nodeType)) {
				target = mix;
			} else if (mix === document || mix === document.body) {
				target = [document.body];
			} else if (typeof mix === 'function') {
				loaded ? mix() : loadQueue.push(mix);
			} else if (mix instanceof TT) {
				return mix;
			} else {
				throw new Error('arguments type error');
			}
		}
		return new TT(target || [], selector);
	}

	// ##### object method
	tt.isArray = isArray;

	tt.isNodeList = isNodeList;

	tt.type = function(target, matches) {
		var str,
			res = target === null		? 'null' :
				  target === void 0		? 'undefined' :
				  target === window		? 'window' :
				  target === document	? 'document' :
				  target.nodeType		? 'node' :
				  tt.isArray(target)	? 'array' :
				  tt.isNodeList(target)	? 'nodelist' : '';

		if (!res) {
			res = typeof target;
			if (res === 'object') {
				res = Object.prototype.toString.call(target).
					  toLowerCase().match(/.*\s([a-z]*)\]/)[1];
			}
		}
		if (!matches) {
			return res;
		} else if (Array.isArray(matches)) {
			for (var i = 0, iz = matches.length; i < iz; ++i) {
				if (matches[i] === res) {
					return true;
				}
				return false
			}
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

		if (args[0] === 'true') {
			deep = true;
			++i;
		}
		target = args[(i - 1)] || {};

		for (; i < iz; ++i) {
			arg = args[i];
			if (tt.type(arg) !== 'object') {
				continue;
			}
			tt.each(Object.keys(arg), function(key, index) {
				if (deep &&
					tt.type(target[key], 'object') &&
					tt.type(arg[key], 'object')) {
						tt.extend(target[key], arg[key]);
				} else {
					target[key] = arg[key];
				}
			});
		}
		return target;
	};


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
		if (typeof str !== "string") {
			throw new Error("arugment type error");
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
		if (typeof str !== "string") {
			throw new Error("arugment type error");
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
		if (typeof name !== "string") {
			throw new Error("argument type error");
		}
		var tag = document.createElement(name);

		return raw ? tag : tt(tag) ;
	}

	tt.createEnvData = function(nav) {
		var res = {},
			ua = (nav || navigator).userAgent.toLowerCase();

		res.android = /android/.test(ua);
		res.ios = /ip(hone|od|ad)/.test(ua);
		res.windowsPhone = /windows\sphone/.test(ua);
		res.chrome = (res.android && /chrome/.test(ua)) || (res.ios && /crios/.test(ua));
		res.firefox = /firefox/.test(ua);
		res.opera = /opera/.test(ua);
		res.ie = /msie/.test(ua);
		res.androidBrowser = res.android && !res.chrome && /applewebkit/.test(ua);
		res.mobileSafari = res.ios && !res.chrome && /applewebkit/.test(ua);
		res.other = !(res.androidBrowser || res.mobileSafari || res.chrome || res.firefox || res.opera || res.ie);
		res.version =
			(res.androidBrowser || res.chrome) ? ua.match(/android\s(\S.*?)\;/) :
			res.mobileSafari ? ua.match(/os\s(\S.*?)\s/) :
			null;
		res.version = res.version && res.version[1];
		res.versionCode = _getVersionCode(res.version);
		res.isCompatible = res.android && res.versionCode < 3000 ||
						   res.ios && res.versionCode < 5000 ||
						   res.opera;
		res.supportTouch = 'ontouchstart' in window;

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
	};

	tt.env = tt.createEnvData(window.navigator);


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

							if (res === 0 || res & Node.DOCUMENT_POSITION_CONTAINED_BY) {
								return true;
							}
							return false;
						});

						if (match) {
							event = tt.extend({}, ev);
							event.currentTarget = match;
							if (typeof listener.callback === 'function') {
								listener.callback(event);
							} else if ('handleEvent' in listener.callback) {
								listener.callback.handleEvent(event);
							}
							return true;
						}
						return false
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
			var _addClass = tt.env.isCompatible ? _addClassByClassName : _addClassByClassList;

			return function(className) {
				_addClass.call(this, className);
				return this;
			}

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
			var _removeClass = tt.env.isCompatible ? _removeClassByClassName : _removeClassByClassList;

			return function(className) {
				_removeClass.call(this, className);
				return this;
			}

			function _removeClassByClassList(className) {
				this.each(function() {
					this.classList.remove(className);
				});
			}

			function _removeClassByClassName(className) {
				className = ' ' + className + ' ';
				this.each(function() {
					this.className = (' ' + this.className + ' ').replace(className, '');
				});
			}
		})(),

		hasClass: (function() {
			var _hasClass = tt.env.isCompatible ? _hasClassByClassName : _hasClassByClassList;

			return function(className) {
				var res;

				res = _hasClass.call(this, className.trim());
				return res ? true : false;
			}

			function _hasClassByClassList(className) {
				return this.match(function() {
					return this.classList.contains(className);
				});
			}

			function _hasClassByClassName(className) {
				return this.match(function() {
					return (' ' + this.className + ' ').indexOf(' ' + className + ' ') > -1;
				});
			}
		})(),

		toggleClass: function(className, strict) {
			var self = this;

			strict ? _strictToggle() : _simpleToggle();
			return this;

			function _strictToggle() {
				self.each(function() {
					var ttObj = tt(this);

					ttObj.hasClass(className) ?
						ttObj.removeClass(className) :
						ttObj.addClass(className);
				});
			}

			function _simpleToggle() {
				if (tt(self[0]).hasClass(className)) {
					self.removeClass(className);
				} else {
					self.addClass(className);
				}
			}
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
					break;
				} else {
					return this[0].getAttribute(mix);
				}
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
					this.insertAdjacentHTML('afterbegin', mix);
				});
			}
			return this;
			/*
			var range = document.createRange();

			range.selectNode(document.body);
			mix = range.createContextualFragment(mix);
			this.each(function() {
				while (this.firstChild) {
					this.removeChild(this.firstChild);
				}
				this.appendChild(mix);
			});
			return this;
			*/
		},

		append: function(mix) {
			if (typeof mix === "string") {
				var range = document.createRange();

				range.selectNode(document.body);
				mix = range.createContextualFragment(mix);
			}
			this.each(function() {
				this.appendChild(mix);
			});
			return this;
		},

		prepend: function(mix) {
			if (typeof mix === "string") {
				var range = document.createRange();

				range.selectNode(document.body);
				mix = range.createContextualFragment(mix);
			}
			this.each(function() {
				this.insertBefore(mix, this.firstChild);
			});
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
			var fn = null;

			if (mix && mix.nodeType) {
				fn = _insertNode;
			} else if (typeof mix === "string") {
				fn = _insertHTML;
			}
			fn && this.each(fn).remove();
			return this;

			function _insertNode() {
				this.parentNode && this.parentNode.insertBefore(mix, this);
			}

			function _insertHTML() {
				this.insertAdjacentHTML("beforebegin", mix);
			}
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
					return window.getComputedStyle(this[0]).getPropertyValue(mix);
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
			var _getDataAttr = tt.env.isCompatible ? _getDataByAttributes : _getDataByDataset,
				_setDataAttr = tt.env.isCompatible ? _setDataByAttributes : _setDataByDataset;

			return function (mix, value) {
				var self = this,
					key;

				switch (arguments.length) {
				case 0:
					return _getDataAttr.call(this);
				case 1:
					if (typeof mix === 'object') {
						tt.each(mix, function(key, val) {
							_setDataAttr.call(self, key, val);
						});
						return this;
					} else {
						return _getDataAttr.call(this, mix);
					}
				case 2:
					_setDataAttr.call(this, mix, value);
					return this;

				}
			}

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
			var currentValue = this.css('display'),
				beforeValue = this._data.beforeDisplay || null;

			if (currentValue !== 'none') {
				return;
			}
			return this.css('display', value || beforeValue || 'block');
		},

		hide: function() {
			var currentValue = this.css('display');

			if (currentValue !== 'none') {
				this._data.beforeDisplay = currentValue;
			}
			return this.css('display', 'none');
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
					left: offset.left + window.pageXOffset,
					top: offset.top + window.pageYOffset
				};
			});
			return this.length === 1 ? res[0] : res;
		}
	};

	window[IDENT] = window[IDENT] || tt;
})(
	this,
	document,
	Array.isArray||(Array.isArray=function(a){return Object.prototype.toString.call(a)==="[object Array]"}),
	function(a) {var b=Object.prototype.toString.call(a);return b==='[object NodeList]'||b==='[object HTMLCollection]'}
);

