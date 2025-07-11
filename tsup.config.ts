// tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"], // support both import and require
  dts: true, // generate .d.ts files
  sourcemap: true, // useful for debugging
  clean: true, // clean dist before building
  external: ["react", "react-dom"], // don't bundle React
});
