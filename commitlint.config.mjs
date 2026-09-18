export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "header-max-length": [2, "always", 150],
    // Scope may contain CamelCase words (e.g. component names); subject-case
    // still applies and rejects sentence-case/start-case/pascal-case/upper-case.
    "scope-case": [0],
    // Long, multi-line commit descriptions are welcome: drop the 100-char
    // per-line cap config-conventional puts on the body and footer.
    "body-max-line-length": [0],
    "footer-max-line-length": [0],
  },
};
