const tselint = require("@typescript-eslint/eslint-plugin");
const parser = require("@typescript-eslint/parser");

module.exports = [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser,
      parserOptions: {
        project: "./tsconfig.json",
        // sourceType: "script",
      },
    },
    plugins: {
      "@typescript-eslint": tselint,
    },
    rules: {},
  },
];
