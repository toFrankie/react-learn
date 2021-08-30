# Refs & DOM

Refs 提供了一种方式，允许我们访问 DOM 节点或在 render 方法中创建的 React 元素。

在典型的 React 数据流中，`props` 是父组件与子组件交互的唯一方式。要修改一个子组件，你需要使用新的 `props` 来重新渲染它。**但是，在某些情况下，你需要在典型数据流之外强制修改子组件**。被修改的子组件可能是一个 React 组件的实例，也可能是一个 DOM 元素。对于这两种情况，React 都提供了解决办法。

## 何时使用 Refs

下面是几个适合使用 refs 的情况：

* 管理焦点，文本选择或媒体播放
* 触发强制动画
* 集成第三方 DOM 库

避免使用 refs 来做任何可以通过声明式实现来完成的事情。

举个例子，避免在 `Dialog` 组件里暴露 `open()` 和 `close()` 方法，最好传递 `isOpen` 属性。

## 请勿过度使用 Refs

你可能首先会想到使用 refs 在你的 App 中“让事情发生”。如果是这种情况，请花一点时间，认真再考虑一下 `state` 属性应该被安排在哪个组件层中。通常你会想明白，让更高的组件层级拥有这个 `state`，是更恰当的。查看[状态提升](https://react.docschina.org/docs/lifting-state-up.html)以获取更多有关示例。


## 创建 Refs

* React 16.3 及以上使用 `React.createRef()` API
* React 16.3 以下建议使用回调形式的 Refs
* 还有一种过时的 API：String 类型的 Refs


#### 1. React.createRef()

Refs 是使用 `React.createRef()` 创建的，并通过 `ref` 属性附加到 React 元素。在构造组件时，通常将 Refs 分配给实例属性，以便可以在整个组件中引用它们。

```jsx
class MyComponent extends React.Component {
  constructor(props) {
    super(props)
    this.myRef = React.createRef() // 将 Ref 分配给实例对象，方便在组件中引用它
  }

  componentDidMount() {
    // 将 Ref 附加到 render 元素时，可通过访问 Ref.current 属性拿到真实的 DOM 节点
    const node = this.myRef.current
  }

  render() {
    // 将 Refs 附加到 React 元素的 ref 属性
    return <div ref={this.myRef} />
  }
}
```

#### 2. 访问 Ref

上面示例中 node 对应 `<div />` 节点。

```jsx
const node = this.myRef.current
```


**Ref 的值根据节点的类型而有所不同**

* 当 `ref` 属性用于 HTML 元素时，构造函数中使用 `React.createRef()` 创建的 `ref` 接收底层 DOM 元素作为其 `current` 属性。

* 当 `ref` 属性用于自定义 class 组件时，`ref` 对象接收组件的挂载实例作为其 `current` 属性。

* **你不能在“函数组件”上使用 `ref` 属性，因为它们没有实例。**

#### 2. 举例

就以上几种类型，举些例子...

##### 为 DOM 元素添加 ref

```jsx
import React, { Component, createRef } from 'react'

class MyInput extends Component {
  constructor(props) {
    super(props)
    this.inputRef = createRef()
    this.focusInput = this.focusInput.bind(this)
  }

  focusInput() {
    this.inputRef.current.focus()
  }

  render() {
    return (
      <>
        <input type="text" ref={this.inputRef} />
        <input type="button" onClick={this.focusInput} value="Focus the input" />
      </>
    )
  }
}
```

> **React 会在组件挂载时给 `current` 属性传入 DOM 元素，并在组件卸载时传入 `null` 值。`ref` 会在 `componentDidMount()` 和 `componentDidUpdate()` 钩子触发前更新。**


##### 为 class 组件添加 Ref

```jsx
import React, { Component, createRef } from 'react'

class Parent extends Component {
  constructor(props) {
    super(props)
    this.myRef = createRef()
    this.handler = this.handler.bind(this)
  }

  handler() {
    // this.myRef.current 引用了 Child 组件，因此将会调用子组件的 do() 方法
    this.myRef.current.do()
  }

  render() {
    return (
      <>
        {/* 请注意， Child 要是 class 组件才可以 */}
        <Child ref={this.myRef} />
        <button onClick={this.handler}>do something</button>
      </>
    )
  }
}

class Child extends Component {
  do() {
    console.log('do something...')
  }

  render() {
    return <div>...</div>
  }
}
```

> 注意，若 ref 绑定到 React 组件上的话，该组件必须是 class 组件才有效。


##### Refs 与 函数组件

默认情况下，你不能在函数组件上使用 ref 属性，因为它们没有实例。

```jsx
import React, { Component, createRef } from 'react'

class Parent extends Component {
  constructor(props) {
    super(props)
    this.uselessRef = createRef()
  }

  componentDidMount() {
    console.log(this.uselessRef) // { current: null }
  }

  render() {
    // Warning: Function components cannot be given refs. Attempts to access this ref will fail.
    return <Child ref={this.uselessRef} />
  }
}

function Child() {
  return <div>It&#39;s functional component.</div>
}
```

如上述示例，可以在控制台中看到警告： `Warning: Function components cannot be given refs. Attempts to access this ref will fail. Did you mean to use React.forwardRef()?`

想要在函数组件中使用 ref，你可以使用 [forwardRef](https://react.docschina.org/docs/forwarding-refs.html)（可与 [useImperativeHandle](https://react.docschina.org/docs/hooks-reference.html#useimperativehandle) 结合使用），或者可以将该组件转化为 class 组件。

##### 在函数组件内部使用 ref 属性

不管怎样，你可以在函数组件内部使用 ref 属性，只要它指向一个 DOM 元素或 class 组件：

```jsx
import React, { Component, createRef, useRef } from 'react'

function Parent() {
  // useRef 会在每次渲染时返回同一个 ref 对象
  const inputRef = useRef(1) // useRef(initialValue)，initialValue 将作为其返回的 ref 对象的 current 属性值

  // 尽管在函数组件内也可以使用 createRef，但本质上与 useRef 不同，
  // 每次函数组件的重新渲染都会生成一个“全新的” ref 对象。
  const tmpRef = createRef() // 无初始参数

  function focusInput() {
    // inputRef.current 将会指向 DOM 元素或 class 组件实例
    inputRef.current.focus()
  }

  return (
    <>
      {/* 绑定到 HTML 元素或 class 组件的 ref 属性时，会更新 inputRef.current */}
      <input type="text" ref={inputRef} />
      <input type="button" onClick={focusInput} value="Focus the input" />
    </>
  )
}
```