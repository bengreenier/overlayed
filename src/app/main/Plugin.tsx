import React, { CSSProperties } from 'react'
import { withSettings } from '../helpers/serialization'
import { withVisibilityToggle } from '../helpers/visibility'
import { IInstalledPlugin } from '../plugin/IPlugin'

interface IPluginProps {
  plugin : IInstalledPlugin
}

// the base styles for a plugin
//
// note: this is exported because of RGL issues
// https://github.com/STRML/react-grid-layout/issues/397
export const pluginStyles = {
  backgroundColor: 'green',
} as CSSProperties

export class Plugin extends React.Component<IPluginProps, any> {
  public render() {
    const PluginWithSettings = withSettings(withVisibilityToggle(this.props.plugin.component))

    return (
      <PluginWithSettings settingsKey={this.props.plugin.name} />
    )
  }
}