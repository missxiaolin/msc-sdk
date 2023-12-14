import BaseMonitor from '../base/baseMonitor';
import { getCurrentTime, getNowFormatTime } from '../utils/utils';
import { CategoryEnum, ErrorLevelEnum } from '../base/baseConfig';
import { parseStackFrames } from '../utils/spaStackFrames';
export class HackVue extends BaseMonitor {
  constructor(options) {
    super(options);
    this.handleError();
  }

  handleError(Vue = window?.Vue) {
    if (!Vue) {
      if (this.maxPolling < 8) {
        setTimeout(() => {
          this.handleError();
        }, 500);
      }
      return;
    }
    Vue.config.errorHandler = (err, vm, info) => {
      try {
        const stackTraces = err ? parseStackFrames(err) : [];
        const errorMsg = err.message;
        if (vm) {
          const componentName = this.formatComponentName(vm);
          const componentNameTrace = this.getComponentNameTrace(vm);
          const propsData = vm.$options && vm.$options.propsData;
          const errorObj = {
            level: ErrorLevelEnum.WARN,
            category: CategoryEnum.JS_ERROR,
            errorMsg,
            stackTraces,
            line: stackTraces[0]?.lineno,
            col: stackTraces[0]?.colno,
            subType: 'vueError',
            componentName,
            // propsData,
            type: err.name,
            hook: info, // 报错的Vue阶段
            componentNameTrace,
            happenTime: getCurrentTime(),
            happenDate: getNowFormatTime(),
          };
          this.recordError(errorObj);
        } else {
          const errorObj = {
            errorType,
            errorMsg,
            type: err.name,
            stackTrace,
          };

          this.recordError(errorObj);
        }
      } catch (error) {
        console.log('error----', error);
        throw new Error(typeof error === 'string' ? error : '');
      }
      throw err;
    };
  }

  getComponentNameTrace(vm) {
    const compTrace = [this.formatComponentName(vm)];
    while (vm.$parent) {
      vm = vm.$parent;
      compTrace.unshift(this.formatComponentName(vm));
    }

    return compTrace;
  }

  formatComponentName(vm) {
    try {
      if (vm.$root === vm) return 'root';

      const name = vm._isVue
        ? (vm.$options && vm.$options.name) || (vm.$options && vm.$options._componentTag)
        : vm.name;
      return (
        (name ? 'component <' + name + '>' : 'anonymous component') +
        (vm._isVue && vm.$options && vm.$options.__file
          ? ' at ' + (vm.$options && vm.$options.__file)
          : '')
      );
    } catch (error) {
      throw new Error(typeof error === 'string' ? error : '');
    }
  }
}

export default HackVue;
