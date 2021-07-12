1.Let、Var、Const的区别
var声明变量绑定到window 上，let和const不行不会
var可重复声明，let和const不行
Let和Const会有临时性死区，在声明之前访问变量报错（不存在变量提升？）
Let 和 Const 只在代码块内有效，块级作用域
变量提升仍然存在争议，可以考虑两种都讲一下

2.Symbol
不是构造函数，而是直接调用Symbol()，返回的变量值永远不同
Symbol.for()全局搜索被登记的 Symbol 中是否有该字符串参数作为名称的 Symbol 值，如果有即返回该 Symbol 值，若没有则新建并返回一个以该字符串参数为名称的 Symbol 值，并登记在全局环境中供搜索
Symbol.keyFor(参数为Symbol变量) 返回一个已登记的 Symbol 类型值的 key ，用来检测该字符串参数作为名称的 Symbol 值是否已被登记。
3.Map和 Set
Map是一个映射数据结构，Set是一个集合数据结构（自带去重效果）

Map：
记住插入的顺序，Object的间遍历时无序的
NaN认为相等，+0和-0认为相等
Get、Set、Delete、Has(键)、Clear、Size、可以forEach遍历
Set：
有序
Add、Has、Delete、Clear
NaN、undefined、+0，-0
4.对象和Class
对象：
写法上：属性的简洁写法、属性名表达式
对象展开运算符…
API：Object.assign，Object.is（处理-0、NaN问题）
Class：
constructor初始化函数，super调用父类初始化函数，箭头函数的绑定特殊性，本质还是一个构造函数，静态属性static，extend继承

子类不是必须要调用super函数，它会默认的去调用，但是一旦子类构造函数调用super，那么它应该在访问this之前，因为ES6先创建的在super创建实例对象，只有创建完成之后，返回this的真实对象，才能访问子构造函数的this
5.函数
默认参数，参数临死性死区 ，不定参数符
箭头函数
6.数组
Array.of 参数中所有值作为元素形成数组
Array.from 将类数组对象或可迭代对象转化为数组
find、findIndex、fill、includes、flat、flatMap
7.迭代器
迭代过程：

Symbol.iterator 作为一个生成器接口， 返回可迭代对象，并且指向当前数据结构的起始位置
可迭代对象有next方法，调用方法返回当前位置的对象包含值value和是否迭代完成done
当done为true时，迭代完毕
可迭代的数据结构： String、Array、Map、Set、类数组、DOM

目的就是为了迭代有序的数据结构，方便访问和使用for…of

8.Promise
定义：是一种异步编程的解决方案，能够将异步操作封装，并将其返回的结果或者错误原因同Promise实例的then方法传入的处理函数联系起来

New Promise：
传入构造器函数，两个参数，都是敲定函数，第一个成功的敲定，第二个失败的敲定，构造器同步执行，但是可以异步的执行敲定函数
构造器中调用对应的敲定函数，返回的promise实例的对象状态就是那种，当然中间能会抛出异常throw，那么…状态是拒绝
状态的变化只有两种 pending => fulfilled，pending => rejected，一旦发生变化就不会再改变
Promise.then返回的Promise的状态：
非Promise对象，直接包裹成为Promise（Promise.resolve）
Promise对象，状态跟随，值跟随 ，通过这一点可以串联Promise（构造器函数的成功敲定函数也是这样的功能）
报错返回拒绝的Promise，错误对象是Promise的错误原因
异常穿透：
如果实例.then方法没有处理实例状态对于的回调函数，那么.then返回的promise实例状态跟随调用then方法的promise，Catch在最后进行异常的捕获

中断Promise链：
处理函数返回等待状态的Promise

实现Promise.all方法：
new Promise找准时机调用敲定函数

