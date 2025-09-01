module.exports = {
  root: true,
  env: { es2022: true, node: true },
  parser: "@typescript-eslint/parser",
  parserOptions: { project: true, tsconfigRootDir: __dirname },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier",
  ],
  rules: {
    "no-console": "warn",
  },
  ignorePatterns: ["dist", "node_modules"],
};
