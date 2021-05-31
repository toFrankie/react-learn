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