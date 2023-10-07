function customizeWebpackConfig(config, _) {
  config.entry['my-entrypoint'] = [
    'src/my-entrypoint.ts',
  ];

  return config;
}

module.exports = customizeWebpackConfig;
