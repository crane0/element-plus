import { buildProps } from '@element-plus/utils'
import type { ExtractPropTypes } from 'vue'
import type Row from './row.vue'

export const RowJustify = ['start', 'center', 'end', 'space-around', 'space-between', 'space-evenly'] as const

export const RowAlign = ['top', 'middle', 'bottom'] as const

export const rowProps = buildProps({
  /**
   * @description custom element tag
   */
  tag: {
    type: String,
    default: 'div',
  },
  /**
   * @description grid spacing
   * 栅格间隔
   */
  gutter: {
    type: Number,
    default: 0,
  },
  /**
   * @description horizontal alignment of flex layout
   * flex布局下 水平对齐方式
   */
  justify: {
    type: String,
    values: RowJustify,
    default: 'start',
  },
  /**
   * @description vertical alignment of flex layout
   * flex布局下 垂直对齐方式
   */
  align: {
    type: String,
    values: RowAlign,
    default: 'top',
  },
} as const)

export type RowProps = ExtractPropTypes<typeof rowProps>
export type RowInstance = InstanceType<typeof Row>
