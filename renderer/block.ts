import { defineAsyncComponent, defineComponent, h, markRaw } from "vue";
import { BLOCKS, MATERIALS } from "./useContext.js";

const RenderMain = defineAsyncComponent(() => import('./RenderMain.js').then(m => m.default));

export function defineBlock(name: string, schema: any) {
  const rawSchema = markRaw(schema)
  return markRaw(defineComponent({
    name,
    props: Object.keys(schema.inputs),
    emits: Object.keys(schema.outputs),
    setup(props, { slots, emit }) {
      const dispatchEvent = (event: string, ...data: any) => {
        if (Object.keys(schema.outputs).includes(event)) {
          emit(event, ...data)
        } else {
          console.warn(`Event ${event} not found in schema.outputs`)
        }
      }
      return () => h(RenderMain, { schema: rawSchema, props, dispatchEvent }, slots)
    }
  }))
}

function getBlockCache(context: any) {
  return context[BLOCKS]
}

export function loadBlock(name: string, context: any) {
  const schema = context[MATERIALS]?.blocks?.[name]
  if (!schema) return null
  const cache = getBlockCache(context)
  if (!cache) return null
  if (!cache[name]) {
    cache[name] = defineBlock(name, schema)
  }
  return cache[name]
}

export function getBlock(name: string, context: any) {
  if (!context[MATERIALS]?.blocks?.[name]) return null
  return getBlockCache(context)?.[name] || loadBlock(name, context)
}
