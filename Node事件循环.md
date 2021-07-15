## Node.js事件循环机制

https://learnku.com/articles/38802

Node 中的 Event Loop 和浏览器中的是完全不相同的东西。Node.js采用V8作为js的解析引擎，而I/O处理方面使用了自己设计的libuv，libuv是一个基于事件驱动的跨平台抽象层，封装了不同操作系统一些底层特性，对外提供统一的API，事件循环机制也是它里面的实现（下文会详细介绍）

### Nodejs的运行机制

- V8引擎解析JavaScript脚本。
- 解析后的代码，调用Node API
- libuv库负责Node API的执行。它将不同的任务分配给不同的线程，形成一个Event Loop（事件循环），以异步的方式将任务的执行结果返回给V8引擎。
- V8引擎再将结果返回给用户

### 事件循环

```
   ┌───────────────────────────┐
┌─>│           timers          │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │
│  └─────────────┬─────────────┘      ┌───────────────┐
│  ┌─────────────┴─────────────┐      │   incoming:   │
│  │           poll            │<─────┤  connections, │
│  └─────────────┬─────────────┘      │   data, etc.  │
│  ┌─────────────┴─────────────┐      └───────────────┘
│  │           check           │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │
   └───────────────────────────┘
```

每个阶段都有一个要执行的回调 FIFO 队列。 尽管每个阶段都有其自己的特殊方式，但是通常，当事件循环进入给定阶段时，它将执行该阶段特定的任何操作，然后在该阶段的队列中执行回调，直到队列耗尽或执行回调的最大数量为止。 当队列已为空或达到回调限制时，事件循环将移至下一个阶段，依此类推。

1. timers：此阶段执行由 setTimeout 和 setInterval 设置的回调
2. pending callbacks：执行推迟到下一个循环迭代的 I/O 回调
3. idle, prepare, ：仅在内部使用
4. poll：取出新完成的 I/O 事件；执行与 I/O 相关的回调（除了关闭回调，计时器调度的回调和 setImmediate 之外，几乎所有这些回调） 适当时，node 将在此处阻塞
5. check：在这里调用 setImmediate 回调
6. close callbacks：一些关闭回调，例如 socket.on('close', ...)

**详细分析**

- 主线程执行代码（V8上），能够触发各种异步任务： 
  - 宏任务：I/O，setTimeout、setInterval、setImmediate（script本身是宏任务）
  - 微任务：process.nextTick、promise （process.nextTick在 promise之前执行，即先执行完所有的 process.nextTick 的任务，再执行完所有的 promise 任务

- 主线程执行完成，进入第一阶段：timers（setTimeout、setInterval），主要检查是否有定时器计时超过对应的阈值，注意，在这个阶段，定时器的数据结构是最小堆，根据设置的阈值就知道谁的执行顺序先。直到执行所有的定时器回调，才执行微任务，进入下一阶段

- pending callbacks / I/O callbacks，检查I/O队列（上一轮poll留下来），比如文件读取、写入，执行I/O任务，执行微任务，进入下一阶段

- idle, prepare 是内部的实现，没必要讨论

- poll轮询阶段，为啥需要它？ 
  - timer 阶段和 pending callbacks 阶段有各种回调（包括微任务），这些回调也是能够触发异步任务，因此，即使当 pending callbacks 完成所有微任务后，I/O队列和定时器队列还是存在大量的任务等待执行
  - poll 首先查看 是否存在已经超时的定时器，存在，回到timer阶段重新走（这个只会在进入poll的时候，做一次判断）
  - poll 发现没有超时的定时器，查看I/O队列是否存在任务，执行任务队列的任务，但是，每执行完成一个任务就执行所有的微任务
  - poll 执行完任务发现为空，那么检查是否存在setImmediate任务注册，如果存在那么结束poll，进入 下一阶段 

> 注意 pending callbacks 和 poll 阶段是核心，他们都处理I/O回调 => 本质上是共用一个I/O任务队列，但是 pending callbacks 不负责收集 I/O回调 到 I/O任务队列，而poll能 够收集，因此 pending callbacks 只能在每次在执行完成 poll 后的下一轮事件循环（poll是有最长执行时间和最大执行回调个数，到了限制之后，即使I/O队列还存在任务也得退出，进行到下一阶段）

- check 执行 setImmediate
- close callbacks  执行关闭回调

### setTimeout VS setImmediate

如果你把这两个函数放入一个 I/O 循环内调用，setImmediate 总是被优先调用

```javascript
// timeout_vs_immediate.js
const fs = require('fs');

fs.readFile(__filename, () => {
  setTimeout(() => {
    console.log('timeout');
  }, 0);
  setImmediate(() => {
    console.log('immediate');
  });
});

$ node timeout_vs_immediate.js
immediate
timeout
```

与 `setTimeout` 相比，使用 `setImmediate` 的主要优点是，如果在 `I/O` 周期内 `setImmediate` 总是比任何 `timers` 快，`poll` 阶段用 `setImmediate` 设置下阶段 `check` 的回调，等到了 `check` 就开始执行；`timers` 阶段只能等到下次循环执行！

**那为什么在外部 (比如主代码部分 mainline) 这两者的执行顺序不确定呢？**

在 mainline 部分执行 setTimeout 设置定时器 (没有写入队列呦)，与 setImmediate 写入 check 队列。mainline 执行完开始事件循环，第一阶段是 timers，这时候 timers 队列可能为空，也可能有回调；如果没有那么执行 check 队列的回调，下一轮循环在检查并执行 timers 队列的回调；如果有就先执行 timers 的回调，再执行 check 阶段的回调。因此这是 timers 的不确定性导致的。
