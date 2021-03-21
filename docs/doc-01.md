React 实现了一套与浏览器无关的 DOM 系统，兼顾了性能和跨浏览器的兼容性。

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


### 参考

* [Using Babel](https://babeljs.io/setup)