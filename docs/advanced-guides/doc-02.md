# Context

> Context 提供了一个无需为每层组件手动添加 `props`，就能在组件树间进行数据传递的方法。

在一个典型的 React 应用中，数据是通过 `props` 属性自上而下（由父及子）进行传递的，但这种做法对于某些类型的属性而言是极其繁琐的（例如：地区偏好，UI 主题），这些属性是应用程序中许多组件都需要的。Context 提供了一种在组件之间共享此类值的方式，而不必显式地通过组件树的逐层传递 `props`。

## 何时使用 Context

Context 设计的目的是为了共享那些对一个一个组件树而言是“全局”的数据，例如当前认证的用户、主题或首选语言。举个例子，下面的代码中，我们通过一个 `theme` 属性手动调整一个按钮组件的样式。

```jsx
import React from 'react'

function App() {
  return (
    // 源头
    <Toolbar theme="dark" />
  )
}

function Toolbar(props) {
  return <ThemeButton theme={props.theme} />
}

function ThemeButton(props) {
  return (
    <div>
      {/* 目标 */}
      <button>Theme is {props.theme}</button>
    </div>
  )
}
```

属性 `theme` 从 `App` 组件到 `ThemeButton` 组件，中间层的组件都需要知道 `theme` 值，并往继续往下传递，直至目标组件。

如果使用 Context，我们可以避免通过中间元素的传递 `props`：

```jsx
import React, { Component, createContext, useContext } from 'react'

// Context 可以让我们无须明确地传遍每一个组件，就能将值深入传递进组件树。
// 为当前的 theme 创建一个 context（“default” 为默认值）。
const ThemeContext = createContext('default')

function App() {
  return (
    // 使用一个 Provider 来将当前的 theme 传递给以下的组件树。
    // 无论多深，任何组件都能读取这个值。
    // 在这个例子中，我们将 “dark” 作为当前的值传递下去。
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  )
}

function Toolbar(props) {
  // 中间的组件再也不必指明往下传递 theme 了。
  return (
    <>
      <ThemeButton />
      <ThemeButton2 />
    </>
  )
}

function ThemeButton(props) {
  // 相当于 static contextType = ThemeContext 或者 <ThemeContext.Consumer>。
  const theme = useContext(ThemeContext)
  return (
    <div>
      <button>Theme is {theme}</button>
    </div>
  )
}

class ThemeButton2 extends Component {
  // 指定 contextType 读取当前的 theme context。
  // React 会往上找到最近的 theme Provider，然后使用它的值。
  // 在这个例子中，当前的 theme 值为 “dark”。
  static contextType = ThemeContext
  render() {
    return (
      <div>
        <button>Theme is {this.context}</button>
      </div>
    )
  }
}
```

## Context API


#### React.createContext

```jsx
const MyContext = React.createContext(defaultValue)
```

创建一个 Context 对象。当 React 渲染一个订阅了这个 Context 对象的组件，这个组件会从组件树中离自身最近的那个匹配的 `Provider` 中读取到当前的 context 值。

**只有当组件树所处的树中没有匹配到 `Provider` 时，其 `defaultValue` 参数才会生效**。这有助于在不使用 `Provider` 包装组件的情况下对组件进行测试。注意：将 `undefined` 或 `null` 传递给 `Provider` 的 `value` 时，消费组件的 `defaultValue` 不会生效。


#### Context.Provider

```jsx
<MyContext.Provider value={/* 某个值 */}>
  {/* Provider 下的子组件将会订阅 MyContext 对象的 context 变化 */}
<MyContext.Provider>
```

每个 Context 对象将会返回一个 Provider React 组件，它允许消费组件订阅 context 的变化。

Provider 接收一个 `value` 属性，传递给消费组件。一个 Provider 可以和多个消费组件有对应关系。多个 Provider 也可以嵌套使用，里层的会覆盖外层的数据。

当 Provider 的 `value` 值发生变化市，它内部的所有消费组件都会重新渲染。Provider 即其内部 consumer 组件都不受制于 `shouldComponentUpdate` 函数，因此当 consumer 组件在其祖先组件退出更新的情况下也能更新。

通过新旧值检测来确定变化，使用了与 `Object.is()` 相同的算法。

> 注意，当传递对象给 `value` 时，检测变化的方式会导致一些问题：详见[注意事项](https://react.docschina.org/docs/context.html#caveats)。