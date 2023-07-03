import { buildProps, definePropType, mutable } from '@element-plus/utils'
import type { ExtractPropTypes } from 'vue'
import type Col from './col.vue'

export type ColSizeObject = {
  span?: number
  offset?: number
  pull?: number
  push?: number
}
export type ColSize = number | ColSizeObject

export const colProps = buildProps({
  /**
   * @description custom element tag
   */
  tag: {
    type: String,
    default: 'div',
  },
  /**
   * @description number of column the grid spans
   * 栅格占据的列数（默认总列数24）
   */
  span: {
    type: Number,
    default: 24,
  },
  /**
   * @description number of spacing on the left side of the grid
   * 栅格左侧的间隔格数（当前栅格距左边栅格的距离，距离用栅格数表示）
   */
  offset: {
    type: Number,
    default: 0,
  },
  /**
   * @description number of columns that grid moves to the left
   * 栅格向左移动格数
   */
  pull: {
    type: Number,
    default: 0,
  },
  /**
   * @description number of columns that grid moves to the right
   * 栅格向右移动格数
   */
  push: {
    type: Number,
    default: 0,
  },
  /**
   * @description `<768px` Responsive columns or column props object
   * 下面这几个都是响应式属性。<768px 时占据的栅格数。
   * definePropType 是自定义的，返回值和参数一致，只不过指定了返回值类型。
   */
  xs: {
    type: definePropType<ColSize>([Number, Object]),
    default: () => mutable({} as const),
  },
  /**
   * @description `≥768px` Responsive columns or column props object
   */
  sm: {
    type: definePropType<ColSize>([Number, Object]),
    default: () => mutable({} as const),
  },
  /**
   * @description `≥992px` Responsive columns or column props object
   */
  md: {
    type: definePropType<ColSize>([Number, Object]),
    default: () => mutable({} as const),
  },
  /**
   * @description `≥1200px` Responsive columns or column props object
   */
  lg: {
    type: definePropType<ColSize>([Number, Object]),
    default: () => mutable({} as const),
  },
  /**
   * @description `≥1920px` Responsive columns or column props object
   */
  xl: {
    type: definePropType<ColSize>([Number, Object]),
    default: () => mutable({} as const),
  },
} as const)
export type ColProps = ExtractPropTypes<typeof colProps>
export type ColInstance = InstanceType<typeof Col>
