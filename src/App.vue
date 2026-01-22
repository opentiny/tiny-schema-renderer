<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TinyVue from '@opentiny/vue'
import { createSchemaRenderer } from '.'
import type { Schema, SchemaRendererOptions } from './renderer/types/index'

const options: SchemaRendererOptions = {
  builtInExcludes: [],
  components: TinyVue
}
const SchemaRenderer = createSchemaRenderer(options)

const schema = ref<Schema>({});

onMounted(async () => {
  const mod = await import('./mock/schema.json')
  schema.value = mod as Schema
})
</script>

<template>
  <component :is="SchemaRenderer" :schema="schema"></component>
</template>
