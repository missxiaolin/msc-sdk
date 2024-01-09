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

### FP
字段|字段类型|描述|备注
|---|---|----|---|
value|number|从导航到浏览器向屏幕呈现第一个像素之间的时间|

### FCP
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