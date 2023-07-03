// installer 是 makeInstaller 函数执行的结果，也就是一个对象 { install，version }
import installer from './defaults'
/* 
  1，下面这些工作区都是在根目录下 package.json 中全局引入了，所以可以直接使用。
  2，export * from 导出的内容是其他模块通过命名导出的集合，导入使用时只能通过命名访问。
		也就是说 export * from 会把依赖中所有非 export default 导出。
		作用：
		形成一个统一的接口。
		避免重复导入。
		方便维护和扩展。

	3，使用默认导出时
	import ElementPlus from 'element-plus' // ElementPlus 只有2个属性 install 和 version，用于全量引入（这2个属性是 installer 执行的结果）
	4，使用命名导出时
	import { ElTable, dayjs } from 'element-plus' // 实现了按需引入。
*/
export * from '@element-plus/components'
export * from '@element-plus/constants'
export * from '@element-plus/directives'
export * from '@element-plus/hooks'
export * from './make-installer'

// install 方法用于全量引入 Element-plus 时执行。该方法中会遍历注册所有组件和插件。
export const install = installer.install
export const version = installer.version
export default installer

export { default as dayjs } from 'dayjs'
