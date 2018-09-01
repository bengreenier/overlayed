import os from 'os'
import { join } from 'path'
import React from 'react'
import ReactDOM from 'react-dom'
import { PluginGrid } from '../helpers/PluginGrid'

// the constant user plugin dir
const userPluginDir = join(os.homedir(), '.overlayed')

/**
 * Top Level react component
 */
class MainApp extends React.Component<any, any> {
  public render() {
    return <PluginGrid userPluginDir={userPluginDir} />
  }
}

// take MainApp online 🚀
ReactDOM.render(React.createElement(MainApp, null),
  document.getElementById('react-dom-bind'))
