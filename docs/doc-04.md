# 组件 & Props

### 函数组件与 class 组件

定义组件最简单的方式就是编写 JavaScript 函数：

```jsx
function Welcome（props) {
  return <h1>Hello, {props.name}</h1>
}
```

该函数是一个有效的 React 组件，因为它接收唯一带有数据的 `props`（代表属性）对象与并返回一个 React 元素。这类组件被称为“函数组件”，因为它本质上就是 JavaScript 函数。

你同时还可以使用 ES6 的 `class` 来定义组件：

```jsx
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>
  }
}
```

上述两个组件在 React 里是等效的。

### 渲染组件

之前，我们遇到的 React 元素都只是 DOM 标签：

```jsx
const element = <div />
```

不过，React 元素也可以是用户自定义的组件：

```jsx
const element = <Welcome name="Frankie" />
```

当 React 元素为用户自定义组件是，它会将 JSX 所接收的属性（attributes）以及子组件（children）转换为单个对象传递给组件，这个对象被称之为 `props`。

> 在 [doc-02](https://github.com/toFrankie/react-learn/blob/main/docs/doc-02.md) 了解了 `React.createElement()` 方法，该方法里面的 props 就是包含了定义在组件上的所有属性（除了 `key`、`ref`、`__self`、`__source` 属性外）以及子组件，即我们称之为 `props` 的对象。

例如，这段代码会在页面上渲染 `Hello, Frankie`：

```jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>
}

const element = <Welcome name="Frankie" />

ReactDOM.render(
  element,
  document.getElementById('root')
)
```

在 [CodePen](https://codepen.io/tofrankie/pen/GRWOORm) 上尝试

让我们来回顾一下这个例子中发生了什么：

1. 我们调用 `ReactDOM.render()` 函数，并传入 `<Welcome name="Frankie" />` 作为参数。
2. React 调用 `Welcome` 组件，并将 `{name: 'Frankie'}` 作为 `props` 传入。
3. Welcome 组件将 `<h1>Hello, Frankie</h1>` 元素作为返回值。
4. React DOM 将 DOM 高效地更新为 `<h1>Hello, Frankie</h1>`。

> 注意：组件名称必须以**大写字母**开头。
>
> React 会将以小写字母开头的组件视为原生 DOM 标签。例如，`<div />` 代表 HTML 的 `div` 标签，而 `<Weclome />` 则代表一个组件，并且需在作用域内使用 `Welcome`。
>
> 相反地，如果你使用 `<Div />` 去表示一个 HTML 的 `div` 标签，它就会抛出 `ReferenceError`，因为 React 将它当做是一个自定义的 `React Component`。
>
> 你可以在[深入 JSX](https://react.docschina.org/docs/jsx-in-depth.html#user-defined-components-must-be-capitalized) 中了解更多关于此规范的原因。

### 组合组件

我们可将一些复杂的组件，可以抽象出任意层次的细节，拆分为更小的组件。

### Props 的只读性（Read-Only）

组件无论是使用函数声明还是通过 class 声明，都决不能修改自身的 props。来看下这个 sum 函数：

```js
function sum(x, y) {
  return x + y
}
```

这样的函数被称为“[纯函数](https://en.wikipedia.org/wiki/Pure_function)”，因为该函数不会尝试更改入参，且多次调用下相同的入参始终返回相同的结果。

相反，下面这个函数则不是纯函数，因为它更改了自己的入参：

```js
function withdraw(account, amount) {
  account.total -= amount
}
```

React 非常地灵活，但它也有一个严格的规则：

> **所有的 React 组件都必须像纯函数一样保护它们的 `props` 不被更改。**

当然，应用程序的 UI 是动态的，并会伴随着时间的推移而变化。在[下一节](https://github.com/toFrankie/react-learn/blob/main/docs/doc-05.md)中，我们将介绍一种新的概念，称之为“state”。在不违反上述规则的情况下，state 允许 React 组件随着用户操作、网络响应或者其他变化而动态地输出内容。