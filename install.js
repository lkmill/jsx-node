'use strict'

const babel = require('@babel/core')

module.exports = function ({
  extension = '.jsx',
  presets = [[ '@babel/preset-env', { shippedProposals: true } ]],
  plugins = [],
  alias,
} = {}) {
  if (extension.charAt(0) !== '.') {
    extension = `.${extension}`
  }

  // eslint-disable-next-line node/no-deprecated-api
  if (require.extensions[extension]) {
    return
  }

  // eslint-disable-next-line node/no-deprecated-api
  require.extensions[extension] = (module, filename) => {
    const result = babel.transformFileSync(filename, {
      plugins: [
        ['@babel/transform-react-jsx', { pragma: 'h' }],
      ],
    })

    // eslint-disable-next-line no-underscore-dangle
    module._compile(result.code, filename)
  }
}
