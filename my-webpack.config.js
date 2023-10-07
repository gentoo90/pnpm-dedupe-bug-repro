const { WebpackManifestPlugin } = require('webpack-manifest-plugin');

function customizeWebpackConfig(config, _) {
  config.entry['my-entrypoint'] = [
    'src/my-entrypoint.ts',
  ];

  config.plugins.push(
    new WebpackManifestPlugin({})
  );

  return config;
}

module.exports = customizeWebpackConfig;
