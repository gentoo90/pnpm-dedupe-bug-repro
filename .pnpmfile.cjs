function readPackage(pkg, context) {
  if (pkg?.name == 'webpack-manifest-plugin') {
    context.log(`Fixing dependencies of ${pkg.name}`);
    pkg.peerDependencies['esbuild'] = '0.18.17';
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  }
};
