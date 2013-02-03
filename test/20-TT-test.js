buster.testCase("tt.js test", {
    "setUp": function() {
        this.hoge = document.getElementById("hoge");
        this.fuga = document.querySelectorAll(".fuga");
        this.piyo = document.querySelectorAll(".piyo");
        this.ttHoge = tt("#hoge");
        this.ttFuga = tt(".fuga");
        this.ttPiyo = tt(".piyo");
        this.role = {
            "hoge": "foo",
            "fuga": "bar",
            "piyo": "baz"
        };
        this.isArray = Array.isArray || function(target) {
            return Object.prototype.toString.call(target) === "[object Array]";
        };
    },
    "get test": function() {
        var res;

        res = this.ttPiyo.get();
        assert.equals(res.nodeType, 1);

        res = this.ttPiyo.get(2);
        assert.equals(res.getAttribute("data-role"), this.role.piyo);
    },
    "toArray test": function() {
        var res;

        res = this.ttPiyo.toArray();
        assert(this.isArray(res));
        assert.equals(res.length, 5);
    },
    "each test": function() {
        var res = [];

        this.ttPiyo.each(function(index) {
            assert.equals(this.nodeType, 1);
            assert.isNumber(index);
            res.push(this);
        });
        assert.equals(res.length, this.piyo.length);
    },
    "match": function() {
        var self = this, res;

        res = this.ttPiyo.match(function(index) {
            assert.equals(this.nodeType, 1);
            assert.isNumber(index);

            var attr = this.getAttribute("data-role");

            if (attr === self.role.piyo) {
                return true;
            }
            return false;
        });
        assert.equals(res.nodeType, 1);
        assert.equals(res.getAttribute("data-role"), this.role.piyo);
    },
    "on test": function() {
        var spy = sinon.spy();

        this.ttHoge.on("onhoge", spy, false);
        tt.triggerEvent(this.hoge, "onhoge", false, true);

        assert.calledOnce(spy);

        this.ttHoge.off("onhoge", spy);
    },
    "off test": function() {
        var spy = sinon.spy();

        this.ttHoge.on("onhoge", spy, false);
        this.ttHoge.off("onhoge", spy);

        tt.triggerEvent(this.hoge, "onhoge", false, true);

        refute.calledOnce(spy);
    },
    "bind test": function() {
        var spy = sinon.spy();

        this.ttHoge.bind("onhoge", spy, false);
        tt.triggerEvent(this.hoge, "onhoge", false, true);

        assert.calledOnce(spy);

        this.ttHoge.unbind("onhoge", spy);
    },
    "unbind test": function() {
        var spy = sinon.spy();

        this.ttHoge.bind("onhoge", spy, false);
        this.ttHoge.unbind("onhoge", spy);

        tt.triggerEvent(this.hoge, "onhoge", false, true);

        refute.calledOnce(spy);
    },
    "addClass test": function() {
        var className = "add-class";

        this.ttHoge.addClass(className);
        assert(this.hoge.className.match(className));
    },
    "removeClass test": function() {
        var className = "remove-class";

        this.ttHoge.addClass(className);

        this.ttHoge.removeClass(className);
        refute(this.hoge.className.indexOf(className) > -1);
    },
    "hasClass test": function() {
        var className = "has-class";

        this.ttHoge.addClass(className);
        assert(this.ttHoge.hasClass(className));

        this.ttHoge.removeClass(className);
        refute(this.ttHoge.hasClass(className));
    },
    "toggleClass test": function() {
        var className = "toggle-class";

        // setting
        this.ttHoge.removeClass(className);

        this.ttHoge.toggleClass(className);
        assert(this.ttHoge.hasClass(className));

        this.ttHoge.toggleClass(className);
        refute(this.ttHoge.hasClass(className));
    },
    "toggleClass deep test": function() {
        var className = "toggle-class-deep",
            targetNode = tt(this.piyo[2]);

        // setting
        this.ttPiyo.removeClass(className);
        targetNode.addClass(className);

        this.ttPiyo.toggleClass(className, true);
        refute(targetNode.hasClass(className));

        this.ttPiyo.toggleClass(className, true);
        assert(targetNode.hasClass(className));
    },
    "find test": function() {
        assert.equals(this.ttFuga.find(".piyo").length, this.piyo.length);
    },
    "contain test": function() {
        assert.equals(this.ttFuga.contains(".piyo"), this.fuga[0]);
        refute(this.ttPiyo.contains(".notfound"));
    },
    "attr test": function() {
        assert.equals(this.ttHoge.attr("name"), this.hoge.getAttribute("name"));

        this.ttHoge.attr("name", "attr-test-01");
        assert.equals(this.ttHoge.attr("name"), this.hoge.getAttribute("name"));

        this.ttHoge.attr("name", "");
        assert.equals(this.ttHoge.attr("name"), this.hoge.getAttribute("name"));

        var attrs = { "name": "attr-test-02", "rel": "attr-test-03" };
        for (var key in attrs) {
            this.ttHoge.attr(key, attrs[key]);
            assert.equals(this.ttHoge.attr(key), this.hoge.getAttribute(key));
        }
    },
    "html test": function() {
        var node = document.createElement("div"),
            stash = this.hoge.innerHTML;

        // setting
        node.innerHTML = "low";

        this.ttHoge.html("<div>low</div>");
        assert.equals(this.hoge.innerHTML, "<div>low</div>");

        // reset
        this.hoge.innerHTML = stash;

        this.ttHoge.html(node);
        assert.equals(this.hoge.innerHTML, "<div>low</div>");
    },
    "append test": function() {
        var node = document.createElement("div"),
            stash = this.hoge.innerHTML;

        // setting
        node.innerHTML = "low";

        this.ttHoge.append(node);
        assert.equals(this.hoge.innerHTML, stash + "<div>low</div>");

        // reset
        this.hoge.innerHTML = stash;

        this.ttHoge.append("<div>low</div>");
        assert.equals(this.hoge.innerHTML, stash + "<div>low</div>");
    },
    "prepend test": function() {
        var node = document.createElement("div"),
            stash = this.hoge.innerHTML;

        // setting
        node.innerHTML = "low";

        this.ttHoge.prepend(node);
        assert.equals(this.hoge.innerHTML, "<div>low</div>" + stash);

        // reset
        this.hoge.innerHTML = stash;

        this.ttHoge.prepend("<div>low</div>");
        assert.equals(this.hoge.innerHTML, "<div>low</div>" + stash);
    },
    "add test": function() {
        var node = document.createElement("div"),
            stash = this.hoge.innerHTML;

        // setting
        node.innerHTML = "low";

        this.ttHoge.add(node);
        assert.equals(this.hoge.innerHTML, stash + "<div>low</div>");

        // reset
        this.hoge.innerHTML = stash;

        this.ttHoge.add("<div>low</div>");
        assert.equals(this.hoge.innerHTML, stash + "<div>low</div>");
    },
    "remove test": function() {
        var node = document.createElement("div");

        node.innerHTML = "mogemoge";

        this.hoge.innerHTML = "";
        this.hoge.appendChild(node);

        tt(node).remove();
        assert.equals(this.hoge.innerHTML, "");
    },
    "clear test": function() {
        var node = document.createElement("div");

        this.hoge.innerHTML = node;

        this.ttHoge.clear();
        assert.equals(this.hoge.innerHTML, "");
    },
    "css test": function() {
        assert.equals(this.ttHoge.css("display"), "block");

        this.ttHoge.css("display", "inline-block");
        assert.equals(this.hoge.style.display, "inline-block");

        this.ttHoge.css({"display": "inline", "background-color": "#000000"});
        assert.equals(this.hoge.style.display, "inline");
        assert.equals(this.hoge.style.backgroundColor, "rgb(0, 0, 0)");
    },
    "data test": function() {
        var data = this.ttHoge.data();

        assert.equals(data.role, this.role.hoge);

        assert.equals(this.ttHoge.data("role"), this.role.hoge);

        this.ttHoge.data("role", "data-test-01")
        assert.equals(this.hoge.getAttribute("data-role"), "data-test-01");

        // reset
        this.hoge.setAttribute("data-role", this.role.hoge);

        this.ttHoge.data({"role": "data-test-02", "title": "data-test-title"});
        assert.equals(this.hoge.getAttribute("data-role"), "data-test-02");
        assert.equals(this.hoge.getAttribute("data-title"), "data-test-title");
    },
    "show test": function() {
        this.hoge.style.display = "none";

        this.ttHoge.show();
        assert.equals(this.hoge.style.display, "block");
    },
    "hide test": function() {
        this.hoge.style.display = "block";

        this.ttHoge.hide();
        assert.equals(this.hoge.style.display, "none");
    },
    "hide show test": function() {
        this.hoge.style.display = "inline-block";

        this.ttHoge.hide().show();
        assert.equals(this.hoge.style.display, "inline-block");
    },
    "trigger test": function() {
        var spy = sinon.spy();

        this.hoge.addEventListener("onhoge", spy, false);
        this.ttHoge.trigger("Event", "onhoge", false, true);

        assert.calledOnce(spy);
    },
    "replace test": function() {
        var stash = this.hoge.innerHTML + "",
            node01 = document.createElement("div"),
            node02 = document.createElement("div");

        node01.innerHTML = "hogehoge";
        node02.innerHTML = "mogemoge";
        this.hoge.innerHTML = "";
        this.hoge.appendChild(node01);

        tt(node01).replace("<div>mogemoge</div>");
        assert.equals(this.hoge.innerHTML, "<div>mogemoge</div>");

        this.hoge.innerHTML = "";
        this.hoge.appendChild(node02);
        tt(node02).replace(node01);
        assert.equals(this.hoge.innerHTML, "<div>hogehoge</div>");

        this.hoge.innerHTML = stash;
    },
    "offset test": function() {
        var rect = this.hoge.getBoundingClientRect(),
            offset = {
                left: rect.left + window.pageXOffset,
                top: rect.top + window.pageYOffset
            };

        assert.equals(this.ttHoge.offset(), offset);
    }
});
