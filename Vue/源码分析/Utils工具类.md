## Utils工具类

在Vue中集成了很多工具类，其中主要包括：debug、环境判断、错误处理、语言处理、nextTick、options、perf、props

### debug

**formatComponentName**

格式化组件名

**generateComponentTrace**

生成组件跟踪

### Env环境判断

**inBrowser**

是否为浏览器环境

```js
const inBrowser = typeof window !== 'undefined'
```

#### inWeex

是否为weex环境

```js
const inWeex = typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform
```

**weexPlatform**

是否为weex平台

```js
const weexPlatform = inWeex && WXEnvironment.platform.toLowerCase()
```

**UA**

判断当前登陆端是手机还是PC

```js
const UA = inBrowser && window.navigator.userAgent.toLowerCase()
```

**isAndroid**

判断当前是否为安卓环境

```js
const isAndroid = (UA && UA.indexOf('android') > 0) || (weexPlatform === 'android')
```

**isIOS**

判断当前是否为IOS环境

```js
const isIOS = (UA && /iphone|ipad|ipod|ios/.test(UA)) || (weexPlatform === 'ios')
```

**IE**

判断当前是否是IE、IE9、Edge

```js
const isIE = UA && /msie|trident/.test(UA)
const isIE9 = UA && UA.indexOf('msie 9.0') > 0
const isEdge = UA && UA.indexOf('edge/') > 0
```

**isChrome**

判断当前是否为Chrome浏览器

```js
const isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge
```

**isFF**

判断当前是否为火狐浏览器

```js
const isFF = UA && UA.match(/firefox\/(\d+)/)
```

### Error情况处理

**handleError**

处理错误

**globalHandleError**

全局句柄错误

**logError**

错误日志

### **lang**

**parsePath**

路径解析，将对象路径转换成 `.`形式的路径

```js
const bailRE = new RegExp(`[^${unicodeRegExp.source}.$_\\d]`)
export function parsePath (path: string): any {
  if (bailRE.test(path)) {
    return
  }
  const segments = path.split('.')
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return
      obj = obj[segments[i]]
    }
    return obj
  }
}
```

#### nexkTick

**flushCallbacks**

刷新回调

```js
function flushCallbacks () {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}
```

**nextTick**

https://juejin.cn/post/6844903599655370765

**源码：src/core/util/next-tick.js**

首先Vue通过callback数组来模拟事件队列，事件队里的事件，通过nextTickHandler方法来执行调用，而何事进行执行，是由timerFunc来决定的，在timerFunc中，可以看出timerFunc的定义优先顺序macroTask ->> microTask，在没有DOM的环境中，使用microTask，比如weex

```js
export function nextTick (cb?: Function, ctx?: Object) {
  let _resolve
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  if (!pending) {
    pending = true
    timerFunc()
  }
  // $flow-disable-line
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}

```

#### Options

Vue实例处理

#### Perf

性能监控

#### Props

