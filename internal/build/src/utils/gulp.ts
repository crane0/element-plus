import { buildRoot } from '@element-plus/build-utils'
import { run } from './process'

import type { TaskFunction } from 'gulp'

// 为 fn 函数添加（覆盖）displayName 属性，在打包时可以在控制台显示 task 的名称
export const withTaskName = <T extends TaskFunction>(name: string, fn: T) =>
  Object.assign(fn, { displayName: name })

export const runTask = (name: string) =>
  withTaskName(`shellTask:${name}`, () =>
    run(`pnpm run start ${name}`, buildRoot)
  )
