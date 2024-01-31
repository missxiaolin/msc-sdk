import { record } from 'rrweb'
import pako from 'pako'
import { Base64 } from 'js-base64'
import { _support } from '../../../utils'
import generateUniqueID from '../../../utils/generateUniqueID'

/**
 * @param transportData
 * @param recordScreentime
 */
export function handleScreen(reportCallback: any, recordScreentime: number): void {
  // events存储录屏信息
  let events: any[] = []
  // 调用stopFn停止录像
  // let stopFn = record({});
  record({
    emit(event) {
      // 此段时间内发生错误，上报录屏信息
      if (_support.hasError) {
        _support.recordScreenId = generateUniqueID();
        reportCallback(zip(events));
        events = [];
        _support.hasError = false;
      }
      events.push(event);
    },
    recordCanvas: true,
    // 默认每10s重新制作快照
    checkoutEveryNms: 1000 * recordScreentime
  })
}

// 压缩
export function zip(data: any): string {
  if (!data) return data
  // 判断数据是否需要转为JSON
  const dataJson = typeof data !== 'string' && typeof data !== 'number' ? JSON.stringify(data) : data
  // 使用Base64.encode处理字符编码，兼容中文
  const str = Base64.encode(dataJson as string)
  const binaryString = pako.gzip(str)
  const arr = Array.from(binaryString)
  let s = ''
  arr.forEach((item: any) => {
    s += String.fromCharCode(item)
  })
  return Base64.btoa(s)
}
