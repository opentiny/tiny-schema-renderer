/**
 * Copyright (c) 2023 - present TinyEngine Authors.
 * Copyright (c) 2023 - present Huawei Cloud Computing Technologies Co., Ltd.
 *
 * Use of this source code is governed by an MIT-style license.
 *
 * THE OPEN SOURCE SOFTWARE IN THIS PRODUCT IS DISTRIBUTED IN THE HOPE THAT IT WILL BE USEFUL,
 * BUT WITHOUT ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS FOR
 * A PARTICULAR PURPOSE. SEE THE APPLICABLE LICENSES FOR MORE DETAILS.
 *
 */

import { h, provide, inject } from 'vue'
import { isHTMLTag, hyphenate } from '@vue/shared'
import babelPluginJSX from '@vue/babel-plugin-jsx'
import { transformSync } from '@babel/core'
import TinyVue, { Notify } from '@opentiny/vue'
import {
  CanvasRow,
  CanvasCol,
  CanvasRowColContainer,
  CanvasFlexBox,
  CanvasSection
} from '@opentiny/tiny-engine-builtin-component'
import {
  CanvasBox,
  CanvasIcon,
  CanvasText,
  CanvasSlot,
  CanvasImg,
  CanvasPlaceholder,
  CanvasRouterLink,
  CanvasRouterView
} from './builtin'
import TinyChartPie from '@opentiny/vue-chart-pie'
import TinyChartRadar from '@opentiny/vue-chart-radar'
import TinyChartBar from '@opentiny/vue-chart-bar'
import TinyChartHistogram from '@opentiny/vue-chart-histogram'
import TinyChartLine from '@opentiny/vue-chart-line'
import TinyChartRing from '@opentiny/vue-chart-ring'

const hyphenateRE = /\B([A-Z])/g
export const customElements = {}
const [JS_EXPRESSION, JS_FUNCTION] = ['JSExpression', 'JSFunction']
const isOn = (key) => /^on[A-Z]\w*/.test(key)

