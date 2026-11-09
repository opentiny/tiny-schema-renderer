import { defineAsyncComponent, defineComponent, h, markRaw, type Component } from 'vue'
import { BLOCKS, MATERIALS } from './useContext.js'
import { getSchemaIOKeys, type BlockSchema } from './schema'

const RenderMain = defineAsyncComponent(() => import('./RenderMain.js').then((m) => m.default))

type BlockComponent = Component & { __schema?: BlockSchema }

type BlockRendererContext = {
  [BLOCKS]?: Record<string, BlockComponent>
  [MATERIALS]?: {
    blocks?: Record<string, BlockSchema>
    [key: string]: unknown
  }
}

export function defineBlock(name: string, schema: BlockSchema) {
  const rawSchema = markRaw(schema)
  return markRaw(
    defineComponent({
      name,
      props: getSchemaIOKeys(schema.inputs),
      emits: getSchemaIOKeys(schema.outputs),
      setup(props, { slots, emit }) {
        const outputKeys = getSchemaIOKeys(schema.outputs)
        const dispatchEvent = (event: string, ...data: unknown[]) => {
          if (outputKeys.includes(event)) {
            emit(event, ...data)
          } else {
            console.warn(`Event ${event} not found in schema.outputs`)
          }
        }
        return () => h(RenderMain, { schema: rawSchema, props, dispatchEvent, blockName: name }, slots)
      }
    })
  ) as BlockComponent
}

function getBlockCache(context: BlockRendererContext) {
  return context[BLOCKS]
}

export function loadBlock(name: string, context: BlockRendererContext) {
  const schema = context[MATERIALS]?.blocks?.[name]
  if (!schema) return null
  const cache = getBlockCache(context)
  if (!cache) return null
  // schema 引用变化时重建（编辑器替换 blocks[name] 后避免闭包钉死旧 schema）
  if (!cache[name] || cache[name].__schema !== schema) {
    const block = defineBlock(name, schema)
    block.__schema = schema
    cache[name] = block
  }
  return cache[name]
}

export function getBlock(name: string, context: BlockRendererContext) {
  if (!context[MATERIALS]?.blocks?.[name]) return null
  return loadBlock(name, context)
}
