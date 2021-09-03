# Effect Hook

Effect Hook 可以让你在函数组件中执行副作用操作。

数据获取，设置订阅以及手动更改 React 组件中的 DOM 都属于副作用。不管你知不知道这些操作，或是“副作用”这个名字，应该都在组件中使用过它们。

> 如果你熟悉 React class 的生命周期函数，你可以把 `useEffect` Hook 看做 `componentDidMount()`、`componentDidUpdate()`、`componentWillUnmount()` 这三个函数的组合。

在 React 组件中有两种常见的副作用操作：**需要清除的**和**不需要清除的**。下面仔细看下它们之间的区别。

## 一、无需清除的 Effect

有时候，我们只想在 React 更新 DOM 之后运行一些额外的代码。比如发送网络请求、手动变更 DOM、记录日志等，这些都是常见的无需清除的操作。因为我们在执行完这些操作之后，就可以忽略它们了。


在 React 的 class 组件中，render 函数是不应该有任何副作用的。一般来说，在这里执行操作太早了，我们基本上都希望在 React 更新 DOM 之后才执行我们的操作。

这就是为什么在 React class 中，我们把副作用操作放到 `componentDidMount` 和 `componentDidUpdate` 函数中。

举个例子，每点击一次 `button` 就会更新 `count`，同时要更新页面标题（副操作）。因此我们需要同时在 `componentDidMount` 和 `componentDidUpdate` 中添加以下代码：

```jsx
class Counter extends React.Component {
  state = { count: 0 }

  clickHandler = () => {
    this.setState({ count: this.state.count + 1 })
  }

  componentDidMount() {
    document.title = `You clicked ${this.state.count} times`
  }

  componentDidUpdate(prevProps, prevState) {
    document.title = `You clicked ${this.state.count} times`
  }

  render() {
    return (
      <div>
        <p>You clicked {this.state.count} times</p>
        <button onClick={this.clickHandler}>Click</button>
      </div>
    )
  }
}
```

如果我们使用函数组件（Hook）的话，怎样去组织代码呢？

只要像下面这样就可以了：

```jsx
import React, { useState, useEffect } from 'react'

function Counter(props) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    document.title = `You clicked ${count} times`
  })

  function clickHandler() {
    setCount(count + 1)
  }

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={clickHandler}>Click</button>
    </div>
  )
}
```

#### useEffect 做了什么？

通过使用这个 Hook，你可以告诉 React 组件需要在渲染后执行某些操作。React 会保存你传递的函数（我们将它称之为“effect”），并且在执行 DOM 更新之后调用它。在这个 effect 中，我们设置了 `document.title` 属性，不过我们也可以执行数据获取或调用其他命令式的 API。

#### 为什么在函数内部调用 useEffect?

将 `useEffect` 放在组件内部让我们可以在 effect 中直接访问 `count` state 变量（或其他 props）。我们不需要特殊的 API 来读取它 —— 它已经保存在函数作用域中。Hook 使用了 JavaScript 闭包机制，而不用在 JavaScript 已经提供了解决方案的情况下，还引入特定的 React API。

#### useEffect 会在每次渲染后都执行吗？

是的，默认情况下，它在**第一次渲染之后**和**每次更新之后**都会执行。（下面会谈到如何控制它。）你可能会更容易接受 effect 发生在“渲染之后”这种概念，不用再去考虑“挂载”还是“更新”（类组件中会分为：挂载、更新、卸载三个阶段）。React 保证了每次运行 effect 的同时，DOM 都已经更新完毕。


#### 详细说明

现在我们已经对 effect 有了大致了解，下面这些代码应不难看懂了：

```jsx
import React, { useState, useEffect } from 'react'

function Counter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    document.title = `You clicked ${count} times`
  })
}
```

我们声明了 `count` state 变量，并告诉 React 我们需要使用 effect。紧接着传递函数给 `useEffect` Hook。此函数就是我们的 effect。然后使用 `document.title` 浏览器 API 设置标题。我们可以在 effect 中获取到最新的 `count` 值，因为他在函数的作用域内。当 React 渲染组件时，会保存已使用的 effect，并在更新完 DOM 后执行它。这个过程在每次渲染时都会发生，包括首次渲染。

