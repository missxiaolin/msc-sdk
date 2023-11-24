import resolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs';
// import babel from '@rollup/plugin-babel'

// import { terser } from 'rollup-plugin-terser'
const path = require('path');
const json = require('@rollup/plugin-json');
const rollup = require('rollup');

const resolveFile = function (filePath) {
  return path.join(__dirname, filePath);
};

const plugins = [
  json({
    compact: true,
  }),
  resolve(),
  commonJS({
    include: 'node_modules/**',
  }),
];

const watchOptions = {
  plugins,
  input: resolveFile('../packages/index.js'),
  output: {
    file: resolveFile('../dist/monitorSdk.js'),
    format: 'iife',
    name: 'monitorSdk',
    sourcemap: false,
  },
};
rollup.watch(watchOptions);
module.exports = watchOptions;

console.log('rollup watching...');
