// eslint.config.js

import typescriptParser from "@typescript-eslint/parser";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";

export default [
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
