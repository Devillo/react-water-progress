import React, { Component } from 'react'
import Progress from '../component/progress'

class Main extends Component {
  constructor (props) {
    super(props)

    this.state = {
      value: 0.2
    }
  }

  render () {
    const { value } = this.state
    return (
      <div className='progress-demo'>
        <Progress value={value} />
        <span onClick={this.handleClick}>change</span>
      </div>
    )
  }

  handleClick = () => {
    const oldValue = this.state.value
    this.setState({
      value: oldValue + 0.05
    })
  }
}

export default Main
