'use strict'

module.exports = class Component {
  constructor (props) {
    this.props = props
    this.state = {}
  }

  setState (obj) {
    Object.assign(this.state, obj)
  }
}
