# 深入 JSX

实际上，JSX 仅仅只是 `React.createElement(component, props, ...children)` 函数的语法糖。如下 JSX 代码：

```jsx
<MyButton color="blue" shadowSize={2}>
  Click Me
</MyButton>
```

会编译为：

```jsx
React.createElement(
  MyButton,
  {
    color: 'blue',
    shadowSize: 2
  },
  'Click Me'
)
```

如果没有子节点，你还可以使用自闭合的标签形式，如：

```jsx
<div className="sidebar" />
```

会编译为:

```jsx
React.createElement(
  'div',
  {
    className: 'sidebar'
  }
)
```

> 这也就是为什么旧版 React，在编写每一个 jsx 文件时，都要引入 `import React from 'react'` 的原因。可以通过 Webpack 配置无需每个都引入。
>
> React 17 有一种全新的 JSX 编译方式，可以不用每个文件都引入。


## 一、指定 React 元素类型

#### React 必须在作用域内

```jsx
// jsx
import React from 'react' // 必须引入，而且只能是 React，也不能小写
import Bar from './bar'

function Foo() {
  return <Bar /> // Bar 是一个变量，因此 Bar 必须在作用域内
}
```

1. 如果你不使用 JavaScript 打包工具而是直接通过 `<script>` 标签加载 React，则必须将 `React` 挂载到全局变量中。

2. 通过 Webpack 配置：

```js
// webpack.config.js
module.exports = {
  plugins: [
    // 自动加载模块，而不必到处 import 或 require 。
    new webpack.ProvidePlugin({
      React: 'React'
    }),
  ]
}
```


#### 在 JSX 类型中使用点语法


我们知道 JSX 语法的类型常见用法有两种：

```
import React from 'react'
import Bar from '.bar'

function Foo() {
  return (
    <>
      <div>这是 DOM 节点</div>
      <Bar>这是自定义 React 组件</Bar>
    </>
  )
}
```

这里类型是指 `<` 后面这个元素（即 `div` 或 `Bar`），通常：

* **小写字母开头**的元素表示 HTML 内置的标签，如 `<div>`，它会生成相应的字符串 `'div'` 传递给 `React.createElement()` 作为第一个参数，即 `React.createElement('div')`。

* **大写字母开头**的元素表示引入或自定义的组件。如 `<Bar />` 会编译为 `React.createElement(Bar)`

> 我们理应保持这种习惯。就好比如 ES6 class 语法，其名称应习惯地采用以大写字母开头的标识符。

除了这样之外，还支持点语法。

```jsx
import React from 'react'

const Components = {
  CompA: () => <div>这是函数组件</div>,
  CompB: class CompB extends Component {
    render = () => <div>这是类组件</div>
  }
}

function Foo() {
  return (
    <>
      <Components.CompA />
      <Components.CompB />
    </>
  )
}
```

#### 用户定义的组件必须以大写字母开头

假设不遵循以上大小写的写法，可能会警告，且不会正常渲染。例如：

```jsx
import React from 'react'

function bar(props) {
  return <div>这是函数组件</div>
}

function Foo() {
  return <bar /> // 将无法正常渲染，并抛出警告。
}
```

> Warning: The tag `<bar>` is unrecognized in this browser. If you meant to render a React component, start its name with an uppercase letter.

如果非得这样做的话，可以：

```jsx
import React from 'react'

function bar(props) {
  return <div>这是函数组件</div>
}

function Foo() {
  const Bar = bar
  return <Bar /> // 但我们在 React DevTools 看到的仍是小写的 bar
}
```

> 点语法可以支持以小写字母开头的标识符，但还是不推荐。

#### 在运行时选择类型

不能将通用表达式作为 React 元素类型，例如：


```jsx
import React from 'react'
import { CompA, CompB } from './components'

const comps = {
  a: CompA,
  b: CompB
}

function Foo(props) {
  // ❌ 将会报错，JSX 类型不能是表达式
  return <comps[props.type] />
}
```

如果你想通过通用表达式来（动态）决定元素类型，你需要首先将它赋值给大写字母开头的变量。这通常用于根据 prop 来渲染不同组件的情况下:

