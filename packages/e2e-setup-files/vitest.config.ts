export default {
  test: {
    name: "setup-files",
    globals: true,
    setupFiles: ["vitest-dynaliter/setupHooks"],
    environment: "node",
  },
};
