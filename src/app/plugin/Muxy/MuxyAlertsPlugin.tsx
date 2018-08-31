import { IInstalledPlugin } from "../IPlugin"
import React from "react"

export interface IMuxyAlertConfiguration {
  alertUrl ?: string
}

export default class MuxyAlertsPlugin extends React.Component<IMuxyAlertConfiguration, any> {
  public render() {
    return <webview src={this.props.alertUrl == null ? '#about' : this.props.alertUrl}></webview>
  }
}