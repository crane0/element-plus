/* 
  在 packages\components\index.ts 中使用 export * from './button'，
  * 表示除了 export default ElButton 之外的所有 export。
*/

import { withInstall, withNoopInstall } from '@element-plus/utils'
import Button from './src/button.vue'
import ButtonGroup from './src/button-group.vue'

export const ElButton = withInstall(Button, {
  ButtonGroup,
})

// withInstall 也会将传递的第2个参数中的组件注册，所以这里添加的 install 方法是一个空函数
export const ElButtonGroup = withNoopInstall(ButtonGroup)

// 因为在一些组件中会用到，packages\components\date-picker\src\date-picker-com\panel-date-pick.vue
export default ElButton

export * from './src/button'
export * from './src/constants'
export type { ButtonInstance, ButtonGroupInstance } from './src/instance'
