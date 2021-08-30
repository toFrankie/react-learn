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

#### 3. 举例

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

## 将 DOM Refs 暴露给父组件

在极少数情况下，你可能希望在父组件中引用子节点的 DOM 节点。通常不建议这样做，因为它会打破组件的封装，但它偶尔可用于触发焦点或测量子 DOM 节点的大小或位置。

虽然你可以向[子组件添加 ref](https://react.docschina.org/docs/refs-and-the-dom.html#adding-a-ref-to-a-class-component)，但这不是一个理想的方案，因为你只能获取到组件实例，而不是 DOM 节点。并且，它还在函数组件上无效。

如果你使用 React 16.3 或更高版本，这种情况下我们推荐使用 [ref 转发](https://react.docschina.org/docs/forwarding-refs.html)。Ref 转发组件可以像暴露自己的 ref 一样暴露子组件的 ref。关于怎样对父组件暴露子组件的 DOM 节点，在 [ref 转发文档](https://react.docschina.org/docs/forwarding-refs.html)中有一个详细的例子。

如果你使用 16.2 或更低版本的 React，或者你需要比 ref 转发更高的灵活性，你可以使用[这个替代方案](https://gist.github.com/gaearon/1a018a023347fe1c2476073330cc5509)将 ref 作为特殊名字的 prop 直接传递。

可能的话，我们不建议暴露 DOM 节点，但有时候它会成为救命稻草。注意这个方案需要你在子组件中增加一些代码。如果你对子组件的实现没有控制权的话，你剩下的选择是使用 [findDOMNode()](https://react.docschina.org/docs/react-dom.html#finddomnode)，但在[严格模式](https://react.docschina.org/docs/strict-mode.html#warning-about-deprecated-finddomnode-usage)下已被废弃且不推荐使用。

## 回调 Refs

> 在低于 React 16.3 版本下使用。

React 也支持另一种设置 refs 的方式，称为“回调 refs”。它能助你更精细地控制何时 refs 被设置和解除。

不同于传递 createRef() 创建的 ref 属性，你会传递一个函数。这个函数中接受 React 组件实例或 HTML DOM 元素作为参数，以使得它们能在其他地方被存储和访问。

下面的例子描述了一个通用的范例：使用 ref 回调函数，在实例的属性中存储对 DOM 阶段的引用。

```jsx
import React, { Component } from 'react'

export default class MyInput extends Component {
  constructor(props) {
    super(props)
    this.inputRef = null
    this.setInputRef = element => {
      // 若 this.setInputRef 绑定在 HTML 元素上，element 则指向该 HTML 元素
      // 若 this.setInputRef 绑定在 React 组件上，那么 element 则指向该组件实例，
      // 这点表现与 React.createRef() 表现是一致的。
      this.inputRef = element
    }
    this.focusInput = this.focusInput.bind(this)
  }

  componentDidMount() {
    console.log(this.inputRef) // 指向所绑定的 <input > 元素
  }

  focusInput() {
    this.inputRef.focus()
  }

  render() {
    return (
      <>
        <input type="text" ref={this.setInputRef} />
        <input type="button" onClick={this.focusInput} value="Focus the input" />
      </>
    )
  }
}
```

> 同样地，React 将在组件挂载时，会调用 ref 回调函数并传入 DOM 元素，当卸载时调用它并传入 `null`。在 `componentDidMount()` 或 `componentDidUpdate()` 触发前，React 会保证 refs 一定是最新的。


你可以在组件间传递回调形式的 refs，就像你可以传递通过 `React.createRef()` 创建的对象 refs 一样。

```jsx
function CustomTextInput(props) {
  return (
    <div>
      <input ref={props.inputRef} />
    </div>
  )
}

class Parent extends React.Component {
  componentDidMount() {
    // this.inputElement 将会指向 CustomTextInput 组件下的 input 元素
    console.log(this.inputElement)
  }
  render() {
    return <CustomTextInput inputRef={el => (this.inputElement = el)} />
  }
}
```

在上面的例子中，`Parent` 把它的 `refs` 回调函数当作 `inputRef` props 传递给了 `CustomTextInput`，而且 `CustomTextInput` 把相同的函数作为特殊的 `ref` 属性传递给了 `<input>`。结果是，在 `Parent` 中的 `this.inputElement` 会被设置为与 `CustomTextInput` 中的 `input` 元素相对应的 DOM 节点。

## 过时 API：String 类型的 Refs

如果你之前使用过 React，你可能了解过之前的 API 中的 string 类型的 ref 属性，例如 "textInput"。你可以通过 this.refs.textInput 来访问 DOM 节点。我们不建议使用它，因为 string 类型的 refs 存在[一些问题](https://github.com/facebook/react/pull/8333#issuecomment-271648615)。它已过时并可能会在未来的版本被移除。

> 如果 `ref` 回调函数是以内联函数的方式定义的，在更新过程中它会被执行两次，第一次传入参数 `null`，然后第二次会传入参数 DOM 元素。这是因为在每次渲染时会创建一个新的函数实例，所以 React 清空旧的 ref 并且设置新的。通过将 ref 的回调函数定义成 class 的绑定函数的方式可以避免上述问题，但是大多数情况下它是无关紧要的。

```jsx
class MyInput extends Component {
  componentDidMount() {
    // 通过 this.refs 可访问当前组件下所有的 String Ref
    console.log(this.refs.domRef) // 指向 <input> 元素
    console.log(this.refs.classRef) // 指向 Child1 组件实例
    console.log(this.refs.funcRef) // undefined，函数组件同样无效
  }

  render() {
    return (
      <>
        <input ref="domRef" />
        <Child1 ref="classRef" />
        <Child2 ref="funcRef" />
      </>
    )
  }
}

class Child1 extends Component {
  render() {
    return <div>Child Component 1</div>
  }
}

function Child2() {
  return <div>Child Component 2</div>
}
```

> 同样地，在组件挂载时，会更新为对应的 DOM 元素或 Class 组件实例，并在 `componentDidMount()` 或 `componentDidUpdate()` 触发前，React 会保证 refs 一定是最新的。在组件卸载时传入 `undefined`。

## 总结

在 React 中，有四种创建 Refs 的方式：

* `React.useRef(initialValue)`

  适用于函数组件，并且函数组件内避免使用下面几种方式，由于函数组件的渲染方式，可能会有问题。

* `React.createRef()`
  适用于 class 组件。该方法返回一个 ref 对象，也常挂载到 class 组件实例上，以便可以在整个组件中引用它。

* `<div ref={el => this.xxx = el } />`
  React 16.2 及以下采用这种方式，一般绑定到组件实例上，然后通过 `this.xxx` 访问 ref 对象。

* `<div ref="strRef" />`
  通过 this.refs.strRef 形式访问 ref 对象。

> 请注意，函数组件内尽可能地使用 `React.useRef()`，class 组件使用 `React.createRef()`，当两者都不支持的情况下，才考虑回调 refs 或字符串类型 refs。而且后面三种形式应用于 class 组件的子函数组件均无效，因为函数组件没有实例（即 `this`）。

以上几种方式，应用于合适的场景时。React 将在组件挂载时更新 ref 对象（在 `componentDidMount()` 或 `componentDidUpdate()` 触发前），当卸载时 ref 对象将清空（即更新为 `undefined` 或 `null`）。