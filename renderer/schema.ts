/**
 * TinyEngine 页面/区块 Schema 类型（对齐低代码协议）。
 * @see https://opentiny.design/tiny-engine#/protocol
 * @see https://docs.opentiny.design/tiny-engine/dev/how-to-develop-plugins.html
 */

export interface JSExpression {
  type: 'JSExpression'
  value: string
  model?: boolean
  params?: string[]
}

export interface JSFunction {
  type: 'JSFunction' | 'js'
  /** 函数体字符串（JSFunction） */
  value?: string
  /** 部分协议写法用 source */
  source?: string
  params?: string[]
}

export interface JSSlot {
  type: 'JSSlot'
  value: string | SchemaNode[] | Record<string, unknown>
  params?: string[]
}

export type PropValue =
  | string
  | number
  | boolean
  | null
  | JSExpression
  | JSFunction
  | JSSlot
  | PropValue[]
  | { [key: string]: PropValue }

/** 协议中的输入/输出口（数组项） */
export interface SchemaIOItem {
  name: string
  type: string
  defaultValue?: unknown
}

/**
 * 运行时常见的 map 写法（如 materials.blocks 示例）：
 * { text: { type: 'string' } }
 */
export type SchemaIOMap = Record<
  string,
  {
    type?: string
    defaultValue?: unknown
    [key: string]: unknown
  }
>

export type SchemaIO = SchemaIOItem[] | SchemaIOMap

export interface SchemaNode {
  id?: string
  componentName: string
  /** 引用区块时可用 */
  blockName?: string
  props?: Record<string, PropValue | unknown>
  children?: SchemaNode[] | string
  componentType?: 'Block' | 'PageStart' | 'PageSection'
  slot?: string | Record<string, unknown>
  params?: string[]
  loop?: unknown
  loopArgs?: string[]
  condition?: boolean | Record<string, unknown>
}

/**
 * 页面 Schema。区块与页面同构，靠 componentName / blockName 区分，
 * 并通过 inputs / outputs 声明对外接口。
 */
export interface PageSchema extends Omit<SchemaNode, 'children' | 'componentName'> {
  componentName: string
  children?: SchemaNode[]
  css?: string
  fileName?: string
  methods?: Record<string, JSFunction>
  state?: Record<string, unknown>
  refs?: Record<string, unknown>
  lifeCycles?: Record<string, JSFunction>
  dataSource?: {
    list?: unknown[]
    [key: string]: unknown
  }
  bridge?: {
    imports?: unknown[]
    [key: string]: unknown
  }
  /** 输入接口：协议为数组；运行时亦支持 map */
  inputs?: SchemaIO
  /** 输出接口：协议为数组；运行时亦支持 map */
  outputs?: SchemaIO
  /** 区块对外属性元数据等 */
  schema?: Record<string, unknown>
}

/** 区块 Schema：与页面同结构，通常 componentName 为区块名或 "Block" */
export type BlockSchema = PageSchema

/** 从 inputs / outputs（数组或 map）取出接口名，供 props / emits 声明 */
export function getSchemaIOKeys(io?: SchemaIO | null): string[] {
  if (!io) return []
  if (Array.isArray(io)) {
    return io.map((item) => item?.name).filter((name): name is string => Boolean(name))
  }
  return Object.keys(io)
}
