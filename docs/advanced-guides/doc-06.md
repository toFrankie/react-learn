# Fragments

React 中的一个常见模式是一个组件返回多个元素。Fragments 允许你将子列表分组，而无需向 DOM 添加额外节点。

假设我们要使用 React 组件渲染以下这段真实 DOM 节点。

```html
Some text.
<h2>A heading</h2>
More text.
<h2>Another heading</h2>
Even more text.
```

要怎么做呢？很简单，谁都知道...

React.Fragment 是在 React 16.2 新增的新特性，旧版本并不支持。下面我们从几个方面，说明 Fragment 的好处。

## 一、React 16.0 之前

在低于 React 16.0 的版本，类组件或函数组件有很多限制。

比如，它们必须返回 **React 元素**或 `null`。其中 React 元素包括类似 `<MyComponent />` 等自定义组件、类似 `<div />` 等 DOM 节点元素。

正确示例：

```jsx
function MyComponent() {
  // ✅ 合法，也可以是其他 HTML 元素
  return <div>...</div>
}

function MyComponent() {
  // ✅ 合法，返回 React 组件
  return <ChildComponent />
}

function MyComponent() {
  // ✅ 合法，不渲染任何真实 DOM 节点
  return null
}
```

错误示例：

```jsx
function MyComponent() {
  // ❌ 不能返回数组
  return [1, 2, 3].map((item, index) => (
    <div key={index}>{item}</div>
  ))

  // 但注意，下面这种包裹在 {} 内是合法的
  // return (
  //   <div>
  //     {[1, 2, 3].map((item, index) => (
  //       <div key={index}>{item}</div>
  //     ))}
  //   </div>
  // )
}

function MyComponent() {
  // ❌ 一定要有返回值，跟 return null 是两回事
  return undefined
}
```

类组件同理。当不正确使用时，将会报错：
> Warning: MyComponent(...): A valid React element (or null) must be returned. You may have returned undefined, an array or some other invalid object.

这种方案的缺点也是显而易见的，在组件的返回值上，总需要一层 <div>、<span> 或其他 DOM 节点包装起来。当 React 渲染成真实 DOM 时，这个包装节点总是会存在的。

很多时候，往往这个包装节点对我们的 UI 层是没有意义的，反而加深了 DOM 树的层次。但很无奈，谁让我们要用 React 呢，人家语法限制就那样...

## 二、React 16.0 起

除了原来的 React 元素和 `null` 之外，新增了几种类型：

