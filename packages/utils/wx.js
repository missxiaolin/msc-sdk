import { variableTypeDetection } from './help';

/**
 * 获取当前url
 */
export function getPage() {
  let path = '';
  if (getCurrentPages().length) {
    path = getCurrentPages()[getCurrentPages().length - 1].__route__;
  }
  return path;
}

/**
 * url
 * @param {*} url
 * @param {*} query
 */
export function setUrlQuery(url, query) {
  var queryArr = [];
  Object.keys(query).forEach(function (k) {
    queryArr.push(k + '=' + query[k]);
  });
  if (url.indexOf('?') !== -1) {
    url = url + '&' + queryArr.join('&');
  } else {
    url = url + '?' + queryArr.join('&');
  }
  return url;
}

/**
 * @param {*} delta
 */
export function getNavigateBackTargetUrl(delta) {
  if (!variableTypeDetection.isFunction(getCurrentPages)) {
    return '';
  }
  var pages = getCurrentPages();
  if (!pages.length) {
    return 'App';
  }
  delta = delta || 1;
  var toPage = pages[pages.length - delta];
  return setUrlQuery(toPage.route, toPage.options);
}

/**
 * 获取设备
 * @returns
 */
export function getSystemInfoSync() {
  const res = wx.getSystemInfoSync();
  const os = res.system.split(' ');
  let obj = {
    ua: '',
    browser: {
      name: `${res.model}`,
      version: res.version,
    },
    cpu: {},
    device: {
      type: 'mobile',
      model: `${res.brand}`,
      vendor: ``,
    },
    engine: {
      name: '',
      version: '',
    },
    os: {
      name: os && os.length && os[0] ? os[0] : '',
      version: os && os.length && os[1] ? os[1] : '',
    },
    fingerPrint: '',
  };

  return obj;
}

/**
 * 获取手机额外信息
 * @returns
 */
export function getPhoneInfo() {
  const res = wx.getSystemInfoSync();
  let obj = {
    screen: {
      height: res.screenWidth,
      width: res.screenHeight,
    },
    navigator: {
      language: res.language,
      connection: { effectiveType: '' }, // 网络类型
    },
  };
  return obj;
}

/**
 * 返回包含id、data字符串的标签
 * @param e wx BaseEvent
 */
export function targetAsString(e) {
  const id = e.currentTarget?.id ? ` id="${e.currentTarget?.id}"` : '';
  const dataSets = Object.keys(e.currentTarget.dataset).map(key => {
    return `data-${key}=${e.currentTarget.dataset[key]}`;
  });
  return `<element ${id} ${dataSets.join(' ')}/>`;
}