const transformJSX = (code) => {
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

export const Mapper = {
  Icon: CanvasIcon,
  Text: CanvasText,
  div: CanvasBox,
  Slot: CanvasSlot,
  slot: CanvasSlot,
  Template: CanvasBox,
  Img: CanvasImg,
  CanvasRow,
  CanvasCol,
  CanvasRowColContainer,
  CanvasFlexBox,
  CanvasSection,
  CanvasPlaceholder,
  CanvasRouterLink,
  CanvasRouterView,
  TinyChartPie,
  TinyChartRadar,
  TinyChartBar,
  TinyChartHistogram,
  TinyChartLine,
  TinyChartRing
}

export const collectionMethodsMap = {}

const getNative = (name) => {
  return TinyVue?.[name]
}

const configure = {}

export const setConfigure = (configureData) => {
  Object.assign(configure, configureData)
}

const isFunctionString = (str) => {
  if (typeof str !== 'string') {
    return false
  }

  return str.includes('function') || str.includes('=>')
}

const isJSSlot = (data) => {
  return data && data.type === 'JSSlot'
}

const isJSExpression = (data) => {
  return data && data.type === 'JSExpression'
}

const isJSFunction = (data) => {
  return data && data.type === 'JSFunction'
}

const isJSResource = (data) => {
  return data && data.type === 'JSResource'
}

const isString = (data) => {
  return typeof data === 'string'
}

const isArray = (data) => {
  return Array.isArray(data)
}

const isFunction = (data) => {
  return typeof data === 'function'
}

const isObject = (data) => {
  return typeof data === 'object'
}

// 判断是否是状态访问器
export const isStateAccessor = (stateData) =>
  stateData?.accessor?.getter?.type === 'JSFunction' || stateData?.accessor?.setter?.type === 'JSFunction'

// 规避创建function eslint报错
export const newFn = (...argv) => {
  const Fn = Function
  return new Fn(...argv)
}

const parseExpression = (data, scope, ctx, isJsx = false) => {
  try {
    const mergeScope = {
      ...ctx,
      ...scope,
      slotScope: scope
    }
    let expression = isJsx ? transformJSX(data.value) : data.value
    let params = {}
    if (data.params) {
      params = data.params.reduce((acc, paramName) => {
        acc[paramName] = mergeScope[paramName]
        return acc
      }, {})
      expression = `(e) => {(${expression}).call(this, e, ${data.params.join(',')})}`
    }
    return newFn('$scope', `with($scope || {}) { return ${expression} }`).call(ctx, {
      ...mergeScope,
      ...params
    })
  } catch (err) {
    // 解析抛出异常，则再尝试解析 JSX 语法。如果解析 JSX 语法仍然出现错误，isJsx 变量会确保不会再次递归执行解析
    if (!isJsx) {
      return parseExpression(data, scope, ctx, true)
    }
    return undefined
  }
}

function renderComponent(schema, scope, context) {
  const { componentName, loop, loopArgs, condition } = schema

  // 处理数据源和表格fetchData的映射关系
  generateCollection(schema)

  if (!componentName) {
    return null
  }

  const component = getComponent(componentName)

  if (!component) {
    return null
  }

  const loopList = parseData(loop, scope, context)

  const renderElement = (item, index) => {
    let mergeScope = item
      ? getLoopScope({
          item,
          index,
          loopArgs,
          scope
        })
      : scope

    if (!parseCondition(condition, mergeScope, context)) {
      return null
    }

    const Ele = h(component, getBindProps(schema, mergeScope, context), getChildren(schema, mergeScope, context))

    return Ele
  }

  return loopList?.length ? loopList.map(renderElement) : renderElement()
}

const renderDefault = (children, scope, parent) => {
  const childrenComponents = children.map?.((child) => renderComponent(child, scope, parent))

  return childrenComponents.filter(Boolean)
}

const parseJSSlot = (data, scope) => {
  return ($scope) => renderDefault(data.value, { ...scope, ...$scope }, data)
}

export const generateFn = (innerFn, context) => {
  return (...args) => {
    // 如果有数据源标识，则表格的fetchData返回数据源的静态数据
    const sourceId = collectionMethodsMap[innerFn.realName || innerFn.name]
    if (sourceId) {
      return innerFn.call(context, ...args)
    } else {
      let result = null

      // 这里是为了兼容用户写法报错导致画布异常，但无法捕获promise内部的异常
      try {
        result = innerFn.call(context, ...args)
      } catch (error) {
        Notify({
          type: 'warning',
          title: `函数:${innerFn.name}执行报错`,
          message: error?.message || `函数:${innerFn.name}执行报错，请检查语法`
        })
      }

      // 这里注意如果innerFn返回的是一个promise则需要捕获异常，重新返回默认一条空数据
      if (result?.then) {
        result = new Promise((resolve) => {
          result.then(resolve).catch((error) => {
            Notify({
              type: 'warning',
              title: '异步函数执行报错',
              message: error?.message || '异步函数执行报错，请检查语法'
            })
            // 这里需要至少返回一条空数据，方便用户使用表格默认插槽
            resolve({
              result: [{}],
              page: { total: 1 }
            })
          })
        })
      }

      return result
    }
  }
}

// 解析函数字符串结构
const parseFunctionString = (fnStr) => {
  const fnRegexp = /(async)?.*?(\w+) *\(([\s\S]*?)\) *\{([\s\S]*)\}/
  const result = fnRegexp.exec(fnStr)
  if (result) {
    return {
      type: result[1] || '',
      name: result[2],
      params: result[3]
        .split(',')
        .map((item) => item.trim())
        .filter((item) => Boolean(item)),
      body: result[4]
    }
  }
  return null
}

const getPlainProps = (object = {}) => {
  const { slot, ...rest } = object
  const props = {}

  if (slot) {
    rest.slot = slot.name || slot
  }

  Object.entries(rest).forEach(([key, value]) => {
    let renderKey = key

    // html 标签属性会忽略大小写，所以传递包含大写的 props 需要转换为 kebab 形式的 props
    if (!/on[A-Z]/.test(renderKey) && hyphenateRE.test(renderKey)) {
      renderKey = hyphenate(renderKey)
    }

    if (['boolean', 'string', 'number'].includes(typeof value)) {
      props[renderKey] = value
    } else {
      // 如果传给webcomponent标签的是对象或者数组需要使用.prop修饰符，转化成h函数就是如下写法
      props[`.${renderKey}`] = value
    }
  })
  return props
}

const generateCollection = (schema) => {
  if (schema.componentName === 'Collection' && schema.props?.dataSource && schema.children) {
    schema.children.forEach((item) => {
      const fetchData = item.props?.fetchData
      const methodMatch = fetchData?.value?.match(/this\.(.+?)}/)
      if (fetchData && methodMatch?.[1]) {
        const methodName = methodMatch[1].trim()
        // 缓存表格fetchData对应的数据源信息
        collectionMethodsMap[methodName] = schema.props.dataSource
      }
    })
  }
}

