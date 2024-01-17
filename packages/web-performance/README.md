## 页面性能监控

页面性能

前面都是错误的一些监控，接下来项目的一些性能，点击热力图如何绘制？

<img src="http://missxiaolin.com/image2020-8-9_16-27-37.png" />
<img src="http://missxiaolin.com/image2020-8-9_16-29-16.png" />

通常我们都是通过浏览器的performmance对象来获取常规的性能指标（如上图所示，perfommance 流程图及兼容性）

- navigationStart 浏览器处理当前网页启动时间
- fetchStart 浏览器发起HTTP请求读取温度的毫秒时间戳
- domainLookupStart 域名查询开始时的时间戳
- connectStart HTTP请求开始向服务器发送的时间戳
- connectEnd 浏览器与服务器连接建立（握手和认证过程结束）的毫秒时间戳
- requestStart 浏览器向服务发出HTTP请求时的时间戳，或者开始读取本地缓存的时间
- resonseStart 浏览器从服务器（或读取本地缓存）收到第一个字节时的时间戳
- responseEnd 浏览器从服务器收到最后一个字节时的时间戳
- domLoding 浏览器开始解析网页dom结构的时间
- domInteractice 网页dom树创建完成开始加载内嵌资源的时间
- domContentLodedEventStart 网页domContentLoaded 事件发生时的时间戳
- domContentLoadedEvendEnd 网页所有需要执行的脚本执行完成时的时间，domReady的时间
- loadEventStart 当前网页load事件的回调函数开始执行的时间戳
- loadEventEnd 当前网页load 事件的回调函数结束的时间戳

等等当然这只是其中一份数据，那么通过这份数据我们可以检测那些信息呢：

- dns查询耗时   dns解析耗时     domainLookupEnd - domainLookupStart
- 请求响应耗时  网络请求耗时    responseStart - requestStart  
- DOM 解析耗时  dom解析耗时 domInteractive - responseEnd  
- 内容传输耗时  TCP连接耗时 responseEnd - responseStart 
- 资源加载耗时  资源加载耗时    loadEventStart - domContentLoadedEventEnd
- DOM_READY耗时 dom阶段渲染耗时 domContentLoadedEventEnd - fetchStart 
- 首次渲染耗时  首次渲染时间/白屏时间   responseEnd - fetchStart  
- 首次可交互耗时    首次可交互时间  domInteractve - fetcgStart  
- 首包时间耗时  首包时间    responseStart - domainLookupStart
- 页面完全加载耗时  页面完全加载时间    loadEventStart - fetchStart 
- SSL连接耗时   SSL安全连接耗时 connectEnd - secureConnectionStart
- TCP连接耗时   TCP连接耗时 connectEnd - connectStart

这部分值已经能反应一些问题：

- DNS查询耗时可以对开发者的CND服务器公祖是否正常做出反馈
- 请求响应耗时能对出返回模板中同步数据的情况作出反馈
- 由DOM解析耗时可以观察我们的DOM结构是否合理，以及是否有JavaScript阻塞我们的页面解析
- 内容传输耗时可以检测出我们的网络是否正常
- 资源加载耗时一般情况下是文档下载时间，主要观察一下文档流体积是否过大
- DOM_READY 耗时通常是DOM树解析完成后，网页内资源加载完成的时间
- 首次渲染耗时表述的是浏览器去加载文档到用户能看到第一帧非空图像，也叫白屏时间
- 首次交互耗时是dom树解析完成的时间
- 首包时间耗时是浏览器对文档发起查找DNS（域名系统）表的请求，到请求返回给浏览器第一个字节数据的时间，这个时间通常反馈的是DNS（域名系统）解析查询的时间
- 页面完全加载耗时指的是下载整个页面的总时间，一般情况下指浏览器对一个URL（统一资源定位符，是对可以从互联网上得到的资源的位置和访问方法的一种简-介的表示，是互联网上标准资源的地址）发起请求到把这个URL上的所需文档下载下来的时间。这个数据主要受到网络环境、文档大小的影响
- SSL连接耗时反馈的是数据安全性、完整性建立耗时
- TCP连接耗时指的是建立连接过程中的耗时，TCP协议主要工作与传输层，是一种UDP更为安全的传输协议

## 指标

