import { buildProps, definePropType, isNumber, isString, mutable } from '@element-plus/utils'
import { CHANGE_EVENT, UPDATE_MODEL_EVENT } from '@element-plus/constants'
import type { ExtractPropTypes } from 'vue'
import type { Arrayable } from '@element-plus/utils'

export type CollapseActiveName = string | number
// string | string[] | number | number[]
export type CollapseModelValue = Arrayable<CollapseActiveName>

// typeof 运算符优先级 > ||，下面这个函数是不是有问题，因为会始终返回 'boolean'
export const emitChangeFn = (value: CollapseModelValue) =>
  typeof isNumber(value) || isString(value) || Array.isArray(value)

/* 
  https://cn.vuejs.org/guide/components/v-model.html#component-v-model
  
  组件上使用 v-model 时，
  <CustomInput v-Model="searchText" />
  相当于
  <CustomInput
    :modelValue="searchText"
    @update:modelValue="newValue => searchText = newValue"
  />

  所以需要定义 props: modelValue 和 emits: update:modelValue
*/
export const collapseProps = buildProps({
  accordion: Boolean,
  modelValue: {
    type: definePropType<CollapseModelValue>([Array, String, Number]),
    default: () => mutable([] as const),
  },
} as const)
export type CollapseProps = ExtractPropTypes<typeof collapseProps>

export const collapseEmits = {
  [UPDATE_MODEL_EVENT]: emitChangeFn,
  [CHANGE_EVENT]: emitChangeFn,
}
export type CollapseEmits = typeof collapseEmits
