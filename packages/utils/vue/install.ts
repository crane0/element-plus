// @vue/shared 定义了一些工具方法。
import { NOOP } from '@vue/shared'

import type { App, Directive } from 'vue'
import type { SFCInstallWithContext, SFCWithInstall } from './typescript'

/* 
  传递第2个参数的情况，可以参考 select 组件。
  withInstall(Select, {
    Option,
    OptionGroup,
  })
  所以会同时将 Option 和 OptionGroup 也通过 app.component 注册。
  T 和 E 都是 Vue 组件，是一个对象，包含 props render setup name 等属性。
  注意，E 是放在一个对象中的，所以 Object.values 得到的数组元素还是组件对象。

*/
// extends 用于实现泛型约束。确保泛型类型参数 E 只能是一个对象
export const withInstall = <T, E extends Record<string, any>>(main: T, extra?: E) => {
  ;(main as SFCWithInstall<T>).install = (app): void => {
    for (const comp of [main, ...Object.values(extra ?? {})]) {
      app.component(comp.name, comp)
    }
  }

  // why 为什么要作为 main 组件的属性
  // 比如 Select.Option = Option组件
  if (extra) {
    for (const [key, comp] of Object.entries(extra)) {
      ;(main as any)[key] = comp
    }
  }
  // why 为什么要组合 E
  return main as SFCWithInstall<T> & E
}

export const withInstallFunction = <T>(fn: T, name: string) => {
  ;(fn as SFCWithInstall<T>).install = (app: App) => {
    ;(fn as SFCInstallWithContext<T>)._context = app._context
    app.config.globalProperties[name] = fn
  }

  return fn as SFCInstallWithContext<T>
}

export const withInstallDirective = <T extends Directive>(directive: T, name: string) => {
  ;(directive as SFCWithInstall<T>).install = (app: App): void => {
    app.directive(name, directive)
  }

  return directive as SFCWithInstall<T>
}

// NOOP 是一个无操作的空函数，主要作用就是提供一个函数默认值，但有不想有其他副作用。
export const withNoopInstall = <T>(component: T) => {
  ;(component as SFCWithInstall<T>).install = NOOP

  return component as SFCWithInstall<T>
}
