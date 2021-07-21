# HTML

## meta元素都有什么

- 元数据：用来构建HTML文档的基本结构，以及如何处理文档向浏览器提供信息和指示，本身不是文档内容，但是提供了后面文档的信息。也就是说提供了网站的信息

- meta元素主要四大属性：charset、content、http-equiv、name
    1. charset：声明页面的字符编码，UTF-8
    2. content: 通常配合name或者http-equiv使用
    3. http-equiv：可以用作http头部的一些作用，通过定义这个属性改变用户代理等行为
    4. name：用于定义页面的元数据，不能与charset、http-equiv，通常是和content配合使用

```html
 <head>
      <title>示例</title>
      <meta name="keywords" content="描述网站内容的关键词，以逗号隔开，用于SEO搜索">
      <meta name="application name" content="当前页所属Web应用系统的名称">
      <meta name="description" content="当前页的说明">
      <meta name="author" content="当前页的作者名">
      <meta name="copyright" content="版权信息">
      <meta name="renderer" content="renderer是为双核浏览器准备的，用于指定双核浏览器默认以何种方式渲染页面">
      <meta name="viewreport" content="提供有关视口初始大小的提示，仅供移动设备使用">
</head>
```

## HTML5有哪些新特性

- **语义化标签** 
8组：header、nav、footer、section、aside、artice、detailes、summary、dialog（对话框）
- **智能表单** 
1.input输入类型增多
color(颜色选取)、date、datetime（UTC时间）、datetime-local（日期时间无时区）、email、month、number、range（一定范围内数字值）、search、tel（电话号码）、time、url、week
2.新增表单元素
datalist（输入域选项列表）keygen(验证用户)、output（不同类型输出）
3.新增表单属性
placehoder（提示语）、required（boolean，不能为空）、pattern(正则)、min/max、step(合法数字间隔）、height/width(image高宽)、autofocus(boolean，自动获取焦点)、mutiple（boolean,多选）

## src和href的区别

- href指向网络资源位置，建立当前文档和资源的连接，一般用于超链接
- src将资源放入当前的文档，在请求src资源的时候会将指向的资源下载并应用到文档中，比如说js、图片等等元素

## javaScript脚本的执行

- js脚本的执行和外链脚本的加载(先加载、执行脚本再解析html)都是阻塞HTML的解析
- 外链的script加载时并行的

## async和defer的区别

```html
<script async/defer></script>
```

共同点：

加上async或者defer属性的脚本的**加载过程**都不会阻塞HTML的解析

不同点：

- async属性。脚本加载完成之后立刻开始脚本的执行，停止对HTML的解析，脚本执行完之后再继续HTML的解析
- defer。等整个HTML文档都解析完了，基本开始执行

![defer and async](https://image-static.segmentfault.com/215/179/2151798436-59da4801c6772_articlex)

## DOMContentLoaded和Load的区别

DOMContentLoaded：当初始的HTML文档完全被加载和解析之后DOMContentLoaded事件触发，不需要等样式和图像加载完成

Load：当一个资源以及依赖的资源加载完成时，触发Load事件

HTML解析完成就会触发DOMContentLoaded（network的蓝线），所有的资源加载完成之后，load事件才会触发（network的红线）

## docetype

Docetype声明位于文档的最前面，处于HTML标签前面，告知浏览器的解析器，当前文档的类型规范

## 元素拖拽

```html
<style>
        .contain {
            width: 100px;
            height: 100px;
            margin-bottom: 20px;
            background: lightblue;
        }

        .el {
            width: 50px;
            height: 50px;
            background: lightcoral;
        }
</style>

<body>
    <div class="contain"></div>
    <div class="el" draggable="true"></div> <!-- 使元素能够被拖拽 -->
    <script>
        /**
         * 将要拖拽的元素设置允许拖拽，赋予dragstart事件将id转换成数据保存
         *为容器添加dragsover属性阻止浏览器默认事件，允许元素放置，赋予drop放置的位置
        **/
        const contain = document.querySelector('.contain')
        const el = document.querySelector('.el')
        el.addEventListener('dragstart', (e) => { // 当元素被拖拽时触发
            console.log(e.target); // 被拖拽元素
            e.dataTransfer.setData('message', 'hello')
        })
        contain.addEventListener('dragover', (e) => {
            e.preventDefault()
        })
        contain.addEventListener('drop', (e) => {
            e.preventDefault()
            console.log(e.dataTransfer.getData('message'));
        })
    </script>
</body>
```

// 获取地理位置
```HTML
navigator.geolocation.getCurrentPosition((position) => {
    const {
        latitude, // 纬度 
        longitude // 经度
    } = position.coords
});
```
