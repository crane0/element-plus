import type { ConfigProviderProps } from './config-provider-props'
import type { InjectionKey, Ref } from 'vue'

// Partial 用于将一个类型的所有属性变为可选属性。
export type ConfigProviderContext = Partial<ConfigProviderProps>

//
/* 
  https://cn.vuejs.org/guide/typescript/composition-api.html#typing-provide-inject
	InjectionKey 是为注入的值标记类型，
	也就是说，当 provide(configProviderContextKey, value) 和 const value = inject(configProviderContextKey) 时，
	value 的类型是 Ref<ConfigProviderContext>

	在这里定义 provide 方法，packages\components\config-provider\src\hooks\use-global-config.ts 
	部分组件会用到 useGlobalComponentSettings 获取全局配置
	在入口文件全局注册组件时，会执行 provide 方法 packages\element-plus\make-installer.ts

	题外话，传递给这个组件的配置，会影响全局 <el-config-provider :button="config">xxx<el-config-provider>
	这个 config 会影响全局的 button 属性。
*/
export const configProviderContextKey: InjectionKey<Ref<ConfigProviderContext>> = Symbol()
