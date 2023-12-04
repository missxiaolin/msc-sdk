import MonitorSdk from './monitor';
import { loadScript, guid, monitorCookie, uaParser } from './utils/utils';
export { guid, monitorCookie, uaParser, loadScript };
export default MonitorSdk;
window.MonitorSdk = MonitorSdk;
window.MUtils = {
  monitorCookie,
  guid,
  loadScript,
  uaParser,
};
