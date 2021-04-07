### 函数组件与 class 组件

定义组件最简单的方式就是编写 JavaScript 函数：

```jsx
function Welcome（props) {
  return <h1>Hello, {props.name}</h1>
}
```

该函数是一个有效的 React 组件，因为它接收唯一带有数据的“props”（代表属性）对象与并返回一个 React 元素。这类组件被称为“函数组件”，因为它本质上就是 JavaScript 函数。

你同时还可以使用 ES6 的 class 来定义组件：

```jsx
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>
  }
}
```

上述两个组件在 React 里是等效的。