import { isString } from './validate';
import UAParser from '../device/ua-parser';
import { isWxMiniEnv } from './global';
import { getSystemInfoSync, getPhoneInfo, getPage } from './wx';

/**
 * @param {*} target
 * @returns
 */
export function deepCopy(target) {
  if (typeof target === 'object') {
    const result = Array.isArray(target) ? [] : {};
    for (const key in target) {
      if (typeof target[key] == 'object') {
        result[key] = deepCopy(target[key]);
      } else {
        result[key] = target[key];
      }
    }

    return result;
  }

  return target;
}

// 获取当前时间戳
export const getCurrentTime = () => new Date().getTime();

/**
 * 节流
 */
export const throttle = (fun, delay = 300) => {
  let last, deferTimer;
  return function () {
    let that = this;
    let _args = arguments;
    let now = +new Date();
    if (last && now < last + delay) {
      clearTimeout(deferTimer);
      deferTimer = setTimeout(() => {
        last = now;
        fun.apply(that, _args);
      }, delay);
    } else {
      last = now;
      fun.apply(that, _args);
    }
  };
};

/**
 * 防抖
 */
export const debounce = (fun, delay = 300) =>
  function (args) {
    let that = this;
    let _args = args;
    clearTimeout(fun.id);
    fun.id = setTimeout(() => {
      fun.call(that, _args);
    }, delay);
  };

/**
 * str 加密
 */
export const b64EncodeUnicode = data => {
  if (!isString(data)) {
    data = JSON.stringify(data);
  }
  try {
    return btoa(
      encodeURIComponent(data).replace(/%([0-9A-F]{2})/g, (match, p1) =>
        String.fromCharCode('0x' + p1)
      )
    );
  } catch (e) {
    data;
  }
};

/**
 * str 解密
 *
 * @param {*} str
 * @returns
 */
