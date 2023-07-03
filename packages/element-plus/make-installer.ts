import { provideGlobalConfig } from '@element-plus/components/config-provider'
import { INSTALLED_KEY } from '@element-plus/constants'
import { version } from './version'

import type { App, Plugin } from '@vue/runtime-core'
import type { ConfigProviderContext } from '@element-plus/components/config-provider'

export const makeInstaller = (components: Plugin[] = []) => {
  const install = (app: App, options?: ConfigProviderContext) => {
    if (app[INSTALLED_KEY]) return

    app[INSTALLED_KEY] = true
    // 每个 component 有自己的 install 方法。
    components.forEach((c) => app.use(c))

    // 如果有，全局安装配置项。
    // Element-plus 提供了 https://element-plus.org/zh-CN/component/config-provider.html
    if (options) provideGlobalConfig(options, app, true)
  }

  return {
    version,
    install,
  }
}
