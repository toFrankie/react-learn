# Refs 转发（Forwarding Refs）

Ref 转发是一项将 [ref](https://react.docschina.org/docs/refs-and-the-dom.html) 自动地通过组件传递到其一子组件的技巧。对于大多数应用中的组件来说，这通常不是必需的。但其对某些组件，尤其是可重用的组件库是很有用的。最常见的案例如下所述。

这种技术并不常见，通常在以下两种场景中特别有用：

* [转发 refs 到 DOM 组件](https://react.docschina.org/docs/forwarding-refs.html#forwarding-refs-to-dom-components)
* [在高阶组件中转发 refs](https://react.docschina.org/docs/forwarding-refs.html#forwarding-refs-in-higher-order-components)


## React.forwardRef

`React.forwardRef()` 接受渲染函数作为参数。React 将使用 `props` 和 `ref` 作为参数来调用此函数。此函数应返回 React 节点。

```jsx
const ForwardRef = React.forwardRef((props, ref) => (
  /* 任意节点，例如 */
  <button ref={ref}>{props.children}</button>
))

const ref = React.createRef()
<ForwardRef ref={ref} />
// 这时 ref.current 将会指向 <button> DOM 元素
```


## 转发 refs 到 DOM 组件

考虑这个渲染原生 DOM 元素 `button` 的 `FancyButton` 组件：

```jsx
function FancyButton(props) {
  return (
    <button className="FancyButton">
      {props.children}
    </button>
  )
}
```

React 组件隐藏其实现细节，包括其渲染结果。其他使用 `FancyButton` 的组件通常不需要获取内部的 DOM 元素 `button` 的 ref。这很好，因为这防止组件过度依赖其他组件的 DOM 结构。

虽然这种封装对类似 `FeedStory` 或 `Comment` 这样的应用级组件是理想的，但其对 `FancyButton` 或 `MyTextInput` 这样的高可复用“叶”组件来说可能是不方便的。这些组件倾向于在整个应用中以一种类似常规 DOM `button` 和 `input` 的方式被使用，并且访问其 DOM 节点对管理焦点，选中或动画来说是不可避免的。

**Ref 转发是一个可选特性，其允许某些组件接收 ref，并将其向下传递（换句话说，“转发”它）给子组件。**

在下面的示例中，`FancyButton` 使用 `React.forwardRef` 来获取传递给它的 ref，然后转发到它渲染的 DOM `button`：

```jsx
import React, { Component, createRef, forwardRef } from 'react'

const FancyButton = forwardRef((props, ref) => (
  <button ref={ref} className="FancyButton">
    {props.children}
  </button>
))

class App extends Component {
  constructor(props) {
    super(props)
    this.ref = createRef()
  }

  componentDidMount() {
    // this.ref.current 将会指向 FancyButton 组件的 <button> 节点
    console.log(this.ref.current)
  }

  render() {
    return <FancyButton ref={this.ref}>Magic</FancyButton>
  }
}
```

这样，使用 `FancyButton` 的组件可以获取底层 DOM 节点 `button` 的 ref ，并在必要时访问，就像其直接使用 DOM `button` 一样。

以下是对上述示例发生情况的逐步解释：

1. 我们通过调用 `React.createRef()` 创建了一个 [React ref](https://react.docschina.org/docs/refs-and-the-dom.html) 并将其赋值给 `ref` 变量。
2. 我们通过指定 `ref` 为 JSX 属性，将其向下传递给 <FancyButton ref={ref}>。
3. React 传递 `ref` 给 `forwardRef` 内函数 `(props, ref) => ...`，作为其第二个参数。
4. 我们向下转发该 `ref` 参数到 `<button ref={ref}>`，将其指定为 JSX 属性。
5. 当 `ref` 挂载完成，`ref.current` 将指向 `<button>` DOM 节点。

> 请注意：
>
> 第二个参数 `ref` 只在使用 `React.forwardRef` 定义组件时存在。常规函数和 class 组件不接收 `ref` 参数，且 props 中也不存在 `ref`。
>
> Ref 转发不仅限于 DOM 组件，你也可以转发 refs 到 class 组件实例中。

## 在高阶组件中转发 Refs

这个技巧对[高阶组件](https://react.docschina.org/docs/higher-order-components.html)（也被称为 HOC）特别有用。让我们从一个输出组件 props 到控制台的 HOC 示例开始：

```jsx
// hoc.jsx
import React, { Component } from 'react'

function logProps(WrappedComponent) {
  // 👇 根据前面的内容，可知 ref 将会指向 LogProps 组件
  class LogProps extends Component {
    componentDidUpdate(prevProps) {
      console.log('old props:', prevProps)
      console.log('new props:', this.props)
    }

    render() {
      // 我们知道在上层绑定了 ref 属性，但是 ref 不是 prop 属性，
      // 就行 key 一样，它会被 React 进行特殊处理。
      return <WrappedComponent {...this.props} />
    }
  }

  return LogProps
}

export default logProps
```

上面 HOC 透传（pass through）所有 `props` 到其包裹的组件，所以渲染结果是相同的。例如，我们可以使用该 HOC 记录所有传递到 “FancyButton” 组件的 `props`：

```jsx
// fancyButton.jsx
import React, { Component } from 'react'
import logProps from './hoc'

class FancyButton extends Component {
  render() {
    return this.props.children
  }
}

// 注意导出的是 LogProps，而不是 FancyButton
export default logProps(FancyButton)
```

```jsx
// app.jsx
import React, { Component, createRef, forwardRef } from 'react'
import FancyButton from './fancyButton'

class App extends Component {
  constructor(props) {
    super(props)
    this.ref = createRef()
  }

  componentDidMount() {
    // 由于 ref 对象绑定到 React 组件中，
    // 因此 this.ref.current 将会指向 LogProps 组件的
    console.log(this.ref.current)
  }

  render() {
    // 从上面的包装关系，我们可以知道，
    // ref 关联的是 hoc.jsx 中的 LogProps 组件（也不是外层的函数）
    return <FancyButton ref={this.ref}>Magic</FancyButton>
  }
}

export default App
```

从上面的例子中，从我们可以知道 `<FancyButton ref={this.ref}>Magic</FancyButton>` 相当于：

```jsx
<LogProps ref={this.ref}>
  <FancyButton>Magic</FancyButton>
</LogProps>
```

所以 `this.ref.current` 指向的是 `LogProps` 组件实例，而不是高阶组件 `LogProps` 下子组件实例或子组件的某个 HTML DOM 元素。

若要实现这样的需求，即指向 `FancyButton` 组件实例，那么前面提到的 `React.forwardRef()` 就能排上用场了。

```jsx
import React, { Component, forwardRef } from 'react'

function logProps(WrappedComponent) {
  class LogProps extends Component {
    componentDidUpdate(prevProps) {
      console.log('old props:', prevProps)
      console.log('new props:', this.props)
    }

    render() {
      const { forwardedRef, ...other } = this.props
      return <WrappedComponent ref={forwardedRef} {...other} />
    }
  }

  // 通过 React.forwardRef() 创建的 React 组件，当给它传递 ref 属性时，
  // 可在其渲染函数的第二个参数中拿到，
  // 但注意继续往下传递时，不能通过 ref={ref} 方式传递，由于 LogProps 是 class 组件，
  // 因此其内部 this.props 也拿不到 ref，只能另起名字，比如下面的：forwardedRef。
  return forwardRef((props, ref) => (
    <LogProps forwardedRef={ref} {...props} />
  ))
}

export default logProps
```

## 在 React DevTools 中显示自定义名称

React.forwardRef 接受一个渲染函数。React DevTools 使用该函数来决定为 ref 转发组件显示的内容。

按照上面的示例，React.forwardRef 的渲染函数为箭头函数，因此在 React DevTools 中将会如下所示：

```text
App
  └── Anonymous ForwardRef
    └── LogProps
      └── FancyButton
```

若要自定义，可将 React.forwardRef 的渲染函数改为具名函数，比如：

```jsx
return React.forwardRef(function customizeComponent(props, ref) {
  return <LogProps forwardedRef={ref} {...props} />
})
```

将会如下所示，

```text
App
  └── customizeComponent ForwardRef
    └── LogProps
      └── FancyButton
```

也可以使用类似 Context.displayName 的形式来指定，即设置渲染函数的 displayName 属性。

```jsx
const forwardingFn = (props, ref) => <LogProps forwardedRef={ref} {...props} />
forwardingFn.displayName = `logProps(forwardingComponent)`
// 也可以取 WrappedComponent.displayName || WrappedComponent.name

return forwardRef(forwardingFn)
```

将会如下所示，

```text
App
  └── forwardingComponent ForwardRef
    └── LogProps
      └── FancyButton
```