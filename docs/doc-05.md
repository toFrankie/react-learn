# State & 生命周期

在 [doc-03 元素渲染](https://github.com/toFrankie/react-learn/blob/main/docs/doc-03.md) 小节，我们只了解了一种更新 UI 界面的方法。通过调用 `ReactDOM.render()` 来修改我们想要渲染的元素。

```jsx
function tick() {
  const element = (
    <div>
      <h1>Hello, world!</h1>
      <h2>It is {new Date().toLocaleTimeString()}.</h2>
    </div>
  )

  ReactDOM.render(element, document.getElementById('root'))
}

setInterval(tick, 1000)
```

在本章节中，我们将学习如何封装真正可复用的 `Clock` 组件。它将设置自己的计时器并每秒更新一次。

我们可以从封装时钟的外观开始：

```jsx
function Clock(props) {
  return (
    <div>
      <h1>Hello, world!</h1>
      <h2>It is {props.date.toLocaleTimeString()}.</h2>
    </div>
  )
}

function tick() {
  ReactDOM.render(<Clock data={new Date()} />, document.getElementById('root'))
}

setInterval(tick, 1000)
```

然而，它忽略了一个关键的技术细节：`Clock` 组件需要设置已计算器，并且需要每秒更新 UI。

理想情况下，我们希望只编写一次代码，便可以让 `Clock` 组件自我更新：

```jsx
ReactDOM.render(<Clock />, document.getElementById('root'))
```

我们需要在 `Clock` 组件中添加 `state` 来实现这个功能。

`state` 与 `props` 类似，但是 `state` 是私有的，并且完全受控于当前组件。

### 将函数组件转换为 class 组件

通过以下五部将 `Clock` 的函数组件转成 `class` 组件：

1. 创建一个同名的 [ES6 class](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Classes)，并继承于 `React.Component`。
2. 添加一个空的 `render()` 方法。
3. 将函数体移动到 `render()` 方法之中。
4. 在 `render()` 方法中使用 `this.props` 替换 `props`。
5. 删除剩余的空函数声明。

```jsx
class Clock extends React.Component {
  render() {
    return (
      <div>
        <h1>Hello, world!</h1>
        <h2>It is {this.props.date.toLocaleTimeString()}.</h2>
      </div>
    )
  }
}
```

现在 `Clock` 组件被定义为 `class`，而不是函数。

每次组件更新时，`render` 方法都会被调用，但只要在相同的 DOM 节点中渲染 `<Clock />`，就仅有一个 `Clock` 组件的 `class` 实例被创建使用。这就使得我们可以使用如 `state` 或生命周期方法等很多其他特性。

### 向 class 组件中添加局部的 state

我们通过以下三步将 `date` 从 `props` 移动到 `state` 中：

1. 把 `render()` 方法中的 `this.props.date` 替换成 `this.state.date`：

```jsx
class Clock extends React.Component {
  render() {
    return (
      <div>
        <h1>Hello, world!</h1>
        <h2>It is {this.state.date.toLocaleTimeString()}.</h2>
      </div>
    )
  }
}
```

2. 添加一个 `class` 构造函数，然后在该函数中为 `this.state` 赋初值：

```jsx
class Clock extends React.Component {
  constructor(props) {
    super(props) // 将 props 传递到父类的构造函数中
    this.state = { date: new Date() }
  }

  render() {
    return (
      <div>
        <h1>Hello, world!</h1>
        <h2>It is {this.props.date.toLocaleTimeString()}.</h2>
      </div>
    )
  }
}
```

`class` 组件应该始终使用 `props` 参数来调用父类的构造函数。

3. 移除 `<Clock />` 元素中的 `date` 属性：

```jsx
ReactDOM.render(
  <Clock />,
  document.getElementById('root')
)
```

我们之后会将计时器相关的代码添加到组件中。

代码如下：

```jsx
class Clock extends React.Component {
  constructor(props) {
    super(props)
    this.state = {date: new Date()}
  }

  render() {
    return (
      <div>
        <h1>Hello, world!</h1>
        <h2>It is {this.state.date.toLocaleTimeString()}.</h2>
      </div>
    )
  }
}

ReactDOM.render(
  <Clock />,
  document.getElementById('root')
)
```

接下来，我们会设置 `Clock` 的计时器并每秒更新它。

### 将生命周期方法添加到 Class 中

在具有许多组件的应用程序中，当组件被销毁时释放所占用的资源是非常重要的。

当 `Clock` 组件第一次被渲染到 DOM 中的时候，就为其设置一个计算器。这在 React 中被称为“**挂载**”（`mount`）。

同时，当 DOM 中 `Clock` 组件被删除的时候，应该清除计时器。这在 React 中被称为“**卸载**”（`unmount`）。

我们可以为 `class` 组件声明一些特殊的方法，当**组件挂载或卸载**时就会去执行这些方法：

```jsx
class Clock extends React.Component {
  constructor(props) {
    super(props)
    this.state = {date: new Date()}
  }

  componentDidMount() {}

  componentWillUnmount() {}

  render() {
    return (
      <div>
        <h1>Hello, world!</h1>
        <h2>It is {this.state.date.toLocaleTimeString()}.</h2>
      </div>
    )
  }
}
```

这些方法叫做“**生命周期方法**”。

`componentDidMount()` 方法会在组件已经被渲染到 DOM 中后运行，所以，最好在这里设置计时器：

```jsx
componentDidMount() {
  this.timerID = setInterval(
    () => this.tick(),
    1000
  )
}
```

接下来把计时器的 ID 保存在 `this` 之中（`this.timerID`）。

尽管 `this.props` 和 `this.state` 是 React 本身设置的，且都拥有特殊的含义，但是其实你可以向 `class` 中随意添加不参与数据流（比如计时器 ID）的额外字段。

我们会在 `componentWillUnmount()` 生命周期方法中清除计时器：

```jsx
componentWillUnmount() {
  clearInterval(this.timerID)
}
```

最后，我们会实现一个叫 `tick()` 的方法，`Clock` 组件每秒都会调用它。

使用 `this.setState()` 来时刻更新组件 `state`：

```jsx

class Clock extends React.Component {
  constructor(props) {
    super(props)
    this.state = { date: new Date() }
  }

  componentDidMount() {
    this.timerID = setInterval(() => this.tick(), 1000)
  }

  componentWillMount() {
    clearInterval(this.timerID)
  }

  tick() {
    this.setState({ date: new Date() })
  }

  render() {
    return (
      <div>
        <h1>Hello, world!</h1>
        <h2>It is {this.state.date.toLocaleTimeString()}.</h2>
      </div>
    )
  }
}

ReactDOM.render(
  <Clock />,
  document.getElementById('root')
)
```

现在时钟每秒都会刷新。

让我们来快速概括一下发生了什么和这些方法的调用顺序：

1. 当 `<Clock />` 被传给 `ReactDOM.render()` 的时候，React 会调用 `Clock` 组件的构造函数。因为 `Clock` 需要显示当前的时间，所以它会用一个包含当前时间的对象来初始化 `this.state`。我们会在之后更新 `state`。
2. 之后 React 会调用组件的 `render()` 方法。这就是 React 确定该在页面上展示什么的方式。然后 React 更新 DOM 来匹配 `Clock` 渲染的输出。
3. 当 `Clock` 的输出被插入到 DOM 中后，React 就会调用 `componentDidMount()` 生命周期方法。在这个方法中，`Clock` 组件向浏览器请求设置一个计时器来调用一次组件的 `tick()` 方法。
4. 浏览器每秒都会调用一次 `tick()` 方法。在这个方法之中，`Clock` 组件会通过调用 `setState()` 来计划进行一次 UI 更新。得益于 `setState()` 的调用，React 能够知道 `state` 已经改变了，然后重新调用 `render()` 方法来确定页面上该显示什么。这一次，`render()` 方法中的 `this.state.date` 就不一样了，如此以来就会渲染输出更新过的时间。React 也会相应地更新 DOM。
5. 一旦 `Clock` 组件从 DOM 中被移除，React 就会调用 `componentWillUnmount()` 生命周期方法，这样计时器就停止了。

### 正确地使用 State

关于 `setState()` 你应该了解三件事：

##### 1. 不要直接修改 State

例如，此代码不会重新渲染组件：

```jsx
// Wrong
this.state.comment = 'Hello'
```

而应该使用 `setState()`：

```jsx
// Correct
this.setState({ comment: 'Hello' })
```

构造函数是唯一可以给 `this.state` 赋值的地方。

假设在 `componentDidMount()` 生命周期中对 `this.state` 进行赋值操作，会抛出以下警告：

```jsx
componentDidMount() {
  this.state = {} // 尽管可以设置成功，但会被警告
  // Warning: Expected Clock state to match memoized state before processing the update queue. This might either be because of a bug in React, or because a component reassigns its own `this.state`.
}
```

##### 2. State 的更新可能是异步的

出于性能考虑，React 可能会把多个 `setState()` 调用合并成一个调用。

因为 `this.props` 和 `this.state` 可能会异步更新，所以你不要依赖他们的值来更新下一个状态。

例如，此代码可能会无法更新计数器：

```jsx
// Wrong
this.setState({
  counter: this.state.counter + this.props.increment
})
```

要解决这个问题，可以让 `setState()` 接收一个函数而不是一个对象。这个函数用上一个 `state` 作为第一个参数，将此次更新被应用时的 `props` 作为第二个参数：

```jsx
// Correct
this.setState((state, props) => {
  counter: state.counter + props.increment
}})
```

上面使用了箭头函数，不过普通的函数也同样可以：

```jsx
// Correct
this.setState(function(state, props) {
  return {
    counter: state.counter + props.increment
  }
}})
```