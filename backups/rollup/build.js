// const { babel } = require('@rollup/plugin-babel')
import resolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs';
// 清理文件
import clear from 'rollup-plugin-clear';
// 查看构建后的文件大小
import filesize from 'rollup-plugin-filesize';
// 用于分析构建后的代码
// import visualizer from 'rollup-plugin-visualizer'
// 执行进度（可选）
import progress from 'rollup-plugin-progress';
// 去除不需要打包的外部依赖
// import externals from 'rollup-plugin-node-externals'

import babel from '@rollup/plugin-babel';
// 代码压缩
import { terser } from 'rollup-plugin-terser';
// 移除无效代码
// import cleanup from 'rollup-plugin-cleanup';
import banner from 'rollup-plugin-banner';
const path = require('path');
const json = require('@rollup/plugin-json');
const bannerStr = `(c) ${new Date().getFullYear()} xiaolin ${new Date().toLocaleString()}`;

const resolveFile = function (filePath) {
  return path.join(__dirname, filePath);
};

const plugins = [
  // uglify(minify),
  clear({
    targets: ['dist'],
  }),
  progress({
    clearLine: false, // default: true
  }),
  // 详细配置： https://github.com/terser/terser#minify-options
  terser({ compress: { drop_console: true } }),
  json({
    compact: true,
  }),
  banner(bannerStr),
  filesize(),
  resolve(),
  commonJS({
    include: 'node_modules/**',
  }),

  babel({
    presets: [
      [
        '@babel/preset-env',
        {
          modules: false,
          // "useBuiltIns": "usage",
          // "corejs": "2.6.10",
          targets: {
            ie: 10,
          },
        },
      ],
    ],
    plugins: ['transform-remove-console'],
    ignore: ['node_modules/**'],
    exclude: 'node_modules/**',
  }),
];

module.exports = [
  {
    plugins,
    input: resolveFile('../packages/index.js'),
    output: [
      {
        file: resolveFile('../dist/monitorSdk.js'),
        format: 'iife',
        name: 'monitorSdk',
        sourcemap: false,
      },
      {
        file: resolveFile('../dist/monitorSdk.esm.js'),
        format: 'esm',
        name: 'monitorSdk',
        sourcemap: false,
      },
      {
        file: resolveFile('../dist/monitorSdk.cjs.js'),
        format: 'cjs',
        name: 'monitorSdk',
        sourcemap: false,
      },
    ],
  },
];
