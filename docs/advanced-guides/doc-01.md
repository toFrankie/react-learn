# 代码分隔

### 打包

大多数 React 应用都会使用 Webpack、Rollup、Browserify 这类的构建工具来打包文件。打包是一个将文件引入合并到一个单独文件的过程，最终形成一个“bundle”。接着在页面上引入该 bundle，整个应用即可一次性加载。

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