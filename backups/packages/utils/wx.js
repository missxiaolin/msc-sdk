import { variableTypeDetection } from './is';

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
  let pages = getCurrentPages();
  if (!pages.length) {
    return 'App';
  }
  delta = delta || 1;
  let toPage = pages[pages.length - delta];
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

/**
 * 格式化性能数据
 * @param {*} data 
 * @returns 
 */
export function getWxPerformance(data) {
  let RF = [];
  let FP = {
    name: 'first-contentful-paint',
    startTime: '',
    RF: [],
  };
  let FCP = {
    name: 'first-contentful-paint',
    startTime: '',
    RF: [],
  };
  let LCP = {
    name: 'first-contentful-paint',
    startTime: '',
    RF: [],
  };
  let NT = {
		appLaunch: 0, // 小程序启动耗时。
		appLaunchStartTime: '',
		route: 0, // 路由耗时
		routeStartTime: '',
		firstRender: 0, // 页面首次渲染耗时
		firstRenderStartTime: '',
		script: 0, // 逻辑层 JS 代码注入耗时
		scriptStartTime: '',
		loadPackage: 0, // 代码包下载耗时。(entryType: loadPackage)
		loadPackageStartTime: '',
	};
  data.forEach(item => {
    if (item.entryType == 'resource') {
      RF.push({
        ...item,
      });
    } else if (item.name == 'firstPaint' && item.entryType == 'render') {
      FP.startTime = item.startTime;
    } else if (item.name == 'firstContentfulPaint' && item.entryType == 'render') {
      FCP.startTime = item.startTime;
    } else if (item.name == 'largestContentfulPaint' && item.entryType == 'render') {
      LCP.startTime = item.startTime;
    } else if (item.name == 'appLaunch' && item.entryType == 'navigation') {
			NT.appLaunch = item.duration || 0;
			NT.appLaunchStartTime = item.startTime || '';
    } else if (item.name == 'firstRender' && item.entryType == 'render') {
			NT.firstRender = item.duration || 0;
			NT.firstRenderStartTime = item.startTime || 0;
    } else if (item.name == 'evaluateScript' && item.entryType == 'script') {
			NT.script = item.duration || 0;
			NT.scriptStartTime = item.startTime || ''
    } else if (item.name == 'downloadPackage' && item.entryType == 'loadPackage') {
			NT.loadPackage = item.duration || 0;
			NT.loadPackageStartTime = item.startTime || ''
    } else if (item.name == 'route' && item.entryType == 'navigation') {
			NT.route = item.duration || 0;
			NT.routeStartTime = item.startTime || '';
    } else {
			console.log(item)
		}
  });
  let result = {
    RF,
    FP,
    FCP,
    LCP,
    FMP: '',
    NT,
  };
  return result;
}