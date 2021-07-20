<script>

  let activeEffect

  class Dep {
    constructor (value) {
      this.subscribers = new Set()
      this._value = value
    }
    get value () {
      this.depend()
      return this._value
    }
    set value (newValue) {
      this._value = newValue
      this.notify()
    }
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

  function watchEffect(effect) {
    activeEffect = effect;
    effect()
    activeEffect = null
  }

  const dep = new Dep('hello')

  watchEffect(() => {
    console.log(dep.value)
  })

  dep.value = 'world'

</script>
