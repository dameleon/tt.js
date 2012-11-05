var config = module.exports;
var fs = require("fs");

config["ttjsTests"] = {
    env: "browser",
    rootPath: "../",
    sources: [
        "src/tt.js",
        "src/tt_helper.js"
    ],
    resources: [
        {
            "path": "/",
            "file": "test/fixtures/test.html"
        }
    ],
    tests: [
        "test/*-test.js"
    ]
};
