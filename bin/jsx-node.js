#!/bin/env node

'use strict';

const babel = require('babel-core');

const defaultOptions = {
  extension: '.jsx',
  presets: ['es2015-node6'],
  plugins: [
    'add-module-exports',
  ],
};

// process.exit(0);
const filename = process.argv[2];

const result = babel.transformFileSync(filename, {
  presets: defaultOptions.presets,
  plugins: [
    ...defaultOptions.plugins,
    ['transform-react-jsx', { pragma: 'h' }],
    require('../babel/stringify'),
  ],
});

process.stdout.write(result.code);

process.exit();
