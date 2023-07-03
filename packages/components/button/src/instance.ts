import type Button from './button.vue'
import type ButtonGroup from './button-group.vue'

// import 导入的 vue 文件，是已经处理过的（比如 vue-loader ）对象。
// vue 文件是 VueComponent 构造函数（类）的实例。
export type ButtonInstance = InstanceType<typeof Button>
export type ButtonGroupInstance = InstanceType<typeof ButtonGroup>
