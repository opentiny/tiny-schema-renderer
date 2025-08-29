import babelPluginJSX from '@vue/babel-plugin-jsx'
import { transformSync } from '@babel/core'
import { getComponent } from './materials-functions'
import type { PageContext } from '../types/index'

const [JS_EXPRESSION, JS_FUNCTION] = ['JSExpression', 'JSFunction']

interface ParseItem {
  type: (data: any) => boolean
  parseFunc: (data: any, scope: Record<string, any>, ctx: PageContext) => any
}

interface StateData {
  accessor?: {
    getter?: { type: string }
    setter?: { type: string }
  }
  defaultValue?: any
}

interface JSData {
  type: string
  value: string
  params?: string[]
  model?: boolean
}

interface ObjectData {
  componentName?: string
  props?: Record<string, any>
  slot?: { name: string }
  [key: string]: any
}

const isOn = (key: string): boolean => /^on[A-Z]\w*/.test(key)

// 判断是否是状态访问器
export const isStateAccessor = (stateData: StateData): boolean =>
  stateData?.accessor?.getter?.type === 'JSFunction' || stateData?.accessor?.setter?.type === 'JSFunction'

const isJSSlot = (data: any): boolean => {
  return data && data.type === 'JSSlot'
}

const isJSExpression = (data: any): boolean => {
  return data && data.type === 'JSExpression'
}

const isJSFunction = (data: any): boolean => {
  return data && data.type === 'JSFunction'
}

const isJSResource = (data: any): boolean => {
  return data && data.type === 'JSResource'
}

const isString = (data: any): boolean => {
  return typeof data === 'string'
}

const isArray = (data: any): boolean => {
  return Array.isArray(data)
}

const isFunction = (data: any): boolean => {
  return typeof data === 'function'
}

const isObject = (data: any): boolean => {
  return typeof data === 'object'
}

const transformJSX = (code: string): string => {
  const res = transformSync(code, {
    plugins: [
      [
        babelPluginJSX,
        {
          pragma: 'h'
        }
      ]
    ]
  })
  return (res?.code || '')
    .replace(/import \{.+\} from "vue";/, '')
    .replace(/h\(_?resolveComponent\((.*?)\)/g, `h(this.getComponent($1)`)
    .replace(/_?resolveComponent/g, 'h')
    .replace(/_?createTextVNode\((.*?)\)/g, '$1')
    .trim()
}

const parseList: ParseItem[] = []

export const parseData = (data: any, scope: Record<string, any> = {}, ctx: PageContext): any => {
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

// 规避创建function eslint报错
export const newFn = (...argv: string[]): Function => {
  const Fn = Function
  return new Fn(...argv)
}

const parseExpression = (data: JSData, scope: Record<string, any>, ctx: PageContext, isJsx = false): any => {
  try {
    const mergeScope: Record<string, any> = {
      ...ctx,
      ...scope,
      slotScope: scope
    }
    let expression = isJsx ? transformJSX(data.value) : data.value
    let params: Record<string, any> = {}
    if (data.params) {
      params = data.params.reduce((acc: Record<string, any>, paramName: string) => {
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

const parseJSSlot = (data: any, scope: Record<string, any>): Function => {
  return ($scope: Record<string, any>) => renderDefault(data.value, { ...scope, ...$scope }, data)
}

// 解析函数字符串结构
const parseFunctionString = (fnStr: string): { type: string; name: string; params: string[]; body: string } | null => {
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

// 解析JSX字符串为可执行函数
const parseJSXFunction = (data: JSData, ctx: PageContext): Function => {
  try {
    const newValue = transformJSX(data.value)
    const fnInfo = parseFunctionString(newValue)
    if (!fnInfo) throw Error('函数解析失败，请检查格式。示例：function fnName() { }')

    return newFn(...fnInfo.params, fnInfo.body).bind({
      ...ctx,
      getComponent
    })
  } catch (error) {
    console.error((error as Error)?.message || '函数声明解析报错，请检查语法')
    return newFn()
  }
}

const parseJSFunction = (data: JSData, _scope: Record<string, any>, ctx: PageContext): Function => {
  try {
    const innerFn = newFn(`return ${data.value}`).bind(ctx)()
    return generateFn(innerFn, ctx)
  } catch (error) {
    return parseJSXFunction(data, ctx)
  }
}

const parseObjectData = (data: ObjectData, scope: Record<string, any>, ctx: PageContext): any => {
  if (!data) {
    return data
  }

  // 如果是状态访问器,则直接解析默认值
  if (isStateAccessor(data as StateData)) {
    return parseData((data as StateData).defaultValue, scope, ctx)
  }

  // 解析通过属性传递icon图标组件
  if (data.componentName === 'Icon') {
    return getIcon(data.props?.name)
  }
  const res: Record<string, any> = {}
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

  if (!Object.keys(res).length) {
    return null
  }

  return res
}

const parseString = (data: string): string => {
  return data.trim()
}

const parseArray = (data: any[], scope: Record<string, any>, ctx: PageContext): any[] => {
  return data.map((item) => parseData(item, scope, ctx))
}

const parseFunction = (data: Function, _scope: Record<string, any>, ctx: PageContext): Function => {
  return data.bind(ctx)
}

// 这些函数在原始代码中可能没有定义，需要根据实际情况补充
const renderDefault = (value: any, _scope: Record<string, any>, _data: any): any => {
  // 实现渲染默认值的逻辑
  return value
}

const generateFn = (innerFn: any, _ctx: PageContext): Function => {
  // 实现生成函数的逻辑
  return innerFn
}

const getIcon = (name: string): any => {
  // 实现获取图标的逻辑
  return name
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
