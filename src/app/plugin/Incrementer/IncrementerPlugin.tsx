import React from "react"
import { IManipulateSettingsProps } from "../../helpers/serialization"

interface ISettings {
  value: number
}

interface IProps extends IManipulateSettingsProps<ISettings>, ISettings {

}

/**
 * Example plugin with update-setting support
 */
export default class RangeMathPlugin extends React.Component<IProps, ISettings> {
  public static defaultProps : Partial<IProps> = {
    value: 0
  }

  private tickInterval ?: number;

  constructor(props : IProps) {
    super(props)

    this.state = {
      value: this.props.value
    }
  }

  public componentDidMount() {
    this.tickInterval = setInterval(this.tick.bind(this), 5000)
  }

  public componentWillUnmount() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval)
    }

    // we can do this when https://github.com/bengreenier/overlayed/issues/17 is resolved
    // 
    // this.props.updateSettings(this.state)
  }

  public render() {
    return <h1>{this.state.value}</h1>
  }

  private tick() {
    this.setState({
      value: this.state.value + 1
    })
    
    // write this out each tick
    this.props.updateSettings(this.state)
  }
}