# Repo that reproduces the PNPM bug with `dedupe-peer-dependents`

With PNPM 8.8.0 `dedupe-peer-dependents=true` does not help with the error in webpack:

```
/home/user/projects/tmp/wpstats/node_modules/.pnpm/webpack@5.88.2/node_modules/webpack/lib/NormalModule.js:231
			throw new TypeError(
			      ^

TypeError: The 'compilation' argument must be an instance of Compilation
    at NormalModule.getCompilationHooks (/home/user/projects/tmp/wpstats/node_modules/.pnpm/webpack@5.88.2/node_modules/webpack/lib/NormalModule.js:231:10)
    at /home/user/projects/tmp/wpstats/node_modules/.pnpm/webpack-manifest-plugin@5.0.0_webpack@5.88.2/node_modules/webpack-manifest-plugin/dist/index.js:57:42
    at _next43 (eval at create (/home/user/projects/tmp/wpstats/node_modules/.pnpm/tapable@2.2.1/node_modules/tapable/lib/HookCodeFactory.js:19:10), <anonymous>:97:1)
    at _next21 (eval at create (/home/user/projects/tmp/wpstats/node_modules/.pnpm/tapable@2.2.1/node_modules/tapable/lib/HookCodeFactory.js:19:10), <anonymous>:189:1)
    at Hook.eval [as call] (eval at create (/home/user/projects/tmp/wpstats/node_modules/.pnpm/tapable@2.2.1/node_modules/tapable/lib/HookCodeFactory.js:19:10), <anonymous>:279:1)
    at Hook.CALL_DELEGATE [as _call] (/home/user/projects/tmp/wpstats/node_modules/.pnpm/tapable@2.2.1/node_modules/tapable/lib/Hook.js:14:14)
    at Compiler.newCompilation (/home/user/projects/tmp/wpstats/node_modules/.pnpm/webpack@5.88.2_esbuild@0.18.17/node_modules/webpack/lib/Compiler.js:1126:26)
    at /home/user/projects/tmp/wpstats/node_modules/.pnpm/webpack@5.88.2_esbuild@0.18.17/node_modules/webpack/lib/Compiler.js:1170:29
    at eval (eval at create (/home/user/projects/tmp/wpstats/node_modules/.pnpm/tapable@2.2.1/node_modules/tapable/lib/HookCodeFactory.js:33:10), <anonymous>:31:1)

Node.js v20.5.1
```

## Steps to reproduce

1. Create a new Angular project
```bash
ng new <PROJECT_NAME> --package-manager pnpm -S --strict --style scss
```

2. Add [`@angular-builders/custom-webpack`](https://www.npmjs.com/package/@angular-builders/custom-webpack) and [`webpack-manifest-plugin`](https://www.npmjs.com/package/webpack-manifest-plugin):
```bash
pnpm add -D @angular-builders/custom-webpack webpack-manifest-plugin
```

3. Create custom `my-webpack.config.js`:
```js
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');

function customizeWebpackConfig(config, _) {
  config.plugins.push(
    new WebpackManifestPlugin({})
  );

  return config;
}

module.exports = customizeWebpackConfig;
```

4. Use it in `angular.json`
```patch
@@ -40,7 +40,7 @@
       "prefix": "app",
       "architect": {
         "build": {
-          "builder": "@angular-devkit/build-angular:browser",
+          "builder": "@angular-builders/custom-webpack:browser",
           "options": {
             "outputPath": "dist/wpstats",
             "index": "src/index.html",
@@ -50,6 +50,12 @@
             ],
             "tsConfig": "tsconfig.app.json",
             "inlineStyleLanguage": "scss",
+            "customWebpackConfig": {
+              "path": "my-webpack.config.js",
+              "verbose": {
+                "properties": [ "plugins", "mode", "entry", "output" ]
+              }
+            },
             "assets": [
               "src/favicon.ico",
               "src/assets"
```

5. Build
```bash
pnpm exec ng build
```
## Workaround

Is in the [`workaround`](https://github.com/gentoo90/pnpm-dedupe-bug-repro/tree/workaround) branch. Use the `readPackage` hook in `.pnpmfile.cjs` to add `esbuild` to peer dependencies of `webpack-manifest-plugin`:
```js
function readPackage(pkg, context) {
  if (pkg?.name == 'webpack-manifest-plugin') {
    context.log(`Fixing dependencies of ${pkg.name}`);
    pkg.peerDependencies['esbuild'] = '0.18.17'
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  }
};
```
