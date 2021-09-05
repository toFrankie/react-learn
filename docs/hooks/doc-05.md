# Hook APIs


如果你刚开始接触 Hook，那么可能需要先查阅 Hook 概览。你也可以在 Hooks FAQ 章节中获取有用的信息。

* 基础 Hook

  * `useState`
  * `useEffect`
  * `useContext`

* 额外的 Hook

  * `useReducer`
  * `useCallback`
  * `useMemo`
  * `useRef`
  * `useImperativeHandle`
  * `useLayoutEffect`
  * `useDebugValue`


## 基础 Hook

#### 1. useState

```jsx
const [state, useState] = useState(initialState)
```

返回一个 `state`，以及更新 `state` 的函数。

在初始渲染期间，返回的状态（`state`）与传入的第一个参数（`initialState`）值相同。

`setState` 函数用于更新 `state`。它接收一个新的 `state` 值并将组件的一次重新渲染加入队列。


```jsx
setState(newState)
```

在后续的重新渲染中，`useState` 返回的第一个值将始终是更新后最新的 `state`。

> 注意，React 会确保 `setState` 函数的标识是稳定的，并且不会在组件重新渲染时发生变化。这就是为什么可以安全地从 `useEffect` 或 `useCallback` 的依赖列表中省略 `setState`。

**函数式更新**

如果新的 `state` 需要通过使用先前的 `state` 计算得出，那么可以将函数传递给 `setState`。该函数将接收先前的 `state`，并返回一个更新后的值。下面的计算器组件示例展示了 `setState` 的两种用法：


```jsx
function Counter({ initialCount = 0 }) {
  const [count, setCount] = useState(initialCount)

  return (
    <>
      Count: {count}
      <button onClick={() => setCount(initialCount)}>Reset</button>
      <button onClick={() => setCount(prevCount => prevCount - 1)}>-</button>
      <button onClick={() => setCount(prevCount => prevCount + 1)}>+</button>
    </>
  )
}
```

“+” 和 “-” 按钮采用函数式形式，因为被更新的 `state` 需要基于之前的 `state`。但是“重置”按钮则采用普通形式，因为它总是把 `count` 设置回初始值。

如果你的更新函数返回值与当前 `state` 完全相同，则随后的重新渲染会被完全跳过。

> 注意，与 class 组件中的 `setState` 方法不同，`useState` 不会自动合并更新对象。你可以用函数式的 `useState` 结合展开运算符来达到合并更新对象的效果。对于以下情况，`useReducer` 是另外一种可选方案，它更适合用于管理包含多个子值的 `state` 对象。

```jsx
useState(prevState => {
  // 也可以使用 Object.assign() 等方法
  return {...prevState, ...updatedValues}
})
```

**惰性初始 state**

`initialState` 参数只会在组件的初始渲染中起作用，后续渲染时会被忽略。如果初始 `state` 需要通过复杂计算获得，则可传入一个函数，在函数中计算并返回初始的 `state`，此函数只在初始渲染时被调用：

```jsx
const [count, setCount] = useState(() => {
  const initialState = someExpressionComputation(props)
  return initialState
})
```

**跳过 state 更新**

调用 State Hook 的更新函数并传入当前的 `state` 时，React 将会跳过子组件的渲染及 effect 的执行。React 使用 [`Object.is` 比较算法](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/is)来比较 `state`。


需要注意的是，React 可能仍需要在跳过渲染前渲染该组件。不过由于 React 不会对组件树的“深层”节点进行不必要的渲染，所以大可不必担心。如果你在渲染期间执行了高开销的计算，则可以使用 `useMemo` 来进行优化。

#### 2. useEffect

```jsx
useEffect(didMount)
```

该 Hook 接收一个包含命令式、且可能有副作用代码的函数。

在函数组件主体内（这里指在 React 渲染阶段）改变 DOM、添加订阅、设置定时器、记录日志以及执行其他包含副作用的操作都是不被允许的，因为这可能会产生莫名其妙的 bug 并破坏 UI 的一致性。

使用 `useEffect` 完成副作用操作。赋值给 `useEffect` 的函数会在组件渲染到屏幕之后执行。你可以把 effect 看作从 React 的纯函数式世界通往命令式世界的逃生通道。

