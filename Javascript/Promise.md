## Promise

### 什么是Promise？

`Promise` 是异步编程的一种解决方案。**所谓 Promise，简单来说就像一个容器，里面保存着某个未来才会结束的事件的结果**。从语法上说，Promise是一个对象，代表了一个异步操作的最终完成或者失败。Pomise包括三种状态：分别是 pending等待中、fulfilled完成了、rejected拒绝了。且一旦状态改变就不能再次改变，具有不受外界影响和不可逆两个特点。

个人理解：通过异步调用实现同步效果（同步：上一个任务出结果之后下一个任务才可以执行）

异步调用：可以无须等待被调用函数的返回值就让操作进行的方法

### Promise常用API

- **Promise.resolve()**

  1. **参数是一个 Promise 实例** 不做任何修改，原封不动地返回这个实例。
  2. **参数是一个 thenable 对象（具有 then 方法的对象）** 将这个的对象转为 Promise 对象，然后立即执行对象的 then方法。
  3. **参数不是具有 then 方法的对象或根本不是对象** 返回一个新的 Promise对象，状态为 Resolved。
  4. **不带有任何参数** 直接返回一个 Resolved状态的Promise对象。

- **Promise.reject()**

  参数会原封不动地作为 reject的理由，变成后续方法的参数。

- **Promise.prototype.then()**

  为Promise实例添加状态改变时的回调函数。第一个参数是Resolved状态的回调函数，第二个参数是Rejected 状态的回调函数。then中的函数一定要return一个结果或一个新的Promise对象，才可以让之后的then回调接收。如果是reject()方法没有return的话，那么返回是undefined。

- **Promise.prototype.catch()**

  用于指定发生错误时的回调函数。

  **!!! catch 与 then的第二个参数的区别是如果在then的第一个函数里抛出了异常，后面的catch能捕获到，而第二个函数捕获不到。**

- **Promise.all()**

  多个Promise任务并行执行。

  如果全部成功执行，则以数组的方式返回所有Promise任务的执行结果；

  如果有一个Promise任务rejected，则只返回 rejected 任务的结果。

- **Promise.race()**

  多个Promise任务并行执行。返回最先执行结束的 Promise 任务的结果，不管这个 Promise结果是成功还是失败。

### Promise的机制详解

在构造Promise的时候，其内部代码是立即执行的。

```javascript
new Promise((resolve,reject)=>{
    console.log('new Promise');
    resolve('success');
})
console.log('finished')

//控制台输出
>new Promise
>finished
```

接下来，了解一下它的执行机制：

```javascript
function getPObj(){
	var p = new Promise(function(resolve,reject){
		setTimeout(function(){
        	console.log("开始执行定时器");
        	resolve("执行回调方法");
    	},2000);
    });
    return p;
}
//控制台输入及输出
getPObj();
> ▶ Promise {<pending>}
-----（2s后）-------
> 开始执行定时器
```

在getPObj中我们new了Promise对象p并返回该对象，在构造p对象的方法中，只有一个定时器，2秒后打印一个日志、执行resolve方法。

不过它并没有执行resolve方法，因为resolve作为传入的参数，我们根本就没定义。

```javascript
function getPObj(){
	var p = new Promise(function(resolve,reject){
		setTimeout(function(){
        	console.log("开始执行定时器");
        	resolve("执行回调方法");
    	},2000);
    });
    return p;
}
getPObj().then(function(data){
    console.log("我是回调方法");
    console.log(data);
})

//控制台输出
> ▶ Promise {<pending>}
-----（2s后）-------
> 开始执行定时器
> 我是回调方法
> 执行回调方法
```

then的传入函数就是resovle的回调方法。

不过似乎这并不能体现它的优越性，但如果是多层嵌套呢？那么then的链式调用就非常有用了，它可以把嵌套平铺开来。

```javascript
function getPObj(num){
	var p = new Promise(function(resolve,reject){
		setTimeout(function(){
        	console.log("定时器编号:"+num);
        	resolve(num);
    	},2000);
    });
    return p;
}
getPObj(1).then(function(data){
	console.log("我是回调方法");
	console.log("执行回调方法:"+data);
	return getPObj(2);
}).then(function(data){
	console.log("我是回调方法");
	console.log("执行回调方法:"+data);
	return getPObj(3);
}).then(function(data){
	console.log("我是回调方法");
	console.log("执行回调方法:"+data);
})
//控制台输出
定时器编号:1
我是回调方法
执行回调方法:1
定时器编号:2
我是回调方法
执行回调方法:2
定时器编号:3
我是回调方法
执行回调方法:3
```

