var config = module.exports;

config["ttjs Tests"] = {
    rootPath: "../",
    environment: "browser",
    sources: [
        "src/tt.js",
        "src/tt_helper.js"
    ],
    tests: [
        "test/*-test.js"
    ]
};
