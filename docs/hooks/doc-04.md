# 自定义 Hook

推荐一个仓库，里面包含很多有趣的自定义 Hooks：[react-use](https://github.com/streamich/react-use)。


自定义 Hook 是一种自然遵循 Hook 设计的约定，而并不是 React 的特性。

#### 自定义 Hook 必须以 “use” 开头吗？

必须如此。这个约定非常重要。不遵循的话，由于无法判断某个函数是否包含对其内部 Hook 的调用，React 将无法自动检查你的 Hook 是否违反了 Hook 的规则。

#### 在两个组件中使用相同的 Hook 会共享 state 吗？

不会。自定义 Hook 是一种重用状态逻辑的机制(例如设置为订阅并存储当前值)，所以每次使用自定义 Hook 时，其中的所有 state 和副作用都是完全隔离的。

#### 自定义 Hook 如何获取独立的 state？

每次调用 Hook，它都会获取独立的 state。由于我们直接调用了 `useFriendStatus`，从 React 的角度来看，我们的组件只是调用了 `useState` 和 `useEffect`。 正如我们在之前章节中了解到的一样，我们可以在一个组件中多次调用 `useState` 和 `useEffect`，它们是完全独立的。

