<style>
  .red {
    color: red
  }

  .green {
    color: green
  }
</style>

<div id="app"></div>

<script>
  function h(tag, props, children) {
    return {
      tag,
      props,
      children
    }
  }

  function mount(vnode, container) {
    const el = document.createElement(vnode.tag)
    // console.log(el);
    // props
    if (vnode.props) {
      for (let key in vnode.props) {
        const value = vnode.props[key]
        el.setAttribute(key, value)
      }
    }
    // children
    if (vnode.children) {
      if (typeof vnode.children === 'string') {
        el.textContent = vnode.children
      } else {
        vnode.children.forEach(child => {
          mount(child, el)
        })
      }
    }
    container.appendChild(el)
  }

  const vdom = h('div', { class: 'red' }, [
    h('span', null, 'hello')
  ])

  mount(vdom, document.getElementById('app'))

  function patch(n1, n2) {
    if (n1.tag === n2.tag) {
      //这个分支为新旧节点tag类型相同
      //这里需要将真实dom节点el,在每次patch时向后传递,保证每次更新的都是
      //这个节点.
      const el = (n2.el = n1.el);
      //diff props
      const oldProps = n1.props || {};
      const newProps = n2.props || {};
      //添加新的属性或更改原来已有但变化了的属性
      for (let key in newProps) {
        const oldValue = oldProps[key];
        const newValue = newProps[key];
        if (newValue !== oldValue) {
          el.setAttribute(key, newValue);
        }
      }
      //移除新属性中没有的属性
      for (let key in oldProps) {
        if (!(key in newProps)) {
          el.removeAttribute(key);
        }
      }
      //diff children
      const oldChildren = n1.children;
      const newChildren = n2.children;
      //在diff children的时候,有四个主要分支
      // 1.新老都是string
      // 2.新: array 老: string
      // 3.新: string 老: array
      // 4.新老都是array
      if (typeof newChildren === "string") {
        if (typeof oldChildren === "string") {
          //情况1
          if (oldChildren !== newChildren) {
            el.innerHTML = newChildren;
          }
        } else {
          //情况3
          el.innerHTML = newChildren;
        }
      } else if (typeof oldChildren === "string" && Array.isArray(newChildren)) {
        //情况2
        el.innerHTML = "";
        newChildren.forEach((child) => mount(child, el));
      } else if (Array.isArray(oldChildren) && Array.isArray(newChildren)) {
        //情况4 是最复杂的情况
        //这里简单起见并没有真正实现vue中的diff算法,而是选取了一个低效但
        //容易理解的算法,但其实vue中如果不给元素提供key的话,也会使用这个
        //算法,这个算法在子元素的tag不会变的情况下非常高效,但如果tag会变
        //则会因为不必要的创造和删除节点,而变得不那么高效.
        const minLength = Math.min(oldChildren.length, newChildren.length);
        for (let i = 0; i < minLength; i++) {
          patch(oldChildren[i], newChildren[i]);
        }
        //老的children长度较小,则说明要添加节点
        if (oldChildren.length === minLength) {
          for (let i = minLength; i < newChildren.length; i++) {
            mount(newChildren[i], el);
          }
        } else {
          //反之,则说明要删除节点
          for (let i = minLength; i < oldChildren.length; i++) {
            el.removeChild(oldChildren[i].el);
          }
        }
      }
    } else {
      //标签类型不同时需要用新节点替换节点
      //这里并没有实现😂
      //回头再补
    }
  }

  const vdom2 = h('div', { class: 'green' }, [
    h('span', null, 'world')
  ])

  patch(vdom, vdom2)

</script>
