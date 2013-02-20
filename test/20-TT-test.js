buster.testCase("tt.js test", {
    "setUp": function() {
        this.fixtures = {
            'id': document.getElementById('fixture-id'),
            'klass': document.getElementsByClassName('fixture-class'),
            'data': document.querySelectorAll('[data-role="fixture-data"]')
        };
        this.tts = {
            'id': tt('#fixture-id'),
            'klass': tt('.fixture-class'),
            'data': tt('[data-role="fixture-data"]')
        };
    },
    "get test": function() {
        var res;

        assert.equals(this.tts.id.get(), this.fixtures.id);
        assert.equals(this.tts.klass.get(2), this.fixtures.klass[2]);
    },
    "toArray test": function() {
        var res = this.tts.klass.toArray();

        assert.equals(tt.type(res), 'array');
        assert.equals(res.length, 5);
    },
    "each test": function() {
        var res = [];

        this.tts.klass.each(function(index) {
            assert.equals(this.nodeType, 1);
            assert.isNumber(index);
            res.push(this);
        });
        assert.equals(res.length, this.fixtures.klass.length);
    },
    "match": function() {
        var self = this, res;

        res = this.tts.klass.match(function(index) {
            assert.equals(this.nodeType, 1);
            assert.isNumber(index);
            return index === 2 ? true : false;
        });
        assert.equals(res.nodeType, 1);
        assert.equals(res, this.fixtures.klass[2]);
    },
    "on test": function() {
        var spy = sinon.spy();

        this.tts.id.on("onhoge", spy, false);
        tt.triggerEvent(this.fixtures.id, "onhoge", false, true);

        assert.calledOnce(spy);

        this.tts.id.off("onhoge", spy);
    },
    "off test": function() {
        var spy = sinon.spy();

        this.tts.id.on("onhoge", spy, false);
        this.tts.id.off("onhoge", spy);

        tt.triggerEvent(this.fixtures.id, "onhoge", false, true);

        refute.calledOnce(spy);
    },
    "bind test": function() {
        var spy = sinon.spy();

        this.tts.id.bind("onhoge", spy, false);
        tt.triggerEvent(this.fixtures.id, "onhoge", false, true);

        assert.calledOnce(spy);

        this.tts.id.unbind("onhoge", spy);
    },
    "unbind test": function() {
        var spy = sinon.spy();

        this.tts.id.bind("onhoge", spy, false);
        this.tts.id.unbind("onhoge", spy);

        tt.triggerEvent(this.fixtures.id, "onhoge", false, true);

        refute.calledOnce(spy);
    },
    // delegate, undelegate
    "addClass test": function() {
        var className = "added";

        this.tts.id.addClass(className);
        assert(this.fixtures.id.className.match(className));
    },
    "removeClass test": function() {
        var className = "added";

        this.tts.id.addClass(className);
        assert(this.fixtures.id.className.match(className));

        this.tts.id.removeClass(className);
        refute(this.fixtures.id.className.indexOf(className) > -1);
    },
    "hasClass test": function() {
        var className = "added";

        this.tts.id.addClass(className);
        assert(this.tts.id.hasClass(className));

        this.tts.id.removeClass(className);
        refute(this.tts.id.hasClass(className));
    },
    "toggleClass test": function() {
        var className = "added";

        this.tts.id.removeClass(className);

        this.tts.id.toggleClass(className);
        assert(this.tts.id.hasClass(className));

        this.tts.id.toggleClass(className);
        refute(this.tts.id.hasClass(className));
    },
    "toggleClass deep test": function() {
        var className = "added",
            target = tt(this.fixtures.klass[2]);

        this.tts.klass.removeClass(className);
        target.addClass(className);

        this.tts.klass.toggleClass(className, true);
        refute(target.hasClass(className));

        this.tts.klass.toggleClass(className, true);
        assert(target.hasClass(className));
    },
    "find test": function() {
        assert.equals(tt(document.body).find('.fixture-class').length, 5);
    },
    "contain test": function() {
        assert.equals(tt(document.body).find('.fixture-class').length, 5);
        refute(tt(document.body).contains(".notfound"));
    },
    "attr test": function() {
        assert.equals(this.tts.id.attr("name"), this.fixtures.id.getAttribute("name"));

        this.tts.id.attr("name", "attr-test-01");
        assert.equals(this.tts.id.attr("name"), this.fixtures.id.getAttribute("name"));

        this.tts.id.attr("name", "");
        assert.equals(this.tts.id.attr("name"), this.fixtures.id.getAttribute("name"));

        var attrs = { "name": "attr-test-02", "rel": "attr-test-03" };
        for (var key in attrs) {
            this.tts.id.attr(key, attrs[key]);
            assert.equals(this.tts.id.attr(key), this.fixtures.id.getAttribute(key));
        }
    },
    "html test": function() {
        var stash = this.fixtures.id.innerHTML;

        this.tts.id.html('<span>appended node</span>');
        assert.equals(this.fixtures.id.innerHTML, '<span>appended node</span>');
        assert.equals(this.tts.id.html(), '<span>appended node</span>');

        // reset
        this.fixtures.id.innerHTML = stash;
    },
    "append test": function() {
        var node = document.createElement("div"),
            stash = this.fixtures.id.innerHTML;

        // setting
        node.innerHTML = "added node";

        this.tts.id.append(node);
        assert.equals(this.fixtures.id.innerHTML, stash + "<div>added node</div>");

        // reset
        this.fixtures.id.innerHTML = stash;
    },
    "prepend test": function() {
        var node = document.createElement("div"),
            stash = this.fixtures.id.innerHTML;

        // setting
        node.innerHTML = "added node";

        this.tts.id.prepend(node);
        assert.equals(this.fixtures.id.innerHTML, "<div>added node</div>" + stash);

        // reset
        this.fixtures.id.innerHTML = stash;
    },
    "remove test": function() {
        var node = document.createElement("div");

        node.innerHTML = "added node";

        this.fixtures.id.innerHTML = "";
        this.fixtures.id.appendChild(node);

        tt(node).remove();
        assert.equals(this.fixtures.id.innerHTML, "");
    },
    "clear test": function() {
        var node = document.createElement("div");

        this.fixtures.id.innerHTML = node;

        this.tts.id.clear();
        assert.equals(this.fixtures.id.innerHTML, "");
    },
    "css test": function() {
        assert.equals(this.tts.id.css("display"), "block");

        this.tts.id.css("display", "inline-block");
        assert.equals(this.fixtures.id.style.display, "inline-block");

        this.tts.id.css({"display": "inline", "background-color": "#000000"});
        assert.equals(this.fixtures.id.style.display, "inline");
        assert.equals(this.fixtures.id.style.backgroundColor, "rgb(0, 0, 0)");
    },
    "data test": function() {
        var data = this.tts.klass.data();

        assert.equals(data.role, 'fixture-data');
        assert.equals(this.tts.klass.data('role'), 'fixture-data');

        // modified
        this.tts.klass.data('role', 'modified-data');
        assert.equals(this.tts.klass.data('role'), 'modified-data');

        // multi modified
        this.tts.klass.data({
            'role': 'modified-data-multi',
            'tmp': 'new-data'
        });
        assert.equals(this.tts.klass.data('role'), 'modified-data-multi');
        assert.equals(this.tts.klass.data('tmp'), 'new-data');

        // reset
        this.tts.klass.data('role', 'fixture-data');
        this.tts.klass.data('tmp', '');
    },
    "show test": function() {
        this.fixtures.id.style.display = "none";

        this.tts.id.show();
        assert.equals(this.fixtures.id.style.display, "block");
    },
    "hide test": function() {
        this.fixtures.id.style.display = "block";

        this.tts.id.hide();
        assert.equals(this.fixtures.id.style.display, "none");
    },
    "hide show test": function() {
        this.fixtures.id.style.display = "inline-block";

        this.tts.id.hide().show();
        assert.equals(this.fixtures.id.style.display, "inline-block");
    },
    "trigger test": function() {
        var spy = sinon.spy();

        this.fixtures.id.addEventListener("onhoge", spy, false);
        this.tts.id.trigger("Event", "onhoge", false, true);

        assert.calledOnce(spy);
    },
    "replace test": function() {
        var stash = this.fixtures.id.innerHTML + "",
            node01 = document.createElement("div"),
            node02 = document.createElement("div");

        node01.innerHTML = "hogehoge";
        node02.innerHTML = "mogemoge";
        this.fixtures.id.innerHTML = "";
        this.fixtures.id.appendChild(node01);

        tt(node01).replace("<div>mogemoge</div>");
        assert.equals(this.fixtures.id.innerHTML, "<div>mogemoge</div>");

        this.fixtures.id.innerHTML = "";
        this.fixtures.id.appendChild(node02);
        tt(node02).replace(node01);
        assert.equals(this.fixtures.id.innerHTML, "<div>hogehoge</div>");

        this.fixtures.id.innerHTML = stash;
    },
    "offset test": function() {
        var rect = this.fixtures.id.getBoundingClientRect(),
            offset = {
                left: rect.left + window.pageXOffset,
                top: rect.top + window.pageYOffset
            };

        assert.equals(this.tts.id.offset(), offset);
    }
});
