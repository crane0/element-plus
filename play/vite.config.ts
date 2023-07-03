import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
// https://github.com/antfu/unplugin-vue-components#configuration
// 实现 vue 组件的按需导入。
import Components from 'unplugin-vue-components/vite'
/* 
  https://github.com/antfu/unplugin-vue-components#importing-from-ui-libraries
  element-plus 自己写的解析器，实现对 element-plus 组件的自动导入。
  这样，可以在 vue 文件中直接使用 element-plus 组件，而不用写 import 或 require 导入语句。
  在构建项目时，ElementPlusResolver 会根据配置和解析规则，自动识别并导入所有的组件及样式文件。
*/
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// https://github.com/antfu/vite-plugin-inspect
// 很好用，可以看到项目都加载了哪些插件!!! 检查 Vite 插件的中间状态。用于调试和编写插件。
// 启动项目后，访问这个路由 /__inspect/
import Inspect from 'vite-plugin-inspect'
// https://github.com/liuweiGL/vite-plugin-mkcert/blob/main/README-zh_CN.md
// 使用 mkcert 为 vite https 开发服务提供证书支持。
import mkcert from 'vite-plugin-mkcert'
import glob from 'fast-glob'
import VueMacros from 'unplugin-vue-macros/vite'
import esbuild from 'rollup-plugin-esbuild'
import { epPackage, epRoot, getPackageDependencies, pkgRoot, projRoot } from '@element-plus/build-utils'
import type { Plugin } from 'vite'
import './vite.init'

const esbuildPlugin = (): Plugin => ({
  ...esbuild({
    target: 'chrome64',
    include: /\.vue$/,
    loaders: {
      '.vue': 'js',
    },
  }),
  // https://cn.vitejs.dev/guide/api-plugin.html#plugin-ordering
  // 设置插件执行顺序。
  enforce: 'post',
})

export default defineConfig(async ({ mode }) => {
  /* 
    https://cn.vitejs.dev/config/#using-environment-variables-in-config
    loadEnv 加载指定环境变量。
  */
  const env = loadEnv(mode, process.cwd(), '')
  // epPackage: packages/element-plus/package.json
  let { dependencies } = getPackageDependencies(epPackage)
  // optimizeDeps 也想对 element-plus 的子依赖做优化。
  dependencies = dependencies.filter((dep) => !dep.startsWith('@types/')) // exclude dts deps
  /* 
    返回数组，元素是查找到的路径（默认相对路径）
    这里删除了 js 后缀的原因还未可知，猜测是在下面的 optimizeDeps 做依赖优化时识别的问题。
  */
  const optimizeDeps = (
    await glob(['dayjs/(locale|plugin)/*.js'], {
      cwd: path.resolve(projRoot, 'node_modules'),
    })
  ).map((dep) => dep.replace(/\.js$/, ''))

  return {
    /* 
      猜测：因为通过 ElementPlusResolver 引入了 element-plus 的所有组件，所以想在 play 项目中引入组件做调试时，替换为本地的组件。
      至于下面的替换规则，应该是配合 ElementPlusResolver 的解析规则实现的。

      问题：根目录下的 node_modules 为什么会有 element-plus 依赖？
      但其实 play 项目是 es 项目，使用的 element-plus 组件也会导入 es 目录下的，所以下面的 lib 应该是用不到的。
    */
    resolve: {
      alias: [
        // element-plus 或 element-plus/es 或 element-plus/lib 路径替换为 packages/element-plus/index.ts。也就是打包 element-plus 时的入口文件。
        {
          find: /^element-plus(\/(es|lib))?$/,
          replacement: path.resolve(epRoot, 'index.ts'),
        },
        // element-plus/es/ 和 element-plus/lib/ 这2个目录下的任何内容，替换为 packages/ 目录下的相同内容
        {
          find: /^element-plus\/(es|lib)\/(.*)$/,
          replacement: `${pkgRoot}/$2`,
        },
      ],
    },
    server: {
      host: true,
      https: !!env.HTTPS,
    },
    plugins: [
      VueMacros({
        setupComponent: false,
        setupSFC: false,
        plugins: {
          vue: vue(),
          vueJsx: vueJsx(),
        },
      }),
      esbuildPlugin(),
      Components({
        // 目标对象
        include: `${__dirname}/**`,
        // 自动导入 Element Plus 所有组件
        resolvers: ElementPlusResolver({ importStyle: 'sass' }),
        // https://github.com/antfu/unplugin-vue-components#typescript
        // 是否生成 ts 声明文件。不过 Volar 插件已经支持了，所以如果使用 Volar 插件，可以设置这个配置项为 false。
        dts: false,
      }),
      mkcert(),
      Inspect(),
    ],

    /* 
      https://cn.vitejs.dev/config/dep-optimization-options.html#dep-optimization-options
      优化依赖，其中一点是：将目标依赖的所有子依赖转为合并为一个模块，可以减少HTTP请求，提高性能。
      默认情况下，只优化 node_modules 中的依赖。
    */
    optimizeDeps: {
      include: ['vue', '@vue/shared', ...dependencies, ...optimizeDeps],
    },
    esbuild: {
      target: 'chrome64',
    },
  }
})
