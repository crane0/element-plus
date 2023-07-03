<template>
  <component :is="tag" :class="rowKls" :style="style">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue'
import { useNamespace } from '@element-plus/hooks'
import { rowContextKey } from './constants'
import { rowProps } from './row'
import type { CSSProperties } from 'vue'

defineOptions({
  name: 'ElRow',
})

const props = defineProps(rowProps)

const ns = useNamespace('row')
const gutter = computed(() => props.gutter)

provide(rowContextKey, {
  gutter,
})

const style = computed(() => {
  const styles: CSSProperties = {} // 确保样式对象的属性和值都符合 CSS 的语法规则
  if (!props.gutter) {
    return styles
  }

  // 都是负值，是因为 el-col 会设置 padding-left 和 padding-right，这样可以抵消左右两边的空隙。
  styles.marginRight = styles.marginLeft = `-${props.gutter / 2}px`
  return styles
})

// ke la si
const rowKls = computed(() => [
  ns.b(),
  ns.is(`justify-${props.justify}`, props.justify !== 'start'),
  ns.is(`align-${props.align}`, props.align !== 'top'),
])
</script>
