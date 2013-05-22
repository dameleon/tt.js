// プラグイン名変えたら色々と書きなおす必要がありますよっと
buster.testCase("tt.js test", {
    "setUp": function() {
        this.isPhantomjs = /phantomjs/.test(navigator.userAgent.toLowerCase());
    },
    "Basic test": {
        "tt function": function() {
            assert.isFunction(tt);
        },
        "tt object": function() {
            var tts = tt("");

            assert.equals(typeof tts, "object");
            assert.equals(tts.constructor.name, "TTWorker");
        },
        "tt loaded function": function() {
            var spy = sinon.spy();

            tt(spy);
            assert.calledOnce(spy);
        }
    },
    "DOM Search test": {
        "ID named search": function() {
            assert.equals(tt("#fixture-id").length, 1);
        },
        "class named search": function() {
            assert.equals(tt(".fixture-class").length, 5);
        },
        "tag named search": function() {
            assert.equals(tt("div").length, document.getElementsByTagName('div').length);
        },
        "use querySelectorAll search": function() {
            assert.equals(tt('[data-role="fixture-data"]').length, 5);
            assert.equals(tt('[data-role=fixture-data]').length, 5);
        }
    },
    "tt methods test": {
        "isArray test": function() {
            assert.isFunction(tt.isArray);
            assert(tt.isArray([]));
        },
        "isNodeList test": function() {
            assert.isFunction(tt.isNodeList);
            assert(tt.isNodeList(document.getElementsByTagName('html')));
        },
        "type test": function() {
            assert.isFunction(tt.type);

            assert.equals(tt.type(null), 'null');
            assert.equals(tt.type(undefined), 'undefined');
            assert.equals(tt.type(window), 'global');
            assert.equals(tt.type(document), 'document');
            assert.equals(tt.type(document.body), 'node');
            assert.equals(tt.type([]), 'array');
            assert.equals(tt.type(document.getElementsByTagName('html')), 'nodelist');
            assert.equals(tt.type({}), 'object');
            assert.equals(tt.type(tt()), 'object');
            assert.equals(tt.type(new Date()), 'date');
            assert(tt.type(new RegExp(''), ['regexp', 'function']));
            assert.equals(tt.type(1234), 'number');
            assert.equals(tt.type('1234'), 'string');
        },
        "each test": function() {
            assert.isFunction(tt.each);

            var arr = [1, 2, 3, 4, 5],
                res = [];

            tt.each(arr, function(val) {
                res.push(val);
            });
            assert(res.length);
            for (var i = 0, iz = res.length; i < iz; ++i) {
                assert.equals(res[i], arr[i]);
            }
        },
        "match test": function() {
            assert.isFunction(tt.match);

            var arr = [1, 2, 3, 4, 5],
                res;

            res = tt.match(arr, function(val) {
                if (val === 3) {
                    return true;
                }
            });
            assert.equals(res, 3);

            res = tt.match(arr, function() {
                return false;
            });
            assert.isNull(res);
        },
        "extend test": {
            "function test" : function() {
                assert.isFunction(tt.extend);
            },
            "object test": function() {
                var a = {
                        'hoge': 1,
                        'fuga': 2,
                        'piyo': 3
                    },
                    b = {
                        'fuga': 'a',
                        'piyo': 'b'
                    },
                    c;

                c = tt.extend(a, b);
                assert.equals(a, c, {
                    'hoge': 1,
                    'fuga': 'a',
                    'piyo': 'b'
                });

                var d = {
                    'hoge': {
                        'fuga': false
                    }
                },
                e = {
                    'hoge': {
                        'fuga': true
                    }
                }
                tt.extend(d, e);
                assert.equals(d, {
                    'hoge': {
                        'fuga': true
                    }
                });
            },
            "array test": function() {
                var a = [1,2,3],
                    b = [],
                    c;

                b[1] = "a";
                b[2] = "b";
                b[3] = "c";

                c = tt.extend(a, b);
                assert.equals(c, [1, "a", "b", "c"]);
            }
        },
        "proxy test": function() {
            var arg = "arg",
                obj = {
                    init: function() { return this; },
                    hoge: "fuga"
                };

            assert.exception(function () {
                tt.proxy();
            }, 'Error');

            assert.equals(obj, tt.proxy(function() { return this; }, obj)());
            assert.equals(arg, tt.proxy(function(a) { return a; }, obj, arg)());
            assert.equals(obj, tt.proxy(obj, 'init')());
        },
        "parseJSON test": function() {
            var jsonText = '{"hoge": "hoge", "fuga": "fuga", "piyo": "piyo"}',
                fakeJsonText = '{hoge: "hoge", fuga: "fuga", piyo: "piyo"}',
                brokenJsonText = '{hoge: fuga,}',
                obj = {
                    hoge: "hoge",
                    fuga: "fuga",
                    piyo: "piyo"
                };

            assert.exception(function() {
                tt.parseJSON(brokenJsonText);
            });
            assert.equals({}, tt.parseJSON());
            _assert(jsonText);
            _assert(fakeJsonText);

            function _assert(text) {
                var res = tt.parseJSON(text);
                tt.each(obj, function(key, val) {
                    assert.equals(obj[key], res[key]);
                });
            }
        },
        "query2object test": function() {
            assert.isFunction(tt.query2object);

            var res = tt.query2object('hoge=huga&foo=bar');
            assert.equals(res, {
                'hoge' : 'huga',
                'foo' : 'bar'
            });
        },
        "param test": function() {
            assert.isFunction(tt.param);

            var res = tt.param({
                'hoge' : 'huga',
                'foo&bar' : 'kiyo&piyo'
            });
            assert.equals(res, 'hoge=huga&foo%26bar=kiyo%26piyo');
        },
        "triggerEvent test": function() {
            assert.isFunction(tt.triggerEvent);

            var spy = sinon.spy();

            tt(document.body).bind('click', spy, false);
            tt(document.body).trigger('click');

            assert.calledOnce(spy);

            refute.exception(function () {
                tt('').trigger('');
            });
        },
        "cssPrefix test": function() {
            assert.isFunction(tt.cssPrefix);

            var defaultPrefix = ["webkit", "moz", "o", "ms", "khtml"],
                testPrefix = ["webkit", "moz"],
                value = "transition", res;

            res = tt.cssPrefix(value);
            tt.each(res, function(prefixed, index) {
                assert.equals(prefixed, "-" + defaultPrefix[index] + "-" + value);
            });

            res = tt.cssPrefix(value, testPrefix);
            tt.each(res, function(prefixed, index) {
                assert.equals(prefixed, "-" + testPrefix[index] + "-" + value);
            });
        },
        "camelizer test": function() {
            var prop = "-webkit-tap-highlight-color";

            assert.equals(tt.camelizer(prop), "webkitTapHighlightColor");
            assert.exception(function() { tt.camelizer() }, "Error");
        },
        "hyphenizer test": function() {
            var prop = "webkitTapHighlightColor";

            assert.equals(tt.hyphenizer(prop), "-webkit-tap-highlight-color");
            assert.exception(function() { tt.hyphenizer() }, "Error");
        },
        "tag test": function() {
            var ttObj = tt.tag("div", true),
                div = tt.tag("div");

            assert.equals(ttObj.get().nodeName.toLowerCase(), "div");
            assert.equals(div.nodeName.toLowerCase(), "div");
            assert.exception(function() { tt.tag() }, "Error");
        },
        "createEnvData test": function() {
            assert.isFunction(tt.createEnvData);

            var res = {};
            var testUA = {
                "ios": [
                    ["6000", "Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A403 Safari/8536.25"],
                    ["5110", "Mozilla/5.0 (iPhone; CPU iPhone OS 5_1_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9B206 Safari/7534.48.3"],
                    ["4210", "Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_2_1 like Mac OS X; ja-jp) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8C148 Safari/6533.18.5"]
                ],
                "android": [
                    ["4110", "Mozilla/5.0 (Linux; U; Android 4.1.1; ja-jp; Galaxy Nexus Build/JRO03H) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30"],
                    ["3210", "Mozilla/5.0 (Linux; U; Android 3.2.1; ja-jp; Transformer TF101 Build/HTK75) AppleWebKit/534.13 (KHTML, like Gecko) Version/4.0 Safari/534.13"],
                    ["2330", "Mozilla/5.0 (Linux; U; Android 2.3.3; ja-jp; SC-02C Build/GINGERBREAD) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1"],
                    ["2210", "Mozilla/5.0 (Linux; U; Android 2.2.1; ja-jp; IS03 Build/S9090) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1"]
                ],
                "windowsPhone": [
                    ["", "Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0; FujitsuToshibaMobileCommun; IS12T; KDDI)"]
                ],
                "chrome": [
                    ["4110", "Mozilla/5.0 (Linux; Android 4.1.1; Nexus 7 Build/JRO03S) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Safari/535.19"]
                ],
                "opera": [
                    ["", "Opera/9.80 (Android 2.3.3; Linux; Opera Mobi/ADR-1111101157; U; ja) Presto/2.9.201 Version/11.50"]
                ],
                "firefox": [
                    ["", "Mozilla/5.0 (Android; Linux armv7l; rv:9.0) Gecko/20111216 Firefox/9.0 Fennec/9.0"]
                ]
            };

            for (var key in testUA) {
                var values = testUA[key];

                values.forEach(function(data) {
                    res = tt.createEnvData({"userAgent": data[1]});
                    assert(res[key]);

                    if (data[0]) {
                        assert.equals(parseInt(data[0]), res.versionCode);
                    } else {
                        refute(data[0]);
                    }

                    assert.equals(data[0] ? parseInt(data[0]) : null, res.versionCode);
                });
            }
        },
        "tt.env test": function() {
            assert.isObject(tt.env);
        },
        "tt.ajax function test": function() {
            assert.exception(function() {
                tt.ajax();
            }, 'Error');
        },
        "tt.ajax json test": function() {
            var dfd = when.defer();

            tt.ajax({
                beforeSend  : null,
                cache       : true,
                complete    : null,
                context     : document.body,
                data        : null,
                dataType    : "json",
                error       : null,
                success     : function(res) {
                    assert.equals(res.result, "success");
                    dfd.resolver.resolve();
                },
                url         : buster.env.contextPath + "/json",
            });

            return dfd.promise;
        },
        "tt.ajax html test": function() {
            var that = this,
                dfd = when.defer(),
                isCompatible = this.isPhantomjs ||
                               (tt.env.androidBrowser && tt.env.versionCode < 5000) ||
                               (tt.env.mobileSafari && tt.env.versionCode < 6000);

            // phantomjs, before android 2.3 and before iOS 5.1 is not supported dataType="document"
            if (isCompatible) {
                    tt.ajax({
                        beforeSend  : null,
                        cache       : true,
                        complete    : null,
                        context     : document.body,
                        data        : null,
                        dataType    : "text",
                        error       : null,
                        success     : function(res) {
                            assert(res);
                            dfd.resolver.resolve();
                        },
                        url         : buster.env.contextPath + "/html",
                    });
            } else {
                tt.ajax({
                    beforeSend  : null,
                    cache       : true,
                    complete    : null,
                    context     : document.body,
                    data        : null,
                    dataType    : this.isPhantomjs ? "text" : "document",
                    error       : null,
                    success     : function(res) {
                        if (isCompatible) {
                            assert(res);
                        } else {
                            assert(res.body.textContent, "success");
                        }
                        dfd.resolver.resolve();
                    },
                    url         : buster.env.contextPath + "/html",
                });
            }

            return dfd.promise;
        },
        "tt.ajax text test": function() {
            var that = this,
                dfd = when.defer();

            tt.ajax({
                beforeSend  : null,
                cache       : true,
                complete    : null,
                context     : document.body,
                data        : null,
                dataType    : "text",
                error       : null,
                success     : function(res) {
                    assert.equals(res, "success");
                    dfd.resolver.resolve();
                },
                url         : buster.env.contextPath + "/text",
            });

            return dfd.promise;
        },
        "tt.ajax error test": function() {
            var that = this,
                dfd = when.defer();

            tt.ajax({
                beforeSend  : null,
                cache       : true,
                complete    : null,
                context     : document.body,
                data        : null,
                dataType    : "text",
                error       : function(status) {
                    assert(true);
                    dfd.resolver.resolve();
                },
                success     : null,
                url         : "http:://undefined.com/not_found",
                timeout     : 100
            });

            return dfd.promise;
        },
        "tt.toArray test": function() {
            assert(Array.isArray(tt.toArray(arguments)));
            assert(Array.isArray(tt.toArray(document.getElementsByTagName("div"))));
        }
    }
});
