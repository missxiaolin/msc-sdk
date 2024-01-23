### 1、简介

msc 是一款前端监控工具，主要包含下面几个方面信息监控：

- 1）前端异常监控；
- 2）页面性能监控；
- 3）设备信息采集；

### 2、异常捕获详情

- 1）js 错误信息监控；
- 2）支持 promise 中未捕获异常信息的抓取；
- 3）支持 ajax 库（xhr）异常信息捕获；
- 4）支持资源错误信息捕获。

### 3、页面性能监控

- 1）重定向的时间；
- 2）DNS 查询时间；
- 3）DNS 缓存时间；
- 4）卸载页面的时间；
- 5）tcp 连接耗时；
- 6）内容加载完成的时间；
- 7）解析 dom 树耗时；
- 8）白屏时间；
- 9）页面加载完成的时间；
- ...


现在 chrome 开发团队提供了 web-vitals(https://www.npmjs.com/package/web-vitals) 库，方便来计算各性能数据（注意：web-vitals 不支持safari浏览器）


### 4、设备信息采集

- 1）设备类型；
- 2）操作系统；
- 3）操作系统版本；
- 4）屏幕高、屏幕宽；
- 5）当前使用的语言-国家；
- 6）联网类型；
- 7）横竖屏；
- 8）浏览器信息；
- 9）浏览器指纹；
- 10）userAgent；
- ...

性能分析参考[https://juejin.cn/post/7010647775880708133]

### 性能分析

真实用户性能指标也就是上文有所提及的 RUM 以及平台自己扩展的一些额外的指标，包括以下指标：

首次绘制时间（ FP ） ：即 First Paint，为首次渲染的时间点。

首次内容绘制时间（ FCP ） ：即 First Contentful Paint，为首次有内容渲染的时间点。

首次有效绘制时间（ FMP ） ：用户启动页面加载与页面呈现首屏之间的时间。

首次交互时间（ FID ） ：即 First Input Delay，记录页面加载阶段，用户首次交互操作的延时时间。FID 指标影响用户对页面交互性和响应性的第一印象。

交互中最大延时（ MPFID ） ：页面加载阶段，用户交互操作可能遇到的最大延时时间。

完全可交互时间（TTI）：即 Time to interactive，记录从页面加载开始，到页面处于完全可交互状态所花费的时间。

首次加载 跳出率：第一个页面完全加载前用户跳出率。

慢开比：完全加载耗时超过 5s 的 PV 占比。

## 说说接入

### web接入

导入sdk

http://www.missxiaolin.com/sdk/web.min.js

~~~
var baseURL = "https://msc-serve.missxiaolin.com";
MITO.init({
    monitorAppId: "adm",
    uuId: () => MITO.getCookie("userId"),
    watch: {
        pageChange: true,
        jsError: true,
        vueError: true,
        promise: true,
        performance: true,
        whiteScreen: true,
        click: true,
        resource: true,
        request: true,
    },
    report: {
        url: baseURL + "/api/update", //错误上报地址
        reportType: 1, // 1:fetch 2:img 3
        maxQueues: 100, // img 尽量限制在 10条
        beforeSend: (data) => data,
        encryption: 0,
        delay: 30000,
    },
});
~~~

### 小程序接入

导入sdk

http://www.missxiaolin.com/sdk/wx-mini.js

~~~
const r = `https://msc-serve.missxiaolin.com`; 
MITO.init({
	monitorAppId: `ys-tool-mp`,
	uuId: () => MITO.getUser("user_id"),
	watch: { "pageChange": true, "jsError": true, "performance": true, "request": true, "click": true }, report: { url: `${r}/api/update`, trackUrl: `${r}/api/tracker/update`, encryption: 0, maxQueues: 8, reportType: 1, delay: 30000 },
})
~~~

### 设置用户ID

~~~
MITO.setUserId('xxxxxx')
~~~

### options.property

~~~
export interface InitOptions extends HooksTypes {
  /**
   * 为false时，整个sdk将禁用
   */
  monitorSwitch?: boolean
  /**
   * 项目id
   */
  monitorAppId?: string
  /**
   * 获取用户
   */
  uuId?: any
  report?: {
    /**
     * 错误监控的dsn服务器地址
     */
    url?: string
    /**
     * 自定义上报地址
     */
    trackUrl?: string
    /**
     * 1:fetch 2:img
     */
    reportType?: number
    /**
     * img 尽量限制在 10条
     */
    maxQueues?: number
    /**
     * 是否加密
     */
    encryption?: number
    /**
     * 间隔
     */
    delay: number
  }
  watch?: {
    whiteScreen: boolean
    /**
     * 页面
     */
    pageChange: boolean
    /**
     * js 错误
     */
    jsError: boolean
    /**
     * vue 错误
     */
    vueError: boolean
    /**
     * promise
     */
    promise: boolean
    /**
     * 性能
     */
    performance: boolean
    /**
     * 点击
     */
    click?: boolean
    /**
     * 资源
     */
    resource?: boolean
    /**
     * 网络
     */
    request?: boolean
    /**
     * 在引入wx-mini的情况下，使用该参数用来开启
     */
    enableTrack?: boolean
  }

  customInfo?: {
    // 获取动态传参  (1.4.5版本及以后支持该方式)
    getDynamic: void
  }

  /**
   * 默认为空，所有ajax都会被监听，不为空时，filterXhrUrlRegExp.test(xhr.url)为true时过滤
   */
  filterXhrUrlRegExp?: RegExp

  /**
   * 按钮点击和微信触摸事件节流时间，默认是0
   */
  throttleDelayTime?: number
}
~~~



### options.hook

~~~
export interface HooksTypes {
  /**
   * 钩子函数，配置发送到服务端的xhr
   * 可以对当前xhr实例做一些配置：xhr.setRequestHeader()、xhr.withCredentials
   * 会在xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8')、
   * xhr.withCredentials = true,后面调用该函数
   * ../param xhr XMLHttpRequest的实例
   */
  configReportXhr?(xhr: XMLHttpRequest, reportData:  any): void
  /**
   * 钩子函数，在每次发送事件前会调用
   *
   * ../param event 有SDK生成的错误事件
   * ../returns 如果返回 null | undefined | boolean 时，将忽略本次上传
   */
  beforeDataReport?(event: any): Promise<any | null | CANCEL> | any | CANCEL | null
  /**
   * 钩子函数，在每次添加用户行为事件前都会调用
   *
   * ../param breadcrumb 由SDK生成的breacrumb事件栈
   * ../param hint 当次的生成的breadcrumb数据
   * ../returns 如果返回 null | undefined | boolean 时，将忽略本次的push
   */
  beforePushBreadcrumb?(breadcrumb: Breadcrumb, hint: BreadcrumbPushData): CANCEL
  /**
   * 在状态小于400并且不等于0的时候回调用当前hook
   * ../param data 请求状态为200时返回的响应体
   * ../returns 如果返回 null | undefined | boolean 时，将忽略本次的上传
   */
  // afterSuccessHttp?<T>(data: T): string | CANCEL
  /**
   * 钩子函数，拦截用户页面的ajax请求，并在ajax请求发送前执行该hook，可以对用户发送的ajax请求做xhr.setRequestHeader
   * ../param config 当前请求的
   */
  beforeAppAjaxSend?(config: IRequestHeaderConfig, setRequestHeader: IBeforeAppAjaxSendConfig): void
}
~~~