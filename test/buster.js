var config = module.exports;

config["ttjsTests"] = {
    rootPath: "../",
    environment: "browser",
    sources: [
        "src/tt.js",
        "src/tt_helper.js"
    ],
    resources: [
        {
            "path": "/",
            "content": "test/fixtures/test.html"
        }
    ],
    tests: [
        "test/*-test.js"
    ]
};
