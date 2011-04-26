var VERSION = "0.0.2",
    smoosh = require("smoosh"),
    fs = require("fs"),
    qunit = require("qunit");

// qunit settings
qunit.options.coverage = false;

// test, yo
qunit.run({
  code: "./src/sslac.js",
  tests: "./tests/sslac.test.js"
});

// smoosh, double yo
smoosh.make("config/smoosh.json");

var copyright = fs.readFileSync("./src/copyright.js", "utf8"),
    sslac     = fs.readFileSync("./tmp/sslac.js", "utf8"),
    sslacMin  = fs.readFileSync("./tmp/sslac.min.js", "utf8") + ";",
    licenses  = {
      "yui_bsd":    fs.readFileSync("./src/licenses/yui_bsd.js", "utf8"),
      "sslac_mit":  fs.readFileSync("./src/licenses/yui_bsd.js", "utf8"),
      "header":     fs.readFileSync("./src/licenses.js", "utf8"),
    };

fs.writeFileSync("./artifacts/sslac-"+VERSION+".js", [
  copyright,
  licenses.header,
  licenses.sslac_mit,
  sslac,
  licenses.yui_bsd
].join("\n"), "utf8");

fs.writeFileSync("./artifacts/sslac-"+VERSION+".min.js", [
  copyright,
  sslacMin
].join(""), "utf8");
