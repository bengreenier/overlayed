import { IPlugin } from "../IPlugin"
import React from "react"

interface IState {
  date : Date
}

export default class ClockPlugin extends React.Component<any, IState> implements IPlugin {
  public diskPath: string = __dirname
  public name: string = 'Clock'
  public version: string = '0.0.1'
  public requiresInstall: boolean = false

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