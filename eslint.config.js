// eslint.config.js

const typescriptParser = require("@typescript-eslint/parser");
const typescriptPlugin = require("@typescript-eslint/eslint-plugin");

module.exports = [
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: {
      "@typescript-eslint": typescriptPlugin,
    },
    rules: {
      ...typescriptPlugin.configs.recommended.rules,
      // Keep existing behaviour: console.log is allowed, and `any` is acceptable.
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
