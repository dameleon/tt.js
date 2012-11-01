TestCase('tt', {
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
