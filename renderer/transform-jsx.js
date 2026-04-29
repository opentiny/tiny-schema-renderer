import babelPluginJSX from '@vue/babel-plugin-jsx'
import { transformSync } from '@babel/core'

export const transformJSX = (code) => {
  const res = transformSync(code, {
    plugins: [
      [
        babelPluginJSX,
        {
          pragma: 'h',
          isCustomElement: (name) => customElements[name]
        }
      ]
    ]
  })
  return (res.code || '')
    .replace(/import \{.+\} from "vue";/, '')
    .replace(/h\(_?resolveComponent\((.*?)\)/g, `h(this.getComponent($1)`)
    .replace(/_?resolveComponent/g, 'h')
    .replace(/_?createTextVNode\((.*?)\)/g, '$1')
    .trim()
}
