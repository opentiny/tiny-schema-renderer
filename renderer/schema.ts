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

export interface I18nText {
  zh_CN?: string
  en_US?: string
  [key: string]: string | undefined
}

/** 区块 schema.properties[].content 里的一条属性，对应运行时 prop */
export interface BlockPropertyContent {
  property: string
  type?: string
  label?: I18nText | { text?: I18nText }
  description?: I18nText
  required?: boolean
  defaultValue?: unknown
  [key: string]: unknown
}

export interface BlockPropertyGroup {
  name?: string
  label?: I18nText
  description?: I18nText
  content?: BlockPropertyContent[]
}

export interface BlockFunctionParam {
  name?: string
  type?: string
  defaultValue?: string
  description?: I18nText
}

export interface BlockFunctionInfo {
  params?: BlockFunctionParam[]
  returns?: Record<string, unknown>
}

/** 区块 schema.events 的值。键名沿用物料协议，如 onClickText */
export interface BlockEventConfig {
  label?: I18nText
  description?: I18nText
  type?: string
  functionInfo?: BlockFunctionInfo
  defaultValue?: string
}

export interface BlockSlotParam {
  name?: string
  type?: string
  description?: I18nText
}

export interface BlockSlotConfig {
  label?: I18nText
  description?: I18nText
  params?: BlockSlotParam[]
}

/**
 * 区块对外接口，对齐物料协议 IComponentSchema。
 * properties 声明输入，events 声明输出，slots 声明可投影插槽。
 */
export interface BlockComponentSchema {
  properties?: BlockPropertyGroup[]
  events?: Record<string, BlockEventConfig>
  slots?: Record<string, BlockSlotConfig>
}

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
 * 页面 Schema。区块与页面同构，靠 componentName / blockName 区分。
 * 区块对外接口写在 schema（properties / events / slots）。
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
  /** 区块对外接口：属性、事件、插槽 */
  schema?: BlockComponentSchema
}

/** 区块 Schema：与页面同结构，通常 componentName 为区块名或 "Block" */
export type BlockSchema = PageSchema

const ON_RE = /^on([A-Z].*)$/

/**
 * 物料事件名转 Vue emit 名：去掉 on 前缀并小写首字母。
 * onClickText -> clickText，onUpdate:modelValue -> update:modelValue。
 * 已经是 emit 名（clickText）时原样返回。
 */
export function toBlockEmitName(eventName: string): string {
  const on = ON_RE.exec(eventName)
  if (!on) return eventName
  const rest = on[1]
  return rest.charAt(0).toLowerCase() + rest.slice(1)
}

function unique(names: string[]): string[] {
  return [...new Set(names)]
}

/** 区块 props：schema.properties[].content[].property */
export function getBlockPropNames(block: BlockSchema): string[] {
  const names: string[] = []
  for (const group of block.schema?.properties ?? []) {
    for (const item of group?.content ?? []) {
      if (item?.property) names.push(item.property)
    }
  }
  return unique(names)
}

/** 区块 emits：schema.events 的键，去掉 on 前缀 */
export function getBlockEmitNames(block: BlockSchema): string[] {
  return unique(Object.keys(block.schema?.events ?? {}).map(toBlockEmitName))
}
