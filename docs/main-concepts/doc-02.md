# React.createElement 源码

今天来介绍一下 `React.createElement()` 方法

### React.createElement

> 👉 [中文](https://zh-hans.reactjs.org/docs/react-api.html#createelement) or [英文](https://reactjs.org/docs/react-api.html#createelement)文档

React 不强制要求使用 JSX，每个 JSX 元素只是调用 `React.createElement(type, [props], [...children])` 的语法糖。因此，使用 JSX 可以完成的任何事情都可以通过纯 JavaScript 完成。

语法：
```js
React.createElement(
  type,
  [props],
  [...children]
)
```

* `type` 可以是标签名字符串（如 div 或 span 等），也可以是 React 组件类型（class 组件或函数组件），或者是 React fragment 类型。

* `props` 可选，组件属性

* `children` 可选，子元素。含有多个子元素时，最终 React Element 的 `props.children` 会返回一个数组。

例如：使用 JSX 编写代码：

```jsx
class Hello extends React.Component {
  render() {
    return <div>Hello {this.props.toWhat}</div>
  }
}

ReactDOM.render(
  <Hello toWhat="World" />,
  document.getElementById('root')
)
```

也可以编写不使用 JSX 的代码：

```js
class Hello extends React.Component {
  render() {
    return React.createElement(
      'div',
      null,
      `Hello ${this.prorps.toWhat}`
    )
  }
}

ReactDOM.render(
  React.createElement(Hello, { toWhat: 'World' }, null),
  document.getElementById('root')
)
```

如果你想了解更多 JSX 转换为 JavaScript 的示例，可以尝试使用[在线 Babel 编译器](https://babeljs.io/repl/#?presets=react&code_lz=GYVwdgxgLglg9mABACwKYBt1wBQEpEDeAUIogE6pQhlIA8AJjAG4B8AEhlogO5xnr0AhLQD0jVgG4iAXyJA)。


### 看源码

```js
function createElement(type, config, children) {
  var propName;

  // Reserved names are extracted
  var props = {};

  // 一些保留的属性
  var key = null;
  var ref = null;
  var self = null;
  var source = null;

  // 提取 key、ref、self、source、prop
  if (config != null) {
    // 将合法的 ref 赋值给 ref 变量
    if (hasValidRef(config)) {
      ref = config.ref;

      {
        warnIfStringRefCannotBeAutoConverted(config);
      }
    }

    // 将合法的 key 转换为字符串类型，并赋值给变量 key
    if (hasValidKey(config)) {
      key = '' + config.key;
    }

    self = config.__self === undefined ? null : config.__self;
    source = config.__source === undefined ? null : config.__source;

    // Remaining properties are added to a new props object
    // 将 config 中除 key、ref、__self、__source 之外的 prop 提取出来，并放入 props 变量中
    for (propName in config) {
      if (hasOwnProperty$1.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
        props[propName] = config[propName];
      }
    }
  }

  // Children can be more than one argument, and those are transferred onto
  // the newly allocated props object.
  // 入参的前两个 type 和 config，剩余的都是 children 参数。所以减 2
  var childrenLength = arguments.length - 2;

  if (childrenLength === 1) {
    // 只有一个子元素时，直接挂到 props.children 下（非数组形式）
    props.children = children;
  } else if (childrenLength > 1) {
    // 子元素多于一个时，将它们都放入数组中，然后挂到 props.children 下（数组形式）
    var childArray = Array(childrenLength);

    for (var i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }

    {
      // 冻结子元素列表
      if (Object.freeze) {
        Object.freeze(childArray);
      }
    }

    props.children = childArray;
  }

  // Resolve default props
  // 取出组件类（即 type 不为字符串的情况）中的静态属性 defaultProps，并给未在 JSX 中设置值的属性设置默认值。
  if (type && type.defaultProps) {
    var defaultProps = type.defaultProps;

    for (propName in defaultProps) {
      // 注意下，若属性值为 null 并不会触发设置默认值的处理，仅 undefined。
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }

  {
    // 以下步骤主要是避免一些保留属性被错误取到，提供警告
    if (key || ref) {
      var displayName = typeof type === 'function' ? type.displayName || type.name || 'Unknown' : type;

      if (key) {
        defineKeyPropWarningGetter(props, displayName);
      }

      if (ref) {
        defineRefPropWarningGetter(props, displayName);
      }
    }
  }

  // 调用 ReactElement 构建元素，并返回
  // type 是直接透传的，
  // key、ref 等等都是从 config 里面解析出来的，props 是除去一些保留属性之外在 config 上读取的属性
  // children 是子元素，多个时返回数组
  return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
}
```

接着看 ReactElement 源码：

```js
/**
 * Factory method to create a new React element. This no longer adheres to
 * the class pattern, so do not use new to call it. Also, instanceof check
 * will not work. Instead test $$typeof field against Symbol.for('react.element') to check
 * if something is a React Element.
 *
 * @param {*} type
 * @param {*} props
 * @param {*} key
 * @param {string|object} ref
 * @param {*} owner
 * @param {*} self A *temporary* helper to detect places where `this` is
 * different from the `owner` when React.createElement is called, so that we
 * can warn. We want to get rid of owner and replace string `ref`s with arrow
 * functions, and as long as `this` and owner are the same, there will be no
 * change in behavior.
 * @param {*} source An annotation object (added by a transpiler or otherwise)
 * indicating filename, line number, and/or other information.
 * @internal
 */
var ReactElement = function (type, key, ref, self, source, owner, props) {
  // 我们暂时把下面的代码折叠，可以看到 ReactElement 方法最后返回的就是 element 对象
  var element = {
    // This tag allows us to uniquely identify this as a React Element
    // 通过这个标签来识别react的元素（一个 Symbol）
    $$typeof: REACT_ELEMENT_TYPE,

    // Built-in properties that belong on the element
    // 内置属性
    type: type,
    key: key,
    ref: ref,
    props: props,

    // Record the component responsible for creating this element.
    // 记录创建该组件的组件
    _owner: owner
  };

  {
    // The validation flag is currently mutative. We put it on
    // an external backing store so that we can freeze the whole object.
    // This can be replaced with a WeakMap once they are implemented in
    // commonly used development environments.
    // 这个验证标志是可变的，我们把这个放在外部支持存储，以便我们能够冻结整个对象，
    element._store = {};

    // To make comparing ReactElements easier for testing purposes, we make
    // the validation flag non-enumerable (where possible, which should
    // include every environment we run tests in), so the test framework
    // ignores it.
    // 为了更加方便地进行测试，我们设置了一个不可枚举的验证标志位，以便测试框架忽略它
    // 给 _store 设置 validated 属性 false
    Object.defineProperty(element._store, 'validated', {
      configurable: false,
      enumerable: false,
      writable: true,
      value: false
    });

    // self and source are DEV only properties.
    // self 和 source 都是开发环境才存在的
    Object.defineProperty(element, '_self', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: self
    });

    // Two elements created in two different places should be considered
    // equal for testing purposes and therefore we hide it from enumeration.
    // 两个再不同地方创建的元素从测试的角度来看是相等的，我们在列举的时候忽略他们
    Object.defineProperty(element, '_source', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: source
    });

    // 如果 Object 有 freeze 的实现，我们冻结元素和它的属性
    if (Object.freeze) {
      Object.freeze(element.props);
      Object.freeze(element);
    }
  }

  return element;
};
```

注意，React 内部是使用 `$$typeof` 来判断 react 元素的类型的。使用 `_store` 来记录内部的状态，后面会有用到。为了方便测试框架，`_store` 中定义了不可配置不可枚举的 `validated` 属性。类似的，框架内部定义了 `self` 和 `source` 的副本 `_self` 和 `_source`，他们都是不可配置不可枚举不可写的。