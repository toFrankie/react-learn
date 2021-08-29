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

#### Class.contextType

```jsx
class MyClass extends React.Component {
  static contextType = MyContext

  render() {
    // this.context 就是最近 Context 的值
    // 也可以在任意生命周期函数中访问到它
    const ctx = this.context
  }
}


// 或者
class MyClass extends React.Component {
  render() {
    const ctx = this.context
  }
}
MyClass.contextType = MyContext
```

挂载在 class 上的 `contextType` 属性会被重赋值为一个由 `React.createContext()` 创建的 Context 对象。这能让你使用 `this.context` 来消费最近 Context 上的那个值。你可以在任何声明周期中访问到它，包括 `render` 函数。

> 你只能通过该 API 订阅单一 context。如果你想订阅多个，阅读[使用多个 Context](https://react.docschina.org/docs/context.html#consuming-multiple-contexts) 章节。


#### Context.Consumer

```
<MyContext.Consumer>
  {
    value => /* 基于 context 值进行渲染*/
  }
</MyContext.Consumer>
```

这里，React 组件也可以订阅到 context 变更。这能让你在[函数式组件](https://react.docschina.org/docs/components-and-props.html#function-and-class-components)中完成订阅 context。

这需要[函数作为子元素（function as a child）](https://react.docschina.org/docs/render-props.html#using-props-other-than-render)这种做法。这个函数接收当前的 context 值，返回一个 React 节点。传递给函数的 `value` 值等同于往上组件树离这个 context 最近的 Provider 提供的 `value` 值。如果没有对应的 Provider，`value` 参数等同于传递给 `createContext()` 的 `defaultValue`。

> 注意，想要了解更多关于“函数作为子元素（function as a child）”模式，详见[render props](https://react.docschina.org/docs/render-props.html)


#### Context.displayName

context 对象接受一个名为 `displayName` 的 property，类型为字符串。React DevTools 使用该字符串来确定 context 要显示的内容。

```jsx
// 按照这样的话，在 React DevTools 中显示的是 MyContext.Provider
const MyContext = React.createContext(defaultValue)
<MyContext.Provider value={/* ... */}>
  {/* ... */}
<MyContext.Provider>


// 按照这样的话，在 React DevTools 中显示的是 customName.Provider
const MyContext = React.createContext(defaultValue)
MyContext.displayName = 'customName'
<MyContext.Provider value={/* ... */}>
  {/* ... */}
<MyContext.Provider>
```

## 示例

#### 动态更新 Context

使用动态的 Context，并进行更新。

**themeContext.jsx**

```jsx
import { createContext } from 'react'

export const themes = {
  light: {
    color: '#000',
    bg: '#fff'
  },
  dark: {
    color: '#fff',
    bg: '#000'
  }
}

export const ThemeContext = createContext({
  theme: themes.light,
  toggleTheme: () => {}
})
```

**themedButton.jsx**

```jsx
import React, { Component } from 'react'
import { ThemeContext } from './themeContext'

class ThemedButton extends Component {
  static contextType = ThemeContext

  render() {
    let { theme, toggleTheme } = this.context
    return <button {...this.props} onClick={toggleTheme} style={{ color: theme.color, background: theme.bg }} />
  }
}

export default ThemedButton
```

**app.jsx**

```jsx
import React, { Component } from 'react'
import ThemedButton from './themedButton'
import { ThemeContext, themes } from './themeContext'

export default class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      theme: themes.light,
      toggleTheme: this.toggleTheme
    }
  }

  toggleTheme = () => {
    this.setState(state => ({
      theme: state.theme === themes.light ? themes.dark : themes.light
    }))
  }

  render() {
    return (
      <div>
        <ThemeContext.Provider value={this.state}>
          <Toolbar />
        </ThemeContext.Provider>
        <section>
          <ThemedButton>Out of Provider</ThemedButton>
        </section>
      </div>
    )
  }
}

function Toolbar(props) {
  return <ThemedButton>Change Theme</ThemedButton>
}
```

## 注意事项

如下示例，当每一次 Provider 重渲染时，以下的代码会重渲染所有下面的 consumers 组件，因为 `value` 属性总是被赋值为新的对象。

```jsx
class App extends React.Component {
  render() {
    return (
      <MyContext.Provider value={{ something: 'something' }}>
        <Toolbar />
      </MyContext.Provider>
    )
  }
}
```


## 旧版 Context

在 React 16.3 之前，属于[旧版 context API](https://react.docschina.org/docs/legacy-context.html)。

**Usage**

```jsx
import React, { Component } from 'react'
import PropTypes from 'prop-types'

// 在 context 的生产者添加 childContextTypes 和 getChildContext
class Parent extends Component {
  static childContextTypes = {
    color: PropTypes.string
  }

  state = {
    color: 'red'
  }

  getChildContext() {
    return {
      color: this.state.color
    }
  }

  render() {
    return <Child />
  }
}

class Child extends Component {
  // 生产者的子树上的所有组件可通过 定义 contextTypes 来访问 context
  static contextTypes = {
    color: PropTypes.string
  }

  render() {
    const ctx = this.context
    console.log(ctx)
    return <div>{ctx.color}</div>
  }
}

// 函数组件，可以这样获取
function Button(props, context) {
  return <button style={{ color: context.color }}>{props.children}</button>
}

// 只要 contextTypes 被定义为函数的一个属性，
// 函数组件第二个参数就能接收到 context，否则该参数将会是一个空对象。
Button.contextTypes = {
  color: PropTypes.string
}
```

**生命周期方法中引用 Context**

如果一个组件内定义了 `contextTypes`，下面的 生命周期方法 会接收一个额外参数，就是 context 对象：

* `constructor(props, context)`
* `componentWillReceiveProps(nextProps, nextContext)`
* `shouldComponentUpdate(nextProps, nextState, nextContext)`
* `componentWillUpdate(nextProps, nextState, nextContext)`

> 注意：从 React 16 开始，`componentDidUpdate` 不再接收 `prevContext`。

**更新 context**

当 Parent 组件的 `props` 或 `state` 改变的时候，`getChildContext` 方法就会被调用。为了更新 context 里的数据，使用 `this.setState` 触发当前 `state` 的更新。这样会产生一个新的 context 并且子组件会接收到变化。

> 如果组件提供的一个 context 发生了变化，而中间父组件的 `shouldComponentUpdate` 返回 `false`，那么使用到该值的后代组件不会进行更新。使用了 context 的组件则完全失控，所以基本上没有办法能够可靠的更新 context。