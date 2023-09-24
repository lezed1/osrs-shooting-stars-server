module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ["prettier"],
  overrides: [
    {
      files: ["*.js", "*.jsx", "*.ts", "*.tsx"],
      extends: ["standard-with-typescript", "prettier"],
    },
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    parser: "@typescript-eslint/parser",
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  rules: {},
  ignorePatterns: [".eslintrc.js", "dist"],
};
