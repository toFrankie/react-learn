# 错误边界

过去，组件内的 JavaScript 错误会导致 React 的内部状态被破坏，并且在下一次渲染时产生可能无法追踪的错误。这些错误基本上是由较早的其他代码（非 React 组件代码）错误引起的，但 React 并没有提供一种在组件中优雅处理这些错误的方式，也无法从错误中恢复。

## 错误边界（Error Boundaries）

部分 UI 的 JavaScript 错误不应该导致整个应用崩溃，为了解决这个问题，React 16 引入了一个新的概念 —— 错误边界。

错误边界是一种 React 组件，这种组件可以捕获并打印发生在其子组件树任何位置的 JavaScript 错误，并且，它会渲染出备用 UI，而不是渲染那些崩溃了的子组件树。错误边界在渲染期间、生命周期方法和整个组件树的构造函数中捕获错误。

> 注意，错误边界无法捕获以下场景中产生的错误：
>
> * 事件处理
> * 异步代码（例如 `setTimeout` 或 `requestAnimationFrame` 回调函数）
> * 服务端渲染
> * 它自身抛出来的错误（并非它的子组件）

如果一个 class 组件中定义了 `static getDerivedStateFromError()` 或 `componentDidCatch()` 这两个生命周期方法中的任意一个（或两个）时，那么它就变成了一个错误边界。当抛出错误后，请使用 `static getDerivedStateFromError()` 渲染备用 UI，使用 `componentDidCatch()` 打印错误信息。

```jsx
import React, { Component } from 'react'

class ErrorBoundary extends Component {
  // 此生命周期会在后代组件抛出错误后被调用，该错误作为参数。
  // getDerivedStateFromError 在 Render 阶段被调用，因此不允许执行副作用。
  static getDerivedStateFromError(error) {
    console.log('--->getDerivedStateFromError')
    // 此方法返回一个对象以更新 state
    return { hasError: true }
  }

  state = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  // componentDidCatch 在 Commit 阶段被调用，因此允许执行副作用
  componentDidCatch(error, errorInfo) {
    console.log('--->componentDidCatch')
    // error: 抛出的错误
    // errorInfo: 带有 componentStack 属性的对象，包含了有关组件引发错误的栈信息
    // e.g. Report errors to the service
    console.log(error.componentStack)
    this.setState({ error, errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return <div>Sorry, something went wrong.</div>
    }

    return this.props.children
  }
}
```

```jsx
import React, { Component } from 'react'

function App() {
  return (
    <ErrorBoundary>
      <ChildComponent />
    </ErrorBoundary>
  )
}

class ErrorComponent extends Component {
  componentDidMount() {
    // 这里将会出错...
    this.data.name = 'xxx'
  }

  render() {
    return <div>这是一个将会发生错误的组件</div>
  }
}
```

你可以在 `componentDidCatch(error, errorInfo)` 中将错误相关的栈信息 `errorInfo.componentStack` 打印出来，例如：

```
TypeError: Cannot set property 'name' of undefined
    at ChildComponent.componentDidMount (index.jsx?ea46:44)
    at commitLifeCycles (react-dom.development.js?61bb:20663)
    at commitLayoutEffects (react-dom.development.js?61bb:23426)
    at HTMLUnknownElement.callCallback (react-dom.development.js?61bb:3945)
    at Object.invokeGuardedCallbackDev (react-dom.development.js?61bb:3994)
    at invokeGuardedCallback (react-dom.development.js?61bb:4056)
    at commitRootImpl (react-dom.development.js?61bb:23151)
    at unstable_runWithPriority (scheduler.development.js?3069:468)
    at runWithPriority$1 (react-dom.development.js?61bb:11276)
    at commitRoot (react-dom.development.js?61bb:22990)
```

> 请注意，在开发模式下，即使启用了边界错误，但是渲染期间发生的所有错误打印到控制台，而且页面也会将 CallStack 显示出来，但它是可以关闭的（底部有个 Close 标识）。

通常：

* `static getDerivedStateFromError()`: 通过更新 state 的方式，来渲染降级 UI
* `componentDidCatch()`: 打印错误，常用于将错误上传监控服务器等




## 注意点

* 只有 Class 组件才可以成为错误组件。多数情况下，你只需要声明一次错误边界组件，并在整个应用中使用它。

* 错误边界仅可以捕获其子组件的错误，无法捕获组件自身的错误。

* 自 React 16 起，任何未被错误边界捕获的错误将会导致整个 React 组件树被卸载。


## 关于事件处理程序

错误边界无法捕获事件处理器内部的错误。

React 不需要错误边界来捕获事件处理器中的错误。与 `render` 方法和生命周期方法不同，事件处理器不会在渲染期间触发。因此，如果它们抛出异常，React 仍然能够知道需要在屏幕上显示什么。

如果你需要在事件处理器内部捕获错误，使用普通的 JavaScript `try/catch` 语句：

假设我们将前面的 `ChildComponent` 组件改一下：

```jsx
class ChildComponent extends Component {
  // componentDidMount() {
  //   this.data.name = 'xxx'
  // }

  render() {
    return (
      <div
        onClick={() => {
          this.data.name = 'xxx'
        }}
      >
        这是一个将会发生错误的组件
      </div>
    )
  }
}
```

在 React 应用渲染期间是没有错误的，当我们点击 `onClick` 所在节点时，由于节点的事件处理程序执行时 `this.data.name = 'xxx'` 会产生错误，我们可以观察到页面并未展示 `<div>Sorry, something went wrong.</div>` 错误降级 UI。所以这种情况下是不会被错误边界捕获的。

还要注意的是，在开发环境下，可能也会展示类似 Error Boundaries 情况的 Call Stack 错误层，但我们关闭之后，可以看到 UI 层还是展示着：`<div>这是一个将会发生错误的组件</div>`，而不是 `<div>Sorry, something went wrong.</div>`。