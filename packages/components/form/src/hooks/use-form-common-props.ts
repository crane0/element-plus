import { computed, inject, ref, unref } from 'vue'
import { useGlobalSize, useProp } from '@element-plus/hooks'
import { formContextKey, formItemContextKey } from '../constants'

import type { ComponentSize } from '@element-plus/constants'
import type { MaybeRef } from '@vueuse/core'

export const useFormSize = (
  fallback?: MaybeRef<ComponentSize | undefined>,
  ignore: Partial<Record<'prop' | 'form' | 'formItem' | 'global', boolean>> = {}
) => {
  const emptyRef = ref(undefined)

  const size = ignore.prop ? emptyRef : useProp<ComponentSize>('size') // 传入的 props
  const globalConfig = ignore.global ? emptyRef : useGlobalSize()
  const form = ignore.form ? { size: undefined } : inject(formContextKey, undefined)
  const formItem = ignore.formItem ? { size: undefined } : inject(formItemContextKey, undefined)

  return computed(
    (): ComponentSize =>
      size.value || // 传入的 props 优先级最高
      unref(fallback) ||
      formItem?.size ||
      form?.size ||
      globalConfig.value ||
      ''
  )
}

// 按优先级获取 disabled。传递的 props.disabled > fallback > form.disabled > 默认值 false
export const useFormDisabled = (fallback?: MaybeRef<boolean | undefined>) => {
  const disabled = useProp<boolean>('disabled') // 获取调用该方法的组件的 props.disabled
  const form = inject(formContextKey, undefined)
  return computed(() => disabled.value || unref(fallback) || form?.disabled || false)
}

// These exports are used for preventing breaking changes
export const useSize = useFormSize
export const useDisabled = useFormDisabled
