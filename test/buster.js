var config = module.exports;
var fs = require("fs");

config["ttjsTests"] = {
    env: "browser",
    rootPath: "../",
    sources: [
        "src/tt.js"
    ],
    resources: [
        { "path": "/", "file": "test/fixtures/index.html" },
        { "path": "/json", "file": "test/fixtures/ajax.json" },
        { "path": "/html", "file": "test/fixtures/ajax.html" },
        { "path": "/text", "file": "test/fixtures/ajax.txt" },
    ],
    tests: [
        "test/*-test.js"
    ]
};
