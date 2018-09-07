import os from 'os'
import { join } from 'path'
import React from 'react'
import ReactDOM from 'react-dom'
import { withSettings } from '../helpers/serialization'
import { PluginGrid } from './PluginGrid'

const PluginGridWithSettings = withSettings(PluginGrid as React.ComponentType<any>)

/**
 * Top Level react component
 */
class MainApp extends React.Component<any, any> {
  public render() {
    return <PluginGridWithSettings settingsKey={'overlayed.grid'} />
  }
}

// take MainApp online 🚀
ReactDOM.render(React.createElement(MainApp, null),
  document.getElementById('react-dom-bind'))
