// 类型断言 as Mutable<typeof val> 将参数 val 的类型转换为 Mutable 类型
export const mutable = <T extends readonly any[] | Record<string, unknown>>(val: T) => val as Mutable<typeof val>
/* 
  整体作用：获得 T 的可变版本，其中 T 所有的属性都可以进行修改。（T 的属性类型原本可能是 readonly）
  -readonly：表示将属性设置为非只读。
  keyof T：获取类型 T 的所有属性名组合的联合类型。
  [P in keyof T]：遍历 T 中的属性名，并将其赋值给类型变量 P。
*/
export type Mutable<T> = { -readonly [P in keyof T]: T[P] }

export type HTMLElementCustomized<T> = HTMLElement & T

/**
 * @deprecated stop to use null
 * @see {@link https://github.com/sindresorhus/meta/discussions/7}
 */
export type Nullable<T> = T | null

// 单个元素或数组
export type Arrayable<T> = T | T[]
export type Awaitable<T> = Promise<T> | T
