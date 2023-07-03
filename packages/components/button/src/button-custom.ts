import { computed } from 'vue'
/* 
  实现通过 js 来控制颜色。https://github.com/scttcper/tinycolor
  color.tint(amount)，混合 #fff，amount = 0 表示不混合，amount = 100 返回 #fff
  color1.mix(color2, amount) color1 混合 color2, amount = 0 表示不混合，返回 color1

*/
import { TinyColor } from '@ctrl/tinycolor'
import { useNamespace } from '@element-plus/hooks'
import { useFormDisabled } from '@element-plus/components/form'
import type { ButtonProps } from './button'

export function darken(color: TinyColor, amount = 20) {
  return color.mix('#141414', amount).toString()
}

export function useButtonCustomStyle(props: ButtonProps) {
  const _disabled = useFormDisabled()
  const ns = useNamespace('button')

  // calculate hover & active color by custom color
  // 只在设置自定义颜色时有效 https://element-plus.org/zh-CN/component/button.html#%E8%87%AA%E5%AE%9A%E4%B9%89%E9%A2%9C%E8%89%B2
  return computed(() => {
    let styles: Record<string, string> = {}

    const buttonColor = props.color

    if (buttonColor) {
      const color = new TinyColor(buttonColor)
      const activeBgColor = props.dark ? color.tint(20).toString() : darken(color, 20)

      if (props.plain) {
        styles = ns.cssVarBlock({
          'bg-color': props.dark ? darken(color, 90) : color.tint(90).toString(),
          'text-color': buttonColor,
          'border-color': props.dark ? darken(color, 50) : color.tint(50).toString(),
          'hover-text-color': `var(${ns.cssVarName('color-white')})`,
          'hover-bg-color': buttonColor,
          'hover-border-color': buttonColor,
          'active-bg-color': activeBgColor,
          'active-text-color': `var(${ns.cssVarName('color-white')})`,
          'active-border-color': activeBgColor,
        })

        if (_disabled.value) {
          styles[ns.cssVarBlockName('disabled-bg-color')] = props.dark ? darken(color, 90) : color.tint(90).toString()
          styles[ns.cssVarBlockName('disabled-text-color')] = props.dark ? darken(color, 50) : color.tint(50).toString()
          styles[ns.cssVarBlockName('disabled-border-color')] = props.dark
            ? darken(color, 80)
            : color.tint(80).toString()
        }
      } else {
        const hoverBgColor = props.dark ? darken(color, 30) : color.tint(30).toString()
        const textColor = color.isDark()
          ? `var(${ns.cssVarName('color-white')})`
          : `var(${ns.cssVarName('color-black')})`
        styles = ns.cssVarBlock({
          'bg-color': buttonColor,
          'text-color': textColor,
          'border-color': buttonColor,
          'hover-bg-color': hoverBgColor,
          'hover-text-color': textColor,
          'hover-border-color': hoverBgColor,
          'active-bg-color': activeBgColor,
          'active-border-color': activeBgColor,
        })

        if (_disabled.value) {
          const disabledButtonColor = props.dark ? darken(color, 50) : color.tint(50).toString()
          styles[ns.cssVarBlockName('disabled-bg-color')] = disabledButtonColor
          styles[ns.cssVarBlockName('disabled-text-color')] = props.dark
            ? 'rgba(255, 255, 255, 0.5)'
            : `var(${ns.cssVarName('color-white')})`
          styles[ns.cssVarBlockName('disabled-border-color')] = disabledButtonColor
        }
      }
    }

    return styles
  })
}
