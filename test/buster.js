var config = module.exports;
var fs = require("fs");

config["ttjsTests"] = {
    env: "browser",
    rootPath: "../",
    sources: [
        "src/tt.js"
    ],
    resources: [
        {
            "path": "/",
            "file": "test/fixtures/index.html"
        }
    ],
    tests: [
        "test/*-test.js"
    ]
};
