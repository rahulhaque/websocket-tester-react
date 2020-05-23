const { override, addLessLoader, addBabelPlugin } = require("customize-cra");

module.exports = override(
  addLessLoader({
    lessOptions: {
      javascriptEnabled: true,
      modifyVars: {}
    }
  }),
  addBabelPlugin(["prismjs", {
    "languages": ["json"],
    "plugins": ["line-numbers", "show-language"],
    "theme": "okaidia",
    "css": true
  }])
);
