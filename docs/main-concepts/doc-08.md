# 列表 & Key

首先，让我们看下在 JavaScript 中如何转化列表。

如下代码，我们使用 `map()` 函数让数组中的每一项变双倍，然后得到了一个新的列表 `doubled` 并打印出来：

```js
const numbers = [1, 2, 3, 4, 5]
const doubled = numbers.map(number => number * 2)
console.log(doubled)
```

代码打印出 `[2, 4, 6, 8, 10]`。

在 React 中，把数组转化为[元素](https://github.com/toFrankie/react-learn/blob/main/docs/doc-03.md)列表的过程是很相似的。

### 渲染多个组件

你可以使用 `{}` 在 JSX 内构建一个[元素集合](https://react.docschina.org/docs/introducing-jsx.html#embedding-expressions-in-jsx)。

下面，我们使用 JavaScript 中的 `map()` 方法来遍历 `numbers` 数组。将数组中的每个元素变成 `<li>` 标签，最后我们将得到的数组赋值给 `listItems`：

```jsx
const numbers = [1, 2, 3, 4, 5]
const listItems = numbers.map(number => <li>{number}</li>)
```

我们把整个 `listItems` 插入到 `<ul>` 元素中，然后[渲染进 DOM](https://react.docschina.org/docs/rendering-elements.html#rendering-an-element-into-the-dom)：

```jsx
ReactDOM.render(<ul>{listItems}</ul>, document.getElementById('root'))
```

这段代码生成了一个 1 到 5 的项目符号列表。

### 基础列表组件

通常你需要在一个组件中渲染列表。

我们可以把前面的例子重构成一个组件，这个组件接收 `numbers` 数据作为参数并输出一个元素列表。

```jsx
function NumberList(props) {
  const { numbers } = props
  const listItems = numbers.map(number => <li>{number}</li>)
  return (
    <ul>{listItems}<ul>
  )
}

const numbers = [1, 2, 3, 4, 5]
ReactDOM.render(
  <NumberList numbers={numbers}/>,
  document.getElementById('root')
)
```

当我们运行这段代码，将会看到一个警告 `a key should be provided for list items`，意思是当你创建一个元素时，必须包括一个特殊的 `key` 属性。我们将在下一节讨论这是为什么？

让我们来给每个列表元素分配一个 `key` 属性来解决上面的那个警告：

```jsx
function NumberList(props) {
  const { numbers } = props
  const listItems = numbers.map(number => <li key={number.toString()}>{number}</li>)
  return (
    <ul>{listItems}<ul>
  )
}

const numbers = [1, 2, 3, 4, 5]
ReactDOM.render(
  <NumberList numbers={numbers}/>,
  document.getElementById('root')
)
```

### key

`key` 帮助 React 识别哪些元素改变了，比如添加或删除。因此你应当给数组中的每一个元素赋予一个确定的标识。

```jsx
const { numbers } = props
const listItems = numbers.map(number => <li key={number.toString()}>{number}</li>)
```

一个元素的 `key` 最好是这个元素在列表中拥有的一个独一无二的字符串。通常，我们使用数据中的 `id` 作为元素的 `key`：

```jsx
const todoItems = todos.map(todo => <li key={todo.id}>{todo.text}</li>)
```

当元素没有确定的 `id` 的时候，万不得已你可以使用元素索引 `index` 作为 `key`：

```jsx
const todoItems = todos.map((todo, index) => (
  // Only do this if items have no stable IDs
  <li key={index}>{todo.text}</li>
))
```

如果列表项目的顺序可能会变化，我们不建议使用索引值来用作 `key` 值，因为这样做会导致性能变差，还可能引起组件状态的问题。可以看看 Robin Pokorny 的[深度解析使用索引作为 key 的负面影响](https://robinpokorny.medium.com/index-as-a-key-is-an-anti-pattern-e0349aece318)这一篇文章。**如果你选择不指定显式的 `key` 值，那么 React 将默认使用索引作为列表项目的 `key` 值。**

要是你有兴趣了解更多的话，这里有一篇文章[深入解释为什么 key 是必须的](https://react.docschina.org/docs/reconciliation.html#recursing-on-children)可以参考。

### 用 key 提取组件

元素的 `key` 只有放在就近的数组上下文中才有意义。

比如说，如果你提取出一个 `ListItem` 组件，你应该把 `key` 保留在数组深红的这个 `<ListItem />` 元素上，而不是放在 `ListItem` 组件中的 `<li>` 元素上。

例子：不正确的使用 `key` 的方式

```jsx
function ListItem(props) {
  const { value } = props
  return (
    // 错误：你不需要在这里指定 key
    <li key={value.toString()}>{value}</li>
  )
}

function NumberList(props) {
  const { numbers } = props
  const listItems = numbers.map(number =>
    // 错误：元素的 key 应该在这里指定
    <ListItem value={number}>
  )
  return (
    <ul>{listItems}<ul>
  )
}

const numbers = [1, 2, 3, 4, 5]
ReactDOM.render(
  <NumberList numbers={numbers}/>,
  document.getElementById('root')
)
```

例子：正确的使用 `key` 的方式

```jsx
function ListItem(props) {
  const { value } = props
  return (
    // 正确：你不需要指定 key
    <li>{value}</li>
  )
}

function NumberList(props) {
  const { numbers } = props
  const listItems = numbers.map(number =>
    // 正确：key 应该在数组的上下文中被指定
    <ListItem key={number.toString()} value={number}>
  )
  return (
    <ul>{listItems}<ul>
  )
}

const numbers = [1, 2, 3, 4, 5]
ReactDOM.render(
  <NumberList numbers={numbers}/>,
  document.getElementById('root')
)
```

> **一个好的经验法则是：在 `map()` 方法中的元素需要设置 `key` 属性。**

### key 只是在兄弟节点之间必须唯一

数组元素中使用的 `key` 在其兄弟节点之间应该是独一无二的。然而，它们不需要是全局唯一的。当我们生成两个不同的数组时，我们可以使用相同的 `key` 值：

```jsx
function Blog(props) {
  const { posts } = props
  const sidebar = (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )

  const content = posts.map(post => (
    <div key={post.id}>
      <h3>{post.title}</h3>
      <p>{post.content}</p>
    </div>
  ))

  return (
    <div>
      {sidebar}
      <hr />
      {content}
    </div>
  )
}

const posts = [
  { id: 1, title: 'Hello World', content: 'Welcome to learning React!' },
  { id: 2, title: 'Installation', content: 'You can install React from npm.' },
]
ReactDOM.render(<Blog posts={posts} />, document.getElementById('root'))
```

`key` 会传递信息给 React，但不会传递你的组件。如果你的组件中需要使用 `key` 属性的值，请使用其他属性名显式传递这个值：

```jsx
const content = posts.map(post => <Post key={post.id} id={post.id} title={post.title} />)
```

上面例子中，`Post` 组件可以读出 `props.id`，但是不能读出 `props.key`。除了 `key` 之外，不能被 `props` 读出的属性还有：`ref`、`__self`、`__source`。

### 在 JSX 中嵌入 map()

在上面的例子中，我们声明了一个单独的 `listItems` 变量并将其包含在 JSX 中：

```jsx
function NumberList(props) {
  const { numbers } = props
  const listItems = numbers.map(number =>
    <ListItem key={number.toString()} value={number}>
  )
  return (
    <ul>{listItems}<ul>
  )
}
```

JSX 允许在大括号中[嵌入任何的表达式](https://react.docschina.org/docs/introducing-jsx.html#embedding-expressions-in-jsx)，所以我们可以内联 `map()` 返回的结果：

```jsx
function NumberList(props) {
  const { numbers } = props

  return (
    <ul>
      {numbers.map(number => <ListItem key={number.toString()} value={number}>}
    <ul>
  )
}
```

这么做有时可以使你的代码更清晰，但有时这种风格也会被滥用。就像在 JavaScript 中一样，合适需要为了可读性提取出一个变量，这完全取决于你。但请记住，如果一个 `map()` 嵌套了太多层级，你可能就是你[提取组件](https://react.docschina.org/docs/components-and-props.html#extracting-components)的一个好时机。