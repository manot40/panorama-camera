/** @type {import('prettier').Config} */
module.exports = {
  printWidth: 110,
  singleQuote: true,
  trailingComma: "es5",
  bracketSameLine: true,
  plugins: ["prettier-plugin-svelte"],
  htmlWhitespaceSensitivity: "ignore",
  overrides: [{ files: "*.svelte", options: { parser: "svelte" } }],
};