export const b64DecodeUnicode = str => {
  try {
    return decodeURIComponent(
      atob(str)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch (e) {
    return str;
  }
};

/**
 * 生成uuid
 * @returns
 */
export const guid = () => {
  let uuid = localStorage.getItem('webUuid');
  if (uuid) return uuid;
  let uuidStr = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    let r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  localStorage.setItem('webUuid', uuidStr);
  return uuidStr;
};

/**
 * @description: 格式化设备信息
 * @return {*}
 */
export const uaParser = () => {
  const {
    ua,
    fingerPrint,
    browser: { name: browserName, version: browserVersion },
    engine: { name: engineName },
    device: { type: deviceType, model: deviceModel, vendor: deviceVendor },
    os: { name: osName, version: osVersion },
  } = isWxMiniEnv ? getSystemInfoSync() : new UAParser().getResult();
  const {
    screen: { height: screenHeight = '', width: screenWidth = '' },
    navigator: {
      language = [],
      connection: { effectiveType = '' },
    },
  } = isWxMiniEnv ? getPhoneInfo() : window;
  let uas = {
    deviceType: deviceType || 'PC', // 设备类型
    OS: `${osName} ${osVersion}`, // 操作系统
    browserInfo: `${browserName} ${browserVersion}`, // 浏览器信息
    device:
      deviceType && deviceVendor ? `${deviceVendor}` : `${browserName}` ? `${browserName}` : '', // 设备类型
    deviceModel: deviceType ? deviceModel : engineName,
    screenHeight, // 屏幕高
    screenWidth, // 屏幕宽
    language, // 当前使用的语言-国家
    netWork: effectiveType, // 联网类型
    fingerPrint, // 浏览器指纹
    userAgent: ua,
  };

  return uas;
};

/**
 * @param {*} path
 * @param {*} query
 * @returns
 */
export const formatUrlToStr = (path = '', query = {}) => {
  let permPath = path || '';
  const params = Object.keys(query) || [];
  if (params.length > 0) {
    permPath += '?';
    params.forEach((item, idx) => {
      permPath += item + '=*';
      if (idx < params.length - 1) {
        permPath += '&';
      }
    });
  } else if (path.indexOf('=') > -1) {
    let urlObj = path.split('=');
    permPath = '';
    urlObj.forEach((item, index) => {
      if (item.indexOf('&') > -1) {
        let reset = urlObj.length - Number(index) == 1 ? '' : '&' + item.split('&')[1] + '=*';
        permPath += reset;
      } else if (index == 0) {
        permPath += item + '=*';
      }
    });
  }
  return permPath || path;
};

/**
 * 获取当前页面链接
 * @returns
 */
export const getPageURL = () => (isWxMiniEnv ? getPage() : window.location.href);

/**
 *
 * @param {*} url
 * @returns
 */
export const replaceSlash = url => url.replace(/^\/|\/$/g, '');

/**
 * 获取当前时间
 */
export const getNowFormatTime = (seperator = '-') => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
  const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
  const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  const seconds = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  const currentdate =
    year + seperator + month + seperator + day + ' ' + hour + ':' + minutes + ':' + seconds;
  return currentdate;
};

/**
 *  获取随机数
 */
export const randomString = len => {
  len = len || 10;
  const $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz123456789';
  const maxPos = $chars.length;
  let pwd = '';
  for (let i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd + new Date().getTime();
};

/**
 *
 * @param {*} tempNum
 * @param {*} s
 * @returns
 */
export const toFixed = (tempNum = 2, s) => {
  let num = tempNum;
  const times = Math.pow(10, s);
  if (num < 0) {
    num = Math.abs(num); // 先把负数转为正数，然后四舍五入之后再转为负数
    const des = parseInt(num * times + 0.5, 10) / times;
    return -des;
  }
  const des = parseInt(num * times + 0.5, 10) / times;
  let finalDes = des;
  const tempDes = des + '';
  if (tempDes.indexOf('.') !== -1) {
    const start = tempDes.split('.')[0];
    let end = tempDes.split('.')[1];
    if (end.length > s) {
      end = end.substring(0, 2);
    }
    finalDes = start + '.' + end;
  }
  return parseFloat(finalDes);
};

/**
 * 动态插入script
 */
export const loadScript = (url, id = getCurrentTime(), callback) => {
  const script = document.createElement('script');
  // script.type = 'text/javascript';
  script.id = `${id}`;
  // 处理IE
  if (script.readyState) {
    script.onreadystatechange = function () {
      if (script.readyState === 'loaded' || script.readyState === 'complete') {
        script.onreadystatechange = null;
        callback();
      }
    };
  } else {
    // 处理其他浏览器的情况
    script.onload = function () {
      callback();
    };
  }
  script.src = url;
  document.body.append(script);
};

/**
 * @description : 原生获取 cookie
 */
export const monitorCookie = name => {
  if (isWxMiniEnv) {
    return wx.getStorageSync(name);
  }
  let resultVal = '';
  if (!name) return resultVal;
  const splitName = name.split('.');
  const cookieKey = splitName.splice(0, 1)[0];
  // RegExp 和 match
  let arr,
    reg = new RegExp('(^| )' + cookieKey + '=([^;]*)(;|$)');
  arr = document.cookie.match(reg);
  if (arr) {
    // 编码转换
    const cKey = decodeURIComponent(arr[2]);
    if (splitName.length) {
      const ObjcKey = JSON.parse(cKey);
      let forVal = '';
      for (let i = 0, len = splitName.length; i < len; i++) {
        if (!i) {
          forVal = ObjcKey[splitName[i]];
        } else {
          forVal = forVal[splitName[i]];
        }
      }
      return (resultVal = forVal);
    }
    resultVal = cKey;
  } else {
    return resultVal;
  }
  return resultVal;
};

/**
 * 保留指定位数的小数
 * @param num 原数据
 * @param decimal 小数位数
 * @returns
 */
export function formatDecimal(num, decimal) {
  if (!num) {
    return num;
  }
  let str = num.toString();
  const index = str.indexOf('.');
  if (index !== -1) {
    str = str.substring(0, decimal + index + 1);
  } else {
    str = str.substring(0);
  }
  return parseFloat(str);
}

/**
 * 计算字符串大小
 * @param str
 * @returns 字节
 */
export function countBytes(str = '') {
  const encoder = new TextEncoder();
  return encoder.encode(str).length;
}

/**
 * 根据字节大小拆分字符串
 * @param str
 * @param maxBytes 最大字节数
 * @returns
 */
export function splitStringByBytes(str = '', maxBytes = '') {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  const decoder = new TextDecoder();
  const chunks = [];
  let start = 0;
  while (start < bytes.length) {
    let end = start + maxBytes;
    while (end > start && (bytes[end] & 0xc0) === 0x80) {
      end--;
    }
    chunks.push(decoder.decode(bytes.subarray(start, end)));
    start = end;
  }
  return chunks;
}

/**
 * 合并
 */
export function __assign() {
  __assign =
    Object.assign ||
    function __assign(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
      return t;
    };
  return __assign.apply(this, arguments);
}
