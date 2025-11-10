<script setup>
import { ref, onMounted, provide } from 'vue'
import SchemaRenderer, { RENDERER_SETTINGS_KEY } from '../index.js'
// import { CustomFunction } from './CustomFunction.js'

const schema = ref({})

// 支持自定义 Function 的实现，用于不支持 new Function 的场景，解析 schema 中的函数字符串时使用
// provide(RENDERER_SETTINGS_KEY, { Function: CustomFunction })

onMounted(async () => {
  schema.value = await import('./mock/schema.json')
})
</script>

<template>
  <SchemaRenderer :schema="schema"></SchemaRenderer>
</template>