```jsx
import React from 'react'
import { CompA, CompB } from './components'

const comps = {
  a: CompA,
  b: CompB
}

function Foo(props) {
  // ✅ JSX 类型可以是大写字母开头的变量。
  const Bar = comps[props.type]
  return <Bar />
}
```

## 二、JSX 中的 props

有多种方式可以在 JSX 中指定 props。

* JavaScript 表达式作为 Props

* 字符串字面量

* Props 默认值为 “True”

* 属性展开

#### JavaScript 表达式作为 Props

```jsx
// ✅ 正确
<Foo bar={1 + 2 + 3 + 4} />
```

请注意，`if`、`for` 等属于语句，不是 JavaScript 表达式，因此不能在 JSX 中直接使用。

#### 字符串字面量

```jsx
<Foo bar="hello" />
// 等价于，推荐上面的写法
<Foo bar={'hello'} />
```

考虑一种情况：

```jsx
function Foo() {
  const str = '<a href="xxx">link</a>'
  return (
    <div>
      {/* 1️⃣ 最终渲染结果是？ */}
      <div>{str}</div>

      {/* 2️⃣ 最终渲染结果是？ */}
      <div dangerouslySetInnerHTML={{ __html: str }} />
    </div>
  )
}
```

对于 `'<a href="xxx">link</a>'` 字符串，若直接设置 HTML 是存在风险的，就是常说[跨站脚本（XXS）](https://en.wikipedia.org/wiki/Cross-site_scripting)攻击的一种方式。在 React 应用中，React 会将上述字符串的敏感字符进行转义为 `&lt;a href=&quot;xxx&quot;&gt;link&lt;/a&gt;`，因此 `<div>{str}</div>` 渲染效果只是一段文本。

同时 React 提供了 [dangerouslySetInnerHTML](https://zh-hans.reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml) 来渲染一个 HTML 元素。例如 2️⃣ 最终会渲染成一个 `<div>` 包裹了一个 `<a>` 标签。

> 想设置 `dangerouslySetInnerHTML` 时，只需要向其传递包含 `key` 为 `__html` 的对象即可。

#### Props 默认值为 “True”

```jsx
<Foo bar />
// 等价于，推荐后者
<Foo bar={true} />
```

通常，我们不建议不传递 value 给 prop，因为这可能与 ES6 对象简写混淆，`{ foo }` 是 `{ foo: foo }` 的简写，而不是 `{ foo: true }`。这样实现只是为了保持和 HTML 中标签属性的行为一致。

#### 属性展开

```jsx
const props = { bar: 1, baz: 2 }

<Foo {...props} />
```

这语法非常的灵活，我们也可以只传递有需要的属性，例如：

```jsx
function Foo() {
  const props = { a: 1, b: 2, c: 3 }
  return <Bar {...props} />
}

function Bar(props) {
  const { a, ...other } = props
  return (
    <div a={a}>
      {/* 只往下传递 b、c 属性 */}
      <button {...other} />
    </div>
  )
}
```

## JSX 中的子元素

包含在开始和结束标签之间的 JSX 表达式内容将作为特定属性 `props.children` 传递给外层组件。


#### 字符串字面量

若子元素为字符串字面量的话，JSX 会做这些处理：**移除行首尾的空格以及空行。与标签相邻的空行均会被删除，文本字符串之间的新行会被压缩为一个空格。**

#### 布尔类型、Null 以及 Undefined 将会忽略

`false`, `null`, `undefined`, and `true` 是合法的子元素。但它们并不会被渲染。以下的 JSX 表达式渲染结果相同：

```jsx
<div />

<div></div>

<div>{false}</div>

<div>{null}</div>

<div>{undefined}</div>

<div>{true}</div>
```

这种有助于，根据特定条件来渲染其他 React 元素。

```jsx
<div>
  {show && <Child1 />}
  <Child2 />
</div>
```

值得注意的是有一些 “falsy” 值，如数字 `0`，仍然会被 React 渲染。例如：

```jsx
<div>
  {/* 当 show 为 0 的时候，将会渲染成 <div>0</div>，而不是 <div></div> */}
  {show && 'other'}
</div>
```

反之，要渲染 false、true、null、undefined 等值，你需要先将它们转换为字符串。例如：

```jsx
<div>{String(undefined)}</div>
```