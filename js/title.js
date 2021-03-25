class Title extends React.Component {
  render() {
    return (
      React.createElement(
        'h1',
        null,
        this.props.text
      )
    )
  }
}

ReactDOM.render(
  React.createElement(Title, {text: '标题'}),
  document.querySelector('#create')
)