---
title: ref 赋值给 reactive引发的问题
---

## ref 赋值给 reactive 引发的问题

以下是出现问题的最小复现代码 <br />

[vue-playgorund](https://play.vuejs.org/#eNp9VMluE0EQ/ZViDthBzgzLzdghHLkhDlwykezYnTDgWdTTDiDLkpHYgrMhAoQlgrAFBaEkh0TORn5m2nb+gqrusTMxEZdZql5tr153zbgeBOZ0lRlZIxeWuBMICJmoBiO257iBzwXUgLPJDD6KJeFMswxUPTRAHSa570IKY1O2Z3sl3wsFuOEU5CkgPZa6lMpA6nJqfIjclkU+c7pYqTLoHi23lzeiViNqrd/k/oOHEO1/7Sw+lRu73a1VncuvMLPiT6X7UZhG1whFUTBVRXeUrtkeQLkoilkYG8/YXl1VnKx66PY9mHC8cnoIFArb6G43ZeMAW9TVot2mXJzXSU1KEndHQ2gEgFxYb3+ckQevO0s/O+8ft9/uyMa76OB9d+2rnH1CeRPheRqUbMkpkv68QvSHqp9q1vHCgJVEr99TecfG4xGi1p58/b2z0jh+NottyMMt+WoOfxX91ODSrlxYvtYb+Ogd4tCcnFGREM+OKXQExSNOzn+SHz4jB/ikUh9/tmfWuquzuhtKxIRgvM+E9kZ7T6P971GriXZa5+dHWdXABXrCBQBnEtLnnPA658WHaVHkU0wMwfnz4IS3UC9+pXxbMUImhJFNUxRTQSkAerBYSXlQ76snAI7q5R4InrAixfRhxYTo2iA3t/oqjEXVE6CCdZa2or15OTN3vPIFZ9KUQWFw1QViXDGviY5ac31pQHumgaQUdEUVVIj23yT1DzjoDTeonCrdm5KW0TjoPlvvPN7BiAKVI5tSYoxVBGhg9OdI5W3qjgd6HRsvoHJ+Kwd+97X0onu0SbtcWY32d9rPFzu/mkD7//2N5tje1Pn0SuOgwtlrQCo+tOThK6QN4ygnniNqehDWXfshF16iYmLFYadM9DrStWNFJkZIZNdOij/JjuG455ylbzG8v/BHMGQW4/EPIHfn0kitljxS9XrOQqN2XlZvAITQMutKNOjX9txEVQg8n6OlilO6l7cNulVsY4ReOUs7zwbGJxqx8VcCnrP6HRoZQ1+4w24xMO+GvodXshI+plCO0Day8VFAG9679G8bd4QIwqxlVb3g3pRZ8l1rFH0Wr3rCcdlw2XdHr5hXzItW2QlF0myy0B2e4P79kHEsaBt4dfZzW2icZnyYM6/MOOP/rTWATdYbcP1Tk0oi03Wj/hfkSdto)

问题原因： 点击 `bind` 后 再点击 `inspect` 会将 `msg` 中的值一并清除

按照传统的类型引用来说，改变了 `state.data` 的引用值，不会对 `msg` 造成影响，但这里却改变了 `msg`的值

将代码进行 `debugger` 调试

在 `inspect` 函数处打下断点

![image-20230604204614029](http://oss.cc-heart.cn:30002/oss/file/WPJTOOANlAvXos4EJeb0m/2023-06-04/image-20230604204614029.png)

根据断点往下走，可以看到`setter`方法

![image-20230604204747228](http://oss.cc-heart.cn:30002/oss/file/WPJTOOANlAvXos4EJeb0m/2023-06-04/image-20230604204747228.png)

可以看到`!isArray(target) && isRef(oldValue) && !isRef(value)` 的条件成立 通过`debugger` 可以看出：

`target === state`

`oldValue === msg`

`value === []`

现在会通过调用`oldvalue.value = value` 改变值 此时的 `state.data === msg`

## 总结

通过 将`ref`创建的变量 赋值给一个 `reactive` 的非数组对象的某一项值，后续在改变这一项值的时候，`原ref创建变量的值`也会改变

```vue
<script setup>
const msg = ref(['1', '2'])

const state = reactive({
  data: null,
})

state.data = msg
state.data = []

console.log(msg.value) // []
console.log(state.data) // []
</script>
```

## 问题源代码

```vue
<script setup>
import { ref, reactive, unref } from 'vue'

const msg = ref(['1', '2'])

// msg.value 还是一个Proxy 代理对象
console.log(msg.value)
const state = reactive({
  data: [],
})

function bind() {
  // 赋值ref对象之后 state.data 还是 ref对象  只有引用的时候会解包
  state.data = msg
  console.log(state.data === msg.value)
}

function inspect() {
  state.data = []
  // 为啥着里会影响着 msg 的改变 ?
  // 这里的state.data 赋值之后 会改变 msg的原因是因为在执行 state的setter的时候执行了以下的代码:
  /*
   *  if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
   *    oldValue.value = value;
   *    return true;
   *  }
   */
  // target 就是一个 state 对象
  // 由于前面的赋值 `state.data = msg` 的 msg 这里不会解包 所以`target.data`他还是一个 RefImpl对象
  // oldValue的值自然是`msg`的引用
  // value的值便是下面的 `state.data = []` 中的 `[]`
  // 上述的条件成立 因此会走下面代码
  // `oldValue.value = value` 相当于走的是 `msg.value = value` 触发了 msg的 `set`
  // 因此改变 `state.data` 相当于改变了 `msg.value`
}
</script>

<template>
  <h1>{{ state.data }}</h1>
  <h2>
    {{ msg }}
  </h2>
  <button @click="bind">bind</button>
  <button @click="inspect">inspect</button>
</template>
```
