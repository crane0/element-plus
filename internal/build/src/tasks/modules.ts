import { rollup } from 'rollup'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import VueMacros from 'unplugin-vue-macros/rollup'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import esbuild from 'rollup-plugin-esbuild'
import glob from 'fast-glob' // https://github.com/mrmlnc/fast-glob#basic-syntax
import { epRoot, excludeFiles, pkgRoot } from '@element-plus/build-utils'
import { generateExternal, writeBundles } from '../utils'
import { ElementPlusAlias } from '../plugins/element-plus-alias'
import { buildConfigEntries, target } from '../build-info'

import type { OutputOptions } from 'rollup'

export const buildModules = async () => {
  // exclude ['node_modules', 'test', 'mock', 'gulpfile', 'dist'] 目录
  const input = excludeFiles(
    // 匹配所有子目录下的 .js .ts .vue 文件
    await glob('**/*.{js,ts,vue}', {
      cwd: pkgRoot, // 要搜索的目录(/packages)
      absolute: true, // 返回绝对路径
      onlyFiles: true, // 只返回文件（不返回文件夹）
    })
  )
  // rollup 返回值是 Promise<RollupBuild>
  const bundle = await rollup({
    input, // 入口文件
    plugins: [
      ElementPlusAlias(),
      VueMacros({
        setupComponent: false,
        setupSFC: false,
        plugins: {
          vue: vue({
            isProduction: false,
          }),
          vueJsx: vueJsx(),
        },
      }),
      nodeResolve({
        // 配置作用的文件扩展名，默认是 ['.mjs', '.js', '.json', '.node']
        extensions: ['.mjs', '.js', '.json', '.ts'],
      }),
      commonjs(),
      esbuild({
        sourceMap: true, // 默认属性
        target, // es2018，默认es2017
        loaders: {
          '.vue': 'ts', // 使用默认的 ts 加载器来处理 vue 文件
        },
      }),
    ],
    // 该选项用于匹配需要保留在 bundle 外部的模块。如果是函数，会将所有入口中引入的模块都作为 id 传入
    // 把 dependencies 和 peerDependencies 中的依赖都作为外部模块
    external: await generateExternal({ full: false }),
    treeshake: false,
  })
  await writeBundles(
    bundle,
    buildConfigEntries.map(([module, config]): OutputOptions => {
      return {
        format: config.format,
        dir: config.output.path,
        exports: module === 'cjs' ? 'named' : undefined,
        preserveModules: true,
        preserveModulesRoot: epRoot,
        sourcemap: true,
        entryFileNames: `[name].${config.ext}`,
      }
    })
  )
}
