/**
 * 错误类型枚举
 */
export class CategoryEnum {
  /**
   * js 错误
   */
  static get JS_ERROR() {
    return 'JS_ERROR';
  }

  /**
   * 资源引用错误
   */
  static get RESOURCE_ERROR() {
    return 'RESOURCE_ERROR';
  }

  /**
   * Vue错误
   */
  // static get VUE_ERROR() { return "VUE_ERROR"; }

  /**
   * promise 错误
   */
  static get PROMISE_ERROR() {
    return 'PROMISE_ERROR';
  }

  /**
   * http异步请求错误
   */
  static get HTTP_ERROR() {
    return 'HTTP_ERROR';
  }

  /**
   * http 异步log
   */
  static get HTTP_LOG() {
    return 'HTTP_LOG';
  }

  /**
   * 控制台错误console.info
   */
  static get CONSOLE_INFO() {
    return 'CONSOLE_INFO';
  }

  /**
   * 控制台错误console.warn
   */
  static get CONSOLE_WARN() {
    return 'CONSOLE_WARN';
  }

  /**
   * 控制台错误console.error
   */
  static get CONSOLE_ERROR() {
    return 'CONSOLE_ERROR';
  }

  /**
   * 跨域js错误
   */
  static get CROSS_SCRIPT_ERROR() {
    return 'CROSS_SCRIPT_ERROR';
  }

  /**
   * 未知异常
   */
  static get UNKNOW_ERROR() {
    return 'UNKNOW_ERROR';
  }

  /**
   * 性能上报
   */
  static get PERFORMANCE() {
    return 'PERFORMANCE';
  }

  /**
   * 网速上报
   */
  static get NETWORK_SPEED() {
    return 'NETWORK_SPEED';
  }

  /**
   * 用户行为
   */
  // static get USER_BEHAVIOR() { return "USER_BEHAVIOR"; }
  /**
   * 用户行为 - 路由信息
   */
  static get PAGE_CHANGE() {
    return 'PAGE_CHANGE';
  }

  /**
   *  用户行为 - 点击行为
   */
  static get USER_CLICK() {
    return 'USER_CLICK';
  }
}

/**
 * 错误level枚举
 */
export class ErrorLevelEnum {
  /**
   * 错误信息
   */
  static get ERROR() {
    return 'ERROR';
  }

  /**
   * 警告信息
   */
  static get WARN() {
    return 'WARNING';
  }

  /**
   * 日志信息
   */
  static get INFO() {
    return 'INFO';
  }
}

/**
 * 用户行为 枚举
 */
export class BehavirEnum {
  /**
   * 路由信息
   */
  static get PAGE_CHANGE() {
    return 'PAGE_CHANGE';
  }

  /**
   * 点击行为
   */
  static get USER_CLICK() {
    return 'USER_CLICK';
  }
}

/**
 * 上报时间间隔
 */
