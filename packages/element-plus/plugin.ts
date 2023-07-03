import { ElInfiniteScroll } from '@element-plus/components/infinite-scroll'
import { ElLoading } from '@element-plus/components/loading'
import { ElMessage } from '@element-plus/components/message'
import { ElMessageBox } from '@element-plus/components/message-box'
import { ElNotification } from '@element-plus/components/notification'
import { ElPopoverDirective } from '@element-plus/components/popover'

// plugin，是一种能为 Vue 添加全局功能的工具代码。比如注册到全局的指令，属性，方法。
// https://cn.vuejs.org/guide/reusability/plugins.html
import type { Plugin } from 'vue'

export default [ElInfiniteScroll, ElLoading, ElMessage, ElMessageBox, ElNotification, ElPopoverDirective] as Plugin[]
