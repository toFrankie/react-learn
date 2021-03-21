'use strict'

const { createElement, Component } = React

class LikeButton extends Component {
  constructor(props) {
    super(props)
    this.state = {
      liked: false
    }
  }

  render() {
    if (this.state.liked) {
      return 'You liked this.'
    }

    return createElement(
      'button',
      {
        onClick: () => this.setState({ liked: true })
      },
      'Like'
    )
  }
}

document.querySelectorAll('.like_button_container').forEach(domContainer => {
  // Read the comment ID from a data-* attribute.
  const commentID = parseInt(domContainer.dataset.commentid, 10)
  ReactDOM.render(
    createElement(LikeButton, { commentID: commentID }),
    domContainer
  )
})