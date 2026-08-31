import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: "es2022",
  external: [
    "react",
    "react-hook-form",
    "@dynamic-form-engine/core",
    "@dynamic-form-engine/react"
  ]
});
