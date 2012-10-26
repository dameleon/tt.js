TestCase('tt', {
	'test10_extend' : function () {
		assertNoException(tt.extend);

		var hoge = {'key' : 'val'};
		var huga = {'prop' : 'value'};
		var foo = {'foo' : 'bar'};

		var res = tt.extend(hoge, huga, foo);

		assertEquals(res.key, hoge.key);
		assertEquals(res.prop, huga.prop);
		assertEquals(res.foo, foo.foo);

		assertNoException(function () {
			tt.extend(undefined)
		});
	},
	'test10_query2object' : function () {
		assertNoException(tt.query2object);
		var res = tt.query2object('hoge=huga&foo=bar');
		assertEquals(res, {
			'hoge' : 'huga',
			'foo' : 'bar'
		});
	},
	'test10_param' : function () {
		assertException(tt.param, 'TypeError');
		var res = tt.param({
			'hoge' : 'huga',
			'foo&bar' : 'kiyo&piyo'
		});
		assertEquals(res, 'hoge=huga&foo%26bar=kiyo%26piyo');
	},
	'test10_data' : function () {
		/*:DOC div = <div data-hoge="huga" data-foo="bar"></div> */
		assertException(tt.fn.data, 'TypeError');
		var res = tt(this.div).data();
		assertEquals(res, {
			'hoge' : 'huga',
			'foo' : 'bar'
		});
	},
	'test10_show_hide' : function () {
		/*:DOC div = <div style="display:none;"></div> */
		assertException(tt.fn.show, 'TypeError');
		assertException(tt.fn.hide, 'TypeError');
		tt(this.div).show();
		assertEquals(this.div.style.display, 'block');
		tt(this.div).hide();
		assertEquals(this.div.style.display, 'none');
	},
	'test10_trigger' : function () {
		/*:DOC div = <div style="display:none;"></div> */
		var spy = sinon.spy();
		tt(this.div).bind('click', spy);
		tt(this.div).trigger('click');
		assertCalledOnce(spy);

		assertNoException(function () {
			tt('hoge').trigger('huga');
		});
		var self = this;
		assertException(function () {
			tt(self.div).trigger();
		}, 'Error');
	},
	'test10_replace' : function () {
		/*:DOC += <div id="hoge"></div> */
		/*:DOC huga = <div id="huga"></div> */
		tt('#hoge').replace(this.huga);
		assertEquals(tt('#hoge').length, 0);
		assertEquals(tt('#huga').length, 1);

		tt('#huga').replace('<div id="hoge"></div>');
		assertEquals(tt('#hoge').length, 1);
		assertEquals(tt('#huga').length, 0);

		assertNoException(function () {
			tt('hoge').replace('');
		});
	}
});
