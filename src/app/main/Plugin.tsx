import React, { CSSProperties } from 'react'
import { withSettings } from '../helpers/serialization'
import { IInstalledPlugin } from '../plugin/IPlugin'

interface IPluginProps {
  plugin : IInstalledPlugin
}

export class Plugin extends React.Component<IPluginProps, any> {
  public render() {
    const PluginWithSettings = withSettings(this.props.plugin.component, this.props.plugin.settings)

    return (
      <PluginWithSettings settingsKey={this.props.plugin.name} />
    )
  }
}