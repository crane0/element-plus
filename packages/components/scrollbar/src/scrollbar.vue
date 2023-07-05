<template>
  <div ref="scrollbarRef" :class="ns.b()">
    <div ref="wrapRef" :class="wrapKls" :style="style" @scroll="handleScroll">
      <component :is="tag" ref="resizeRef" :class="resizeKls" :style="viewStyle">
        <slot />
      </component>
    </div>
    <template v-if="!native">
      <bar ref="barRef" :height="sizeHeight" :width="sizeWidth" :always="always" :ratio-x="ratioX" :ratio-y="ratioY" />
    </template>
  </div>
</template>
<script lang="ts" setup>
import { computed, nextTick, onMounted, onUpdated, provide, reactive, ref, watch } from 'vue'
import { useEventListener, useResizeObserver } from '@vueuse/core'
import { addUnit, debugWarn, isNumber, isObject } from '@element-plus/utils'
import { useNamespace } from '@element-plus/hooks'
import { GAP } from './util'
import Bar from './bar.vue'
import { scrollbarContextKey } from './constants'
import { scrollbarEmits, scrollbarProps } from './scrollbar'
import type { BarInstance } from './bar'
import type { CSSProperties, StyleValue } from 'vue'

const COMPONENT_NAME = 'ElScrollbar'

defineOptions({
  name: COMPONENT_NAME,
})

const props = defineProps(scrollbarProps)
const emit = defineEmits(scrollbarEmits)

const ns = useNamespace('scrollbar')

let stopResizeObserver: (() => void) | undefined = undefined
let stopResizeListener: (() => void) | undefined = undefined

const scrollbarRef = ref<HTMLDivElement>()
const wrapRef = ref<HTMLDivElement>()
const resizeRef = ref<HTMLElement>()

const sizeWidth = ref('0')
const sizeHeight = ref('0')
const barRef = ref<BarInstance>()
const ratioY = ref(1)
const ratioX = ref(1)

/**
 * height: 滚动条高度
 * maxHeight：滚动条最大高度
 */
const style = computed<StyleValue>(() => {
  const style: CSSProperties = {}
  if (props.height) style.height = addUnit(props.height) // addUnit 添加 px 单位
  if (props.maxHeight) style.maxHeight = addUnit(props.maxHeight)
  return [props.wrapStyle, style]
})

const wrapKls = computed(() => {
  return [
    props.wrapClass,
    ns.e('wrap'), // el-scrollbar__wrap
    { [ns.em('wrap', 'hidden-default')]: !props.native }, // el-scrollbar__wrap--hidden-default
  ]
})

const resizeKls = computed(() => {
  return [ns.e('view'), props.viewClass] // el-scrollbar__view
})

const handleScroll = () => {
  if (wrapRef.value) {
    barRef.value?.handleScroll(wrapRef.value)

    // 元素滚动的距离
    emit('scroll', {
      scrollTop: wrapRef.value.scrollTop,
      scrollLeft: wrapRef.value.scrollLeft,
    })
  }
}

// TODO: refactor method overrides, due to script setup dts
// @ts-nocheck
// expose 的方法，滚动到一组特定坐标
function scrollTo(xCord: number, yCord?: number): void
function scrollTo(options: ScrollToOptions): void
function scrollTo(arg1: unknown, arg2?: number) {
  if (isObject(arg1)) {
    wrapRef.value!.scrollTo(arg1)
  } else if (isNumber(arg1) && isNumber(arg2)) {
    wrapRef.value!.scrollTo(arg1, arg2)
  }
}

// expose 的方法，设置滚动条到顶部的距离
const setScrollTop = (value: number) => {
  if (!isNumber(value)) {
    debugWarn(COMPONENT_NAME, 'value must be a number')
    return
  }
  wrapRef.value!.scrollTop = value
}

const setScrollLeft = (value: number) => {
  if (!isNumber(value)) {
    debugWarn(COMPONENT_NAME, 'value must be a number')
    return
  }
  wrapRef.value!.scrollLeft = value
}

// expose 的方法，手动更新滚动条状态
const update = () => {
  if (!wrapRef.value) return
  const offsetHeight = wrapRef.value.offsetHeight - GAP // GAP el-scrollbar__bar 上下各有2px距离
  const offsetWidth = wrapRef.value.offsetWidth - GAP

  const originalHeight = offsetHeight ** 2 / wrapRef.value.scrollHeight // offsetHeight 可视区域高度，scrollHeight 内容高度（包括隐藏）
  const originalWidth = offsetWidth ** 2 / wrapRef.value.scrollWidth
  const height = Math.max(originalHeight, props.minSize) // minSize 滚动条最小尺寸
  const width = Math.max(originalWidth, props.minSize)

  ratioY.value = originalHeight / (offsetHeight - originalHeight) / (height / (offsetHeight - height))
  ratioX.value = originalWidth / (offsetWidth - originalWidth) / (width / (offsetWidth - width))

  sizeHeight.value = height + GAP < offsetHeight ? `${height}px` : ''
  sizeWidth.value = width + GAP < offsetWidth ? `${width}px` : ''
}

watch(
  () => props.noresize,
  (noresize) => {
    if (noresize) {
      stopResizeObserver?.()
      stopResizeListener?.()
    } else {
      ;({ stop: stopResizeObserver } = useResizeObserver(resizeRef, update))
      stopResizeListener = useEventListener('resize', update)
    }
  },
  { immediate: true }
)

watch(
  () => [props.maxHeight, props.height],
  () => {
    if (!props.native)
      nextTick(() => {
        update()
        if (wrapRef.value) {
          barRef.value?.handleScroll(wrapRef.value)
        }
      })
  }
)

provide(
  scrollbarContextKey,
  reactive({
    scrollbarElement: scrollbarRef,
    wrapElement: wrapRef,
  })
)

onMounted(() => {
  if (!props.native)
    nextTick(() => {
      update()
    })
})
onUpdated(() => update())

defineExpose({
  /** @description scrollbar wrap ref */
  wrapRef,
  /** @description update scrollbar state manually */
  update,
  /** @description scrolls to a particular set of coordinates */
  scrollTo,
  /** @description set distance to scroll top */
  setScrollTop,
  /** @description set distance to scroll left */
  setScrollLeft,
  /** @description handle scroll event */
  handleScroll,
})
</script>
