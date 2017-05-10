import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { CLASS_PREFIX, createElementNS, setAttributes, setStyles } from '../configs'
import './progress.styl'

/**
 * Progress 样式
 * PROGRESS_CLASS 基本样式
 * PROGRESS_WAVE 波浪样式
 * PROGRESS_WAVE_LEFT 左波浪样式
 * PROGRESS_WAVE_RIGHT 右波浪样式
 * PROGRESS_BUBBLE 气泡样式
 * PROGRESS_BOMB 爆炸样式
 * PROGRESS_BOMB_TOP 爆照上线条样式
 * PROGRESS_BOMB_RIGHT 爆照右线条样式
 * PROGRESS_BOMB_BOTTOM 爆照下线条样式
 * PROGRESS_BOMB_LEFT 爆照左线条样式
 */
const PROGRESS_CLASS = CLASS_PREFIX + 'progress'
const PROGRESS_WAVE = PROGRESS_CLASS + '-wave'
const PROGRESS_WAVE_LEFT = PROGRESS_WAVE + '-left'
const PROGRESS_WAVE_RIGHT = PROGRESS_WAVE + '-right'
const PROGRESS_BUBBLE = PROGRESS_CLASS + '-bubble'
const PROGRESS_BOMB = PROGRESS_CLASS + '-bomb'
const PROGRESS_BOMB_TOP = PROGRESS_BOMB + '-top'
const PROGRESS_BOMB_RIGHT = PROGRESS_BOMB + '-right'
const PROGRESS_BOMB_BOTTOM = PROGRESS_BOMB + '-bottom'
const PROGRESS_BOMB_LEFT = PROGRESS_BOMB + '-left'

class Water extends Component {
  constructor (props) {
    super(props)

    const { value } = props

    this.state = {
      svgWidth: 300,
      svgHeight: 330,
      height: 300,
      value,
      changeValue: value
    }
  }

  componentDidMount = () => {
    this.draw()
  }

  componentWillReceiveProps = (nextProps) => {
    const newValue = nextProps.value > 1 ? 1 : nextProps.value
    const oldValue = this.state.value

    // 如果比例相等直接返回
    if (newValue === oldValue) return

    // 需要注销原有定时（快速点击情况下）
    clearInterval(this.intervalInstance)

    // 获取当前浮动到的比例，不管上次定时有没有结束，从这个数值开始浮动
    let value = this.state.changeValue

    // 升降幅度
    const space = 0.01

    // 获取总高度
    const { height } = this.state

    console.log(newValue > value, newValue)

    // 上升和下降状态使用不同的定时时间
    // 上升情况下浮动总时间应该与气泡上浮时间一致
    // 下降情况下则匀速下降
    if (newValue > value) {
      // 气泡实际应该上升到的高度
      const actualHeight = height * (1 - newValue)

      // 计算当前比例到结束比例需要的定时循环步数
      const count = Math.ceil(Math.abs(newValue - value) / 0.01)

      // 因为气泡是从300的高度上升的
      // 通过实际高度的差值计算所需时间
      // 速度 speed=100
      // stemTime 为定时时间间隔
      const deviation = Math.abs(actualHeight - 290)
      const speed = 150
      const stepTime = deviation / speed * 1000 / count

      // 气泡只有在一开始才会产生
      // 定义 begin 代表开始
      let begin = true
      if (newValue !== oldValue) {
        const upFunc = () => {
          if (Math.abs(newValue - value) < 0.01) {
            value = newValue
            clearInterval(this.intervalInstance)
          } else if (newValue > oldValue) {
            value += space
          } else {
            value -= space
          }
          this.update(value, 'up', begin, actualHeight)
          begin = false
          this.setState({
            changeValue: value
          })
        }
        upFunc()
        this.intervalInstance = setInterval(() => {
          upFunc()
        }, stepTime)
      }
    } else {
      if (newValue !== oldValue) {
        this.intervalInstance = setInterval(() => {
          if (Math.abs(newValue - value) < 0.01) {
            value = newValue
            clearInterval(this.intervalInstance)
          } else if (newValue > oldValue) {
            value += space
          } else {
            value -= space
          }
          this.update(value, 'down')
          this.setState({
            changeValue: value
          })
        }, 50)
      }
    }
    this.setState({
      value: newValue
    })
  }

  render () {
    return (
      <div className={PROGRESS_CLASS} ref='progress' />
    )
  }

  getPathD = (value) => {
    const { height } = this.state

    // 计算，设置路径属性
    const actualHeight = height * (1 - value) + 60
    const peakHeight = actualHeight - 30
    const valleyHeight = actualHeight + 10
    const ldWaveA = `Q -225 ${peakHeight} -150 ${actualHeight} Q -125 ${valleyHeight} -100 ${actualHeight}`
    const ldWaveB = `Q -25 ${peakHeight} 50 ${actualHeight} Q 75 ${valleyHeight} 100 ${actualHeight}`
    const ldWaveC = `Q 175 ${peakHeight} 250 ${actualHeight} Q 275 ${valleyHeight} 300 ${actualHeight}`
    let ld
    if (value === 0) ld = 'M -300 330 L 300 330'
    else ld = `M -300 ${actualHeight} ${ldWaveA + ldWaveB + ldWaveC} L 300 330 L -300 330`

    const rdWaveA = `Q 25 ${valleyHeight} 50 ${actualHeight} Q 125 ${peakHeight} 200 ${actualHeight}`
    const rdWaveB = `Q 225 ${valleyHeight} 250 ${actualHeight} Q 325 ${peakHeight} 400 ${actualHeight}`
    const rdWaveC = `Q 425 ${valleyHeight} 450 ${actualHeight} Q 525 ${peakHeight} 600 ${actualHeight}`
    let rd
    if (value === 0) rd = 'M 0 330 L 600 330'
    else rd = `M 0 ${actualHeight} ${rdWaveA + rdWaveB + rdWaveC} L 600 330 L 0 330`

    return {
      ld,
      rd
    }
  }

