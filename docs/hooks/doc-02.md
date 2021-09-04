 # State Hook

考虑以下场景：

```jsx
function Counter(props) {
  const [obj, setObj] = useState({ num: 0 })

  const handler = () => {
    obj.num += 1
    setObj(obj)
  }

  return (
    <div>
      <p>You clicked {obj.num} times</p>
      <button onClick={handler}>Click</button>
    </div>
  )
}
```

我们发现点击按钮，页面并不会更新，但是 `obj` state 是确确实实在递增的。如果通过其他途径来触发 UI 的更新，`obj.num` 的改变会体现出来。这种情况通常会使用解构方式解决。