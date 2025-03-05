<script setup>
import { ref, onMounted } from "vue";
import SchemaRenderer from "../index.js";

const schema = ref({});

onMounted(async () => {
  schema.value = await import("./mock/schema.json");
});
</script>

<template>
  <SchemaRenderer :schema="schema"></SchemaRenderer>
</template>