* React 16.0 起支持返回**数组**、**[Protals](https://zh-hans.reactjs.org/docs/portals.html)**、**字符串**、**数值**、**布尔值**。
* React 16.2 起支持返回 **[Fragment](https://zh-hans.reactjs.org/docs/fragments.html)**，个人认为这是对数组形式的一种增强用法。

> 其中**布尔值**和 **`null`** 什么都不渲染，**字符串或数值**类型会渲染为**文本节点**。

例如：

```jsx
function MyComponent() {
  // ✅ 合法，支持数组了，需要添加 key 属性去避免警告
  return [1, 2, 3].map((item, index) => (
    <div key={index}>{item}</div>
  ))

  // 或者是
  // return [
  //   <div key="1">1</div>,
  //   <div key="2">2</div>,
  //   <div key="3">3</div>
  // ]
}

function MyComponent() {
  // ✅ 合法，自 React 16.2 起支持 Fragment 语法，不用像上面一样需要 key 了
  return (
    <React.Fragment>
      <div>1</div>
      <div>2</div>
      <div>3</div>
    </React.Fragment>
  )
}

function MyComponent() {
  // ✅ 合法，最终会渲染为文本节点（注意，不是 <span>some string...</span> 哦）
  return 'some string...'
}
```

相比 React 15.x 及更早版本，这种方式实在是太棒了。除了支持更多类型，最重要的是不会增加额外的节点。

前面提到，React 15.x 里的 React 组件总是避免不了需要一层可能是“无谓”的节点节点进行包装，那么 React 16.0 的改进，可以解决如下场景：

问题示例：

```jsx
function Table() {
  return (
    <table>
      <tbody>
        <tr>
          <Columns />
        </tr>
      </tbody>
    </table>
  )
}

function Columns() {
  // 按照 React 15.x 的语法要求，Columns 组件的返回值，
  // 必须要用一个类似 div 元素等包装起来
  return (
    <div>
      <td>Hello</td>
      <td>World</td>
    </div>
  )
}
```

根据 W3C 的要求，一个合法的 `<table>`，`<tr>` 的子元素必须是 `<td>`。而 React 这种组件的写法直接破坏了 `<table>` 结构，最终也得不到我们的预期结果。


> 一个合法的 <table> 结构应该是这样的，`table > thead/tbody/tfoot > tr > td > div/other`。


如果按照 React 16.x 提供的新特性，可以轻松解决...

```jsx
function Columns() {
  // React.Fragment 最终渲染为真实 DOM 并不会产生任何 DOM 节点，
  // 因此，不会破坏 <table> 的结构了。（数组形式也是可以的）
  return (
    <React.Fragment>
      <td>Hello</td>
      <td>World</td>
    </React.Fragment>
  )
}
```

## 三、Fragment

自 React 16.2 起，开始支持 React.Fragment 语法。前面提到该特性是对数组形式的一种增强用法。

#### 语法

它的语法非常简单，把它是 React 内置的一个 React 组件。

```jsx
<React.Fragment>
  // One or more child elements
</React.Fragment>
```

`key` 是唯一可以传递给 Fragment 的属性。将来可能会添加对其他属性的支持，例如事件处理程序。

```jsx
class App extends React.Component {
  state = {
    items: [
      {
        id: '`2`',
        name: '计算机',
        description: '用来计算的仪器...'
      },
      {
        id: '2',
        name: '显示器',
        description: '以视觉方式显示信息的装置...'
      }
    ]
  }

  render() {
    return <Glossary items={this.state.items} ></Glossary>
  }
}

function Glossary(props) {
  return (
    <dl>
      {props.items.map(item => (
        // 没有 `key`，React 会发出一个关键警告
        <React.Fragment key={item.id}>
          <dt>{item.name}</dt>
          <dd>{item.description}</dd>
        </React.Fragment>
      ))}
    </dl>
  )
}
```

也可以使用它的简写语法 `<></>`，但这种写法不接受任意属性，包括 `key`。

> JSX 中的片段语法受到现有技术的启发，例如 [E4X](https://developer.mozilla.org/en-US/docs/Archive/Web/E4X/E4X_for_templating) 中的 `XMLList() <></>` 构造函数。使用一对空标签是为了表示它不会向 DOM 添加实际元素的想法。

#### 对比

回到文章开头的示例，要渲染这样一段真实 DOM 节点。

```html
Some text.
<h2>A heading</h2>
More text.
<h2>Another heading</h2>
Even more text.
```

前面提到，可以有几种解决方案，各有利弊。

**解决方法一**

低于 React 16.0 版本，由于不支持 Fragment 和数组形式，唯一的方法是将它们包装在一个额外的元素中，通常是 `div` 或 `span`。如下：

```jsx
function MyComponent() {
  return (
    <div>
      Some text.
      <h2>A heading</h2>
      More text.
      <h2>Another heading</h2>
      Even more text.
    </div>
  )
}
```

但上述这种方法有个缺点，在渲染成真实 DOM 的时候，会增加一个节点，比如上述的 `<div />`。

**解决方法二**

自 React 16.0 起，支持数组形式。因此可以这么做：

```jsx
function MyComponent() {
  return [
    'Some text.',
    <h2 key="heading-1">A heading</h2>,
    'More text.',
    <h2 key="heading-2">Another heading</h2>,
    'Even more text.'
  ]
}
```

这种方式有点麻烦，我们对比一下 Fragment 形式。

**解决方法三（推荐）**

自 React 16.2 起，支持 React.Fragment 语法，因此我们可以这样使用。

```jsx
function MyComponent() {
  return (
    <React.Fragment>
      Some text.
      <h2>A heading</h2>
      More text.
      <h2>Another heading</h2>
      Even more text.
    </React.Fragment>
  )
}
```

仔细对比数组和 Fragment 形式，可以发现数组形式有以下缺点：

* 数组中的子项必须用逗号分隔。
* 数组中的 children 必须有一个 key 来防止 React 的 key 警告。
* 字符串必须用引号括起来。

以上这些限制 Fragment 统统都没有，我们就按正常的思维去编写 DOM 节点就好了。



## 四、References

* [Fragments](https://react.docschina.org/docs/fragments.html)
* [React v16.0](https://reactjs.org/blog/2017/09/26/react-v16.0.html#new-render-return-types-fragments-and-strings)
* [React v16.2.0: Improved Support for Fragments](https://reactjs.org/blog/2017/11/28/react-v16.2.0-fragment-support.html)
