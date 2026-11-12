/**
 * Whether an unminified bundle carries a module of the published package, by the region comment
 * the bundler writes before each module (`//#region node_modules/@tweakpad/ui/dist/<module>.js`).
 * Tag names are no evidence: shared modules list other components' tags in selectors.
 */
export function bundlesModule(source, module) {
  return source.includes(`//#region node_modules/@tweakpad/ui/dist/${module}.js\n`);
}
