'use strict';

const babel = require('babel-core');

module.exports = function ({
  extension = '.jsx',
  presets = ['es2015-node6'],
  plugins = ['add-module-exports'],
  alias,
} = {}) {
  if (extension.charAt(0) !== '.') {
    extension = `.${extension}`;
  }

  if (require.extensions[extension]) {
    return;
  }

  require.extensions[extension] = (module, filename) => {
    const result = babel.transformFileSync(filename, {
      presets,
      plugins: [
        ...plugins,
        ['transform-react-jsx', { pragma: 'h' }],
        ['jsx-node/babel/alias', alias],
        ['jsx-node/babel/stringify'],
      ],
    });

    // eslint-disable-next-line no-underscore-dangle
    module._compile(result.code, filename);
  };
};