export const getComponent = (name) => {
  return Mapper[name] || getNative(name) || customElements[name] || (isHTMLTag(name) ? name : null)
}

// 解析JSX字符串为可执行函数
const parseJSXFunction = (data, ctx) => {
  try {
    const newValue = transformJSX(data.value)
    const fnInfo = parseFunctionString(newValue)
    if (!fnInfo) throw Error('函数解析失败，请检查格式。示例：function fnName() { }')

    return newFn(...fnInfo.params, fnInfo.body).bind({
      ...ctx,
      getComponent
    })
  } catch (error) {
    Notify({
      type: 'warning',
      title: '函数声明解析报错',
      message: error?.message || '函数声明解析报错，请检查语法'
    })

    return newFn()
  }
}

const parseJSFunction = (data, scope, ctx) => {
  try {
    if (!isFunctionString(data.value)) {
      return
    }
    const innerFn = newFn(`return ${data.value}`).bind(ctx)()
    return generateFn(innerFn, ctx)
  } catch (error) {
    return parseJSXFunction(data, ctx)
  }
}

const parseList = []

export function parseData(data, scope, ctx) {
  let res = data
  parseList.some((item) => {
    if (item.type(data)) {
      res = item.parseFunc(data, scope, ctx)

      return true
    }

    return false
  })

  return res
}

const parseCondition = (condition, scope, ctx) => {
  // eslint-disable-next-line no-eq-null
  return condition == null ? true : parseData(condition, scope, ctx)
}

const parseLoopArgs = (_loop) => {
  if (_loop) {
    const { item, index, loopArgs = '' } = _loop
    const body = `return {${loopArgs[0] || 'item'}: item, ${loopArgs[1] || 'index'} : index }`
    return newFn('item,index', body)(item, index)
  }
  return undefined
}

export const getIcon = (name) => window.TinyVueIcon?.[name]?.() || ''

const parseObjectData = (data, scope, ctx) => {
  if (!data) {
    return data
  }

  // 如果是状态访问器,则直接解析默认值
  if (isStateAccessor(data)) {
    return parseData(data.defaultValue, scope, ctx)
  }

  // 解析通过属性传递icon图标组件
  if (data.componentName === 'Icon') {
    return getIcon(data.props.name)
  }
  const res = {}
  Object.entries(data).forEach(([key, value]) => {
    // 如果是插槽则需要进行特殊处理
    if (key === 'slot' && value?.name) {
      res[key] = value.name
    } else {
      res[key] = parseData(value, scope, ctx)
    }
  })

  const propsEntries = Object.entries(data)
  const modelValue = propsEntries.find(([_key, value]) => value?.type === JS_EXPRESSION && value?.model === true)
  const hasUpdateModelValue = propsEntries.find(([key]) => isOn(key) && key.startsWith(`onUpdate:${modelValue?.[0]}`))

  if (modelValue && !hasUpdateModelValue) {
    // 添加 onUpdate:modelKey 事件
    res[`onUpdate:${modelValue?.[0]}`] = parseData(
      {
        type: JS_FUNCTION,
        value: `(value) => ${modelValue[1].value}=value`
      },
      scope,
      ctx
    )
  }

  return res
}

const parseString = (data) => {
  return data.trim()
}

const parseArray = (data, scope, ctx) => {
  return data.map((item) => parseData(item, scope, ctx))
}

const parseFunction = (data, scope, ctx) => {
  return data.bind(ctx)
}

