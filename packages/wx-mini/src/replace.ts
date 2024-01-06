import { getFlag } from '../../utils/global'
import { WxAppEvents } from '../../shared/index'

export function replaceApp() {
  if (App) {
    const originApp = App
    App = function (appOptions: WechatMiniprogram.App.Option) {
      const methods = [WxAppEvents.AppOnShow, WxAppEvents.AppOnError, WxAppEvents.AppOnUnhandledRejection]
      methods.forEach((method) => {
        if (getFlag(method)) return
      })
      return originApp(appOptions)
    } as WechatMiniprogram.App.Constructor
  }
}
