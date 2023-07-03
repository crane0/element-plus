import { useSizeProp } from '@element-plus/hooks'
import { buildProps, iconPropType } from '@element-plus/utils'
import { Loading } from '@element-plus/icons-vue'
import type { ExtractPropTypes } from 'vue'

export const buttonTypes = [
  'default',
  'primary',
  'success',
  'warning',
  'info',
  'danger',
  /**
   * @deprecated
   * Text type will be deprecated in the next major version (3.0.0)
   */
  'text',
  '',
] as const
export const buttonNativeTypes = ['button', 'submit', 'reset'] as const

// 选项式API，
export const buttonProps = buildProps({
  /**
   * @description button size
   */
  size: useSizeProp,
  /**
   * @description disable the button
   */
  disabled: Boolean,
  /**
   * @description button type
   */
  type: {
    type: String,
    values: buttonTypes,
    default: '',
  },
  /**
   * @description icon component
   */
  icon: {
    type: iconPropType,
  },
  /**
   * @description native button type
   */
  nativeType: {
    type: String,
    values: buttonNativeTypes,
    default: 'button',
  },
  /**
   * @description determine whether it's loading
   */
  loading: Boolean,
  /**
   * @description customize loading icon component
   */
  loadingIcon: {
    type: iconPropType,
    default: () => Loading,
  },
  /**
   * @description determine whether it's a plain button
   */
  plain: Boolean,
  /**
   * @description determine whether it's a text button
   */
  text: Boolean,
  /**
   * @description determine whether it's a link button
   */
  link: Boolean,
  /**
   * @description determine whether the text button background color is always on
   */
  bg: Boolean,
  /**
   * @description native button autofocus
   */
  autofocus: Boolean,
  /**
   * @description determine whether it's a round button
   */
  round: Boolean,
  /**
   * @description determine whether it's a circle button
   */
  circle: Boolean,
  /**
   * @description custom button color, automatically calculate `hover` and `active` color
   */
  color: String,
  /**
   * @description dark mode, which automatically converts `color` to dark mode colors
   */
  dark: Boolean,
  /**
   * @description automatically insert a space between two chinese characters
   */
  autoInsertSpace: {
    type: Boolean,
    default: undefined,
  },
} as const)

// https://cn.vuejs.org/api/options-state.html#emits
// 属性值可以是一个验证函数，会被调用，但即便没有通过验证也没有什么影响。比如添加个 log 什么的。
export const buttonEmits = {
  click: (evt: MouseEvent) => evt instanceof MouseEvent,
}

/* 
  https://cn.vuejs.org/api/utility-types.html#extractproptypes
  typeof buttonProps 获取 buttonProps 对象的类型
  ExtractPropTypes 是 Vue 的工具类，提取 props 中的属性类型：对应 props.xxx.type 的类型，

  因为 buildProps 方法会将 type 和 values 和 default 合并，所以 ExtractPropTypes 获取到的是这3个的联合类型。
  type: {
    type: String,
    values: buttonTypes,
    default: '',
  },

  导出下面这些类型命名，在其他组件中会用到。
*/
export type ButtonProps = ExtractPropTypes<typeof buttonProps>
export type ButtonEmits = typeof buttonEmits

export type ButtonType = ButtonProps['type']
export type ButtonNativeType = ButtonProps['nativeType']

export interface ButtonConfigContext {
  autoInsertSpace?: boolean
}
