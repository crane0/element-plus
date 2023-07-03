// 用来同步 provide() 和 inject() 之间值的类型。
import type { InjectionKey } from 'vue'

import type { ButtonProps } from './button'

// 对应 ButtonGroup 的可选属性
export interface ButtonGroupContext {
  size?: ButtonProps['size']
  type?: ButtonProps['type']
}

export const buttonGroupContextKey: InjectionKey<ButtonGroupContext> = Symbol('buttonGroupContextKey')