  draw () {
    const { svgWidth, svgHeight } = this.state
    const { value } = this.props

    // 创建dom
    const svgEl = createElementNS('svg')
    const pathLeftEl = createElementNS('path')
    const pathRightEl = createElementNS('path')
    const bubbleSymbolEl = createElementNS('symbol')
    const bubbleEl = createElementNS('circle')
    const bombSymbolEl = createElementNS('symbol')
    const bombPathAEl = createElementNS('path')
    const bombPathBEl = createElementNS('path')
    const bombPathCEl = createElementNS('path')
    const bombPathDEl = createElementNS('path')

    // 获取波浪dom路径
    const { ld, rd } = this.getPathD(value)

    // 设置svg属性
    setAttributes(svgEl, {
      width: svgWidth,
      height: svgHeight,
      viewbox: `0, 0, ${svgWidth}, ${svgHeight}`
    })

    // 设置左波浪线属性
    setAttributes(pathLeftEl, {
      d: ld,
      class: classnames(PROGRESS_WAVE, PROGRESS_WAVE_LEFT)
    })

    // 设置右波浪线属性
    setAttributes(pathRightEl, {
      d: rd,
      class: classnames(PROGRESS_WAVE, PROGRESS_WAVE_RIGHT)
    })

    // 设置 bubblSymbol 属性
    setAttributes(bubbleSymbolEl, {
      id: 'bubble',
      width: 20,
      height: 20,
      viewbox: '0, 0, 20, 20'
    })

    // 设置 bubble 属性
    setAttributes(bubbleEl, {
      cx: 10,
      cy: 10,
      r: 5,
      class: PROGRESS_BUBBLE
    })

    // 设置 bombSymbol 属性
    setAttributes(bombSymbolEl, {
      id: 'bomb',
      width: 20,
      height: 20,
      viewbox: '0, 0, 20, 20'
    })

    // 设置 bombPath 属性
    setAttributes(bombPathAEl, {
      d: 'M 10 8 L 10 2',
      class: classnames(PROGRESS_BOMB, PROGRESS_BOMB_TOP)
    })
    setAttributes(bombPathBEl, {
      d: 'M 12 10 L 18 10',
      class: classnames(PROGRESS_BOMB, PROGRESS_BOMB_RIGHT)
    })
    setAttributes(bombPathCEl, {
      d: 'M 10 12 L 10 18',
      class: classnames(PROGRESS_BOMB, PROGRESS_BOMB_BOTTOM)
    })
    setAttributes(bombPathDEl, {
      d: 'M 8 10 L 2 10',
      class: classnames(PROGRESS_BOMB, PROGRESS_BOMB_LEFT)
    })

    bubbleSymbolEl.appendChild(bubbleEl)
    bombSymbolEl.appendChild(bombPathAEl)
    bombSymbolEl.appendChild(bombPathBEl)
    bombSymbolEl.appendChild(bombPathCEl)
    bombSymbolEl.appendChild(bombPathDEl)
    svgEl.appendChild(bubbleSymbolEl)
    svgEl.appendChild(bombSymbolEl)
    svgEl.appendChild(pathLeftEl)
    svgEl.appendChild(pathRightEl)
    this.refs.progress.appendChild(svgEl)

    this.pathLeftEl = pathLeftEl
    this.pathRightEl = pathRightEl
    this.svgEl = svgEl
  }

  update = (value, type, beigin, height) => {
    const { ld, rd } = this.getPathD(value)

    setAttributes(this.pathLeftEl, {
      d: ld
    })
    setAttributes(this.pathRightEl, {
      d: rd
    })

    if (!beigin || type !== 'up') return

    // 计算飘逸的时间
    const deviation = height - 290
    const speen = 150
    const time = Math.abs(deviation / speen)

    // 随机生成1-3个气泡
    const bubbleNum = Math.ceil(Math.random() * 3)
    for (let i = 0; i < bubbleNum; i++) {
      // 生成气泡 dom
      const bubbleUseEl = createElementNS('use')

      // 随机生成气泡出现的横坐标点
      const bubbleX = Math.random() * 100 + 100

      // 随机生成气泡横坐标偏移
      let bubbleDeviation = Math.random() * 15
      bubbleDeviation = Math.round(Math.random()) === 0 ? -bubbleDeviation : bubbleDeviation

      // 设置气泡属性和定时运动
      setAttributes(bubbleUseEl, {
        'xlink-href': '#bubble',
        x: bubbleX,
        y: 320
      })
      setStyles(bubbleUseEl, {
        transition: `all ${time}s ease-in 0ms`,
        transformOrigin: `${bubbleX + 11}px 331px`
      })
      setTimeout(() => {
        setStyles(bubbleUseEl, {
          transform: `translate(${bubbleDeviation}px, ${deviation}px) scale(1.5)`,
          fill: 'rgb(255, 255, 255)',
          fillOpacity: 0
        })
        setTimeout(() => {
          this.svgEl.removeChild(bubbleUseEl)
        }, time * 1000)
      })
      this.svgEl.appendChild(bubbleUseEl)
    }
  }

  static propTypes = {
    value: PropTypes.number
  }

  static defaultProps = {
    value: 0
  }
}
export default Water