判断Promise的执行顺序
注意，知道前面的Promise状态发生变化时，才能放进微任务队列
async 返回 Promise 和 promise.thne返回 Promise 都会导致中间有两个层级的微任务队列间隔
async 每有await延后一个层次发生，如果返回promise再加两个层级
new Promise((resolve)=>{
	resolve()
}).then(()=>{

})

Promise.resolve().then(()=>{

})
//这两个promise的then发生的层级一致
9.Generator、Yield 函数
Generator函数返回一个可迭代对象，迭代的顺序就是在生成器函数使用yield关键字分段的顺序，每调用一次迭代对象的next，函数内部代码执行一段

Thunk
Co 手写实现一个自动执行器
10.Async、Await
和Promise，Generator 有很大关联的： Async函数返回一个Promise，await可以等待Promise实例状态敲定，自己进行迭代器的next方法

11.模块化
模块化开发是一种管理方式，是一种生产方式，一种解决问题的方案，一个模块就是实现特定功能的文件，有了模块，我们就可以更方便地使用别人的代码，想要什么功能，就加载什么模块，但是模块开发需要遵循一定的规范，否则就都乱套了，因此，才有了后来大家熟悉的AMD规范，CMD规范

CommonJS：
一个单独的文件就是一个模块，主要运行与服务器端，同步加载模块。require输入其他模块提供的功能 module.exports规范模块对外接口，输出一个值的拷贝。 输出之后不能改变，会缓存起来

AMD：
异步加载，一个单独文件一个模块，主要运行于浏览器端，模块和模块的依赖可以被异步加载。define定义模块 require用于输入其他模块提供的功能.规范模块对外接口。 define.amd是一个对象，表明函数遵守AMD规范。AMD的运行逻辑是，提前加载，提前执行，申明依赖模块的时候，会第一时间加载并执行模块内的代码，使后面的回调函数能在所需的环境中运行

//moduleC
define(['moduleA', 'moduleB'], function(moduleA, moduleB) {
    
})

//引入
require(['moduleC'], function(moduleC) {

})
CMD：
通用模块。一个文件一个模块。主要在浏览器中运行，define全局函数，定义模块，通过exports向外 提供接口，用require获取接口，使用某个组件时用use()调用。通过require引入的模块，只有当程序运行到这里时候才会加载执行

//moduleC
define(function(require, exports, module){

})
//引入
use('moduleC', function(moduleC) {
    
})
UMD：
通用模块。解决commonJS和AMD不能通用的问题。define.amd存在，执行AMD规范； module.exports,执行CommonJS规范；都没有，原始代码规范。

ES6 Module：
ES6模块功能主要由两个命令构成： import 和 export 。 import 命令用于输入其他模块提供的功能。 export 命令用于规范模块的对外接口

12.Proxy 和 Reflect
Proxy
Proxy 构造函数用于创建一个参数对象的代理，从而实现基本操作的拦截和自定义（如属性查找、赋值、枚举、函数调用等

handler的各各属性是对应的捕获器（trap） 常见的监听方法有：

getPrototypeOf
setPrototypeOf
isExtensible
preventExtensions
getOwnPropertyDescriptor
defineProperty
has 拦截in操作
deleteProperty 拦截delete操作
get(target, propKey, receiver) 拦截访问属性，表示Proxy实例本身
set(target, propKey, value, receiver) 拦截赋值属性
ownKeys 拦截getOwnPropertyNames或者getOwnPropertySymbols
apply 拦截函数调用
construct 拦截new操作调用
问Vue为什么用Proxy重写
defineProperty 无法监听对象重新添加的属性
defineProperty 不能很好的实现对数组下标的监控（可能新增元素）
Reflect
ES6 中将 Object 的一些明显属于语言内部的方法移植到了 Reflect 对象上（当前某些方法会同时存在于 Object 和 Reflect 对象上），未来的新方法会只部署在 Reflect 对象上。

Reflect 对象对某些方法的返回结果进行了修改，使其更合理。

Reflect 对象使用函数的方式实现了 Object 的命令式操作