在每个回调执行完成后，再返回一个新的Promise对象，继续下一次操作，这就实现了嵌套流程的控制。

Promise 实现是链式调用，也就是说每次调用 then()之后返回的都是一个Promise，并且是一个全新的 Promise，原因也是因为状态不可变。

如果在 then 中 使用了 return，那么 return 的值会被 Promise.resolve()包装。

```javascript
Promise.resolve(1)
  .then(res => {
    console.log(res) // => 1
    return 2 // 包装成 Promise.resolve(2)
  })
  .then(res => {
    console.log(res) // => 2
  })
```

接下来说一下构造Promise对象时的另一个参数：reject方法。它一般用于处理不符合预期的情况。

```javascript
const promise = new Promise(function(resolve,reject){  
	somethingDO();  
    if (/*结果符合预期,异步操作成功*/) {  
		resolve()  
	}else{/*不符合预期，操作失败*/  
		reject();  
	}  
})
```

还是用之前的实例，接下来完成如下操作：生成一个1-10的随机数，如果大于5就失败。

```javascript
function getPObj(num){
	var p = new Promise(function(resolve,reject){
		setTimeout(function(){
        	console.log("编号:"+num);
            var i= Math.ceil(Math.random()*10);//生成1-10的随机数
        	if(i<=5){
				resolve(num);
            }else{
                reject(num);
            }
    	},2000);
    });
    return p;
}
function rejectNum(num){
    console.log('失败，编号为'+num);
}
function successNum(num){
    console.log("成功，编号为"+num);
}
getPObj(1).then((data)=>{
    successNum(data);
    return getPObj(2);
	},(data)=>{
    rejectNum(data)
}).then((data)=>{
    successNum(data);
    return getPObj(3);
	},(data)=>{
    rejectNum(data)
}).then((data)=>{
    successNum(data)
	},(data)=>{
    rejectNum(data)
})

//输出
编号:1
失败，编号为1
成功，编号为undefined
编号:3
失败，编号为3
```

第一次执行时，i 的随机值就大于5，所以执行了reject方法。但是和我们预期的还是有点不一样，如果返回失败，我们希望终止掉整个链条，但是从实际结果看，是继续往下执行。这是因为回调的reject的方法没有返回值，Promise会自动返回一个undefined，传入下一个链条的resolve方法中，并继续后面的then链。

如果想要正常地获取异常并终止，就需要try catch 了

```javascript
function getPObj(num){
	var p = new Promise(function(resolve,reject){
		setTimeout(function(){
        	console.log("编号:"+num);
            var i= Math.ceil(Math.random()*10);//生成1-10的随机数
        	if(i<=5){
				resolve(num);
            }else{
                reject(new Error("错误编号："+num));
            }
    	},2000);
    });
    return p;
}
function successNum(num){
    console.log("成功，编号为"+num);
}
getPObj(1).then((data)=>{
    successNum(data);
    return getPObj(2);
	}
).then((data)=>{
    successNum(data);
    return getPObj(3);
	}
).then((data)=>{
    successNum(data)
}).catch((e)=>{
    console.log(e)
});

//输出
> 编号:1
> Error: 错误编号：1
>    at <anonymous>:9:24
```

这个实例中，每个then的reject的方法都删除了，catch方法实际就是实现了全局的reject方法。**在实际开发中，一般采用catch代替reject**。

最后再添加一下finally方法。最终，它在什么状态下都会执行

```javascript
function getPObj(num){
	var p = new Promise(function(resolve,reject){
		setTimeout(function(){
        	console.log("编号:"+num);
            var i= Math.ceil(Math.random()*10);//生成1-10的随机数
        	if(i<=5){
				resolve(num);
            }else{
                reject(new Error("错误编号："+num));
            }
    	},2000);
    });
    return p;
}
function successNum(num){
    console.log("成功，编号为"+num);
}
getPObj(1).then((data)=>{
    successNum(data);
    return getPObj(2);
	}
).then((data)=>{
    successNum(data);
    return getPObj(3);
	}
).then((data)=>{
    successNum(data)
}).catch((e)=>{
    console.log(e)
}).finally(function(){
    console.log("流程结束");
});

//输出
> 编号:1
> Error: 错误编号：1
>    at <anonymous>:9:24
> 流程结束
```

### Promise.all

Promise.all可以将几个Promise对象封装成一个，格式如下：

```javascript
Promise.all([p1,p2,p3]).then(function(data){...})
```

当这几个对象都变成resolved状态后，总状态变为resolved；否则，其中有一个为rejected状态，则变成reject，其他的可以忽略。

