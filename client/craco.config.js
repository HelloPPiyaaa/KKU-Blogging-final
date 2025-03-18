module.exports = {
    webpack: {
      configure: (webpackConfig) => {
        const cssMinimizerPluginIndex = webpackConfig.optimization.minimizer.findIndex(
          (plugin) => plugin.constructor.name === 'CssMinimizerPlugin'
        );
        if (cssMinimizerPluginIndex !== -1) {
          webpackConfig.optimization.minimizer.splice(cssMinimizerPluginIndex, 1);
        }
        return webpackConfig;
      },
    },
  };
  