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
 * 为指定组件的 props 对象补齐缺失的默认属性值。
 *
 * @param componentName - 组件名
 * @param props - 绑定到组件的 props 对象
 * @param defaultPropsMap - 默认值映射表，key 为组件名
 */
export const applyDefaultPropsToProps = (
  componentName: string,
  props: Record<string, any>,
  defaultPropsMap: DefaultPropsMap | null | undefined,
): void => {
  if (typeof componentName !== 'string' || !isObjectRecord(defaultPropsMap)) {
    return
  }

  const componentDefaults = defaultPropsMap[componentName]
  if (!componentDefaults) {
    return
  }

  Object.entries(componentDefaults).forEach(([propertyPath, defaultValue]) => {
    fillMissingValue(props, propertyPath, defaultValue)
  })
}
