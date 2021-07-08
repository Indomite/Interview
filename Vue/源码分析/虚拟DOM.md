## 虚拟DOM

### 前言

虚拟DOM，Virtual DOM，这个概念对我们而言其实是不陌生的，在目前主流的三大框架中，都有涉及到使用虚拟DOM，接下来看看在Vue中的虚拟DOM的存在和实现

**什么是虚拟DOM？**

首先，虚拟DOM的本质还是JS对象。通常把组成一个DOM节点的必要东西通过一个JS对象表示出来，那么这个JS对象就可以用来描述这个DOM节点，我们把这个JS对象就称为是这个真实DOM节点的虚拟DOM节点

**为什么要有虚拟DOM？**

我们知道，Vue是数据驱动视图。也就是说，数据发生变化，视图也就要随之发生更新，在更新的时候难免还是要操作DOM的，但是如果操作真实DOM还是非常复杂的，在每一个真实的DOM节点下的属性是非常多的，直接操作真实DOM是非常消耗性能的一件事，所以虚拟DOM应运而生。

方案：**通过JS的计算性能换取操作DOM的性能**

不盲目更新视图，而是对比数据前后发生的状态改变，计算出哪些属性是需要更新的，只更新需要更新的地方，在不需要更新的地方就不用更新了，达到了尽量少更新DOM的效果。

### Vue中的虚拟DOM

**虚拟DOM在Vue中是如何实现的呢？**

#### VNode类

虚拟DOM就是通过JS对象描述一个真实的DOM节点，在Vue中也是同样的道理，存在一个VNode类，通过该类可以实现不同类型的虚拟DOM节点

**源码：src/core/vdom/vnode.js**

```js
this.tag = tag                                /*当前节点的标签名*/
this.data = data        /*当前节点对应的对象，包含了具体的一些数据信息，是一个VNodeData类型，可以参考VNodeData类型中的数据信息*/
this.children = children  /*当前节点的子节点，是一个数组*/
this.text = text     /*当前节点的文本*/
this.elm = elm       /*当前虚拟节点对应的真实dom节点*/
this.ns = undefined            /*当前节点的名字空间*/
this.context = context          /*当前组件节点对应的Vue实例*/
this.fnContext = undefined       /*函数式组件对应的Vue实例*/
this.fnOptions = undefined
this.fnScopeId = undefined
this.key = data && data.key           /*节点的key属性，被当作节点的标志，用以优化*/
this.componentOptions = componentOptions   /*组件的option选项*/
this.componentInstance = undefined       /*当前节点对应的组件的实例*/
this.parent = undefined           /*当前节点的父节点*/
this.raw = false         /*简而言之就是是否为原生HTML或只是普通文本，innerHTML的时候为true，textContent的时候为false*/
this.isStatic = false         /*静态节点标志*/
this.isRootInsert = true      /*是否作为跟节点插入*/
this.isComment = false             /*是否为注释节点*/
this.isCloned = false           /*是否为克隆节点*/
this.isOnce = false                /*是否有v-once指令*/
this.asyncFactory = asyncFactory
this.asyncMeta = undefined
this.isAsyncPlaceholder = false
```

#### VNode类型

通过不同属性之间的搭配，实现不同类型的节点

**注释节点**

```javascript
// 创建注释节点
export const createEmptyVNode = (text: string = '') => {
  const node = new VNode()
  node.text = text
  node.isComment = true
  return node
}
```

**文本节点**

```javascript
// 创建文本节点
export function createTextVNode (val: string | number) {
  return new VNode(undefined, undefined, undefined, String(val))
}
```

**克隆节点**

克隆节点就是把一个已经存在的节点复制一份出来，它主要是为了做模板编译优化时使用

```javascript
// 创建克隆节点
export function cloneVNode (vnode: VNode): VNode {
  const cloned = new VNode(
    vnode.tag,
    vnode.data,
    vnode.children,
    vnode.text,
    vnode.elm,
    vnode.context,
    vnode.componentOptions,
    vnode.asyncFactory
  )
  cloned.ns = vnode.ns
  cloned.isStatic = vnode.isStatic
  cloned.key = vnode.key
  cloned.isComment = vnode.isComment
  cloned.fnContext = vnode.fnContext
  cloned.fnOptions = vnode.fnOptions
  cloned.fnScopeId = vnode.fnScopeId
  cloned.asyncMeta = vnode.asyncMeta
  cloned.isCloned = true
  return cloned
}
```

**元素节点**

元素节点面对众多的属性，也不能直接写死对应的标签属性，相对来说更贴近常见的DOM节点

对比上下两种节点，真实的DOM节点和VNode节点，整体的结构还是相似的

