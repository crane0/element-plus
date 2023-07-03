export const unique = <T>(arr: T[]) => [...new Set(arr)]

// ReadonlyArray 只读数组
type Many<T> = T | ReadonlyArray<T>
/* 
  castArray 用于将传入的参数转换为一个数组。
  1，如果参数为 fasty | 0，则返回 []
  2，如果参数本身是数组，则原样返回，否则将参数包装为数组返回
*/
export const castArray = <T>(arr: Many<T>): T[] => {
  if (!arr && (arr as any) !== 0) return []
  return Array.isArray(arr) ? arr : [arr]
}

// TODO: remove import alias
// avoid naming conflicts
export { castArray as ensureArray } from 'lodash-unified'
