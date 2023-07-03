/*
  这个Task的作用：
  将/packages里的js ts vue文件，保持原有目录结构（其中 preserveModulesRoot 目标目录提取到根目录），
  分别打成esm模块和cjs模块，放到dist/element-plus/下,其中es文件夹下存放esm模块代码，lib文件夹下存放cjs模块代码。
*/
import { rollup } from 'rollup'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import VueMacros from 'unplugin-vue-macros/rollup'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import esbuild from 'rollup-plugin-esbuild'
import glob from 'fast-glob' // https://github.com/mrmlnc/fast-glob#basic-syntax
// 在 package.json 中有全局引入工作区，所以可以使用
import { epRoot, excludeFiles, pkgRoot } from '@element-plus/build-utils'
import { generateExternal, writeBundles } from '../utils'
import { ElementPlusAlias } from '../plugins/element-plus-alias'
import { buildConfigEntries, target } from '../build-info'

import type { OutputOptions } from 'rollup'

export const buildModules = async () => {
  /* 
    exclude ['node_modules', 'test', 'mock', 'gulpfile', 'dist'] 目录
    因为 glob 返回的绝对路径，并且是 js,ts,vue 文件，所以 packages/theme-chalk 被完整排除。
    test-utils 也被排除。
  */
  const input = excludeFiles(
    // 匹配所有子目录下的所有 .js .ts .vue 文件
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
      // 自定义插件，替换所有的 @element-plus/theme-chalk 为 element-plus/theme-chalk
      ElementPlusAlias(),
      /* 
        https://vue-macros.sxzz.moe/zh-CN/guide/bundler-integration.html#%E5%AE%89%E8%A3%85
        Vue Macros 是一个库，用于实现尚未被 Vue 正式实现的提案或想法。所以它扩展了一些宏和语法糖到 Vue 中，方便开发。
        下面这个配置是官方的例子。默认配置项都是开启的，设置 false 来关闭。
        换句话说，因为在该项目在使用了 VueMacros 的一些宏或语法糖，所以需要再这里配置解析。
        设置为 false 的配置项说明没有用到相关的功能，所以关闭。
        另外，默认是有 vue 和 vueJsx 的解析器的，但这里使用了其他的解析器，可能是更稳定一些吧。
      */
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
      // rollup 不支持 CommonJS 模块，所以需要转换为 es6 模块
      commonjs(),
      // 更快更稳定的打包 js。
      esbuild({
        sourceMap: true, // 默认属性
        target, // es2018，默认es2017
        loaders: {
          '.vue': 'ts', // 使用默认的 ts 加载器来处理 vue 文件
        },
      }),
    ],
    // 该选项用于匹配需要保留在 bundle 外部的模块。如果是函数，会将所有入口中引入的模块都作为 id 传入
    // generateExternal 把 dependencies 和 peerDependencies 中的依赖都作为外部模块
    external: await generateExternal({ full: false }),
    treeshake: false,
  })

  /* 
    https://www.rollupjs.com/guide/tools#gulp
    Gulp 可以理解 Rollup 返回的 Promise。
    通过 writeBundles 实现 bundle.write() 输出文件。
    OutputOptions 文档
    https://www.rollupjs.com/guide/javascript-api#%E8%BE%93%E5%87%BA%E9%80%89%E9%A1%B9%E5%AF%B9%E8%B1%A1outputoptions-object
    https://www.rollupjs.com/guide/big-list-of-options#outputdir
  */
  await writeBundles(
    bundle,
    buildConfigEntries.map(([module, config]): OutputOptions => {
      return {
        format: config.format, // 必选。指定生成 bundle 的格式，一般对应指定的模块，比如 CommonJS 格式为 cjs，ES 格式为 esm。
        dir: config.output.path, // 该选项用于指定所有生成 chunk 文件所在的目录。如果生成多个 chunk，则此选项是必须的。否则，可以使用 file 选项代替。
        // 指定打包结果应该如何被导出，以便其他 JavaScript 环境可以正确地加载它们。
        // 具体参考 https://iw35cg346x.feishu.cn/wiki/Xrr0wYCi9iMdN1k0sqjcjEsRnwb#IwoodYKCMoUs6oxgjfGcQ6tRn2c
        exports: module === 'cjs' ? 'named' : undefined,
        // preserveModules 需要配合 dir 一起使用，用于将 input 目录保持不变打包到 output 目录（使用原始模块名作为文件名）。
        // 也就是说将 packages 目录下的文件都按照原目录结构打包到 config.output.path: dist/element-plus/es
        preserveModules: true,
        // preserveModulesRoot 用于将指定的目录内容直接打包（而不是保持原目录）到 output 目录，
        // 也就是说将 epRoot: packages/element-plus 目录下的文件打包到 output 目录: dist/element-plus/es。而不是 dist/element-plus/es/element-plus 目录
        preserveModulesRoot: epRoot,
        sourcemap: true,
        entryFileNames: `[name].${config.ext}`, // 指定 chunks 的入口文件名
      }
    })
  )
}
