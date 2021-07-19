## Vue 3 Deep Dive with Evan You

### 什么是 DOM？

![img](https://gitee.com/guangzan/imagehost/raw/master/markdown/vue1.png)

如果我们把这个 HTML 加载到浏览器中，浏览器创建这些节点，用来显示网页。所以这个HTML映射到一系列DOM节点，然后我们可以使用JavaScript进行操作。例如：

```javascript
let item = document.getElementByTagName('h1')[0]
item.textContent = "New Heading"
```

## VDOM

网页可以有很多DOM节点，这意味着DOM树可以有数千个节点。这就是为什么我们有像Vue这样的框架，帮我们干这些重活儿，并进行大量的JavaScript调用。

然而，搜索和更新数千个DOM节点很明显会变慢。这就是Vue和其他类似框架有一种叫做虚拟DOM的东西。虚拟DOM是表示DOM的一种方式。例如，这个HTML也可以通过一个虚拟节点来表示，看起来像这样。如您所见，它只是一个JavaScript对象。

```html
<div>Hello</div>

{
    tag: 'div',
    children: [
        {
            text: 'Hello'
        }
    ]
}
```

Vue知道如何使用此虚拟节点并挂载到DOM上，它会更新我们在浏览器中看到的内容。实际上还有一个步骤其中，Vue基于我们的模板创建一个渲染函数，返回一个虚拟DOM节点。

![img](https://gitee.com/guangzan/imagehost/raw/master/markdown/vue2.png)

渲染函数可以是这样的:

```javascript
render(h) {
    return h('div', 'hello')
}
```

当组件更改时，Render函数将重新运行，它将创建另一个虚拟节点。然后发送旧的 VNode 和新的 VNode 到Vue中进行比较并以最高效的方式在我们的网页上更新。

![img](https://gitee.com/guangzan/imagehost/raw/master/markdown/vue3.png)

我们可以将虚拟DOM和实际DOM的关系类比为蓝图和实际建筑的关系。假设我更改了29楼的一些数据。我改变了家具的布局还加了一些橱柜。我有两种方法可以改变。首先，我可以拆除29楼的一切从头开始重建。或者我可以创造新的蓝图，比较新旧蓝图并进行更新以尽可能减少工作量。这就是虚拟DOM的工作原理。Vue 3让这些更新更快并且更高效。

## 核心模块

Vue 的三个核心模块：

- Reactivity Module 响应式模块
- Compiler Module 编译器模块
- Renderer Module 渲染模块

**响应式模块**允许我们创建 JavaScript 响应对象并可以观察其变化。当使用这些对象的代码运行时，它们会被跟踪，因此，它们可以在响应对象发生变化后运行。

**编译器模块**获取 HTML 模板并将它们编译成渲染函数。这可能在运行时在浏览器中发生，但在构建 Vue 项目时更常见。这样浏览器就可以只接收渲染函数。

**渲染模块**的代码包含在网页上渲染组件的三个不同阶段：

- 渲染阶段
- 挂载阶段
- 补丁阶段

在渲染阶段，将调用 render 函数，它返回一个虚拟 DOM 节点。
在挂载阶段，使用虚拟DOM节点并调用 DOM API 来创建网页。
在补丁阶段，渲染器将旧的虚拟节点和新的虚拟节点进行比较并只更新网页变化的部分。

一个简单组件的执行，它有一个模板，以及在模板内部使用的响应对象。

1. 首先，模板编译器将 HTML 转换为一个渲染函数。
2. 然后初始化响应对象，使用响应式模块。
3. 接下来，在渲染模块中，我们进入渲染阶段。这将调用 render 函数，它引用了响应对象。我们现在监听这个响应对象的变化，render 函数返回一个虚拟 DOM 节点。
4. 接下来，在挂载阶段，调用 mount 函数使用虚拟 DOM 节点创建 web 页面。
5. 最后，如果我们的响应对象发生任何变化，正在被监视，渲染器再次调用render函数，创建一个新的虚拟DOM节点。新的和旧的虚拟DOM节点，发送到补丁函数中，然后根据需要更新我们的网页。

## 渲染器机制

拥有虚拟DOM层有一些好处，最重要的是它让组件的渲染逻辑完全从真实DOM中解耦，并让它更直接地重用框架的运行时在其他环境中。模板会完成你要做的事在99%的情况下你只需要写出HTML就好了，但偶尔可能想做些更可控的事情在，你需要编写一个渲染函数。Vue 2中的渲染函数如下所示，

```javascript
render(h) {
    return h (
        'div', {
        attrs: {
            id: foo
        },
        on: {
            click: this.onClick
        },
        'hello'
    })
}
```

所以这是组件定义中的一个选项，相对于提供一个 template 选项，在 Vue 2 中你可以为组件提供一个渲染函数，你会得到 h 参数，直接作为渲染函数的参数。你可以用它来创造我们称之为虚拟DOM节点，简称 vnode。

vnode 接受三个参数：

- 第一个参数是类型，所以我们在这里创建一个 div。
- 第二个参数是一个对象包含 vnode 上的所有数据或属性，API有点冗长从某种意义上说，你必须指明传递给节点的绑定类型。例如，如果要绑定属性你必须把它嵌套在attrs对象下如果要绑定事件侦听器你得把它列在 on 下面。
- 第三个参数是这个 vnode 的子节点。所以直接传递一个字符串是一个方便的 API，表明此节点只包含文本子节点，但它也可以是包含更多子节点的数组。所以你可以在这里有一个数组并且嵌套了更多的嵌套 h 调用。

在Vue 3中我们改变了API，目标是简化它。

```javascript
import { h } from 'vue'

render () {
    return h(
        'div', 
        {
            id: 'foo',
            onClick: this.onClick
        },
        'hello'
    })
}
```

第一个显著的变化是我们现在有了一个扁平的 `props` 结构。当你调用 h 时，第二个参数现在总是一个扁平的对象。你可以直接给它传递一个属性，这里我们只是给它一个 ID。按惯例监听器以 on 开头，所以任何带 on 的都会自动绑定为一个监听器所以你不必考虑太多嵌套的问题。

在大多数情况下，你也不需要思考是应将其作为 attribute 绑定还是DOM属性绑定，因为 Vue 将智能地找出为你做这件事的最好方法。我们检查这个 key 是否作为属性存在在原生 DOM 中。如果存在，我们会将其设置为 property，如果它不存在，我们将它设置为一个attribute。

render API 的另一项改动是 h helper 现在是直接从 Vue 本身全局导入的。一些用户在 Vue 2 中因为 h 在这里传递而在这里面 h 又很特别，因为它绑定到当前组件实例。当你想拆分一个大的渲染函数时，你必须把这个 h 函数一路传递给这些分割函数。所以，这有点困难，但有了全局引入的 h 你导入一次就可以分割你的渲染函数，在同一个文件里分割多少个都行。

渲染函数不再有 h 参数了，在内部它确实接收参数，但这只是编译器使用的用来生成代码。当用户直接使用时，他们不需要这个参数。所以，如果你用 TypeScript 使用定义的组件 API 你也会得到 this 的完整类型推断。

## 何时/如何使用 render 函数

看看渲染函数在 Vue 中是什么样子。在 Vue 2 中，一个传统的 Vue 组件，有一个 template 选项，但是为了重用渲染函数我们可以用一个名为 `render` 的函数来代替它，我们会通过参数得到这个称为 h（hyperscript）。但在这里，我们只是示范一下我们如何在 Vue 3 中使用它。我们会从 vue 导入 h，我们可以用它来返回 h。

```javascript
import { h } from 'vue'

const App = {
    render () {
        return h('div') 
    }
}

// 等效模板中的普通 div
```

所以我们可以给这个虚拟节点一些 props，

```javascript
import { h } from 'vue'

const App = {
    render () {
        return h(
            'div',
            {
                id: 'hello'
            },
            [
                h('span','world')
            ]
        ) 
    }
}

// <div id="hello"><span>world</span></div>
```

现在，我们知道如何生成静态结构。但是当人们第一次使用 render 函数会问 “我该怎么写，比如说，`v-if` 或者 `v-for`”？我们没有像 `v-if` 或者类似的东西。相反，您可以直接使用 JavaScript。

```javascript
import { h } from 'vue'

const App = {
    render () {
        return this.ok
            ? h('div',{ id: 'hello' },[h('span','world')]
            : h('p', 'other branch')
        ) 
    }
}
```

如果 ok 的值为 true，它将呈现 div，反之，它将呈现 p。同样，如果你想做 v-else-if 你需要嵌套这个三元表达式:

```javascript
import { h } from 'vue'

const App = {
    render () {
        return this.ok
            ? h('div',{ id: 'hello' },[h('span','world')]
            : this.otherCondition
                ? h('p', 'other branch')
                : h('span')
        ) 
    }
}
```

我想你可能会喜欢创建一个变量，将不同的节点添加到该变量。

```javascript
import { h } from 'vue'

let nodeToReturn
if(this.ok) {
    nodeToReturn = ...
} else if () {

}

const App = {
    render () {
        return this.ok
            ? h('div',{ id: 'hello' },[h('span','world')]
            : this.otherCondition
                ? h('p', 'other branch')
                : h('span')
        ) 
    }
}
```

这就是 JavaScript 灵活的地方，这看起来更像普通的 JavaScript。当你的代码变得更加复杂时您可以使用普通的 JavaScript 重构技巧使它们更容易理解。

我们讨论了 `v-if`， 接下来看看 `v-for`。 类似的，你也可以给它们加上 key，这是渲染函数中的渲染列表。

```javascript
import { h } from 'vue'

const App = {
    render () {
        return this.list.map(item => {
            return h('div', {key: item.id}, item.text)
        })) 
    }
}
```

在渲染函数中，您可能要处理插槽。

在 Vue 3 里默认插槽将暴露在这个 `this.$slot.default`。如果对于组件什么都没有提供，这将是 `undefined`，所以你得先检查一下它的存在。如果它存在，它将永远是一个数组。有了作用域槽，我们可以将 `props` 传递给作用域槽，所以把数据传递到作用域槽只是通过传递一个参数到这个函数调用中。因为这是一个数组你可以将它直接放在 children 位置。

```javascript
import { h } from 'vue'

const App = {
    render () {
        const slot = this.$slot.default
            ? this.$slot.default()
            : []
        
        return h('div', slot)
    }
}
```

你可以在 render 函数中用插槽做一件很强大的事，比如以某种方式操纵插槽，因为它只是一个 JavaScript 对象数组，你可以用 `map` 遍历它。

```javascript
import { h } from 'vue'

const App = {
    render () {
        const slot = this.$slot.default
            ? this.$slot.default()
            : []
        
        slot.map(vnode => {
            return h('div', [vnode])
        })
    }
}
```

这里有一个例子，截住并更改插槽数据。假设我们有一个堆栈组件（tack component），在一些用户界面库(UI libraries)中很常见。你可以传递很多属性给它，得到嵌套的堆栈渲染结果，有点像 HTML 中 `ul` 和 `ol` 的默认样式。

```html
<Stack size="4">
    <div>hello</div>
    <Stack size="4">
        <div>hello</div>
        <div>hello</div>
    </Stack>
</Stack>
```

渲染成这样：

```html
<div class="stack">
    <div class="mt-4">
         <div>hello</div>
    </div>
    <div class="mt-4">
         <div class="stack">
            <div class="mt-4">
                <div>hello</div>
            </div>
         </div>
    </div>
</div>
```

这里有一个普通的基于模板的语法，在同一个插槽内它们都是默认插槽，你能做的只有渲染这个部分，在模板很难实现。但是你可以用渲染函数来实现，程序化的遍历插槽内的每个项目然后把它们变成别的东西。

```javascript
import { h } from 'vue'

const Stack = {
    render () {
        const slot = this.$slots.default
            ? this.$slots.default()
            : []
        
        return h(
            'div',
            {class: 'stack'},
            slot.map(child => {
                return h(
                        'div', 
                        {class: `mt-${this.$props.size}`},
                        [child]
                    )
            })
        )
    }
}
```

我们用 `slot.map` 生成新的 vnode 列表，原来的子插槽被包装在里面。有了这个，我们把它放到一个 stack.html 文件里。

```html
<script src="https://unpkg.com/vue@next"></script>
<style>
    .mt-4 {
        margin: 10px
    }
</style>


<div id="app"></div>

<script>
    const { h, createApp } = Vue

    const Stack = {
        render() {
            const slot = this.$slots.default
                ? this.$slots.default()
                : []

            return h(
                'div',
                { class: 'stack' },
                slot.map(child => {
                    return h('div', { class: `mt-${this.$attrs.size}` }, [child])
                    // this.$props.size ?
                })
            )
        },
    }

    const App = {
        components: {
            Stack
        },
        template: `
        <Stack size="4">
            <div>hello</div>
            <Stack size="4">
                <div>hello</div>
                <div>hello</div>
            </Stack>
        </Stack>
        `
    }

    createApp(App).mount('#app')
</script>
```

![img](https://gitee.com/guangzan/imagehost/raw/master/markdown/vue4.png)
