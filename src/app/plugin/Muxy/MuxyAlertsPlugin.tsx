import React from "react"

export interface IMuxyAlertConfiguration {
  /**
   * The unique user url for alerts
   */
  alertUrl ?: string
}

/**
 * Muxy (https://muxy.io) alerts plugin 
 */
export default class MuxyAlertsPlugin extends React.Component<IMuxyAlertConfiguration, any> {
  public render() {
    return <webview src={this.props.alertUrl == null ? '#about' : this.props.alertUrl} />
  }
}