可以理解为p1&&p2&&p3。

```javascript
function getPObj(num){
      var p = new Promise(function(resolve,reject){
        setTimeout(function(){
         console.log("编号:"+num);
         resolve(num);
      },2000);
      });
      return p;
    }
 
Promise.all([getPObj(1),getPObj(2),getPObj(3)]).then(
	function(data){
		console.log("resolve");
    	console.log(data);
    }).catch(function(e){
    	console.log("error");
    	console.log(e);
})
//输出
编号:1
编号:2
编号:3
resolve
(3) [1, 2, 3]
```

其中有一个返回rejected状态,还是用之前的随机数方法：

```javascript
function getPObj(num){
	var p = new Promise(function(resolve,reject){
		setTimeout(function(){
        	console.log("编号:"+num);
            var i= Math.ceil(Math.random()*10);//生成1-10的随机数
        	if(i<=5){
				resolve(num);
            }else{
                reject(new Error("错误编号："+num));
            }
    	},2000);
    });
    return p;
}
Promise.all([getPObj(1),getPObj(2),getPObj(3)]).then(
    function(data){
		console.log("resolve");
	}).catch(function(e){
		console.log("error");
		console.log(e);
})

//输出
编号:1
编号:2
error
Error: 错误编号：2
    at <anonymous>:9:24
编号:3
```

### Promise.race

race与all类似，页可以将几个Promise对象封装成一个，格式如下：

```javascript
Promise.race([p1,p2,p3]).then(function(data){...})
```

不同的是，看谁执行的快then就回调谁的结果。可以理解为p1||p2||p3

```javascript
function getPObj(num){
	var p = new Promise(function(resolve,reject){
		setTimeout(function(){
        	console.log("编号:"+num);
            var i= Math.ceil(Math.random()*10);//生成1-10的随机数
        	if(i<=5){
				resolve(num);
            }else{
                reject(new Error("错误编号："+num));
            }
    	},2000);
    });
    return p;
}
Promise.race([getPObj(1),getPObj(2),getPObj(3)]).then(
    function(data){
		console.log("resolve");
        console.log(data);
	}).catch(function(e){
		console.log("error");
		console.log(e);
})

//输出
编号:1
resolve
1
编号:2
编号:3
```

当接受到第一个对象的resolved状态后，其他的两个就抛弃不处理了，不论这个Promise对象结果是成功还是失败，都只返回它的。

### 实现一个Promise

先写一个简易版的

#### 先写大体框架

```javascript
const PENDING='pending'
const RESOLVED='resolved'
const REJECTED='rejected'

function MyPromise(fn){
    const that =this
    that.state=PENDING
    that.value=null
    that.resolvedCallbacks=[]
    that.rejectedCallbacks=[]
    //待完善resolve和reject
    //待完善执行fn
}
```

- 首先我们创建了三个常量用于表示状态，对于经常使用的一些值都应该通过常量来管理，便于开发及后期维护

- 在函数体内部首先创建了常量that，因为代码可能会异步执行，用于获取正确的 this 对象
- 起始Promise状态为pending
- value用于保存resolve或者reject中传的值
- resolvedCallbacks和rejectedCallbacks用于保存then中的回调，因为当执行完Promise时状态能还是等待中，这时候应该把then中的回调保存起来用于状态改变时使用

#### 完善resolve和reject

```javascript
function resolve(value){
    if(that.state===PENDING){
        that.state=RESOLVED;
        that.value=value;
        that.resolvedCallbacks.map(cb=>cb(that.value))
    }
}

function reject(value){
    if(that.state===PENDING){
        that.state=REJECTED
        that.value=value
        that.rejectedCallbacks.map(cb=>cb(that.value))
    }
}
```

- 首先两个函数都得判断当前状态是否为等待中，因为规范规定只有等待态才可以改变状态
- 将当前状态更改为对应状态，并且将传入的值赋值给value
- 遍历回调数组并执行

#### 实现执行传入函数fn

```
try{
	fn(resolve,reject)
}catch(e){
	reject()
}
```

- 实现很简单，执行传入的参数并且将之前两个函数当做参数传进去
- 要注意的是，可能执行函数过程中会遇到错误，需要捕获错误并且执行 reject 函数

#### 实现较为复杂的then

```javascript
MyPromise.protype.then=function(onFulfilled,onRejected){
    const that=this
    onFulfilled=typeof onFulfilled ==='function'? inFulfilled:v=>v
    OnRejected=typeof onRejected ==='function' ? onRejected:e=>{throw e}
    if(that.state===PENDING){
        that.resolvedCallbacks.push(onFulfilled)
        that.rejectedCallbacks.push(onRejected)
    }
    if(that.state===RESOLVED){
        onFulfilled(that.value)
    }
    if(that.state===REJECTED){
        onRejected(that.value)
    }
}
```