### NavigationTiming
字段|字段类型|描述|计算公式|备注
|---|----|----|------|---|
dnsLookup|number|DNS查询耗时|	domainLookupEnd - domainLookupStart
initial connection|number|TCP连接耗时|connectEnd - connectStart
SSL|number|SSL安全连接耗时|	connectEnd - secureConnectionStart|只在HTTPS下有效。
ttfb|number|请求响应耗时|responseStart - requestStart|https://developer.chrome.com/docs/devtools/network/reference/#timing
content download|number|内容传输耗时|responseEnd - responseStart
dom parse|number|DOM解析耗时|domInteractive - responseEnd
resource download|number|资源加载耗时|	loadEventStart - domContentLoadedEventEnd
dom Ready|number|DOM完成加载|domContentLoadedEventEnd - fetchStart
page load|number|页面完全加载|loadEventStart - fetchStart

### 白屏时间(FP)
字段|字段类型|描述|备注
|---|---|----|---|
value|number|从导航到浏览器向屏幕呈现第一个像素之间的时间|

### 首屏时间(FCP)
字段|字段类型|描述|备注
|---|----|----|---|
value|number|浏览器呈现来自DOM的第一部分内容|

### LCP
字段|字段类型|描述|备注
|---|---|----|---|
value|number|视口中可见的最大图像或文本块的渲染时间|

### ACT
字段|字段类型|描述|备注
|---|---|----|---|
value|number|首屏加载后所有接口完成请求后的时间|

### CCP
字段|字段类型|描述|备注
|---|---|----|---|
value|number|首屏加载后所有接口完成请求后，图片完全加载后的时间|

### FID
字段|字段类型|描述|备注
|---|---|----|---|
eventName|string|事件名|
targetCls|string|目标对象类名|
startTime|number|事件触发时间|
delay|number|事件延迟时间|
eventHandleTime|number|事件处理时间|

### CLS
字段|字段类型|描述|备注
|---|---|----|---|
value|number|页面元素意外位移量|

### FPS
字段|字段类型|描述|备注
|---|---|----|---|
value|number|页面刷新率

### Resource Flow
字段|字段类型|描述|备注
|---|---|----|---|
value|[PerformanceResourceTiming](https://developer.mozilla.org/zh-CN/docs/Web/API/PerformanceResourceTiming)|资源加载瀑布流

### Network Info
字段|字段类型|描述|备注
|---|---|----|---|
downlink|double|有效带宽|单位Mbps
effectiveType|string|连接类型|slow-2g、2g、3g、4g
rtt|number|来回通信延迟|https://zh.wikipedia.org/wiki/%E4%BE%86%E5%9B%9E%E9%80%9A%E8%A8%8A%E5%BB%B6%E9%81%B2

### Device Info
字段|字段类型|描述|备注
|---|---|----|---|
deviceMemory|float|设备内存大致数量|单位GB
hardwareConcurrency|number|返回可用于运行在用户的计算机上的线程的逻辑处理器的数量
jsHeapSizeLimit|number|上下文可用的最大内存|单位MB
totalJSHeapSize|number|已分配的内存|单位MB
usedJSHeapSize|number|当前活跃的内存|单位MB

### Page Info
字段|字段类型|描述|备注
|---|---|----|---|
host|[DOMString](https://developer.mozilla.org/zh-CN/docs/Web/API/DOMString)|域名,可能带有端口号
hostname|[DOMString](https://developer.mozilla.org/zh-CN/docs/Web/API/DOMString)|域名
href|[DOMString](https://developer.mozilla.org/zh-CN/docs/Web/API/DOMString)|整个URL
protocol|[DOMString](https://developer.mozilla.org/zh-CN/docs/Web/API/DOMString)|URL协议
origin|[DOMString](https://developer.mozilla.org/zh-CN/docs/Web/API/DOMString)|页面来源的域名
port|[DOMString](https://developer.mozilla.org/zh-CN/docs/Web/API/DOMString)|端口号
pathname|[DOMString](https://developer.mozilla.org/zh-CN/docs/Web/API/DOMString)|URL路径部分，以'/'开头
search|[DOMString](https://developer.mozilla.org/zh-CN/docs/Web/API/DOMString)|URL参数，以'?'开头
hash|[DOMString](https://developer.mozilla.org/zh-CN/docs/Web/API/DOMString)|URL标识，以'#'开头
userAgent|[DOMString](https://developer.mozilla.org/zh-CN/docs/Web/API/DOMString)|用户代理字符串