```javascript
// 真实DOM节点
<div id='a'><span>难凉热血</span></div>

// VNode节点
{
  tag:'div',
  data:{},
  children:[
    {
      tag:'span',
      text:'难凉热血'
    }
  ]
}
```

**组件节点**

组件节点除了有元素节点具有的属性之外，它还有两个特有的属性：

- componentOptions :组件的option选项，如组件的`props`等
- componentInstance :当前组件节点对应的`Vue`实例

**函数式组件节点**

函数式组件节点相较于组件节点，它又有两个特有的属性：

- fnContext:函数式组件对应的Vue实例
- fnOptions: 组件的option选项

**VNode在Vue的虚拟DOM过程中起了什么作用？**

VNode的作用是相当大的。我们在视图渲染之前，把写好的template模板先编译成VNode并缓存下来，等到数据发生变化页面需要重新渲染的时候，我们把数据发生变化后生成的VNode与前一次缓存下来的VNode进行对比，找出差异，然后有差异的VNode对应的真实DOM节点就是需要重新渲染的节点，最后根据有差异的VNode创建出真实的DOM节点再插入到视图中，最终完成一次视图更新。

### DOM-Diff算法

上述我们讲到，VNode最大的用途就是在数据变化前后生成真实DOM对应的虚拟DOM节点，然后就可以对比新旧两份VNode，找出差异所在，然后更新有差异的DOM节点，最终达到以最少操作真实DOM更新视图的目的

**对比新旧两份VNode并找出差异的过程就是所谓的DOM-Diff过程**

#### Patch

在`Vue`中，把 `DOM-Diff`过程叫做`patch`过程。patch,意为“补丁”，即指对旧的`VNode`修补，打补丁从而得到新的`VNode`

**核心思想**：所谓旧的`VNode`(即`oldVNode`)就是数据变化之前视图所对应的虚拟`DOM`节点，而新的`VNode`是数据变化之后将要渲染的新的视图所对应的虚拟`DOM`节点，所以我们要以生成的新的`VNode`为基准，对比旧的`oldVNode`，如果新的`VNode`上有的节点而旧的`oldVNode`上没有，那么就在旧的`oldVNode`上加上去；如果新的`VNode`上没有的节点而旧的`oldVNode`上有，那么就在旧的`oldVNode`上去掉；如果某些节点在新的`VNode`和旧的`oldVNode`上都有，那么就以新的`VNode`为准，更新旧的`oldVNode`，从而让新旧`VNode`相同。

**以新的VNode为基准，改造旧的oldVNode使之成为跟新的VNode一样，这就是patch过程要干的事**。

- **创建节点**

  新的`VNode`中有而旧的`oldVNode`中没有，就在旧的`oldVNode`中创建。

  

  在VNode描述六种节点中，只有三种节点可以被创建并且插入到虚拟DOM中：元素节点、文本节点、注释节点。所以在patch中通过判断节点的类型，从而调用不同的方法，创建并插入到DOM中。

  **源码： /src/core/vdom/patch.js**

  ```javascript
  function createElm (vnode, parentElm, refElm) {
      const data = vnode.data
      const children = vnode.children
      const tag = vnode.tag
      if (isDef(tag)) {
        	vnode.elm = nodeOps.createElement(tag, vnode)   // 创建元素节点
          createChildren(vnode, children, insertedVnodeQueue) // 创建元素节点的子节点
          insert(parentElm, vnode.elm, refElm)       // 插入到DOM中
      } else if (isTrue(vnode.isComment)) {
        vnode.elm = nodeOps.createComment(vnode.text)  // 创建注释节点
        insert(parentElm, vnode.elm, refElm)           // 插入到DOM中
      } else {
        vnode.elm = nodeOps.createTextNode(vnode.text)  // 创建文本节点
        insert(parentElm, vnode.elm, refElm)           // 插入到DOM中
      }
    }
  ```

  - 判断是否为元素节点只需判断该`VNode`节点是否有`tag`标签即可。如果有`tag`属性即认为是元素节点，则调用`createElement`方法创建元素节点，通常元素节点还会有子节点，那就递归遍历创建所有子节点，将所有子节点创建好之后`insert`插入到当前元素节点里面，最后把当前元素节点插入到`DOM`中。

  - 判断是否为注释节点，只需判断`VNode`的`isComment`属性是否为`true`即可，若为`true`则为注释节点，则调用`createComment`方法创建注释节点，再插入到`DOM`中。

  - 如果既不是元素节点，也不是注释节点，那就认为是文本节点，则调用`createTextNode`方法创建文本节点，再插入到`DOM`中。

    **注**：代码中的`nodeOps`是`Vue`为了跨平台兼容性，对所有节点操作进行了封装，例如`nodeOps.createTextNode()`在浏览器端等同于`document.createTextNode()`

