---
title: jest、vitest 单元测试 与 assert 原生断言
date: 2023-06-12
articleId: c35c9fb5-4eed-4514-ad46-19d3a6a25e77
---

# jest、vitest 单元测试与 assert 原生断言

## node 原生断言

> 建议都使用严格模式下的断言保证断言的严谨 (严格模式下例如：`deepStrictEqual` 使用的是 `===` 判断，而 `deepEqual` 使用的是 `==` 判断)

```js
const assert = require('node:assert/strict')

// actual - expected 判断严格相等
console.log(assert.deepStrictEqual([1, 2, 3], [1, 4, 3]))
```

## jest 单元测试

安装 `jest`

```shell
pnpm i jest @types/jest # @types/jest 可以有类型提示
```

> 原生的 `jest` 并不支持转译，如果需要对 `esm` 模块进行测试，需要引入 `babel` 进行转译

```shell
pnpm i @babel/core @babel/preset-env --save-dev
```

创建 `.babelrc`

```js
{
    "presets": ["@babel/preset-env"]
}
```

### typescript 测试

`jest` 需要借助 `.babelrc` 去解析 `TypeScript` 文件再进行测试

```shell
pnpm i @babel/preset-typescript
```

`.babelrc`：

```js
{
    "presets": [
        "@babel/preset-env",
        "@babel/preset-typescript"
    ]
}
```

> `@babel/preset-env` 如果引入后使用了 `async await` 报错，需要引入 `@babel/plugin-transform-runtime`

### jest mock setTimeout

```js
export const setTime1000 = (callback) => {
  setTimeout(() => {
    callback && callback()
  }, 1000)
}
```

在 `index.test.js` 中 `useFakeTimers` 会将 `setTimeout` 等其他 `API` 替换成 `jest` 实现的 `API`

```ts
type FakeableAPI =
  | 'Date'
  | 'hrtime'
  | 'nextTick'
  | 'performance'
  | 'queueMicrotask'
  | 'requestAnimationFrame'
  | 'cancelAnimationFrame'
  | 'requestIdleCallback'
  | 'cancelIdleCallback'
  | 'setImmediate'
  | 'clearImmediate'
  | 'setInterval'
  | 'clearInterval'
  | 'setTimeout'
  | 'clearTimeout'
```

简易的定时器函数的测试：

```js
describe('test', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })
  it('test', () => {
    jest.spyOn(window, 'setTimeout')

    const fn = jest.fn()

    setTime1000(fn)

    jest.runAllTimers()

    expect(fn).toBeCalled()
    expect(setTimeout).toHaveBeenCalledTimes(1)
  })
})
```

#### setTimeout 超时问题

以下代码会造成执行超时：

```js
import { sleep } from '../utils/index'
describe('test', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })
  it('test', async () => {
    const callback = jest.fn()

    const act = async () => {
      await sleep(10)
      callback()
    }

    await act()

    expect(callback).not.toHaveBeenCalled()

    jest.runAllTimers() // 运行所有setTimeout 这样时间器的callback

    expect(callback).toHaveBeenCalled()
    expect(callback).toBeCalledTimes(1)
  })
})
```

> `jest.runAllTimers` 用来调用 `setTimeout` 中添加的 `callback`，再结合 `event loop` 结果可知，`await act()` 之后的代码会等待 `sleep` 进行 `resolve` 操作。`jest.runAllTimers` 没有调用，`setTimeout` 的 `callback(也就是promise 的 resolve)` 也不会调用。`await act()` 后续的代码也不会执行... (这里就造成了死锁，最终造成了执行超时。)

**解决方式：**需要先运行 `runAllTimers` 在等待 `await sleep` 之后的任务执行完毕之后在调用 `expect`

```diff
describe('test', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })
  it('test', async () => {
    const callback = jest.fn()

    const act = async () => {
      await sleep(10)
      callback()
    }

-    await act()
+    const cb = act()

    expect(callback).not.toHaveBeenCalled()

    jest.runAllTimers() // 运行所有setTimeout 这样时间器的callback

+    await cb()

    expect(callback).toHaveBeenCalled()
    expect(callback).toBeCalledTimes(1)
  })
})
```

### css 等引入失败问题

jest 如果引用了 css 或者其他等字体文件 jest 在解析模块的时候会报错，`jest` 提供了

`moduleNameMapper` 属性，可以 `mock` 导入的文件，使其能正确运行。

> webpack 配置了别名不会在 jest 中生效，需要在 `moduleNameMapper` 中再次去写入映射关系。

```js
jest: {
        // 在根目录下创建fileMock.js 文件 用于第三方字体、图片等文件的mock
        "moduleNameMapper": {
            "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/fileMock.js",
            // css 会映射到 identity-obj-proxy 这个包
            // 使用之前需要判断是否安装了 identity-obj-proxy包
            "\\.(css|less)$": "identity-obj-proxy"
        }
```

### 常用的断言

