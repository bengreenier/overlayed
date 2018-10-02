import { ipcRenderer } from 'electron'
import log from 'electron-log'
import open from 'open'
import React, { CSSProperties } from 'react'
import { IPCMessageNames } from '../../ipc/IPCMessageNames'
import { withSettings } from '../helpers/serialization'
import { IInstalledPlugin } from '../plugin/IPlugin'
import { ErrorBoundary } from './ErrorBoundry'

interface IPluginProps {
  plugin : IInstalledPlugin,
  isEditMode : boolean
}

const labelStyle = {
  backgroundColor: 'rgba(51, 138, 46, 0.6)',
  position: 'relative',
  top: '-20px',
  whiteSpace: 'pre'
} as CSSProperties

export class Plugin extends React.Component<IPluginProps, any> {
  constructor(props : IPluginProps) {
    super(props)

    this.onLabelLinkClicked = this.onLabelLinkClicked.bind(this)
    this.onError = this.onError.bind(this)
  }

  public render() {
    const PluginWithSettings = withSettings(this.props.plugin.component, this.props.plugin.settings)

    return (
      <React.Fragment>
        <span style={this.props.isEditMode ? labelStyle : {display: 'none'}}>
          {`${this.props.plugin.name} @ `}
          <a href={'#'} data-open={`file://${this.props.plugin.diskPath}`} onClick={this.onLabelLinkClicked} >
            {this.props.plugin.version}
          </a>
        </span>
        <ErrorBoundary onError={this.onError}>
          <PluginWithSettings settingsKey={this.props.plugin.name} />
        </ErrorBoundary>
      </React.Fragment>
    )
  }

  private onLabelLinkClicked(e : any) {
    if (e.target) {
      const uri = (e.target as HTMLElement).getAttribute('data-open')
      if (uri) {
        log.info(`plugin label clicked: opening ${uri}`)
        open(uri)
      }
    }
  }

  private onError(err : Error) {
    // show tooltips and log failures loading components
    const errorContents = `Failed to render ${this.props.plugin.name} located at ${this.props.plugin.diskPath}`
    
    ipcRenderer.send(IPCMessageNames.ShowTooltip, {
      content: errorContents,
      title: 'Plugin Render Error',
    })
    log.error(errorContents)
  }
}