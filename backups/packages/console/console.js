import BaseMonitor from '../base/baseMonitor';
import { CategoryEnum, ErrorLevelEnum } from '../base/baseConfig';
import { getCurrentTime, getNowFormatTime } from '../utils/utils';
/**
 * console.error异常
 */
class HackConsole extends BaseMonitor {
  constructor(options) {
    super(options);
    this.hackConsole();
  }

  hackConsole() {
    if (window && window.console) {
      const consoleList = ['debug', 'info', 'warn', 'log', 'error'];
      for (let e = consoleList, n = 0; e.length; n++) {
        let r = e[n];
        let action = window.console[r];
        if (!window.console[r]) return;
        (function (r, action) {
          window.console[r] = function () {
            let i = Array.prototype.slice.apply(arguments);
            let s = {
              type: 'console',
              data: {
                level: r,
                message: JSON.stringify(i),
              },
            };
            action && action.apply(null, i);
          };
        })(r, action);
      }
    }
  }
}

export default HackConsole;
