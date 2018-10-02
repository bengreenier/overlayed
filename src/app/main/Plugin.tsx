import log from 'electron-log'
import open from 'open'
import React, { CSSProperties } from 'react'
import { withSettings } from '../helpers/serialization'
import { IInstalledPlugin } from '../plugin/IPlugin'

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
        <PluginWithSettings settingsKey={this.props.plugin.name} />
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
}