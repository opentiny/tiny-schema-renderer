<script setup>
import { ref, onMounted } from "vue";
import SchemaRenderer from "../index.js";

const schema = ref({});
const schema2 = ref({});

onMounted(async () => {
  schema.value = await import("./mock/schema.json");
  schema2.value = await import("./mock/schema2.json");
});
</script>

<template>
  <SchemaRenderer :schema="schema"></SchemaRenderer>
  <SchemaRenderer :schema="schema2"></SchemaRenderer>
</template>
