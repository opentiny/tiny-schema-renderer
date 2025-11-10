<script setup>
import { ref, onMounted, provide } from 'vue'
import SchemaRenderer, { RENDERER_SETTINGS_KEY } from '../index.js'
import { CustomFunction } from './CustomFunction.js'

const schema = ref({})

provide(RENDERER_SETTINGS_KEY, { Function: CustomFunction })

onMounted(async () => {
  schema.value = await import('./mock/schema.json')
})
</script>

<template>
  <SchemaRenderer :schema="schema"></SchemaRenderer>
</template>
