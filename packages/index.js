import MonitorSdk from './monitor';
import { isWxMiniEnv, guid, monitorCookie, uaParser, loadScript } from './utils/utils';
export { isWxMiniEnv, guid, monitorCookie, uaParser, loadScript };
export default MonitorSdk;

if (isWxMiniEnv) {
  wx.MonitorSdk = MonitorSdk;
  wx.MUtils = {
    isWxMiniEnv,
    guid,
    monitorCookie,
    uaParser,
    loadScript,
  };
} else {
  window.MonitorSdk = MonitorSdk;
  window.MUtils = {
    isWxMiniEnv,
    guid,
    monitorCookie,
    uaParser,
    loadScript,
  };
}
