import { Text, computed, inject, ref, useSlots } from 'vue'
import { useFormDisabled, useFormItem, useFormSize } from '@element-plus/components/form'
import { useGlobalConfig } from '@element-plus/components/config-provider'
import { useDeprecated } from '@element-plus/hooks'
import { buttonGroupContextKey } from './constants'

import type { SetupContext } from 'vue'
import type { ButtonEmits, ButtonProps } from './button'

export const useButton = (props: ButtonProps, emit: SetupContext<ButtonEmits>['emit']) => {
  // 废弃属性的处理
  useDeprecated(
    {
      from: 'type.text',
      replacement: 'link',
      version: '3.0.0',
      scope: 'props',
      ref: 'https://element-plus.org/en-US/component/button.html#button-attributes',
    },
    computed(() => props.type === 'text')
  )

  // button-group 中 provide
  // inject 第2个参数是默认值（没有匹配到第1个参数 key 时）
  const buttonGroupContext = inject(buttonGroupContextKey, undefined)
  const globalConfig = useGlobalConfig('button')
  const { form } = useFormItem()
  const _size = useFormSize(computed(() => buttonGroupContext?.size)) // useFormSize 有几个优先级
  const _disabled = useFormDisabled() // 也有几个优先级
  const _ref = ref<HTMLButtonElement>()
  const slots = useSlots()

  const _type = computed(() => props.type || buttonGroupContext?.type || '')
  const autoInsertSpace = computed(() => props.autoInsertSpace ?? globalConfig.value?.autoInsertSpace ?? false)

  // add space between two characters in Chinese
  const shouldAddSpace = computed(() => {
    const defaultSlot = slots.default?.() // 判断方法是否可用
    if (autoInsertSpace.value && defaultSlot?.length === 1) {
      const slot = defaultSlot[0]
      // Symbol(Text)
      if (slot?.type === Text) {
        const text = slot.children as string
        /* 
          匹配2个统一表意文字（包括汉字，日文，韩文等东亚文字）
          u 标志：使用 Unicode 模式匹配
          \p{PropertyName}：属性转义，一般结合 u 标志使用。
            \p{Unified_Ideograph} 表示匹配1个统一表意文字。
        */
        return /^\p{Unified_Ideograph}{2}$/u.test(text.trim())
      }
    }
    return false
  })

  const handleClick = (evt: MouseEvent) => {
    if (props.nativeType === 'reset') {
      form?.resetFields()
    }
    emit('click', evt)
  }

  return {
    _disabled,
    _size,
    _type,
    _ref,
    shouldAddSpace,
    handleClick,
  }
}
