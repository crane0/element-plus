/* 
  整体做的事情
  最终打包目录 distBundle = dist/element-plus/theme-chalk
  1，编译 ./src 目录下的所有 scss 子文件，也就是所有的组件样式。（注意，不包括子目录中的 scss）
      并在输出时重命名 el-xxx，输出目录 ./dist（重命名时跳过 index.css, base.css, display.css）
  2，编译 dark 主题文件： ./src/dark/css-vars.scss，输出目录 ./dist/dark
  3，将第1,2步编译到 ./dist 目录下的 css 文件复制到 distBundle
    另外将 ./src 目录的所有 scss 文件不编译也复制一份到 distBundle/src
*/
import path from 'path'
import chalk from 'chalk'
import { dest, parallel, series, src } from 'gulp'
import gulpSass from 'gulp-sass'
// 使用 Dart Sass 编译器。相比于旧版本的 Node Sass（gulp-sass 的默认编译器），Dart Sass 具有更好的性能和更全面的特性支持。
import dartSass from 'sass'
// 自动添加浏览器前缀
import autoprefixer from 'gulp-autoprefixer'
// 压缩和优化 CSS 文件的大小
import cleanCSS from 'gulp-clean-css'
// 可以对通过 Gulp 流传递的文件进行重命名操作
import rename from 'gulp-rename'
import consola from 'consola'
import { epOutput } from '@element-plus/build-utils'

// 当前目录下 dist
const distFolder = path.resolve(__dirname, 'dist')
// 根目录下 /dist/element-plus/theme-chalk
const distBundle = path.resolve(epOutput, 'theme-chalk')

/**
 * compile theme-chalk scss & minify
 * not use sass.sync().on('error', sass.logError) to throw exception
 * 加上 .on('error', sass.logError) 会导致 CI 执行失败。
 * @returns
 */
function buildThemeChalk() {
  const sass = gulpSass(dartSass)
  const noElPrefixFile = /(index|base|display)/
  return (
    // 不包括 src 目录中其他文件夹的 scss 文件。
    src(path.resolve(__dirname, 'src/*.scss'))
      .pipe(sass.sync())
      // cascade: false 相同选择器的多个属性不进行排序和合并。
      .pipe(autoprefixer({ cascade: false }))
      .pipe(
        cleanCSS({}, (details) => {
          /* 
          details = {                                                                                                                                               00:31:50
            stats: {
              efficiency: 0.536231884057971,
              minifiedSize: 32,
              originalSize: 69,
              timeSpent: 6
            },
            errors: [],
            warnings: [],
            path: 'F:\\mycode\\element-plus\\packages\\theme-chalk\\src\\affix.css',
            name: '\\affix.css'
          }
        */
          consola.success(
            `${chalk.cyan(details.name)}: ${chalk.yellow(details.stats.originalSize / 1000)} KB -> ${chalk.green(
              details.stats.minifiedSize / 1000
            )} KB`
          )
        })
      )
      .pipe(
        rename((path) => {
          /* 
          path = {                                                                                                                                               00:31:51
            dirname: '.',
            basename: 'alert',
            extname: '.css'
          }
        */
          if (!noElPrefixFile.test(path.basename)) {
            path.basename = `el-${path.basename}`
          }
        })
      )
      .pipe(dest(distFolder))
  )
}

/**
 * Build dark Css Vars
 * @returns
 */
function buildDarkCssVars() {
  const sass = gulpSass(dartSass)
  return src(path.resolve(__dirname, 'src/dark/css-vars.scss'))
    .pipe(sass.sync())
    .pipe(autoprefixer({ cascade: false }))
    .pipe(
      cleanCSS({}, (details) => {
        consola.success(
          `${chalk.cyan(details.name)}: ${chalk.yellow(details.stats.originalSize / 1000)} KB -> ${chalk.green(
            details.stats.minifiedSize / 1000
          )} KB`
        )
      })
    )
    .pipe(dest(`${distFolder}/dark`))
}

/**
 * copy from packages/theme-chalk/dist to dist/element-plus/theme-chalk
 */
export function copyThemeChalkBundle() {
  return src(`${distFolder}/**`).pipe(dest(distBundle))
}

/**
 * copy source file to packages
 * copy from packages/theme-chalk/src to dist/element-plus/theme-chalk/src
 */

export function copyThemeChalkSource() {
  return src(path.resolve(__dirname, 'src/**')).pipe(dest(path.resolve(distBundle, 'src')))
}

// 上面2个函数并没有在其他地方用到，可以不用 export
// 只有 export 的人物可以被 gulp 命令直接调用。
export const build = parallel(copyThemeChalkSource, series(buildThemeChalk, buildDarkCssVars, copyThemeChalkBundle))

export default build
