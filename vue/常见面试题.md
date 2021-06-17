## Vue常见面试题

### v-if 和 v-show

v-if是真的条件渲染，确保在切换的过程中条件块内的事件监听器和子组件适当的被销毁和重建，如果初始化渲染的时候条件为假，则什么也不做，等到变成真的时候，开始渲染

v-show只是控制一个简单的css切换，不管初始条件是什么，元素总是会被渲染

### 组件间的通信

**props和emit**

父组件通过props传递数据给子组件。

父组件对子组件的自定义事件使用`v-on:eventName=doSomething`进行监听，当子组件内部触发了该自定义事件时（使用`$emit('eventName')`），父组件执行doSomething，从而实现子组件向父组件的通信。

### VueX

```javascript
const store = new Vuex.Store({
    state: {
        count: 0
    },

    getters: {
        countPlus: state => {
            return state.count + 1
        }
    },

    mutations: {
        increment: (state, payload) => {
            state.count += payload
        }
    }
})
new Vue({
    el: '.app',
    store,
    computed: {
        count: function() {
            return this.$store.state.count
        }
    },
    methods: {
        increment: function() {
            this.$store.commit('increment', 10)
        }
    },
    template: `
        <div>
            {{ count }}
            <button @click='increment'>点我</button>
        </div>
    `
})
```

### Vue-Router

**嵌套路由**

简单来说就是router-view中还有router-vie

**路由导航**

`router-link`提供了声明式导航，我们也可以使用`this.$router.push`进行函数式导航

#####  Hash模式和History模式

Hash模式的Url结构类似：`https://example.com/#user/akara`

History模式的Url结构类似：`https://example.com/user/akara`

无论哪种模式，本质都是使用的`history.pushState`，每次pushState后，会在浏览器的浏览记录中添加一个新的记录，但是并**不会触发页面刷新**，也**不会请求新的数据**。

#####  Hash模式和History模式

Hash模式的Url结构类似：`https://example.com/#user/akara`

History模式的Url结构类似：`https://example.com/user/akara`

无论哪种模式，本质都是使用的`history.pushState`，每次pushState后，会在浏览器的浏览记录中添加一个新的记录，但是并**不会触发页面刷新**，也**不会请求新的数据**。

**导航守卫**

```js
const router = new VueRouter({ ... })

router.beforeEach((to, from, next) => {
  // ...
})
```

### 生命周期

当我们使用`new Vue()`生成Vue实例的时候，先会调用Vue._init 进行初始化。

1. 初始化生命周期，事件（以及initRender）

2. 调用BeforeCreate生命周期函数

3. 初始化数据（以及initInjections）

   1. 使用Object.defineProperty对data的属性进行数据劫持
   2. 当数据被渲染进页面时，调用get函数，把属性的Watcher放进dep内部的数组内
   3. 当数据被修改时，调用set函数，调用dep的notify方法，从而调用dep内部数组内所有Watcher的update方法

4. 调用Created生命周期函数

5. 查看有没有el参数，没有的话当vm.$mount()调用时进入下一步

6. 查看有没有template参数，有的话则把template转化成渲染函数，没有的话把el的outerHTML转化为渲染函数，渲染函数生成虚拟DOM

   1. parse用正则等方式解析template中的指令，class，style等数据，生成AST（抽象语法树）
   2. optimize用来标记静态节点，之后diff算法中就会跳过静态节点的对比
   3. generate把AST转化为渲染函数

7. 调用beforeMount生命周期函数

8. 利用虚拟DOM生成真实DOM并挂载在el元素上

9. 调用Mounted生命周期函数

   数据改变时

   1. 调用beforeUpdate生命周期函数
   2. 数据改变时，调用所有监听对应属性的Watcher的update函数，这个函数会把Watcher放进一个队列中，等到下一个tick时才取出。从而实现异步更新DOM。
   3. 重新生成虚拟DOM，并对新老VDom进行patch（patch的核心是diff算法）处理
      1. 如果oldVnode不存在，不存在则直接根据newVnode新建节点
      2. 调用sameVnode对oldVnode和newVnode进行比较，只有当key， tag， isComment都相同，同时定义或同时未定义data， 或者两个都是input且type相同时才是sameVnode。那么就对两个VNode进行patchVnode操作。如果不是sameVode，则直接进行替换。
         1. 如果新老VNode都是静态的，且key值相同，并且新的VNode标记了v-once或是clone，则只需替换elm和componentsinstance
         2. 新老VNode都有children，则使用updateChildren对子节点进行diff
            1. 对于oldVnode的children，用oldCh表示。对于newVnode的children，用newCh表示
            2. 首先定义 oldStartIdx、newStartIdx、oldEndIdx 以及 newEndIdx 分别是新老两个 children 的两边的索引，同时 oldStartVnode、newStartVnode、oldEndVnode 以及 newEndVnode 分别指向这几个索引对应的VNode 节点。
            3. while循环，循环中oldStartIdx和oldEndIdx不断靠拢，newStartIdx和newEndIdx也不断靠拢。
            4. 比较，oldStartVnode和newStartVnode，oldEndVnode和newEndVnode ， oldStartVnode和newEndVnode ， oldEndVnode和newStartVnode。如果两个是sameVnode则进行patchVnode, 不是就进行下一个的比较
            5. 如果以上四次比较都不是sameVnode，那么找oldCh有没有和newStartVnode是sameVnode的节点
               1. 如果设置了key，直接通过newStartVnode的key查看有没有key相同的Vnode
               2. 如果没有key，则通过循环，一个个的调用sameVnode函数比较。（体现了**key能够提高diff算法的效率**）
               3. 如果找不到相同的Vnode，则新建一个Vnode
            6. 循环结束。处理多余的或者不够的真实节点。oldStartIdx > oldEndIdx 新增节点 或者 newStartIdx > newEndIdx 删除节点。
         3. 如果oldVnode没有children，newVnode有，则先清空老节点的文本内容，再为DOM加入子节点
         4. 如果oldVnode有children，newVnode没有，则删除该节点所有子节点
         5. 如果新老节点都没有子节点，替换DOM的文本

10. 调用updated生命周期函数

11. 调用vm.$destroy()

12. 调用beforeDestroy生命周期函数

13. 删除组件（包括watchers和事件监听器等）

14. 调用destroyed生命周期函数

