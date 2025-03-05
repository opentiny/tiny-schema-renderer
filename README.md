# @opentiny/tiny-schema-renderer

基于 json-schema 的表单渲染器

## 安装

```bash
npm install @opentiny/tiny-schema-renderer --save
```

## 使用

```javascript
import SchemaRenderer from "@opentiny/tiny-schema-renderer";

const schema = {
  state: {},
  methods: {},
  componentName: "Page",
  css: "body {\r\n  background-color:#eef0f5 ;\r\n  margin-bottom: 80px;\r\n}",
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

export default {
  components: {
    SchemaRenderer,
  },
  render() {
    return h(SchemaRenderer, {
      schema,
    });
  },
};
```
