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
        assert.equals(this.isArray(res));
        assert.equals(res.length, 5);
    },
    "each test": function() {
        var res = [];

        this.ttPiyo.each(function(node, index) {
            assert.equals(node.nodeType, 1);
            assert.isNumber(index);
            res.push(node);
        });
        assert.equals(res.length, this.piyo.length);
    },
    "match": function() {
        var self = this, res;

        res = this.ttPiyo.match(function(node, index) {
            assert.equals(node.nodeType, 1);
            assert.isNumber(index);

            var attr = node.getAttribute("data-role");

            if (attr === self.role.piyo) {
                return true;
            }
            return false;
        });
        assert.equals(res.nodeType, 1);
        assert.equals(res.getAttribute("data-role"), this.role.piyo);
    },
    "on test": function() {
        // 非同期なので後回し
    },
    "bind test": function() {
        // this["on test"]とかで呼べないのかな…
    },
    "off test": function() {
        // 非同期なので後回し
    },
    "unbind test": function() {
        // this["off test"]とかで呼べないのかな…
    },
    "addClass test": function() {
        var className = "add-class";

        this.ttHoge.addClass(className);
        assert.contain(this.hoge.className, className);
    },
    "removeClass test": function() {
        var className = "remove-class";

        this.ttHoge.addClass(className);

        this.ttHoge.removeClass(className);
        refure.contain(this.hoge.className, className);
    },
    "hasClass test": function() {
        var className = "has-class";

        this.ttHoge.addClass(className);
        assert(this.ttHoge.hasClass(className));

        this.ttHoge.removeClass(className);
        refure(this.ttHoge.hasClass(className));
    },
    "toggleClass test": function() {
        var className = "toggle-class";

        // setting
        this.ttHoge.removeClass(className);

        this.toggleClass(className);
        assert(this.ttHoge.hasClass(className));

        this.toggleClass(className);
        refure(this.ttHoge.hasClass(className));
    },
    "toggleClass deep test": function() {
        var className = "toggle-class-deep",
            targetNode = tt(this.piyo[2]);

        // setting
        this.ttPiyo.removeClass(className);
        targetNode.addClass(className);

        this.toggleClass(className, true);
        refure(targetNode.hasClass(className));

        this.toggleClass(className, true);
        assert(targetNode.hasClass(className));
    },
    "attr test": function() {
        assert.equals(this.ttHoge.attr("name"), this.hoge.getAttribute("name"));

        this.ttHoge.attr("name", "attr-test-01");
        assert.equals(this.ttHoge("name"), this.hoge.getAttribute("name"));

        this.ttHoge.attr("name", "");
        assert.equals(this.ttHoge("name"), this.hoge.getAttribute("name"));

        var attrs = { "name": "attr-test-02", "rel": "attr-test-03" };
        for (var key in attrs) {
            this.ttHoge.attr(key, attrs[key]);
            assert.equals(this.ttHoge(key), this.hoge.getAttribute(key));
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

        this.hoge.innerHTML = node;

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
        assert.equals(this.hoge.style.display, "block");

        this.ttHoge.css({"display": "inline", "backgroundColor", "#000000"});
        assert.equals(this.hoge.style.display, "inline");
        assert.equals(this.hoge.style.backgroundColor, "inline");
    },
    "data test": function() {
        assert.equals(this.ttHoge.data(), {"role": this.role.hoge});

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

        this.hoge.addEventListener("click", spy, false);
        this.ttHoge.trigger("MouseEvent", "click", false, true);
    },
    "replace test": function() {
        var stash = this.hoge.innerHTML + "",
            node01 = document.createElement("div"),
            node02 = document.createElement("div");

        node.innerHTML = "hogehoge";
        targetNode.innerHTML = "mogemoge";
        this.hoge.innerHTML = "";
        this.hoge.appendChild(node);

        tt(node01).replace("<div>mogemoge</div>");
        assert.equals(this.hoge.innerHTML, "<div>mogemoge</div>");

        tt(node02).replace(node01);
        assert.equals(this.hoge.innerHTML, "<div>hogehgoe</div>");

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
