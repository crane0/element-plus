import type { InjectionKey } from 'vue'
import type { FormContext, FormItemContext } from './types'

// form.vue 中进行 provide
export const formContextKey: InjectionKey<FormContext> = Symbol('formContextKey')
export const formItemContextKey: InjectionKey<FormItemContext> = Symbol('formItemContextKey')
