# HTML

<br />

## XHTML和HTML的区别

- 文档顶部的document不同XHTML顶部规定了DTD写法
- HTML元素必须正确的嵌套，属性需要引号需要小写
- XHTML结合了XML和HTML，结合了XML的传输和存储数据和HTML的简单特性

## 常用的浏览器及其内核

首先就是**五大浏览器**：IE、Chrome、safari、Firefox、Opear
内核：  
- IE-Trident
- FireFox-Gecko
- Chrome和Safari-webkit
- 再者就是360和搜狗这种就是有**极速模式和兼容模式**：极速-webkit，兼容-Trident

## HTML布局元素分类以及场景

**内联元素**：span、a、strong、i、em、br、input、textarea
- 本身的属性：display:inline
- 和其他元素在一行显示，不可以直接控制宽、高，但是可以设置内外边距
- 一般用于宽高由内容定义的情况

**块级元素**：div、h、hr、ol、li、dl、table、from
- 本身的属性：display:block
- 独占一行显示，每个块级都会从新的一行开始，可以直接控制宽高
- 不设置宽度的情况下宽度为父元素的宽度
- 一般用于布局等需要指定宽高的情况

## 两个a标签之间出现空格

一般这种情况就是两个a标签在代码编写的时候存在空格
- **解决办法**就是不写在一行

## b标签和strong标签的区别

- b标签主要就是为了加粗而加粗，但是strong是为了标明重点而加粗
容易理解的场景就是在使用阅读设备阅读的时候strong会重读

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

常见的meta属性
```html
  <!-- 声明文档使用的字符编码 -->
  <meta charset='utf-8'>
  <!-- 优先使用 IE 最新版本和 Chrome -->
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
  <!-- 页面描述 -->
  <meta name="description" content="不超过150个字符"/>
  <!-- 页面关键词 -->
  <meta name="keywords" content=""/>
  <!-- 网页作者 -->
  <meta name="author" content="name, email@gmail.com"/>
  <!-- 搜索引擎抓取 -->
  <meta name="robots" content="index,follow"/>
  <!-- 为移动设备添加 viewport -->
  <meta name="viewport" content="initial-scale=1, maximum-scale=3, minimum-scale=1, user-scalable=no">
```

## HTML5有哪些新特性

- **语义化标签** <br/>
8组：header、nav、footer、section、aside、artice、detailes、summary、dialog（对话框）
- **智能表单** <br/>
1.input输入类型增多<br/>
color(颜色选取)、date、datetime（UTC时间）、datetime-local（日期时间无时区）、email、month、number、range（一定范围内数字值）、search、tel（电话号码）、time、url、week <br/>
2.新增表单元素 <br/>
datalist（输入域选项列表）keygen(验证用户)、output（不同类型输出）
3.新增表单属性
placehoder（提示语）、required（boolean，不能为空）、pattern(正则)、min/max、step(合法数字间隔）、height/width(image高宽)、autofocus(boolean，自动获取焦点)、mutiple（boolean,多选）

## src和href的区别

- href指向网络资源位置，建立当前文档和资源的连接，一般用于超链接
- src将资源放入当前的文档，在请求src资源的时候会将指向的资源下载并应用到文档中，比如说js、图片等等元素，浏览器解析到该元素的时候会暂停其他资源的下载和处理，类似于将资源嵌入到了标签内，这也是js放在底部的一个原因