- 首先判断两个参数是否为函数类型，因为这两个参数是可选参数

- 当参数不是函数类型时，需要创建一个函数赋值给对应的参数，同时也实现了透传

- 接下来就是一系列判断状态的逻辑，当状态不是等待态时，就去执行相对应的函数。如果状态是等待态的话，就往回调函数中push函数，比如如下代码就会进入等待态的逻辑

  ```javascript
  new MyPromise((resolve, reject) => {
    setTimeout(() => {
      resolve(1)
    }, 0)
  }).then(value => {
    console.log(value)
  })
  ```

以上是简单版的Promise实现流程，合并起来的代码就是

```javascript
const PENDING='pending'
const RESOLVED='resolved'
const REJECTED='rejected'

function MyPromise(fn){
    that=this
    that.state=PENDING
    that.value=null
    that.reason=null
    that.resolvedCallbacks=[];
    that.rejectedCallbacks=[];
    
    function resolve(value){
   	if(that.state===PENDING){
        that.state=RESOLVED;
        that.value=value;
        that.resolvedCallbacks.map(cb=>cb(that.value))
    	}
 	}

	function reject(value){
    	if(that.state===PENDING){
        	that.state=REJECTED
        	that.value=value
        	that.rejectedCallbacks.map(cb=>cb(that.value))
    	}
	}
    try{
        fn(resolve,reject)
    }catch(e){
        reject(e)
    }
}
MyPromise.prototype.then=function(onFulfilled,onRejected){
    const that=this
    onFulfilled=typeof onFulfilled ==='function'? inFulfilled:v=>v
    OnRejected=typeof onRejected ==='function' ? onRejected:e=>{throw e}
    if(that.state===PENDING){
        that.resolvedCallbacks.push(onFulfilled)
        that.rejectedCallbacks.push(onRejected)
    }
    if(that.state===RESOLVED){
        onFulfilled(that.value)
    }
    if(that.state===REJECTED){
        onRejected(that.value)
    }
}
```

### 面试手写Promise版本

基于简化版本，then()方法里加上了对象

```javascript
function Promise(executor) {
    let self = this;
    self.value  = undefined;
    self.reason = undefined;
    self.status = "pending";
    
    // 处理setTimeout使状态不能立即改变的情况
    self.onFullFilledCallbacks = [];
    self.onRejectedCallbacks = [];
    
    function resolve(value) {
        if (self.status == "pending") {
            self.value  = value;
            self.status = "resolved";
            self.onFullFilledCallbacks.forEach(onFulFilled => onFulFilled());
        }
    }
    
    function reject(reason) {
        if (self.status == "pending") {
            self.reason = reason;
            self.status = "rejected";
            self.onRejectedCallbacks.forEach(onRejected => onRejected());
        }
    }
    
    try {
        executor(resolve, reject);
    } catch (error) {
        reject(error);
    }
}

Promise.prototype.then = function(onFulfilled, onRejected) {
    let p2Resolve, p2Reject;
    let p2 = new promise((resolve, reject) => {
        p2Resolve = resolve;
        p2Reject  = reject;
    })
    if (this.status == "pending") {
        this.onFullFilledCallbacks.push(() => {
            onFulfilled(this.value);
            p2Resolve();
        });
        this.onRejectedCallbacks.push(() => {
            onRejected(this.reason);
            p2Reject();
        });
    } else if (this.status == "resolved") {
        onFulfilled(this.value);
        p2Resolve();
    } else if (this.status == "rejected") {
        onRejected(this.reason);
        p2Reject();
    }
    
    return p2;
}
```

### 实现一个Promise.all()

```javascript
function promiseAll(promises){
    return new Promise((resolve,reject)=>{
        if(!Array.isArray(promises)){
            return rejcet(new Error("arguments must be an array"))
        }
        let promiseCounter=0,
            promiseNum=promises.length,
            resolvedValues=new Array(promiseNum);
        for(let i=0;i<promiseNum;i++){
            (function(i){
                Promise.resolve(promises[i]).then((value)=>{
                    promiseCounter++;
                    resolvedValues[i]==value;
                    if(promiseCounter==promiseNum){
                        return resolve(resolvedValues);
                    }
                }).catch(error){
                    reject(error)
                }
            })(i)
        }
    })
}
```

### Promise的缺点

异常需要回调函数才能捕获

无法取消

