### 1、简介

monster_monitor 是一款前端监控工具，主要包含下面几个方面信息监控：

- 1）前端异常监控；
- 2）页面性能监控；
- 3）设备信息采集；

### 2、异常捕获详情

- 1）js 错误信息监控；
- 2）支持 vue 错误信息监控（需要将 vue 传入，并设置 vueError:true）；
- 3）支持 promise 中未捕获异常信息的抓取；
- 4）支持 ajax 库（xhr）异常信息捕获；
- 5）支持 console.error 错误信息捕获;
- 6）支持资源错误信息捕获。

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

### 5、引入方式

```
1、支持es6方式引入
import { MonitorJS } from "monster_monitor";

2、支持commonjs方式引入
const MonitorJS = require("monster_monitor");

3、支持AMD方式引入
define(['monster_monitor'],(MonitorJS)=>{});

4、支持<script>标签引入方式
<script src="../node_modules/monster_monitor/dist/monitorjs.min.js"></script>
```

### 6、异常监控 Usage

```

1）异常监控初始化代码：
// Default full options
const defaultTrackerOptions = {
  report: {
    url: "",  // 报告url，设置正确的报告url以打开自动报告开关
    beforeSend: (data) => data  //在请求发送前修饰报告数据，支持修饰或返回对象以覆盖
  },
  data: {},
  error: {
    watch: true, // If listen all error
    random: 1, // Sampling rate from 0 to 1, 1 means emit all error
    repeat: 5, // 5 means don't emit sample error events when exceed 5 times. Be careful to set large number because if your report handler cause error, it would probably cause js dead cycle
    delay: 1000 // Delay emit event after 1000 ms
  },
  performance: false, // If want to collect performance data
  http: {
    fetch: true, // If listen request use fetch interface
    ajax: true, // If listen ajax request
    ignoreRules: [] // If request url match rules, interceptor won't emit events. Support string and regexp
  },
  behavior: {
    watch: false,
    console: [ConsoleType.error],
    click: true, // If set to true will listen all dom click event
    queueLimit: 20 // Limit behavior queue to 20
  },
  /**
   * rrweb use mutation observer api, for compatibility see:
   * https://caniuse.com/mutationobserver
   */
  rrweb: {
    watch: false,
    queueLimit: 50, // Limit rrweb queue to 20
    delay: 1000 // Emit event after 1000 ms
  },
  isSpa: true // If watch is true, globalData would add _spaUrl property when route change
};
const monitor = MonitorSdk(defaultTrackerOptions);

2）参数说明：
{
    url ：错误上报地址
    jsError ：配置是否需要监控js错误 （默认true）
    promiseError ：配置是否需要监控promise错误 （默认true）
    resourceError ：配置是否需要监控资源错误 （默认true）
    ajaxError ：配置是否需要监控ajax错误 （默认true）
    consoleError ：配置是否需要监控console.error错误 （默认false）
    vueError ：配置是否需要记录vue错误信息 （默认false）
    vue ： 如需监控vue错误信息，则需要传入vue
    customInfo : { //自定义扩展信息，一般用于数据持久化区分
        a:"", //自定义信息a（名称可自定义）可参考测试栗子 module
        b:"", //自定义信息b（名称可自定义）
        getDynamic:()=>{  //获取动态传参  1.4.5版本及以后支持该方式

        }
    }
}

3）响应（持久化数据）说明：
{
    category:"", //错误类型(枚举)：js_error 、resource_error、vue_error、promise_error、ajax_error、console_info、console_warn、console_error、unknow_error
    logType: "Info", //日志类型(枚举) Error、Warning、Info
    logInfo: "", //记录的信息
    deviceInfo:"", //设备信息(JSON字符串)
    ...customInfo //自定义扩展信息，一般用于数据持久化区分【如：1、项目区分(Project)；2、错误大类区分（前端错误、后端错误 等等）】
}
```

### 7、上报页面性能 Usage

```
1）页面性能信息采集代码：
new MonitorJS().monitorPerformance({
    pageId:"page_0001",  //页面唯一标示
    url:"",  //信息采集上报地址
    isPage:true, //是否上报页面性能数据，默认true
    isResource:true, //是否上报页面资源数据，默认true
    isRNetworkSpeed:true,  //是否需要上报网速，默认false
    isRScript:false, //资源数据细分，是否上报，默认true
    isRCSS:false, //资源数据细分，是否上报CSS数据，默认true
    isRFetch :false, //资源数据细分，是否上报Fetch数据，默认true
    isRXHR :false,  //资源数据细分，是否上报XHR数据，默认true
    isRLink:false, //资源数据细分，是否上报Link，默认true
    isRIMG :false, //资源数据细分，是否上报IMG数据，默认true
    customInfo:{   //扩展信息，一般用于数据数据持久化区分
        module:"项目",
        filterOne: "page_0001",
        getDynamic:()=>{
            return {
                filterTow:()=>{},
            };
        }
    }
});

2）参数说明：
{
    pageId ：页面唯一标示
    url ：信息采集上报地址
}

3）响应（持久化数据）说明：
{
    time: 1565161213722, //上报时间
    deviceInfo: "", //设备信息
    markUser: "",  //用户标示
    markUv: "",  //uv采集
    pageId: "", //页面唯一标示
    performance: {
        analysisTime: 1825, //解析dom树耗时
        appcacheTime: 0,  //DNS 缓存时间
        blankTime: 8, //白屏时间
        dnsTime: 0, //DNS 查询时间
        domReadyTime: 53, //domReadyTime
        loadPage: 1878, //页面加载完成的时间
        redirectTime: 0, //重定向时间
        reqTime: 8, //请求时间
        tcpTime: 0, //tcp连接耗时
        ttfbTime: 1, //读取页面第一个字节的时间
        unloadTime: 0, //卸载页面的时间
    },
    resourceList: [
        {
            dnsTime: 1562.2399999992922, //dns查询耗时
            initiatorType: "img", //发起资源类型
            name: "https://pic.xiaohuochai.site/blog/chromePerformance1.png", //请求资源路径
            nextHopProtocol: "http/1.1", //http协议版本
            redirectTime: 0, //重定向时间
            reqTime: 1.1899999808520079, //请求时间
            tcpTime: 33.76000002026558, //tcp链接耗时
        }
    ],
}
```

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
