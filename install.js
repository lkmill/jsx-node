'use strict';

const babel = require('babel-core');

module.exports = function ({
  extension = '.jsx',
  presets = ['es2015-node6', 'es2016', 'es2017', 'stage-0'],
  plugins = [],
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
        ['add-module-exports'],
        ['transform-react-jsx', { pragma: 'h' }],
        ['module-resolver', {
          alias,
        }],
      ],
    });

    // eslint-disable-next-line no-underscore-dangle
    module._compile(result.code, filename);
  };
};
