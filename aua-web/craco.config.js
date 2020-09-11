const CracoLessPlugin = require('craco-less');

const modifyVars = {
  '@primary-color': '#143e86',
  '@font-size-base': '14px',
  '@height-base': '40px',
  '@height-lg': '48px',
  '@height-sm': '32px',
  '@border-radius-base': '6px',
  '@heading-1-size': 'ceil(@font-size-base * 2.0)',
  '@heading-2-size': 'ceil(@font-size-base * 1.8)',
  '@heading-3-size': 'ceil(@font-size-base * 1.6)',
  '@heading-4-size': 'ceil(@font-size-base * 1.4)',
};

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          // javascriptEnabled: true,
          // modifyVars,
          lessOptions: {
            javascriptEnabled: true,
            modifyVars,
          }
        }
      },
    },
  ],
};