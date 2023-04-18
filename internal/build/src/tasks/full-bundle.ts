/* 
  并发生成压缩和不压缩的 umd 和 esm 两种类型的包。
  入口文件：packages/element-plus/index.ts
  输入目录：element-plus-dev/dist/element-plus/dist/

  更多的 rollup 配置项可以参考之前的注释 internal\build\src\tasks\modules.ts
  rollup 的 output.exports 和 output.name 参考 https://iw35cg346x.feishu.cn/wiki/Xrr0wYCi9iMdN1k0sqjcjEsRnwb#IwoodYKCMoUs6oxgjfGcQ6tRn2c
*/
import path from 'path'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { rollup } from 'rollup'
import commonjs from '@rollup/plugin-commonjs'
import vue from '@vitejs/plugin-vue'
import VueMacros from 'unplugin-vue-macros/rollup'
import vueJsx from '@vitejs/plugin-vue-jsx'
import esbuild, { minify as minifyPlugin } from 'rollup-plugin-esbuild'
import { parallel } from 'gulp'
import glob from 'fast-glob'
import { camelCase, upperFirst } from 'lodash'
import {
  PKG_BRAND_NAME,
  PKG_CAMELCASE_LOCAL_NAME,
  PKG_CAMELCASE_NAME,
} from '@element-plus/build-constants'
import { epOutput, epRoot, localeRoot } from '@element-plus/build-utils'
import { version } from '../../../../packages/element-plus/version'
import { ElementPlusAlias } from '../plugins/element-plus-alias'
import {
  formatBundleFilename,
  generateExternal,
  withTaskName,
  writeBundles,
} from '../utils'
import { target } from '../build-info'
import type { Plugin } from 'rollup'

// 会在打包后的文件顶部添加。比如 /*! Element Plus v0.0.0-dev.1 */
const banner = `/*! ${PKG_BRAND_NAME} v${version} */\n`

// 打包项目整体
async function buildFullEntry(minify: boolean) {
  const plugins: Plugin[] = [
    ElementPlusAlias(),
    VueMacros({
      setupComponent: false,
      setupSFC: false,
      plugins: {
        vue: vue({
          isProduction: true,
        }),
        vueJsx: vueJsx(),
      },
    }),
    nodeResolve({
      extensions: ['.mjs', '.js', '.json', '.ts'],
    }),
    commonjs(),
    esbuild({
      exclude: [],
      sourceMap: minify,
      target,
      loaders: {
        '.vue': 'ts',
      },
      // 用于定义可在代码中使用的全局常量，并且该字段不会经过任何的语法分析，而是直接替换文本。
      define: {
        'process.env.NODE_ENV': JSON.stringify('production'), // JSON.stringify 确保是双引号
      },
      treeShaking: true,
      /* 
        用于保留特定类型的注释。
        none: 禁用注释
        inline：只保留合法的 inline 注释。合法：以 // 开头，紧跟在代码行末尾（同一行）。语句上方的单行注释也算，但代码块内语句上方的就不合法。
        eof：只保留文件末尾的注释。主要用于保留添加的版权声明或许可证等信息。
      */
      legalComments: 'eof',
    }),
  ]
  if (minify) {
    plugins.push(
      minifyPlugin({
        target,
        sourceMap: true,
      })
    )
  }

  const bundle = await rollup({
    input: path.resolve(epRoot, 'index.ts'), // packages/element-plus/index.ts
    plugins,
    external: await generateExternal({ full: true }), // 并不剔除 @vue 依赖。
    treeshake: true,
  })
  await writeBundles(bundle, [
    {
      format: 'umd',
      file: path.resolve(
        epOutput,
        'dist',
        formatBundleFilename('index.full', minify, 'js') // dist/element-plus/dist/
      ),
      exports: 'named',
      name: PKG_CAMELCASE_NAME, // ElementPlus
      // 将所有导入 vue 的语句全部替换为全局变量名 Vue。因为 vue 做为外部模块不打包进 bundle。使用时单独引入。
      // 类似替换导入 jquery 的语句为 $。替换导入 lodash 的语句为 _
      // 具体参考 https://iw35cg346x.feishu.cn/wiki/Xrr0wYCi9iMdN1k0sqjcjEsRnwb#O4eSdiq0GoEw60xwNOdcxTW5njg
      globals: {
        vue: 'Vue',
      },
      sourcemap: minify,
      banner,
    },
    {
      format: 'esm',
      file: path.resolve(
        epOutput,
        'dist',
        formatBundleFilename('index.full', minify, 'mjs')
      ),
      sourcemap: minify,
      banner,
    },
  ])
}

// 打包国际化
async function buildFullLocale(minify: boolean) {
  const files = await glob(`**/*.ts`, {
    cwd: path.resolve(localeRoot, 'lang'), // packages/local/lang
    absolute: true,
  })
  return Promise.all(
    files.map(async (file) => {
      const filename = path.basename(file, '.ts') // 返回 file 路径最后的文件名
      const name = upperFirst(camelCase(filename)) // zh-cn --> zhCn --> ZhCn

      const bundle = await rollup({
        input: file,
        plugins: [
          esbuild({
            minify,
            sourceMap: minify,
            target, // es2018
          }),
        ],
      })
      // bundle, config
      await writeBundles(bundle, [
        {
          format: 'umd',
          file: path.resolve(
            // dist/element-plus/dist/locale/zh-cn.js
            epOutput,
            'dist/locale',
            formatBundleFilename(filename, minify, 'js')
          ),
          exports: 'default',
          name: `${PKG_CAMELCASE_LOCAL_NAME}${name}`, // 比如 ElementPlusLocaleZhCn
          sourcemap: minify,
          banner,
        },
        {
          format: 'esm',
          file: path.resolve(
            epOutput,
            'dist/locale',
            formatBundleFilename(filename, minify, 'mjs')
          ),
          sourcemap: minify,
          banner,
        },
      ])
    })
  )
}

// minify表示压缩，所以该方法的作用：生成压缩和不压缩的包。
export const buildFull = (minify: boolean) => async () =>
  Promise.all([buildFullEntry(minify), buildFullLocale(minify)])

// 并发生成压缩和不压缩的包
export const buildFullBundle = parallel(
  withTaskName('buildFullMinified', buildFull(true)),
  withTaskName('buildFull', buildFull(false))
)
