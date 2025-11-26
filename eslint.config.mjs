import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
 {
    files: ["main.js"],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        __dirname: "readonly",
      },
    },
  },

  // JS du renderer : côté navigateur, avec require dispo
  {
    files: ["renderer/**/*.js"],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "commonjs",
      globals: {
        ...globals.browser,
        require: "readonly",
      },
    },
  },
]);
