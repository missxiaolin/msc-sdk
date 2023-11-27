// (c) 2023 xiaolin 2023/11/27 17:29:23
"use strict";function e(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function t(t){for(var r=1;r<arguments.length;r++){var n=null!=arguments[r]?arguments[r]:{};r%2?e(Object(n),!0).forEach((function(e){i(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):e(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function n(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,p(n.key),n)}}function o(e,t,r){return t&&n(e.prototype,t),r&&n(e,r),Object.defineProperty(e,"prototype",{writable:!1}),e}function i(e,t,r){return(t=p(t))in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e){return a=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(e){return e.__proto__||Object.getPrototypeOf(e)},a(e)}function u(e,t){return u=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(e,t){return e.__proto__=t,e},u(e,t)}function c(e,t){if(t&&("object"==typeof t||"function"==typeof t))return t;if(void 0!==t)throw new TypeError("Derived constructors may only return object or undefined");return function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e)}function s(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var r,n=a(e);if(t){var o=a(this).constructor;r=Reflect.construct(n,arguments,o)}else r=n.apply(this,arguments);return c(this,r)}}function f(e){return function(e){if(Array.isArray(e))return l(e)}(e)||function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(e)||function(e,t){if(!e)return;if("string"==typeof e)return l(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);"Object"===r&&e.constructor&&(r=e.constructor.name);if("Map"===r||"Set"===r)return Array.from(e);if("Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return l(e,t)}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function l(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}function p(e){var t=function(e,t){if("object"!=typeof e||null===e)return e;var r=e[Symbol.toPrimitive];if(void 0!==r){var n=r.call(e,t||"default");if("object"!=typeof n)return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(e,"string");return"symbol"==typeof t?t:String(t)}var d=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:300;return function(r){var n=this,o=r;clearTimeout(e.id),e.id=setTimeout((function(){e.call(n,o)}),t)}},h=function(e){isString(e)||(e=JSON.stringify(e));try{return btoa(encodeURIComponent(e).replace(/%([0-9A-F]{2})/g,(function(e,t){return String.fromCharCode("0x"+t)})))}catch(e){}},v=function(){var e=UAParser.getResult(),t=e.ua,r=e.fingerPrint,n=e.browser,o=n.name,i=n.version,a=e.engine.name,u=e.device,c=u.type,s=u.model,f=u.vendor,l=e.os,p=l.name,d=l.version,h=window,v=h.screen,g=v.height,y=void 0===g?"":g,m=v.width,b=void 0===m?"":m,w=h.navigator,O=w.language,S=void 0===O?[]:O,I=w.connection.effectiveType,x=void 0===I?"":I;return{deviceType:c||"PC",OS:"".concat(p," ").concat(d),browserInfo:"".concat(o," ").concat(i),device:c?"".concat(f):o,deviceModel:c?s:a,screenHeight:y,screenWidth:b,language:S,netWork:x,fingerPrint:r,userAgent:t}},g=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},r=e||"",n=Object.keys(t)||[];if(n.length>0)r+="?",n.forEach((function(e,t){r+=e+"=*",t<n.length-1&&(r+="&")}));else if(e.indexOf("=")>-1){var o=e.split("=");r="",o.forEach((function(e,t){if(e.indexOf("&")>-1){var n=o.length-Number(t)==1?"":"&"+e.split("&")[1]+"=*";r+=n}else 0==t&&(r+=e+"=*")}))}return r||e},y=function(e){return e.replace(/^\/|\/$/g,"")},m=function(){function e(){r(this,e)}return o(e,[{key:"report",value:function(e){var t=e.reportUrl,r=e.data,n=e.beforeSend,o=e.reportType,i=e.dataType;this.checkUrl(t)&&("function"==typeof n&&(r.data=n(r.data,i)),this.sendInfo({reportUrl:t,reportType:o,data:r}))}},{key:"sendInfo",value:function(e){var t=e.reportType,r=void 0===t?1:t;try{switch(r){case 1:default:this.reportByFetch(e);break;case 2:this.reportByImg(e);break;case 3:this.reportByNavigator(e)}}catch(e){}}},{key:"reportByImg",value:function(e){try{var t=e.data;(new Image).src="".concat(e.reportUrl,"/static/gif.gif?v=").concat((new Date).getTime(),"&data=").concat(t.data)}catch(e){}}},{key:"reportByFetch",value:function(e){function t(t){return e.apply(this,arguments)}return t.toString=function(){return e.toString()},t}((function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0;if(!(t>=2)){var r=e.data,n=JSON.stringify(r);fetch(e.reportUrl,{headers:{"Content-Type":"application/json"},method:"post",body:n}).then((function(){})).catch((function(r){reportByFetch(e,t++)}))}}))},{key:"reportByNavigator",value:function(e){var t=JSON.stringify(e.data);navigator.sendBeacon&&navigator.sendBeacon(e.reportUrl,t)}},{key:"formatParams",value:function(e){var t=[];for(var r in e)t.push(encodeURIComponent(r)+"="+encodeURIComponent(e[r]));return t.join("&")}},{key:"checkUrl",value:function(e){if(!e)return!1;return/^[hH][tT][tT][pP]([sS]?):\/\//.test(e)}}]),e}(),b=function(e){return Object.prototype.toString.call(e).replace(/\[object\s|\]/g,"")},w=function(e){return"Function"===b(e)},O=function(e){return"Array"===b(e)},S=function(e){return"Object"===b(e)},I=new m,x={isStop:!0,queues:[],apiOtion:{delay:5e3},deviceInfo:v(),getCustomInfo:function(){try{var e,r={},n=this.apiOtion.customInfo,o="";for(var i in w(null===(e=n)||void 0===e?void 0:e.getDynamic)&&(o=n.getDynamic()),S(o)&&(n=t(t({},n),o)),n)w(n[i])||(r[i]=n[i]);return r}catch(e){return{}}},init:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};this.apiOtion=t(t({},this.apiOtion),e),x.getStorageQueses()},getStorageQueses:function(){var e=window.localStorage.getItem("webMonitorQueues");e&&(e=JSON.parse(e),this.queues=this.queues.concat(e)),window.localStorage.removeItem("webMonitorQueues")},add:function(e){S(e)?this.queues.push(e):O(e)&&(this.queues=[].concat(f(this.queues),f(e)))},getUserId:function(e){var t=e;return w(e)&&(t=e()),t||function(){var e=localStorage.getItem("webUuid");if(e)return e;var t="xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,(function(e){var t=16*Math.random()|0;return("x"==e?t:3&t|8).toString(16)}));return localStorage.setItem("webUuid",t),t}()},windowHidden:function(){if(this.queues.length){var e=JSON.stringify(this.queues);window.localStorage.setItem("webMonitorQueues",e)}},fire:function(){var e=this,t=this.apiOtion.delay,r=d((function t(){if(e.queues&&0!==e.queues.length){var r=e.apiOtion.delay;x.sendEscalation(),setTimeout((function(){t()}),r)}else e.isStop=!0}),t);this.isStop&&(this.isStop=!1,x.getStorageQueses(),r())},sendEscalation:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],t=x.deviceInfo,r=x.getCustomInfo(),n=this.apiOtion,o=n.maxQueues,i=n.reportUrl,a=n.beforeSend,u=n.reportType,c=n.uuId,s=n.monitorAppId,f=n.encryption,l=this.queues.length,p=l>=o?o:l,d={lists:e.length&&e||this.queues.splice(0,p),deviceInfo:t,customInfo:r,appUid:{uuId:x.getUserId(c),monitorAppId:s}},v=f||2==u?h(d):d;I.report({dataType:1,reportUrl:i,beforeSend:a,reportType:u,data:{data:v}})}},U=x,j=function(){function e(t){var n=this;r(this,e),i(this,"isUrlInIgnoreList",(function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",t=n.$options,r=t.ignoreRules,o=void 0===r?[]:r,i=t.reportUrl,a=void 0===i?"":i,u=t.trackUrl,c=void 0===u?"":u;return a&&o.push(a),c&&o.push(c),o.some((function(t){return"string"==typeof t?y(t)===y(e):t.test(e)}))})),this.$options=t,this.maxPolling=0,this.pageLoadDone=!1,window.addEventListener("pageshow",(function(){n.pageLoadDone=!0}),{once:!0,capture:!0})}return o(e,[{key:"recordError",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};this.handleRecordError(e),this.pageLoadDone&&U.isStop&&U.fire()}},{key:"handleRecordError",value:function(e){try{if(!Object.keys(e).length)return;if(this.$options.reportUrl&&e.url&&e.url.toLowerCase().indexOf(this.$options.reportUrl.toLowerCase())>=0)return;var r=window.location.href,n=t({pageUrl:r,simpleUrl:g(r)},e);U.add(n)}catch(e){}}}]),e}(),k=function(e){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),Object.defineProperty(e,"prototype",{writable:!1}),t&&u(e,t)}(n,j);var t=s(n);function n(e){var o;return r(this,n),(o=t.call(this,e)).reportUrl=e.reportUrl,o.init(),o}return o(n,[{key:"init",value:function(){}}]),n}(),P=new m,T={isStop:!0,queues:[],apiOtion:{delay:5e3},deviceInfo:v(),getCustomInfo:function(){try{var e,r={},n=this.apiOtion.customInfo,o="";for(var i in w(null===(e=n)||void 0===e?void 0:e.getDynamic)&&(o=n.getDynamic()),S(o)&&(n=t(t({},n),o)),n)w(n[i])||(r[i]=n[i]);return r}catch(e){return{}}},init:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};this.apiOtion=t(t({},this.apiOtion),e),T.getStorageQueses()},getStorageQueses:function(){var e=window.localStorage.getItem("webTraceQueues");e&&(e=JSON.parse(e),this.queues=this.queues.concat(e)),window.localStorage.removeItem("webTraceQueues")},add:function(e){S(e)?this.queues.push(e):O(e)&&(this.queues=[].concat(f(this.queues),f(e)))},getUserId:function(e){var t=e;return w(e)&&(t=e()),t||guid()},windowHidden:function(){if(this.queues.length){var e=JSON.stringify(this.queues);window.localStorage.setItem("webTraceQueues",e)}},fire:function(){var e=this,t=this.apiOtion.delay,r=d((function t(){if(e.queues&&0!==e.queues.length){var r=e.apiOtion.delay;T.sendEscalation(),setTimeout((function(){t()}),r)}else e.isStop=!0}),t);this.isStop&&(this.isStop=!1,T.getStorageQueses(),r())},sendEscalation:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],t=T.deviceInfo,r=T.getCustomInfo(),n=this.apiOtion,o=n.maxQueues,i=n.trackUrl,a=n.beforeSend,u=n.reportType,c=n.uuId,s=n.monitorAppId,f=n.encryption,l=i,p=this.queues.length,d=p>=o?o:p,v={lists:e.length&&e||this.queues.splice(0,d),deviceInfo:t,customInfo:r,appUid:{uuId:T.getUserId(c),monitorAppId:s}},g=f||2==u?h(v):v;P.report({dataType:2,reportUrl:l,beforeSend:a,reportType:u,data:{data:g}})}},q=T,E=function(){function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};r(this,e);var n=(null==t?void 0:t.watch)||{},o=n.jsError,i=void 0===o||o,a=n.vueError,u=void 0===a||a,c=n.promise,s=void 0===c||c,f=n.resource,l=void 0===f||f,p=n.fetch,d=void 0===p||p,h=n.xhr,v=void 0===h||h,g=n.performance,y=void 0===g||g,m=n.click,b=void 0===m||m,w=n.pageChange,O=void 0===w||w,S=n.console,I=void 0!==S&&S,x=(null==t?void 0:t.customInfo)||{};this.watchJs=i,this.watchPromise=s,this.watchResource=l,this.watchFetch=d,this.watchXhr=v,this.watchVue=u,this.watchPerformance=y,this.behaviorClick=b,this.behaviorPageChange=O,this.consoleError=!(!1===I||!I.length);var j=this.consoleError&&I,k=(null==t?void 0:t.report)||{},P=k.url,T=void 0===P?"":P,E=k.trackUrl,C=void 0===E?"":E,A=k.reportType,Q=void 0===A?1:A,R=k.delay,D=void 0===R?8e3:R,B=k.beforeSend,N=void 0===B?null:B,J=k.maxQueues,_=void 0===J?15:J,F=k.encryption,L=void 0!==F&&F,M=k.monitorSwitch,$=void 0===M||M,H=k.trackSwitch,W=void 0===H||H,V=T,X=null==t?void 0:t.monitorAppId;if(!X)return alert("请设置监控上报项目");var z={reportUrl:V,trackUrl:C,customInfo:x,monitorAppId:X,uuId:null==t?void 0:t.uuId,reportType:Q,delay:D,beforeSend:N,consoleOption:j,maxQueues:_,encryption:L,performance:y,monitorSwitch:$,trackSwitch:W};$&&U.init(z),W&&q.init(z),this.init(z)}return o(e,[{key:"init",value:function(e){var t=e.monitorSwitch,r=e.trackSwitch,n=e.trackUrl;t&&this.watchFetch&&new k(e),r&&n.length}}]),e}();window.MonitorSdk=E,module.exports=E;