parseList.push(
  ...[
    {
      type: isJSExpression,
      parseFunc: parseExpression
    },
    {
      type: isJSFunction,
      parseFunc: parseJSFunction
    },
    {
      type: isJSResource,
      parseFunc: parseExpression
    },
    {
      type: isJSSlot,
      parseFunc: parseJSSlot
    },
    {
      type: isString,
      parseFunc: parseString
    },
    {
      type: isArray,
      parseFunc: parseArray
    },
    {
      type: isFunction,
      parseFunc: parseFunction
    },
    {
      type: isObject,
      parseFunc: parseObjectData
    }
  ]
)

const generateSlotGroup = (children, isCustomElm, schema) => {
  const slotGroup = {}

  children.forEach((child) => {
    const { componentName, children, params = [], props } = child
    const slot = child.slot || props?.slot?.name || props?.slot || 'default'
    const isNotEmptyTemplate = componentName === 'Template' && children.length

    isCustomElm && (child.props.slot = 'slot') // CE下需要给子节点加上slot标识
    slotGroup[slot] = slotGroup[slot] || {
      value: [],
      params,
      parent: isNotEmptyTemplate ? child : schema
    }

    slotGroup[slot].value.push(...(isNotEmptyTemplate ? children : [child])) // template 标签直接过滤掉
  })

  return slotGroup
}

const renderSlot = (children, scope, schema, isCustomElm) => {
  if (children.some((a) => a.componentName === 'Template')) {
    const slotGroup = generateSlotGroup(children, isCustomElm, schema)
    const slots = {}

    Object.keys(slotGroup).forEach((slotName) => {
      const currentSlot = slotGroup[slotName]

      slots[slotName] = ($scope) => renderDefault(currentSlot.value, { ...scope, ...$scope }, currentSlot.parent)
    })

    return slots
  }

  return { default: () => renderDefault(children, scope, schema) }
}

const directChildrenHasTemplate = (children) => children.some((child) => child.componentName === 'Template')

const getBindProps = (schema, scope, context) => {
  const { componentName } = schema

  if (componentName === 'CanvasPlaceholder') {
    return {}
  }

  const bindProps = {
    ...parseData(schema.props, scope, context),
    'data-id': schema.id,
    'data-tag': componentName
  }

  if (Mapper[componentName]) {
    bindProps.schema = schema
  }

  // 绑定组件属性时需要将 className 重命名为 class，防止覆盖组件内置 class
  bindProps.class = bindProps.className
  delete bindProps.className

  return bindProps
}

const getLoopScope = ({ scope, index, item, loopArgs }) => {
  return {
    ...scope,
    ...(parseLoopArgs({
      item,
      index,
      loopArgs
    }) || {})
  }
}

const injectPlaceHolder = (componentName, children) => {
  const isEmptyArr = Array.isArray(children) && !children.length

  if (configure[componentName]?.isContainer && (!children || isEmptyArr)) {
    return [
      {
        componentName: 'CanvasPlaceholder'
      }
    ]
  }

  return children
}

const getChildren = (schema, mergeScope, context) => {
  const { componentName, children } = schema
  const renderChildren = injectPlaceHolder(componentName, children)

  if (!Array.isArray(renderChildren)) {
    return parseData(renderChildren, mergeScope, context)
  }

  if (!renderChildren.length) {
    return null
  }

  const isCustomElm = customElements[componentName]

  if (directChildrenHasTemplate(renderChildren)) {
    return renderSlot(renderChildren, mergeScope, schema, isCustomElm)
  }

  // 这里 children 需要返回一个默认插槽的函数，避免 vue 告警：
  // Non-function value encountered for default slot. Prefer function slots for better performance.
  return {
    default: () => children.map?.((child) => renderComponent(child, mergeScope, context)).filter(Boolean)
  }
}

export const renderer = {
  name: 'renderer',
  props: {
    schema: Object,
    scope: Object,
    parent: Object
  },
  setup(props) {
    provide('schema', props.schema)
  },
  render() {
    const context = inject('pageContext')
    const { scope, schema } = this

    return renderComponent(schema, scope, context)
  }
}

export default renderer
