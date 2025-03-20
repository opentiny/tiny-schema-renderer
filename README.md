# @opentiny/tiny-schema-renderer

基于 json-schema 的运行时渲染器

## 前置条件

运行时渲染器底层基于 `vue@3.x.x` 并且内置了 `TinyVue` 组件库，所以要在工程中安装 `@opentiny/vue`、`@opentiny/vue-theme`、`@opentiny/vue-icon`、`vue` 依赖。

## 安装（vue3 工程）

```bash
npm i @opentiny/tiny-schema-renderer @opentiny/vue @opentiny/vue-theme @opentiny/vue-icon --save
```

## 使用方式一

当作 `vue` 组件直接使用

```vue
<template>
  <SchemaRenderer :schema="schema"></SchemaRenderer>
</template>

<script setup>
import SchemaRenderer from "@opentiny/tiny-schema-renderer";

const schema = {
  state: {},
  methods: {},
  componentName: "Page",
  props: {},
  children: [
    {
      componentName: "Text",
      props: {
        text: "运行时渲染器",
      },
    },
  ],
  fileName: "TinySchemaRenderer",
};
</script>
```


## 使用方式二

当作 `webcomponents` 标签使用

### 1、创建 `card.ce.vue`

```vue
<template>
  <SchemaRenderer :schema="schemaObj"></SchemaRenderer>
</template>

<script setup>
import SchemaRenderer from "@opentiny/tiny-schema-renderer";
import { computed } from "vue";

const props = defineProps({
  schema: {
    type: String,
    required: true,
    default: () => "",
  },
});

const schemaObj = computed(() => {
  return JSON.parse(props.schema);
});
</script>
<style>
@import url("@opentiny/vue-theme/index.css");
</style>
```

### 2、创建 `web-component.js` 引入 `card.ce.vue` 注册自己的 `webcomponents` 标签

```js
import Card from "./components/card.ce.vue";
import { defineCustomElement } from "vue";

// 将 Vue 组件转为自定义元素类。
export const CardElement = defineCustomElement(Card);

// 记得在浏览器中注册元素类。
customElements.define("schema-card", CardElement);
```

### 3、在入口文件 `mian.js` 中加载 `web-component.js`

```js
import { createApp } from "vue";
import App from "./App.vue";
import "./web-components";

createApp(App).mount("#app");
```

### 4、使用方式

可以在 html 文档中随意使用自定义标签渲染 `schema`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>运行时渲染器</title>
  </head>
  <body>
    <schema-card
      schema='{state: {},methods: {},componentName: "Page",props: {},children: [{ componentName: "Text",props: {text: "运行时渲染器"}}]}'
    ></schema-card>
  </body>
</html>
```