经验丰富的 JavaScript 开发人员可能会注意到，传递给 `useEffect` 的函数在每次渲染中都会有所不同，这是刻意为之的。事实上这正是我们可以在 effect 中国能获取最新的 `count` 的值，而不用担心其过期的原因。每次我们重修渲染，都会生成新的 effect，替换掉之前的。某种意义上讲，effect 更像是渲染结果的一部分 —— 每个 effect 属于一次特定的渲染。我们将在本章节后续部分更清楚地了解这样做的意义。


> 与 `componentDidMount` 和 `componentDidUpdate` 不同，使用 `useEffect` 调度的 effect 不会阻塞浏览器更新屏幕，这样你的应用看起来响应更快。大多数情况下，effect 不需要同步地执行。在个别情况下（例如测量布局），有单独的 `useLayoutEffect` Hook 供你使用，其 API 与 `useEffect` 相同。


## 二、需要清除的 effect

之前，我们研究了如何使用不需要清除的副作用，还有一些副作用是需要清除的。例如订阅外部数据源。这种情况下，清除工作是非常重要的，可以防止引起内存泄露！现在让我们来比较一下如何用 Class 和 Hook 来实现。


假设组件 `Resize` 内要写一个 `resize` 事件监听器，例如：

先写一个防抖函数：

```jsx
const throttle = (func, wait) => {
  let prev = 0
  let timerId

  return function (...args) {
    const now = Number(new Date())

    if (timerId) clearTimeout(timerId)

    if (now >= prev + wait) {
      prev = now
      func.apply(this, args)
    } else {
      timerId = setTimeout(() => {
        prev = now
        func.apply(this, args)
      }, wait)
    }
  }
}
```

#### Class 示例

```jsx
import React, { Component } from 'react'

class Resize extends Component {
  constructor(props) {
    super(props)
    this.state = {
      count: 0
    }
    this.handler = () => {
      console.log('Window size is changed.')
    }
    this.listener = throttle(this.handler, 500)
  }

  componentDidMount() {
    // 组件加载后，添加监听器
    window.addEventListener('resize', this.listener, false)
  }

  componentWillUnmount() {
    // 组件卸载时，移除监听器
    window.removeEventListener('resize', this.listener)
  }


  render() {
    return <div>Please change the window size to trigger the listener!</div>
  }
}
```

你会注意到 `componentDidMount` 和 `componentWillUnmount` 之间相互对应。使用生命周期函数迫使我们拆分这些逻辑代码，即使这两部分代码都作用于相同的副作用。

#### Hook 示例

```jsx
import React, { useEffect } from 'react'

function Resize(props) {
  useEffect(() => {
    const handler = () => { console.log('Window size is changed.') }
    const listener = throttle(handler, 500)

    // 组件初次加载后，添加监听器
    window.addEventListener('resize', listener, false)

    return () => {
      // 组件卸载时，会执行清除函数，以移除监听器
      window.removeEventListener('resize', listener)
    }
  }, [])
  // 当 useEffect 第二个参数为 [] 时，仅在组件首次加载时执行。
  // 就本示例而言，不传递第二个参数也是可以的，只是每次渲染都会重新添加。
  // 注意，组件重新渲染之前也会先移除监听器的。

  return <div>Please change the window size to trigger the listener!</div>
}
```

#### 为什么要在 effect 中返回一个函数？

这是 effect 可选的清除机制。每个 effect 都可以返回一个清除函数。如此可以将添加和移除监听器的逻辑放在一起。它们属于 effect 的一部分。

#### React 何时清除 effect？

React 会在组件卸载的时候执行清除操作。正如之前学到的，effect 在每次渲染的时候都会执行。这就是为什么 React 会在执行当前 effect 之前对上一个 effect 进行清除。我们稍后将讨论为什么这将助于避免 bug以及如何在遇到性能问题时跳过此行为。