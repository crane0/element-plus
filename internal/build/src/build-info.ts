import path from 'path'
import { PKG_NAME } from '@element-plus/build-constants'
import { epOutput } from '@element-plus/build-utils'

import type { ModuleFormat } from 'rollup'

export const modules = ['esm', 'cjs'] as const
export type Module = typeof modules[number] // 最终 Module 为联合类型 'esm' | 'cjs'
export interface BuildInfo {
  module: 'ESNext' | 'CommonJS'
  format: ModuleFormat
  ext: 'mjs' | 'cjs' | 'js'
  output: {
    /** e.g: `es` */
    name: string
    /** e.g: `dist/element-plus/es` */
    path: string
  }

  bundle: {
    /** e.g: `element-plus/es` */
    path: string
  }
}

// 表示以 Module 类型为键，BuildInfo 类型为值的对象
export const buildConfig: Record<Module, BuildInfo> = {
  esm: {
    module: 'ESNext',
    format: 'esm',
    ext: 'mjs',
    output: {
      name: 'es',
      path: path.resolve(epOutput, 'es'), // dist/element-plus/es
    },
    bundle: {
      path: `${PKG_NAME}/es`, // element-plus/es
    },
  },
  cjs: {
    module: 'CommonJS',
    format: 'cjs',
    ext: 'js',
    output: {
      name: 'lib',
      path: path.resolve(epOutput, 'lib'), // dist/element-plus/lib
    },
    bundle: {
      path: `${PKG_NAME}/lib`, // element-plus/lib
    },
  },
}
// Object.entries 返回自身可枚举属性的键值对数组
export const buildConfigEntries = Object.entries(
  buildConfig
) as BuildConfigEntries

export type BuildConfig = typeof buildConfig
export type BuildConfigEntries = [Module, BuildInfo][]

export const target = 'es2018'
