<script setup>
import { ref, onMounted, provide, shallowReactive } from 'vue'
import SchemaRenderer, { RENDERER_SETTINGS_KEY } from '../index.js'
import * as TinyVueComponents from '@opentiny/vue'
import * as TinyVueHuicharts from '@opentiny/vue-huicharts'
import { transformJSX } from '../renderer/transform-jsx.js'
// import { CustomFunction } from './CustomFunction.js'

const schema = ref({})
const materials = {
  components: { ...TinyVueComponents, ...TinyVueHuicharts },
}
const rendererSetting = shallowReactive({
  materials,
  transformJSX
  // 支持自定义 Function 的实现，用于不支持 new Function 的场景，解析 schema 中的函数字符串时使用
  // Function: CustomFunction
})

provide(RENDERER_SETTINGS_KEY, rendererSetting)

onMounted(async () => {
  schema.value = await import('./mock/schema.json')
})
</script>

<template>
  <SchemaRenderer :schema="schema"></SchemaRenderer>
</template>
