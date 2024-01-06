import { Severity, ERRORTYPES_CATEGORY } from '../shared'
import { VueInstance, ViewModel } from './types'
import { ReportDataType } from '../types'
import { getTimestamp, variableTypeDetection, getBigVersion, getNowFormatTime } from '../utils'
import { breadcrumb } from '../core'

export function handleVueError(err: Error, vm: ViewModel, info: string, level: Severity, Vue: VueInstance): void {
  const version = Vue?.version
  const stackTraces = err.stack || []
  let data: ReportDataType = {
    subType: 'vueError',
    errorMsg: `${err.message}`,
    stackTraces: err.stack || [],
    line: stackTraces[0]?.lineno || 0,
    col: stackTraces[0]?.colno || 0,
    type: err.name,
    hook: info, // 报错的Vue阶段
    happenTime: getTimestamp(),
    happenDate: getNowFormatTime()
  }
  if (variableTypeDetection.isString(version)) {
    // console.log('getBigVersion', getBigVersion(version))
    switch (getBigVersion(version)) {
      case 2:
        data = { ...data, ...vue2VmHandler(vm) }
        data.componentNameTrace = getComponentNameTrace(vm, getBigVersion(version))
        break
      case 3:
        data = { ...data, ...vue3VmHandler(vm) }
        data.componentNameTrace = getComponentNameTrace(vm, getBigVersion(version))
        break
      default:
        return
        break
    }
  }
  breadcrumb.push({
    level: Severity.ERROR,
    category: ERRORTYPES_CATEGORY.JS_ERROR,
    ...data
  })
}

/**
 * @param vm
 * @returns
 */
function getComponentNameTrace(vm: ViewModel, version: number) {
  const compTrace = [this.formatComponentName(vm)]
  while (vm.$parent) {
    vm = vm.$parent
    if (version == 2) compTrace.unshift(vue2VmHandler(vm))
    if (version == 3) compTrace.unshift(vue3VmHandler(vm))
  }
  return compTrace
}

/**
 * vue2
 * @param vm
 * @returns
 */
function vue2VmHandler(vm: ViewModel) {
  let componentName = ''
  if (vm.$root === vm) {
    componentName = 'root'
  } else {
    const name = vm._isVue ? (vm.$options && vm.$options.name) || (vm.$options && vm.$options._componentTag) : vm.name
    componentName =
      (name ? 'component <' + name + '>' : 'anonymous component') +
      (vm._isVue && vm.$options && vm.$options.__file ? ' at ' + (vm.$options && vm.$options.__file) : '')
  }
  return {
    componentName
  }
}

/**
 * vue3
 * @param vm
 * @returns
 */
function vue3VmHandler(vm: ViewModel) {
  let componentName = ''
  if (vm.$root === vm) {
    componentName = 'root'
  } else {
    // console.log(vm.$options)
    const name = vm.$options && vm.$options.name
    componentName = name ? 'component <' + name + '>' : 'anonymous component'
  }
  return {
    componentName
  }
}
