import { throttle } from './utils'

/**
 * 浏览器加载前
 * @param {*} callback
 */
export function onBeforeunload(callback) {
  const onBeforePageunload = event => {
    callback(event);
    window.removeEventListener('onBeforeunload', onBeforePageunload, true);
  };
  window.addEventListener('beforeunload', onBeforePageunload, true);
}

/**
 * 浏览器关闭 或 页签切换
 * @param {*} callback
 * @param {*} once
 */
export function onHidden(callback, once) {
  const onHiddenOrPageHide = event => {
    if (event.type === 'pagehide' || document.visibilityState === 'hidden') {
      callback(event);
      if (once) {
        window.removeEventListener('visibilitychange', pageHideCall, true);
        window.removeEventListener('pagehide', pageHideCall, true);
      }
    }
  };
  const pageHideCall = throttle(onHiddenOrPageHide);
  window.addEventListener('visibilitychange', pageHideCall, true);
  window.addEventListener('pagehide', pageHideCall, true);
}