默认情况下，effect 将在每轮渲染结束后执行，但你可以选择让它[在只有某些值改变的时候](https://react.docschina.org/docs/hooks-reference.html#conditionally-firing-an-effect)才执行。

**清除 effect**

通常，组件卸载时需要清除 effect 创建的诸如订阅或计时器 ID 等资源。要实现这一点，`useEffect` 函数需返回一个清除函数。以下就是一个创建订阅的例子：

```jsx
useEffect(() => {
  // 添加订阅
  const subscription = props.source.subscribe()
  return () => {
    // 清除订阅
    subscription.unsubscribe()
  }
})
```

为了防止内存泄露，清除函数会在组件卸载前执行。另外，如果函数组件多次渲染（通常如此），则在执行下一个 effect 之前，上一个 effect 就已被清除。在上述示例中，意味着组件的每一次更新都会创建新的订阅。若想避免每次更新都触发 effect 的执行，请参阅下一小节。

**effect 的执行时机**

**与 `componentDidMount`、`componentDidUpdate` 不同的是，在浏览器完成布局与绘制之后，传给 `useEffect` 的函数会延迟调用**。这使得它适用于许多常见的副作用场景，比如设置订阅和事件处理等情况，因此不应在函数中执行阻塞浏览器更新屏幕的操作。

然而，并非所有 effect 都可以被延迟执行。例如，在浏览器执行下一次绘制前，用户可见的 DOM 变更就必须同步执行，这样用户才不会感觉到视觉上的不一致。概念上类似于被动监听事件和主动监听事件的区别。React 为此提供了一个额外的 `useLayoutEffect` Hook 来处理这类 effect。它和 `useEffect` 的结构相同，区别只是调用时机不同。

**虽然 `useEffect` 会在浏览器绘制后延迟执行，但会保证在任何新的渲染前执行**。React 将在组件更新前刷新上一轮渲染的 effect。

**effect 的条件执行**

默认情况下，effect 会在每轮组件渲染完成后执行。这样的话，一旦 effect 的依赖发生变化，它就会被重新创建。

然而，在某些场景下，这么做可能会矫枉过正。比如，在上一章节的订阅示例中，我们不需要在每次组件更新时都创建新的订阅，而是仅需在 `source` prop 改变时重新创建。

要实现这一点，可以给 `useEffect` 传递第二个参数，它是 effect 所依赖的值数组。更新后的示例如下：

```jsx
useEffect(() => {
  // 添加订阅
  const subscription = props.source.subscribe()
  return () => {
    // 清除订阅
    subscription.unsubscribe()
  }
}, [props.source])
```

此时，只有当 `props.source` 改变后才会重新创建订阅。

> **注意**
>
> 如果你要使用此优化方式，请确保数组中包含了所有外部作用域中会发生变化且在 effect 中使用的变量，否则你的代码会引用到先前渲染中的旧变量。请参阅文档，了解更多关于[如何处理函数](https://react.docschina.org/docs/hooks-faq.html#is-it-safe-to-omit-functions-from-the-list-of-dependencies)以及[数组频繁变化时的措施](https://react.docschina.org/docs/hooks-faq.html#what-can-i-do-if-my-effect-dependencies-change-too-often)的内容。
>
> 如果想执行只运行一次的 effect（仅在组件挂载和卸载时执行），可以传递一个空数组（`[]`）作为第二个参数。这就告诉 React 你的 effect 不依赖于 `props` 或 `state` 中的任意值，所以它永远都不需要重复执行。这并不属于特殊情况 —— 它依然遵循输入数组的工作方式。
>
> 如果你传入了一个空数组（`[]`），effect 内部的 `props` 和 `state` 就会一直持有其初始值。尽管传入 `[]` 作为第二个参数有点类似于 `componentDidMount` 和 `componentWillUnmount` 的思维模式，但我们有[更好的](https://react.docschina.org/docs/hooks-faq.html#is-it-safe-to-omit-functions-from-the-list-of-dependencies)[方式](https://react.docschina.org/docs/hooks-faq.html#what-can-i-do-if-my-effect-dependencies-change-too-often)来避免过于频繁的重复调用 effect。除此之外，请记得 React 会等待浏览器完成画面渲染之后才会延迟调用 `useEffect`，因此会使得处理额外操作很方便。
>
> 我们推荐启用 [eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks#installation) 中的 [exhaustive-deps](https://github.com/facebook/react/issues/14920) 规则。此规则会在添加错误依赖时发出警告并给出修复建议。

依赖项数组不会作为参数传给 effect 函数。虽然从概念上来说它表现为：所有 effect 函数中引用的值都应该出现在依赖项数组中。未来编译器会更加智能，届时自动创建数组将成为可能。

#### 3. useContext

```jsx
const value = useContext(MyContext)
```

接收一个 context 对象（`React.createContext` 的返回值）并返回该 context 的当前值。当前的 context 值由上层组件中距离当前组件最近的 `<MyContext.Provider>` 中的 `value` prop 决定。


当组件上层最近的 `<MyContext.Provider>` 更新时，该 Hook 会触发重渲染，并使用最新传递给 `MyContext` provider 的 context `value` 值。即使祖先使用 `React.memo` 或 `shouldComponentUpdate`，也会在组件本身使用 `useContext` 时重新渲染。

别忘记 `useContext` 的参数必须是 context 对象本身：

* 正确：`useContext(MyContext)`
* 错误：`useContext(MyContext.Consumer)`
* 错误：`useContext(MyContext.Provider)`

调用了 `useContext` 的组件总会在 context 值变化时重新渲染。如果重新渲染组件的开销较大，你可以通过使用 [memoization 来优化](https://github.com/facebook/react/issues/15156#issuecomment-474590693)。


> 如果你在接触 Hook 前已经对 context API 比较熟悉，那应该可以理解，`useContext(MyContext)` 相当于 class 组件中的 `static contextType = MyContext` 或者 `<MyContext.Consumer>`。
>
> **`useContext(MyContext)` 只是让你能够读取 context 的值以及订阅 context 的变化。你仍然需要在上层组件树中使用 `<MyContext.Provider>` 来为下层组件提供 context。**

```jsx
const themes = {
  light: {
    foreground: '#000000',
    background: '#eeeeee'
  },
  dark: {
    foreground: '#ffffff',
    background: '#222222'
  }
}

const ThemeContext = React.createContext(themes.light)

function App() {
  return (
    <ThemeContext.Provider value={themes.dark}>
      <Toolbar />
    </ThemeContext.Provider>
  )
}

function Toolbar(props) {
  return (
    <div>
      <ThemedButton />
    </div>
  )
}

function ThemedButton() {
  const theme = useContext(ThemeContext)
  return (
    <button style={{ background: theme.background, color: theme.foreground }}>I am styled by theme context!</button>
  )
}

```

对先前 [Context 高级指南](https://react.docschina.org/docs/context.html)中的示例使用 hook 进行了修改，你可以在链接中找到有关如何 Context 的更多信息。

## 额外的 Hook