import React from "react"

interface IProps {
  /**
   * Visualized locale
   */
  locale ?: string
}

interface IState {
  date : Date
}

/**
 * Example stateful plugin
 */
export default class ClockPlugin extends React.Component<IProps, IState> {
  public static defaultProps : IProps = {
    locale: 'en-US'
  }

  private clockInterval ?: number

  constructor(props : IProps) {
    super(props)

    this.state = {
      date: new Date()
    }
  }

  public componentDidMount() {
    this.clockInterval = setInterval(this.tick.bind(this), 1000)
  }

  public componentWillUnmount() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval)
    }
  }

  public render() {
    return <h1>{this.state.date.toLocaleTimeString(this.props.locale)}</h1>
  }

  private tick() {
    this.setState({
      date: new Date()
    })
  }
}