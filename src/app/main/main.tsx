import { ipcRenderer } from 'electron'
import os from 'os'
import { join } from 'path'
import React from 'react'
import ReactDOM from 'react-dom'
import { IPCMessageNames } from '../../ipc/IPCMessageNames';
import { withSettings } from '../helpers/serialization'
import { PluginGrid } from './PluginGrid'

const PluginGridWithSettings = withSettings(PluginGrid as React.ComponentType<any>)

/**
 * Top Level react component
 */
class MainApp extends React.Component<any, any> {
  public componentWillUnmount() {
    // tslint:disable-next-line:no-console
    console.log('unmount main')
  }

  public render() {
    return <PluginGridWithSettings settingsKey={'overlayed.grid'} />
  }
}

const topLevelNode = document.getElementById('react-dom-bind') as HTMLElement

// take MainApp online 🚀
ReactDOM.render(React.createElement(MainApp, null), topLevelNode)

// listen for shutdown
ipcRenderer.on(IPCMessageNames.RequestShutdown, () => {
  // wait for the dom changes to actually occur
  const obs = new MutationObserver(() => {
    // report back that we're safe to unload now
    ipcRenderer.sendSync(IPCMessageNames.AllowShutdown)
  })

  // watch the dom
  obs.observe(topLevelNode, {childList: true, subtree: true})

  // issue the changes
  ReactDOM.unmountComponentAtNode(topLevelNode)
})