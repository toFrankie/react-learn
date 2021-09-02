# 高阶组件

高阶组件（HOC）是 React 中用于复用组件逻辑的一种高级技巧。HOC 自身不是 React API 的一部分，它是一种基于 React 的组合特性而形成的设计模式。

具体而言，**高阶函数是参数为组件，返回值为新组件的函数。**

```jsx
const EnhancedComponent = higherOrderComponent(WrappedComponent)
```

组件是将 props 转换为 UI，而高阶组件是将组件转换为另一个组件。

HOC 在 React 的第三方库中很常见，例如 Redux 的 [connect](https://github.com/reduxjs/react-redux/blob/master/docs/api/connect.md#connect) 和 Relay 的 [createFragmentContainer](https://relay.dev/docs/v10.1.3/fragment-container/#createfragmentcontainer)。

## 高阶函数

* 不要改变原始组件，使用组合。
  修改传入组件的 HOC 是一种糟糕的抽象方式。

* 将不相关的 props 传递给被包裹的组件
  HOC 应该透传与自身无关的 props。

* 最大化可组合性

* 包装显示名称以便轻松调试

注意事项：

* 不要在 render 方法中使用 HOC
* 务必复制静态方法