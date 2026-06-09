type DefaultValueMap = Record<string, any>

export type DefaultPropsMap = Record<string, DefaultValueMap>

const isObjectRecord = (value: unknown): value is Record<string, any> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * 深拷贝默认值，避免后续 schema 变更污染注册表中的原始值。
 *
 * @param value - 待拷贝的默认值
 * @returns 拷贝后的值
 */
const cloneDefaultValue = (value: any): any => {
  if (!isObjectRecord(value) && !Array.isArray(value)) {
    return value
  }
  return JSON.parse(JSON.stringify(value))
}

/**
 * 在目标 props 对象上按点分路径填充缺失的默认值。
 * 仅当叶子属性为 null 或 undefined 时写入，不覆盖已有值。
 *
 * @param target - 节点 props 对象
 * @param propertyPath - 点分属性路径，如 "options.0.label"
 * @param defaultValue - 默认值
 */
const fillMissingValue = (
  target: Record<string, any>,
  propertyPath: string,
  defaultValue: any,
): void => {
  const keys = propertyPath.split('.')
  let current: Record<string, any> = target

  for (const key of keys.slice(0, -1)) {
    const nextValue = current[key]
    if (nextValue == null) {
      current[key] = {}
      current = current[key]
      continue
    }

    if (!isObjectRecord(nextValue)) {
      return
    }

    current = nextValue
  }

  const leafKey = keys[keys.length - 1]
  if (current[leafKey] == null) {
    current[leafKey] = cloneDefaultValue(defaultValue)
  }
}

/**
 * 对单个 schema 节点应用组件级默认值。
 *
 * @param node - schema 节点
 * @param defaultPropsMap - 默认值映射表，key 为组件名
 */
const applyDefaultsToNode = (
  node: Record<string, any>,
  defaultPropsMap: DefaultPropsMap,
): void => {
  const componentName = node.componentName
  if (typeof componentName !== 'string') {
    return
  }

  const componentDefaults = defaultPropsMap[componentName]
  if (!componentDefaults) {
    return
  }

  if (!isObjectRecord(node.props)) {
    node.props = {}
  }

  Object.entries(componentDefaults).forEach(([propertyPath, defaultValue]) => {
    fillMissingValue(node.props, propertyPath, defaultValue)
  })
}

/**
 * 递归遍历 schema 树，为所有组件节点补齐缺失的默认 props。
 *
 * @param value - 当前遍历值
 * @param defaultPropsMap - 默认值映射表
 */
const visitPossibleNode = (
  value: unknown,
  defaultPropsMap: DefaultPropsMap,
): void => {
  if (Array.isArray(value)) {
    value.forEach((item) => visitPossibleNode(item, defaultPropsMap))
    return
  }

  if (!isObjectRecord(value)) {
    return
  }

  if (typeof value.componentName === 'string') {
    applyDefaultsToNode(value, defaultPropsMap)
    visitPossibleNode(value.children, defaultPropsMap)
    visitPossibleNode(value.slot, defaultPropsMap)
    return
  }

  Object.values(value).forEach((item) => visitPossibleNode(item, defaultPropsMap))
}

/**
 * 在 schema 初始化阶段一次性应用默认值映射，仅填充缺失字段，不覆盖已有 props。
 *
 * @param schema - 页面或卡片 schema
 * @param defaultPropsMap - 用户传入的默认值映射，key 为组件名
 */
export const applyDefaultPropsToSchema = (
  schema: Record<string, any>,
  defaultPropsMap: DefaultPropsMap | null | undefined,
): void => {
  if (!isObjectRecord(schema) || !isObjectRecord(defaultPropsMap)) {
    return
  }

  visitPossibleNode(schema, defaultPropsMap)
}
