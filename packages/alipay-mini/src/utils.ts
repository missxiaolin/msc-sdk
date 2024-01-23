/**
 * 获取支付宝用户
 * @param key 
 * @returns 
 */
export function getUser(key: string) {
  return my.getStorageSync({
    key: key
  }).data
}
