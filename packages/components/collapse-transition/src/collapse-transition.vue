<template>
  <transition :name="ns.b()" v-on="on">
    <slot />
  </transition>
</template>
<script lang="ts" setup>
import { useNamespace } from '@element-plus/hooks'
import type { RendererElement } from '@vue/runtime-core'

defineOptions({
  name: 'ElCollapseTransition',
})

const ns = useNamespace('collapse-transition')

// https://cn.vuejs.org/guide/built-ins/transition.html#javascript-hooks
const on = {
  // el 是被 transition 包裹的元素
  // 在元素被插入到 DOM 之前被调用 "enter-from" 状态
  beforeEnter(el: RendererElement) {
    if (!el.dataset) el.dataset = {}
    // padding 会占据高度，如果一开始高度为0，而 padding 不为0，则在动画开始瞬间元素的显示高度是上下padding，不是从0开始的
    el.dataset.oldPaddingTop = el.style.paddingTop
    el.dataset.oldPaddingBottom = el.style.paddingBottom

    el.style.maxHeight = 0
    el.style.paddingTop = 0
    el.style.paddingBottom = 0
  },

  // 在元素被插入到 DOM(display: none -> block)之后的下一帧(block)被调用，要开始动画了
  enter(el: RendererElement) {
    el.dataset.oldOverflow = el.style.overflow
    if (el.scrollHeight !== 0) {
      el.style.maxHeight = `${el.scrollHeight}px`
      el.style.paddingTop = el.dataset.oldPaddingTop
      el.style.paddingBottom = el.dataset.oldPaddingBottom
    } else {
      el.style.maxHeight = 0
      el.style.paddingTop = el.dataset.oldPaddingTop
      el.style.paddingBottom = el.dataset.oldPaddingBottom
    }

    el.style.overflow = 'hidden' // 作用是什么？
  },

  // 当进入过渡完成时调用
  afterEnter(el: RendererElement) {
    el.style.maxHeight = '' // 作用是什么？因为是自定义的属性，所以用完就删除了吗
    el.style.overflow = el.dataset.oldOverflow
  },

  // "leave-from" 状态
  beforeLeave(el: RendererElement) {
    if (!el.dataset) el.dataset = {}
    el.dataset.oldPaddingTop = el.style.paddingTop
    el.dataset.oldPaddingBottom = el.style.paddingBottom
    el.dataset.oldOverflow = el.style.overflow

    el.style.maxHeight = `${el.scrollHeight}px`
    el.style.overflow = 'hidden' // 为什么要从 hidden 作为过渡初始状态？
  },

  // 在离开过渡(display: block -> none)开始时的下一帧(none)被调用，要开始动画了
  leave(el: RendererElement) {
    if (el.scrollHeight !== 0) {
      el.style.maxHeight = 0
      el.style.paddingTop = 0
      el.style.paddingBottom = 0
    }
  },
  // 在离开过渡完成、且元素已从 DOM 中移除时调用
  afterLeave(el: RendererElement) {
    el.style.maxHeight = ''
    el.style.overflow = el.dataset.oldOverflow
    el.style.paddingTop = el.dataset.oldPaddingTop
    el.style.paddingBottom = el.dataset.oldPaddingBottom
  },
}
</script>
