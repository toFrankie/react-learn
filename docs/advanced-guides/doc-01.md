# 代码分隔

### 打包

大多数 React 应用都会使用 [Webpack](https://webpack.docschina.org/)、[Rollup](https://rollupjs.org/guide/en/)、[Browserify](https://browserify.org/) 这类的构建工具来打包文件。打包是一个将文件引入合并到一个单独文件的过程，最终形成一个“bundle”。接着在页面上引入该 bundle，整个应用即可一次性加载。

示例

App 文件

```js
// app.js
import { add } from './math.js'

console.log(add(16, 26)) // 42
```

```js
// math.js
export function add(a, b) {
  return a + b
}
```

打包后文件：

```js
function add(a, b) {
  return a + b
}

console.log(add(16, 26)) // 42
```

> 注意：最终你的打包文件看起来会和上面的例子区别很大。

如果你正在使用 [Create React App](https://create-react-app.dev/)、[Next.js](https://nextjs.org/)、[Gatsby](https://www.gatsbyjs.com/)，或者类似的工具，你可以直接使用的 Webpack 配置来构建你的应用。

如果你没有使用这类工具，你就需要自己来进行配置。例如，查看 Webpack 文档上的[安装](https://webpack.docschina.org/guides/installation/)和[入门教程](https://webpack.docschina.org/guides/getting-started/)。

### 代码分割

打包是个非常棒的技术，但随着你的应用增长，你的代码包也随之增长。尤其是在整合了体积巨大的第三方库的情况下。你需要关注你代码中所包含的代码，以避免因体积过大而导致加载时间过长。

为了避免搞出大体积的代码包，在前期就思考该问题并对代码包进行分隔是个不错的选择。代码分隔是诸如 [Webpack](https://webpack.docschina.org/)、[Rollup](https://rollupjs.org/guide/en/) 和 Browserify（[factor-bundle](https://github.com/browserify/factor-bundle)）这类打包器支持的一项技术，能够创建多个包并在运行时动态加载。

对你的应用进行代码分割能够帮助你“懒加载”当前用户所需要的内容，能够显著地提高你的应用性能。尽管并没有减少应用整体的代码体积，但你可以避免加载用户永远不需要的代码，并在初始加载的时候减少所需加载的代码量。

### import()

在你的应用中引入代码分隔的最佳方式是通过动态 `import()` 语法。

使用之前：

```js
import { add } from './math.js'

console.log(add(16, 26))
```

使用之后：

```js
// app.js
import('./math.js').then(math => {
  console.log(math.add(16, 26))
})
```

当 Webpack 解析到该语法时，会自动进行代码分隔。如果你使用 Create React App，该功能已开箱即用，你可以[立即使用](https://create-react-app.dev/docs/code-splitting/)该特性。[Next.js](https://nextjs.org/docs/advanced-features/dynamic-import) 也已支持该特性而无需进行配置。

如果你自己配置 Webpack，你可能要阅读下 Webpack 关于[代码分割](https://webpack.docschina.org/guides/code-splitting/)的指南。你的Webpack 配置应该[类似于此](https://gist.github.com/gaearon/ca6e803f5c604d37468b0091d9959269)。

当你使用 [Babel](https://babeljs.io/) 时，你要确保 Babel 能够解析动态 `import` 语法而不是将其进行转换。对于这一要求你需要 [@babel/plugin-syntax-dynamic-import](https://classic.yarnpkg.com/en/package/@babel/plugin-syntax-dynamic-import) 插件。


### React.lazy

> 注意：`React.lazy` 和 `Suspense` 技术还不支持服务端渲染。如果你想要服务端渲染的应用中使用，我们推荐 [Loadable Compoents](https://github.com/gregberge/loadable-components) 这个库。它有一个很棒的[服务端渲染打包指南](https://loadable-components.com/docs/server-side-rendering/)。

`React.lazy` 函数能让你像渲染常规组件一样处理动态引入（的组件）。

使用之前：

```jsx
import OtherComponent from './OtherComponent'
```

使用之后：

```
const OtherComponent = React.lazy(() => import('./OtherComponent'))
```

此代码将会在组件首次渲染时，自动导入包含 `OtherComponent` 组件的包。

`React.lazy` 接受一个函数，这个函数需要动态调用 `import()`。它必须返回一个 `Promise`，该 `Promise` 需要 `resolve` 一个 `default export` 的 React 组件。

未完待续...