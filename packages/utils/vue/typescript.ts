import type { AppContext, Plugin } from 'vue'

/* 
  自定义泛型类型
  T 类型在使用时才明确。在该项目中使用时 T 就是 SFC 单文件组件类型
  Plugin 用于描述一个 Vue 插件（其实就是为了提示要有 install 方法）。
  用交叉类型合并后，SFCWithInstall 类型：既可以表示是一个 SFC ，也可以是一个 Vue 插件。
*/
export type SFCWithInstall<T> = T & Plugin

export type SFCInstallWithContext<T> = SFCWithInstall<T> & {
  _context: AppContext | null
}
