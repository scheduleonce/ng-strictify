// filepath: c:\Oncehub\so-projects\ng-strictify\test-app\eslint.config.js
module.exports = [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
      parser: require("@typescript-eslint/parser"),
      sourceType: "module",
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
    },
    rules: {
      ...require("@typescript-eslint/eslint-plugin").configs["recommended-type-checked"].rules,
    },
  },
  {
    ignores: ["node_modules/**"]
  }
];