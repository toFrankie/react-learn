React 实现了一套与浏览器无关的 DOM 系统，兼顾了性能和跨浏览器的兼容性。

### React 元素与普通 DOM 元素的差异

在 React 中，所有 DOM 属性和属性（包括事件处理程序）都应该是 camelCased 的。

例如，HTML 属性 `tabindex` 对应 React 中的属性 `tabIndex`。唯一例外的是 `aria-*` 和 `data-*` 属性，应小写。例如，你可以继续 `aria-label` 作为 `aria-label`。

##### 1. 属性差异

React 和 HTML 之间有许多不同的属性：

* checked

该 `checked` 属性由 `<input>` 类型 `checkbox` 或者组件支持 `radio`。你可以使用它来设置组件是否被选中。这对于构建受控组件非常有用。`defaultChecked` 是不受控制的等价物，用于设置组件是否在第一次安装时进行检查。

* className

要指定一个 CSS 类，请使用该 `className` 属性。这适用于所有常规的 DOM 和 SVG 元素用于 `<div>`、`<a>` 和其他。

如果你使用 Web 组件的反应（这是不常见的），请改用 `class` 属性。

* dangerouslySetInnerHTML

`dangerouslySetInnerHTML` 是 React `innerHTML` 在浏览器 DOM 中使用的替代品。一般来说，从代码中设置 HTML 是有风险的，因为很容易让你的用户无意中发现跨站脚本攻击（XSS）。因此，你可以从 React 中设置 HTML，但您必须输入 `dangerouslySetInnerHTML` 并使用 `__html` 密钥传递对象，以提醒自己危险。例如：

```jsx
function createMarkup() {
  return { __html: 'First &middot; Second' }
}

function MyComponent() {
  return <div dangerouslySetInnerHTML={createMarkup()} />
}
```

* htmlFor

既然 `for` 是 JavaScript 中的保留字，React 元素就会用到 `htmlFor`。

### 如何支持 JSX 语法？

如果在浏览器端直接 JSX 语法，需要引入 babel 的 JSX 解析器，将 JSX 转化为 JS 语法。同时引入 babel 后，你就可以使用 ES6+ 语法，babel 会帮你把新的 ES6+ 语法特性转化为 ES5 语法，以兼容更多的浏览器。

> 需要注意的地方：
> 1. `<script>` 标签的 `type` 属性为 `text/babel`，这是 React 独有的 JSX 语法，跟 JavaScript 不兼容。凡是在页面中直接使用 JSX 的地方，都要加上 `type="text/babel"`。
>
> 2. 一共用了三个库：`react.js` 、`react-dom.js` 和 `babel.min.js`，它们必须首先加载。其中，`react.js` 是 React 的核心库，`react-dom.js` 是提供与 DOM 相关的功能，`babel.js` 的作用是将 JSX 语法转为 JavaScript 语法。
> 3. 关于 `jsxtransformer.js`、`browser.js` 以及 `babel.js` 的关系可以看下这篇[文章](https://blog.csdn.net/u013451157/article/details/78946375)。

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
  </head>
  <body>
    <!-- Load React. -->
    <script src="react/react.development.js"></script>
    <script src="react/react-dom.development.js"></script>
    <!-- Load Babel. -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <!-- Your custom script here. -->
    <script type="text/babel">
      // ...
    </script>
  </body>
</html>
```

**以上这种方式并不适用于生产环境，仅用于学习和创建简单的示例，它会使你的网站变慢。**

### JSX 语法

我们来看看适用两种不同的语法来声明一个 React 元素：

```js
// 原生 js
const element = React.createElement(
  'h1',
  null,
  'Hello, world!'
)
```

```jsx
// jsx
const element = <h1>Hello, world!</h1>
```

上面的两段示例是等价的，虽然 jsx 完全是可选的，显然使用 jsx 语法会更简洁，可读性更好。


### 参考

* [Using Babel](https://babeljs.io/setup)