'use strict';

const babel = require('babel-core');

const defaultOptions = {
  extension: '.jsx',
  presets: ['es2015-node6'],
  plugins: [
    'add-module-exports',
  ],
};

exports.install = function ({ extension, presets, plugins } = defaultOptions) {
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
        'jsx-node/babel',
      ],
    });

    // eslint-disable-next-line no-underscore-dangle
    module._compile(result.code, filename);
  };
};
