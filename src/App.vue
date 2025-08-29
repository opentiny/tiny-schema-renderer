<script setup lang="ts">
import { ref, onMounted } from "vue";
import TinyVue from "@opentiny/vue";
import { createSchemaRenderer } from ".";
import type { Schema } from "./renderer/types/index";

const SchemaRenderer = createSchemaRenderer({
  builtInExcludes: [],
  components: TinyVue
})

const schema = ref<Schema>({});

onMounted(async () => {
  schema.value = await import("./mock/schema.json");
});
</script>

<template>
  <component :is="SchemaRenderer" :schema="schema"></component>
</template>
