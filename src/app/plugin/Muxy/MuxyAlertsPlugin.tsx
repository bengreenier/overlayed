import { IPlugin } from "../IPlugin"
import React from "react"

export interface IMuxyAlertConfiguration {
  alertUrl ?: string
}

export default class MuxyAlertsPlugin extends React.Component<IMuxyAlertConfiguration, any> implements IPlugin {
  public diskPath: string = __dirname
  public name: string = 'Muxy Alerts'
  public version: string = '0.0.1'
  public requiresInstall: boolean = false

  public render() {
    return <webview src={this.props.alertUrl == null ? '#about' : this.props.alertUrl}></webview>
  }
}