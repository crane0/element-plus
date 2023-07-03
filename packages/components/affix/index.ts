import { withInstall } from '@element-plus/utils'

import Affix from './src/affix.vue'

// Affix 是一个对象，包含 props render setup name 等属性。
export const ElAffix = withInstall(Affix)

// 为什么要导出这个？可能真的用不到
export default ElAffix

// ../index.ts 中会 export 所有。
export * from './src/affix'
