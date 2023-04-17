import { PKG_NAME, PKG_PREFIX } from '@element-plus/build-constants'

import type { Plugin } from 'rollup'

// 自定义插件官方教程 https://v3.gulpjs.com.cn/docs/writing-a-plugin/
export function ElementPlusAlias(): Plugin {
  const themeChalk = 'theme-chalk'
  // @element-plus/theme-chalk
  const sourceThemeChalk = `${PKG_PREFIX}/${themeChalk}` as const
  // element-plus/theme-chalk
  const bundleThemeChalk = `${PKG_NAME}/${themeChalk}` as const

  return {
    name: 'element-plus-alias-plugin',
    resolveId(id) {
      if (!id.startsWith(sourceThemeChalk)) return
      return {
        id: id.replaceAll(sourceThemeChalk, bundleThemeChalk),
        external: 'absolute',
      }
    },
  }
}
