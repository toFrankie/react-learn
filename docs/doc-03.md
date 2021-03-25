### 元素渲染

元素是构成 React 应用最小的砖块。

```jsx
const element = <h1>Hello World</h1>
```

与浏览器的 DOM 元素不同，React 元素是创建开销极小的普通对象。React DOM 会负责更新 DOM 来与 React 元素保持一致。

> 这里有可能会将元素和另外一个熟知的概念“组件”混淆。[后面](https://github.com/toFrankie/react-learn/blob/main/docs/doc-04.md)会讲到。


##### 将一个元素渲染为 DOM

假设你的 HTML 文件某处有一个 `<div>`：

```html
<div id="root"></div>
```

我们将其称为“根” DOM 节点，因为该节点内所有内容都将由 React DOM 管理。

仅使用 React 来构建的应用通常只有一个单一的根 DOM 节点。如果你在将 React 集成进一个已有应用，那么你可以在应用中包含任意多的独立根 DOM 节点。

想要将一个 React 元素渲染到根 DOM 节点，只需要把它们传入 `ReactDOM.render()`：

```jsx
const element = <h1>Hello World</h1>
ReactDOM.render(element, document.getElementById('root'))
```

##### 更新已渲染的元素

React 元素是[不可变对象]()，一旦被创建，你就无法更改它的子元素或者属性。一个元素就像电影的单帧：它代表了某个特定时刻的 UI。

根据我们已有的只是，更新 UI 唯一的方式是创建一个全新的元素，并将其传入 [ReactDOM.render()](https://zh-hans.reactjs.org/docs/react-dom.html#render).

考虑一个计算器的例子：

```jsx
function tick() {
  const element = (
    <div>
      <h1>Hello world</h1>
      <h2>It is {new Date().toLocaleTimeString()}.</h2>
    </div>
  )
  ReactDOM.render(element, document.getElementById('root'))
}
```

这个例子会在 `setInterval()` 回调函数，每秒都调用 `ReactDOM.render()`。

> 注意：在实践中，大多数 React 应用只会调用一次 `ReactDOM.render()`。在下一个章节，我们将学习如何将这些代码封装到有状态组件中。

##### React 只更新它需要更新的部分

React DOM 会将元素和它的子元素与它们之前的状态进行比较，并只会进行必要的更新来使 DOM 达到预期的状态。

你可以使用浏览器的检查元素工具查看来确认这一点。

```html
<div id="create">
  <div>
    <h1>Hello world</h1>
    <!-- 实际改变的内容只是以下这部分 -->
    <h2>It is 下午10:44:18.</h2>
  </div>
</div>
```

尽管每一秒我们都会新建一个描述整个 UI 树的元素，React DOM 只会更新实际改变了的内容，也就是例子中的文本节点。

根据我们的经验，应该专注于 UI 在任意给定时刻的状态，而不是一视同仁地随着时间修改整个界面。


##### ReactDOM.render

语法

```jsx
ReactDOM.render(element, container[, callback])
```

在提供的 `container` 里渲染一个 React 元素，并返回对该组件的引用（或者针对无状态组件返回 `null`）。

如果 React 元素之前已经在 `container` 里渲染过，这将会对其执行更新操作，并仅会在必要时改变 DOM 以映射最新的 React 元素。

如果提供了可选的回调函数，该回调将在组件被渲染或更新之后被执行。

> **注意：**
>
> `ReactDOM.render()` 会控制你传入容器节点里的内容。当首次调用时，容器节点里的所有 DOM 元素都会被替换，后续的调用则会使用 React 的 DOM 差分算法（DOM diffing algorithm）进行高效的更新。
>
> `ReactDOM.render()` 不会修改容器节点（只会修改容器的子节点）。可以在不覆盖现有子节点的情况下，将组件插入已有的 DOM 节点中。
>
> `ReactDOM.render()` 目前会返回对根组件 `ReactComponent` 实例的引用。 但是，目前应该避免使用返回的引用，因为它是历史遗留下来的内容，而且在未来版本的 React 中，组件渲染在某些情况下可能会是异步的。 如果你真的需要获得对根组件 `ReactComponent` 实例的引用，那么推荐为根元素添加 [callback ref](https://zh-hans.reactjs.org/docs/refs-and-the-dom.html#the-ref-callback-attribute)。
>
> 使用 `ReactDOM.render()` 对服务端渲染容器进行 `hydrate` 操作的方式已经被废弃，并且会在 React 17 被移除。作为替代，请使用 `hydrate()`。

##### 看源码

```js
function render(element, container, callback) {
  // 判断参数 container 是否为 DOM 节点，否则抛出异常
  if (!isValidContainer(container)) {
    {
      throw Error( "Target container is not a DOM element." );
    }
  }

  {
    var isModernRoot = isContainerMarkedAsRoot(container) && container._reactRootContainer === undefined;

    if (isModernRoot) {
      error('You are calling ReactDOM.render() on a container that was previously ' + 'passed to ReactDOM.createRoot(). This is not supported. ' + 'Did you mean to call root.render(element)?');
    }
  }

  return legacyRenderSubtreeIntoContainer(null, element, container, false, callback);
}
```

```js
function legacyRenderSubtreeIntoContainer(parentComponent, children, container, forceHydrate, callback) {
  {
    topLevelUpdateWarnings(container);
    warnOnInvalidCallback$1(callback === undefined ? null : callback, 'render');
  }

  // TODO: Without `any` type, Flow says "Property cannot be accessed on any
  // member of intersection type." Whyyyyyy.
  var root = container._reactRootContainer;
  var fiberRoot;

  if (!root) {
    // Initial mount
    root = container._reactRootContainer = legacyCreateRootFromDOMContainer(container, forceHydrate);
    fiberRoot = root._internalRoot;

    if (typeof callback === 'function') {
      var originalCallback = callback;

      callback = function () {
        var instance = getPublicRootInstance(fiberRoot);
        originalCallback.call(instance);
      };
    } // Initial mount should not be batched.


    unbatchedUpdates(function () {
      updateContainer(children, fiberRoot, parentComponent, callback);
    });
  } else {
    fiberRoot = root._internalRoot;

    if (typeof callback === 'function') {
      var _originalCallback = callback;

      callback = function () {
        var instance = getPublicRootInstance(fiberRoot);

        _originalCallback.call(instance);
      };
    } // Update


    updateContainer(children, fiberRoot, parentComponent, callback);
  }

  return getPublicRootInstance(fiberRoot);
}
```