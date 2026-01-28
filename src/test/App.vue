<script setup lang="ts">
import { ref, onMounted, provide } from 'vue'
import TinyVue from '@opentiny/vue'
import { createSchemaRenderer } from '@opentiny/tiny-schema-renderer'
import type { ISchema, ISchemaRendererOptions } from '../renderer/types/index'
import { CustomFunction } from './custom-function'
import { RENDERER_SETTINGS_KEY } from '../renderer/core/renderer-settings'

// 支持自定义 Function 的实现，用于不支持 new Function 的场景，解析 schema 中的函数字符串时使用
provide(RENDERER_SETTINGS_KEY, { Function: CustomFunction })

const componentResolver = (name: string) => {
  return TinyVue[name]
}

const options: ISchemaRendererOptions = {
  componentResolver
}
const SchemaRenderer = createSchemaRenderer(options)

const schema = ref<ISchema>({});

onMounted(async () => {
  const mod = await import('../mock/schema.json')
  schema.value = mod as ISchema
})
</script>

<template>
  <component :is="SchemaRenderer" :schema="schema"></component>
</template>
