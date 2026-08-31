/**
 * 清空对象上的所有可枚举属性。
 *
 * @param obj - 待清空的对象
 */
export const reset = (obj: Record<string, unknown>): void => {
  Object.keys(obj).forEach((key) => delete obj[key])
}

/**
 * 对比两个对象，返回 objA 中存在但 objB 中不存在的 key 列表。
 *
 * @param objA - 当前运行时对象
 * @param objB - 新的 schema 配置对象
 * @returns 需要从运行时对象中删除的 key
 */
export const getDeletedKeys = (
  objA: Record<string, unknown> | null | undefined,
  objB: Record<string, unknown> | null | undefined
): string[] => {
  const keyB = new Set(Object.keys(objB || {}))

  return Object.keys(objA || {}).filter((item) => !keyB.has(item))
}
