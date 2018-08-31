import React from "react"

interface IState {
  date : Date
}

/**
 * Example stateful plugin
 */
export default class ClockPlugin extends React.Component<any, IState> {
  private clockInterval ?: number

  constructor(props : any) {
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
    return <h1>{this.state.date.toLocaleTimeString()}</h1>
  }

  private tick() {
    this.setState({
      date: new Date()
    })
  }
}