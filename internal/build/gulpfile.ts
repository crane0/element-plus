import path from 'path'
import { copyFile, mkdir } from 'fs/promises'
import { copy } from 'fs-extra'
import { parallel, series } from 'gulp'
import {
  buildOutput, // dist
  epOutput, // dist/element-plus
  epPackage, // packages\element-plus\package.json
  projRoot, // 根目录 /
} from '@element-plus/build-utils'
import { buildConfig, run, runTask, withTaskName } from './src'
import type { TaskFunction } from 'gulp'
import type { Module } from './src'

export const copyFiles = () =>
  Promise.all([
    copyFile(epPackage, path.join(epOutput, 'package.json')),
    copyFile(path.resolve(projRoot, 'README.md'), path.resolve(epOutput, 'README.md')),
    copyFile(path.resolve(projRoot, 'global.d.ts'), path.resolve(epOutput, 'global.d.ts')),
  ])

export const copyTypesDefinitions: TaskFunction = (done) => {
  // /dist/types/packages
  const src = path.resolve(buildOutput, 'types', 'packages')
  // module: 'esm' | 'cjs'
  const copyTypes = (module: Module) =>
    withTaskName(`copyTypes:${module}`, () =>
      // esm: dist/element-plus/es
      // cjs: dist/element-plus/lib
      // 递归的将 /dist/types/packages 目录下的文件，复制到上面这2个目录下。
      copy(src, buildConfig[module].output.path, { recursive: true })
    )

  // 并行执行
  return parallel(copyTypes('esm'), copyTypes('cjs'))(done)
}

export const copyFullStyle = async () => {
  // 异步创建 dist/element-plus/dist 目录，recursive 表示递归创建
  await mkdir(path.resolve(epOutput, 'dist'), { recursive: true })
  await copyFile(path.resolve(epOutput, 'theme-chalk/index.css'), path.resolve(epOutput, 'dist/index.css'))
}

export default series(
  withTaskName('clean', () => run('pnpm run clean')),
  withTaskName('createOutput', () => mkdir(epOutput, { recursive: true })),

  parallel(
    runTask('buildModules'),
    runTask('buildFullBundle'),
    runTask('generateTypesDefinitions'),
    runTask('buildHelper'),
    series(
      withTaskName('buildThemeChalk', () => run('pnpm run -C packages/theme-chalk build')),
      copyFullStyle
    )
  ),

  parallel(copyTypesDefinitions, copyFiles)
)

// 只有公有任务可以被gulp命令直接调用，使用 export 注册公有任务。
export * from './src'
