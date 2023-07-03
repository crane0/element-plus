import { computed, getCurrentInstance, inject, provide, ref, unref } from 'vue'
import { debugWarn, keysOf } from '@element-plus/utils'
import {
  SIZE_INJECTION_KEY,
  defaultInitialZIndex,
  defaultNamespace,
  localeContextKey,
  namespaceContextKey,
  useLocale,
  useNamespace,
  useZIndex,
  zIndexContextKey,
} from '@element-plus/hooks'
import { configProviderContextKey } from '../constants'

import type { MaybeRef } from '@vueuse/core'
import type { App, Ref } from 'vue'
import type { ConfigProviderContext } from '../constants'

// this is meant to fix global methods like `ElMessage(opts)`, this way we can inject current locale
// into the component as default injection value.
// refer to: https://github.com/element-plus/element-plus/issues/2610#issuecomment-887965266
// 因为没有传参，globalConfig.value === undefined。这里猜测是为了自定义类型推断。是一个准备好的响应式对象。
const globalConfig = ref<ConfigProviderContext>()

/* 
  useGlobalConfig 函数重载，全局配置函数，inject configProviderContextKey
  第1种重载，通过传入指定 props 获取对应的全局配置。
    只在 button 和 dialog 组建中用到，用于获取指定的全局配置。
  第2种重载，不传参数，获取所有的全局配置。

  而 provide configProviderContextKey 在 provideGlobalConfig 中调用。
  provideGlobalConfig 在3个地方调用
    1，useGlobalComponentSettings，组件可以直接获取全局配置的一些属性。
    2，packages\components\config-provider\src\config-provider.ts，用于实现全局配置组件。
    3，packages\element-plus\make-installer.ts，打包入口文件。
      当全量打包为 UMD 和 ESM 模块时，会在 install 方法中传入 options 全局属性，进行全局配置。

  综上，发现 useGlobalConfig 和 useGlobalComponentSettings 在不同组件中都有直接使用。
  区别是什么呢？
  useGlobalConfig 是简单的获取对应的全局属性。
  useGlobalComponentSettings 会将一些全局属性做处理，比如返回的 zIndex 就不是一个简单的数字，而变成了对象。
*/
export function useGlobalConfig<K extends keyof ConfigProviderContext, D extends ConfigProviderContext[K]>(
  key: K,
  defaultValue?: D
): Ref<Exclude<ConfigProviderContext[K], undefined> | D>
export function useGlobalConfig(): Ref<ConfigProviderContext>
export function useGlobalConfig(key?: keyof ConfigProviderContext, defaultValue = undefined) {
  // getCurrentInstance() 获取当前组件实例
  const config = getCurrentInstance() ? inject(configProviderContextKey, globalConfig) : globalConfig
  if (key) {
    return computed(() => config.value?.[key] ?? defaultValue)
  } else {
    return config
  }
}

// for components like `ElMessage` `ElNotification` `ElMessageBox`.
export function useGlobalComponentSettings(block: string, sizeFallback?: MaybeRef<ConfigProviderContext['size']>) {
  const config = useGlobalConfig()

  const ns = useNamespace(
    block,
    computed(() => config.value?.namespace || defaultNamespace)
  )

  const locale = useLocale(computed(() => config.value?.locale))
  const zIndex = useZIndex(computed(() => config.value?.zIndex || defaultInitialZIndex))
  const size = computed(() => unref(sizeFallback) || config.value?.size || '')
  provideGlobalConfig(computed(() => unref(config) || {}))

  return {
    ns,
    locale,
    zIndex,
    size,
  }
}

export const provideGlobalConfig = (config: MaybeRef<ConfigProviderContext>, app?: App, global = false) => {
  const inSetup = !!getCurrentInstance()
  const oldConfig = inSetup ? useGlobalConfig() : undefined

  const provideFn = app?.provide ?? (inSetup ? provide : undefined)
  if (!provideFn) {
    debugWarn('provideGlobalConfig', 'provideGlobalConfig() can only be used inside setup().')
    return
  }

  const context = computed(() => {
    const cfg = unref(config)
    if (!oldConfig?.value) return cfg
    return mergeConfig(oldConfig.value, cfg)
  })
  provideFn(configProviderContextKey, context)
  provideFn(
    localeContextKey,
    computed(() => context.value.locale)
  )
  provideFn(
    namespaceContextKey,
    computed(() => context.value.namespace)
  )
  provideFn(
    zIndexContextKey,
    computed(() => context.value.zIndex)
  )

  provideFn(SIZE_INJECTION_KEY, {
    size: computed(() => context.value.size || ''),
  })

  if (global || !globalConfig.value) {
    globalConfig.value = context.value
  }
  return context
}

const mergeConfig = (a: ConfigProviderContext, b: ConfigProviderContext): ConfigProviderContext => {
  const keys = [...new Set([...keysOf(a), ...keysOf(b)])]
  const obj: Record<string, any> = {}
  for (const key of keys) {
    obj[key] = b[key] ?? a[key]
  }
  return obj
}
