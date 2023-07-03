import { computed, provide, ref, watch } from 'vue'
import { ensureArray } from '@element-plus/utils'
import { useNamespace } from '@element-plus/hooks'
import { CHANGE_EVENT, UPDATE_MODEL_EVENT } from '@element-plus/constants'
import { collapseContextKey } from './constants'

import type { SetupContext } from 'vue'
import type { CollapseActiveName, CollapseEmits, CollapseProps } from './collapse'

export const useCollapse = (props: CollapseProps, emit: SetupContext<CollapseEmits>['emit']) => {
  const activeNames = ref(ensureArray(props.modelValue))

  const setActiveNames = (_activeNames: CollapseActiveName[]) => {
    activeNames.value = _activeNames
    // 手风琴 ? 则只打开一个 : 所有都可以打开
    const value = props.accordion ? activeNames.value[0] : activeNames.value
    emit(UPDATE_MODEL_EVENT, value)
    emit(CHANGE_EVENT, value)
  }

  const handleItemClick = (name: CollapseActiveName) => {
    if (props.accordion) {
      setActiveNames([activeNames.value[0] === name ? '' : name]) // 手风琴点击相同会关闭
    } else {
      const _activeNames = [...activeNames.value]
      const index = _activeNames.indexOf(name)

      if (index > -1) {
        _activeNames.splice(index, 1) // 删除
      } else {
        _activeNames.push(name)
      }
      setActiveNames(_activeNames)
    }
  }

  // 先转换为一个数组
  watch(
    () => props.modelValue,
    () => (activeNames.value = ensureArray(props.modelValue)),
    { deep: true }
  )

  provide(collapseContextKey, {
    activeNames,
    handleItemClick,
  })
  return {
    activeNames,
    setActiveNames,
  }
}

export const useCollapseDOM = () => {
  const ns = useNamespace('collapse')

  const rootKls = computed(() => ns.b())
  return {
    rootKls,
  }
}
