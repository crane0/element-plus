import { computed, inject, ref, unref } from 'vue'

import type { InjectionKey, Ref } from 'vue'

export const defaultNamespace = 'el'
const statePrefix = 'is-'

const _bem = (namespace: string, block: string, blockSuffix: string, element: string, modifier: string) => {
  let cls = `${namespace}-${block}`
  if (blockSuffix) {
    cls += `-${blockSuffix}`
  }
  if (element) {
    cls += `__${element}`
  }
  if (modifier) {
    cls += `--${modifier}`
  }
  return cls
}

export const namespaceContextKey: InjectionKey<Ref<string | undefined>> = Symbol('namespaceContextKey')

export const useGetDerivedNamespace = (namespaceOverrides?: Ref<string | undefined>) => {
  const derivedNamespace = namespaceOverrides || inject(namespaceContextKey, ref(defaultNamespace))
  const namespace = computed(() => {
    return unref(derivedNamespace) || defaultNamespace // defaultNamespace 没必要加了吧，上面已经 ref(defaultNamespace)
  })
  return namespace
}

export const useNamespace = (block: string, namespaceOverrides?: Ref<string | undefined>) => {
  const namespace = useGetDerivedNamespace(namespaceOverrides)
  const b = (blockSuffix = '') => _bem(namespace.value, block, blockSuffix, '', '') // el-button
  const e = (element?: string) => (element ? _bem(namespace.value, block, '', element, '') : '')
  const m = (modifier?: string) => (modifier ? _bem(namespace.value, block, '', '', modifier) : '') // el-button__small
  const be = (blockSuffix?: string, element?: string) =>
    blockSuffix && element ? _bem(namespace.value, block, blockSuffix, element, '') : ''
  const em = (element?: string, modifier?: string) =>
    element && modifier ? _bem(namespace.value, block, '', element, modifier) : ''
  const bm = (blockSuffix?: string, modifier?: string) =>
    blockSuffix && modifier ? _bem(namespace.value, block, blockSuffix, '', modifier) : ''
  const bem = (blockSuffix?: string, element?: string, modifier?: string) =>
    blockSuffix && element && modifier ? _bem(namespace.value, block, blockSuffix, element, modifier) : ''

  // 函数重载
  const is: {
    (name: string, state: boolean | undefined): string
    (name: string): string
    // args 可以是1个包含1个元素的数组，该元素的类型是 boolean 或 undefined，或者是1个空数组 []。
  } = (name: string, ...args: [boolean | undefined] | []) => {
    // args[0]! 断言args[0]不会是 null 或 undefined。从而取消编译器对该表达式可能为 null 或 undefined 的类型检查。
    // 不过如果第2个参数显示的传入 undefined 时，args[0] 就是 undefined。断言就出问题了。不过在这个项目中不会有这种使用场景，所以可以断言。
    const state = args.length >= 1 ? args[0]! : true
    return name && state ? `${statePrefix}${name}` : '' // is-disabled
  }

  // for css var， --el-xxx: value;
  const cssVar = (object: Record<string, string>) => {
    const styles: Record<string, string> = {}
    for (const key in object) {
      if (object[key]) {
        styles[`--${namespace.value}-${key}`] = object[key]
      }
    }
    return styles
  }
  // with block
  // { bem 格式的 class: 16进制颜色 }
  const cssVarBlock = (object: Record<string, string>) => {
    const styles: Record<string, string> = {}
    for (const key in object) {
      if (object[key]) {
        // --el-button-bg-clolor = #626aef
        styles[`--${namespace.value}-${block}-${key}`] = object[key]
      }
    }
    return styles
  }

  const cssVarName = (name: string) => `--${namespace.value}-${name}`
  const cssVarBlockName = (name: string) => `--${namespace.value}-${block}-${name}`

  return {
    namespace,
    b,
    e,
    m,
    be,
    em,
    bm,
    bem,
    is,
    // css
    cssVar,
    cssVarName,
    cssVarBlock,
    cssVarBlockName,
  }
}

export type UseNamespaceReturn = ReturnType<typeof useNamespace>