- **删除节点**

  新的`VNode`中没有而旧的`oldVNode`中有，就从旧的`oldVNode`中删除。

  

  如果某些节点再新的`VNode`中没有而在旧的`oldVNode`中有，那么就需要把这些节点从旧的`oldVNode`中删除。删除节点非常简单，只需在要删除节点的父元素上调用`removeChild`方法即可

  ```javascript
  function removeNode (el) {
      const parent = nodeOps.parentNode(el)  // 获取父节点
      if (isDef(parent)) {
        nodeOps.removeChild(parent, el)  // 调用父节点的removeChild方法
      }
    }
  ```

- **更新节点**

  新的`VNode`和旧的`oldVNode`中都有，就以新的`VNode`为准，更新旧的`oldVNode`。

  

  更新节点就是当某些节点在新的`VNode`和旧的`oldVNode`中都有时，我们就需要细致比较一下，找出不一样的地方进行更新。

  **静态节点**：不管数据再怎么变化，只要这个节点第一次渲染了，那么它以后就永远不会发生变化，这是因为它不包含任何变量，所以数据发生任何变化都与它无关。我们把这种节点称之为静态节点

  1. 如果`VNode`和`oldVNode`均为静态节点

     我们说了，静态节点无论数据发生任何变化都与它无关，所以都为静态节点的话则直接跳过，无需处理。

  2. 如果`VNode`是文本节点

     如果`VNode`是文本节点即表示这个节点内只包含纯文本，那么只需看`oldVNode`是否也是文本节点，如果是，那就比较两个文本是否不同，如果不同则把`oldVNode`里的文本改成跟`VNode`的文本一样。如果`oldVNode`不是文本节点，那么不论它是什么，直接调用`setTextNode`方法把它改成文本节点，并且文本内容跟`VNode`相同。

  3. 如果`VNode`是元素节点

     如果`VNode`是元素节点，则又细分以下两种情况：

     - 该节点包含子节点

       如果新的节点内包含了子节点，那么此时要看旧的节点是否包含子节点，如果旧的节点里也包含了子节点，那就需要递归对比更新子节点；如果旧的节点里不包含子节点，那么这个旧节点有可能是空节点或者是文本节点，如果旧的节点是空节点就把新的节点里的子节点创建一份然后插入到旧的节点里面，如果旧的节点是文本节点，则把文本清空，然后把新的节点里的子节点创建一份然后插入到旧的节点里面。

     - 该节点不包含子节点

       如果该节点不包含子节点，同时它又不是文本节点，那就说明该节点是个空节点，那就好办了，不管旧节点之前里面都有啥，直接清空即可。

  ```javascript
  // 更新节点
  function patchVnode (oldVnode, vnode, insertedVnodeQueue, removeOnly) {
    // vnode与oldVnode是否完全一样？若是，退出程序
    if (oldVnode === vnode) {
      return
    }
    const elm = vnode.elm = oldVnode.elm
  
    // vnode与oldVnode是否都是静态节点？若是，退出程序
    if (isTrue(vnode.isStatic) &&
      isTrue(oldVnode.isStatic) &&
      vnode.key === oldVnode.key &&
      (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
    ) {
      return
    }
  
    const oldCh = oldVnode.children
    const ch = vnode.children
    // vnode有text属性？若没有：
    if (isUndef(vnode.text)) {
      // vnode的子节点与oldVnode的子节点是否都存在？
      if (isDef(oldCh) && isDef(ch)) {
        // 若都存在，判断子节点是否相同，不同则更新子节点
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
      }
      // 若只有vnode的子节点存在
      else if (isDef(ch)) {
        /**
         * 判断oldVnode是否有文本？
         * 若没有，则把vnode的子节点添加到真实DOM中
         * 若有，则清空Dom中的文本，再把vnode的子节点添加到真实DOM中
         */
        if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
      }
      // 若只有oldnode的子节点存在
      else if (isDef(oldCh)) {
        // 清空DOM中的子节点
        removeVnodes(elm, oldCh, 0, oldCh.length - 1)
      }
      // 若vnode和oldnode都没有子节点，但是oldnode中有文本
      else if (isDef(oldVnode.text)) {
        // 清空oldnode文本
        nodeOps.setTextContent(elm, '')
      }
      // 上面两个判断一句话概括就是，如果vnode中既没有text，也没有子节点，那么对应的oldnode中有什么就清空什么
    }
    // 若有，vnode的text属性与oldVnode的text属性是否相同？
    else if (oldVnode.text !== vnode.text) {
      // 若不相同：则用vnode的text替换真实DOM的文本
      nodeOps.setTextContent(elm, vnode.text)
    }
  }
  ```

### 操作子节点

