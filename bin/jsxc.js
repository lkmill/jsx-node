#!/bin/env node

'use strict'

const babel = require('babel-core')

const defaultOptions = {
  extension: '.jsx',
  presets: [[ '@babel/preset-env', { shippedProposals: true } ]],
  plugins: [
    'add-module-exports',
  ],
}

// process.exit(0);
const filename = process.argv[2]

const result = babel.transformFileSync(filename, {
  presets: defaultOptions.presets,
  plugins: [
    ...defaultOptions.plugins,
    ['@babel/transform-react-jsx', { pragma: 'h' }],
  ],
})

process.stdout.write(result.code)

process.exit()