|                        |                                                          |                                         |
| :--------------------: | :------------------------------------------------------: | :-------------------------------------: |
|        toEqual         |             递归检查所有属性和属性值是否相等             |     `expect([1,2]).not.toBe([1,2])`     |
|          not           |                 允许测试结果不等于某个值                 |        `expect([]).not.toBe([])`        |
|      toHaveLength      |      可以用来测试字符串和数组类型的长度是否满足预期      |     `expect([1,2]).toHaveLength(2)`     |
|        toThrow         |              被测试方法是否按照预期抛出异常              |                                         |
|        toMatch         | 传入一个正则表达式，它允许我们来进行字符串类型的正则匹配 |                                         |
|    toBeGreaterThan     |                    判断是否大于期望值                    |      expect(n).toBeGreaterThan(3)       |
| toBeGreaterThanOrEqual |                  判断是否大于等于期望值                  |  expect(n).toBeGreaterThanOrEqual(3.5)  |
|     toBeUnDefined      |                  判断是否为 `undefined`                  |        expect(n).toBeUnDefined()        |
|      toBeLessThan      |                   判断是否小于于期望值                   |        expect(n).toBeLessThan(3)        |
|      toBeCloseTo       |                      浮点数判断相等                      |       expect(n).toBeCloseTo(0.3)        |
|       toContain        |                  判断数组中是否包含元素                  | expect(['one', 'two']).toContain('one') |

## 异步代码回调

```js
describe('callback', () => {
  it('callback example', (done) => {
    setTimeout(() => {
      expect(true).toBeTruthy()
      // 使用done 可以告知jest 结束测试
      done()
    })
  })
})
```

### promises

> 注意需要把 promise 作为返回值。

```js
const promises = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('123')
    }, 100)
  })
}
describe('callback', () => {
  it('callback example', () => {
    return expect(promises()).resolves.toBe('123')
    // return promises().then(data => expect(data).toBe('123'))

    // catch 对应的则是 rejects
  })
})
```

### 执行顺序

#### jest 中的 4 个钩子函数

`beforeAll`：所有测试之前执行

`afterAll`：所有测试执行完之后

`beforeEach`：每个测试实例之前执行

`afterEach`：每个测试实例完成之后执行

运行顺序：

```text
beforeAll => beforeEach => afterEach => afterAll
```

默认情况下，`before` 和 `after` 块中的代码将应用于文件中的每个测试，而不管它们属于哪个 `describe` 块。这意味着在同一个文件中的所有测试都将受到这些代码的影响。

但是，如果将 `before` 和 `after` 块放置在 `describe` 块内部，它们将仅适用于该 `describe` 块内的测试。这意味着在同一个文件中的其他 `describe` 块中的测试将不会受到这些代码的影响。

```js
describe('global', () => {
  beforeAll(() => console.log('global - beforeAll'))
  afterAll(() => console.log('global - afterAll'))
  beforeEach(() => console.log('global - beforeEach'))
  afterEach(() => console.log('global - afterEach'))
  test('', () => console.log('global - test'))
  describe('scoped before/after', () => {
    beforeAll(() => console.log('scope - beforeAll'))
    afterAll(() => console.log('scope - afterAll'))
    beforeEach(() => console.log('scope - beforeEach'))
    afterEach(() => console.log('scope - afterEach'))
    test('', () => console.log('scope - test'))
  })
})

// global - beforeAll
// global - beforeEach
// global - test
// global - afterEach
// scope - beforeAll
// global - beforeEach
// scope - beforeEach
// scope - test
// scope - afterEach
// global - afterEach
// scope - afterAll
// global - afterAll
```

从打印日志结果来看 `beforeAll` 会比 `beforeEach` 先调用，并且全局的会比局部的优先调用。

### describe 与 test 调用时机

```js
describe('describe and test invoke timers', () => {
  describe('describe 1', () => {
    console.log('describe-1')
    test('describe-test-1', () => {
      console.log('describe-test-1')
      expect(1).toBe(1)
    })
  })

  test('test 2', () => {
    console.log('test-2')
    expect(2).toBe(2)
  })

  describe('describe 2', () => {
    console.log('describe-2')
    test('describe-test-2', () => {
      console.log('describe-test-2')
      expect(3).toBe(3)
    })
  })
})

// describe-1
// describe-2
// describe-test-1
// test-2
// describe-test-2
```

可以看到 `describe` 会比同等级别的的 `test` 优先调用

### Mock 函数

通过 `jest.fn` 模拟的函数都会有一个特殊的 `.mock` 属性，它保存了函数调用的次数、入参、以及每次调用 `this` 的值

> toBeCalled、toBeCalledWith、lastCalledWith 就是检查 `.mock` 属性的语法糖。

```js
describe('mock', () => {
  test('mock fn', () => {
    const fn = jest.fn((data) => data + 1)
    ;[1, 2, 3].forEach(fn)

    // 第一次调用的第一个参数
    expect(fn.mock.calls[0][0]).toEqual(1)
    // 第一次调用的第二个参数
    expect(fn.mock.calls[0][1]).toEqual(0)
    // fn函数调用的次数
    expect(fn.mock.calls.length).toBe(3)
    // 返回的值
    expect(fn.mock.results[0].value).toBe(2)
  })
})
```

## 参考资料

[jest tutorial](https://github.yanhaixiang.com/jest-tutorial/basic/mock-timer/#%E6%A8%A1%E6%8B%9F%E6%97%B6%E9%92%9F%E7%9A%84%E6%9C%BA%E5%88%B6)

[jest expect](https://jestjs.io/docs/expect)

[jest setup teardown](https://jestjs.io/docs/setup-teardown)

[Jest：Timer and Promise don't work well。(setTimeout and async function)](https://stackoverflow.com/questions/52177631/jest-timer-and-promise-dont-work-well-settimeout-and-async-function)

[再谈 babel 7.18.0 引发的问题](https://developer.aliyun.com/article/982111)

[jest unexpected token when importing css](https://stackoverflow.com/questions/54627028/jest-unexpected-token-when-importing-css)