在更新节点过程中，新旧`VNode`可能都包含有子节点，对于子节点的对比更新会有额外的一些逻辑，那么其中包括什么呢？

#### 更新子节点

当新的`VNode`与旧的`oldVNode`都是元素节点并且都包含子节点时，那么这两个节点的`VNode`实例上的`children`属性就是所包含的子节点数组。我们把新的`VNode`上的子节点数组记为`newChildren`，把旧的`oldVNode`上的子节点数组记为`oldChildren`，我们把`newChildren`里面的元素与`oldChildren`里的元素一一进行对比，对比两个子节点数组肯定是要通过循环，外层循环`newChildren`数组，内层循环`oldChildren`数组，每循环外层`newChildren`数组里的一个子节点，就去内层`oldChildren`数组里找看有没有与之相同的子节点

```javascript
for (let i = 0; i < newChildren.length; i++) {
  const newChild = newChildren[i];
  for (let j = 0; j < oldChildren.length; j++) {
    const oldChild = oldChildren[j];
    if (newChild === oldChild) {
      // ...
    }
  }
}
```

- 创建子节点

  如果`newChildren`里面的某个子节点在`oldChildren`里找不到与之相同的子节点，那么说明`newChildren`里面的这个子节点是之前没有的，是需要此次新增的节点，那么就创建子节点。

  **那么创建好之后如何插入到DOM中的合适的位置呢？**

  显然，把节点插入到`DOM`中是很容易的，找到合适的位置是关键。接下来我们分析一下如何找这个合适的位置

  **合适的位置是所有未处理节点之前，而并非所有已处理节点之后**。

- 删除子节点

  如果把`newChildren`里面的每一个子节点都循环完毕后，发现在`oldChildren`还有未处理的子节点，那就说明这些未处理的子节点是需要被废弃的，那么就将这些节点删除。

- 移动子节点

  如果`newChildren`里面的某个子节点在`oldChildren`里找到了与之相同的子节点，但是所处的位置不同，这说明此次变化需要调整该子节点的位置，那就以`newChildren`里子节点的位置为基准，调整`oldChildren`里该节点的位置，使之与在`newChildren`里的位置相同。

- 更新节点

  如果`newChildren`里面的某个子节点在`oldChildren`里找到了与之相同的子节点，并且所处的位置也相同，那么就更新`oldChildren`里该节点，使之与`newChildren`里的该节点相同。

  **所有未处理节点之前就是我们要移动的目的位置**

```javascript
if (isUndef(idxInOld)) {    // 如果在oldChildren里找不到当前循环的newChildren里的子节点
    // 新增节点并插入到合适位置
    createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
} else {
    // 如果在oldChildren里找到了当前循环的newChildren里的子节点
    vnodeToMove = oldCh[idxInOld]
    // 如果两个节点相同
    if (sameVnode(vnodeToMove, newStartVnode)) {
        // 调用patchVnode更新节点
        patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue)
        oldCh[idxInOld] = undefined
        // canmove表示是否需要移动节点，如果为true表示需要移动，则移动节点，如果为false则不用移动
        canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
    }
}
```

### 优化更新子节点

#### 优化策略

- 先把`newChildren`数组里的所有未处理子节点的第一个子节点和`oldChildren`数组里所有未处理子节点的第一个子节点做比对，如果相同，那就直接进入更新节点的操作；

- 如果不同，再把`newChildren`数组里所有未处理子节点的最后一个子节点和`oldChildren`数组里所有未处理子节点的最后一个子节点做比对，如果相同，那就直接进入更新节点的操作；

- 如果不同，再把`newChildren`数组里所有未处理子节点的最后一个子节点和`oldChildren`数组里所有未处理子节点的第一个子节点做比对，如果相同，那就直接进入更新节点的操作，更新完后再将`oldChildren`数组里的该节点移动到与`newChildren`数组里节点相同的位置；

- 如果不同，再把`newChildren`数组里所有未处理子节点的第一个子节点和`oldChildren`数组里所有未处理子节点的最后一个子节点做比对，如果相同，那就直接进入更新节点的操作，更新完后再将`oldChildren`数组里的该节点移动到与`newChildren`数组里节点相同的位置；

- 最后四种情况都试完如果还不同，那就按照之前循环的方式来查找节点。

  ![img](https://vue-js.com/learn-vue/assets/img/8.e4c85c40.png)

  https://vue-js.com/learn-vue/assets/img/8.e4c85c40.png

#### 总结

`Vue`中子节点更新的优化策略，发现`Vue`为了避免双重循环数据量大时间复杂度升高带来的性能问题，而选择了从子节点数组中的4个特殊位置互相比对，分别是：新前与旧前，新后与旧后，新后与旧前，新前与旧后





