<script>

  let activeEffect

  class Dep {
    // 订阅者模式
    subscribers = new Set()
    // 发生变化
    depend() {
      if (activeEffect) {
        this.subscribers.add(activeEffect)
      }
    }
    // 通知更新
    notify() {
      this.subscribers.forEach(effect => {
        effect()
      })
    }
  }

  function reactiveV2(raw) {
    Object.keys(raw).forEach(key => {
      const dep = new Dep()
      let value = raw[key]

      Object.defineProperty(raw, key, {
        get() {
          dep.depend()
          return value
        },
        set(newValue) {
          value = newValue
          dep.notify()
        }
      })
    })
    return raw
  }

  const targetMap = new WeakMap()

  function getDep (target, key) {
    let depsMap = targetMap.get(target)
      if(!depsMap){
        depsMap = new Map()
        targetMap.set(target, depsMap)
      }
      let dep = depsMap.get(key)
      if(!dep) {
        dep = new Dep()
        depsMap.set(key, dep)
      }
      return dep
  }

  const reactiveHandles = {
    get(target, key, receiver) {
      const dep = getDep(target, key)
      dep.depend()
      return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
      const dep = getDep(target, key)
      const result = Reflect.set(target, key, value, receiver) 
      dep.notify()
      return result
    }
  }

  function reactive(raw) {
    return new Proxy(raw, reactiveHandles)
  }

  function watchEffect(effect) {
    activeEffect = effect;
    effect()
    activeEffect = null
  }

  const state = reactive({
    count: 0
  })

  watchEffect(() => {
    console.log(state.count);
  })

  state.count++
</script>
