import { ipcRenderer } from 'electron'
import log from 'electron-log'
import React from 'react'
import ReactDOM from 'react-dom'
import { IPCMessageNames } from '../../ipc/IPCMessageNames'
import { withSettings } from '../helpers/serialization'
import { PluginGrid } from './PluginGrid'

const PluginGridWithSettings = withSettings(PluginGrid as React.ComponentType<any>)

interface IState {
  isEditMode : boolean
}

/**
 * Top Level react component
 */
class MainApp extends React.Component<any, IState> {
  constructor(props : any) {
    super(props)

    this.state = {
      isEditMode: false
    }

    this.onToggleEditMode = this.onToggleEditMode.bind(this)
  }

  public componentDidMount() {
    ipcRenderer.addListener(IPCMessageNames.ToggleEditMode, this.onToggleEditMode)
  }

  public componentWillUnmount() {
    ipcRenderer.removeListener(IPCMessageNames.ToggleEditMode, this.onToggleEditMode)
  }

  public render() {
    return <PluginGridWithSettings settingsKey={'overlayed.grid'} isEditMode={this.state.isEditMode} />
  }

  private onToggleEditMode(e : any, electronReportedToggleVal : boolean) {
    // make sure we aren't out of step with electron :)
    if (this.state.isEditMode !== electronReportedToggleVal) {
      this.setState({
        isEditMode: !this.state.isEditMode
      })
    }
  }
}

const topLevelNode = document.getElementById('react-dom-bind') as HTMLElement

// take MainApp online 🚀
ReactDOM.render(React.createElement(MainApp, null), topLevelNode)

// listen for shutdown
ipcRenderer.on(IPCMessageNames.RequestShutdown, () => {
  log.info('starting renderer shutdown')

  // wait for the dom changes to actually occur
  const obs = new MutationObserver(() => {
    log.info('renderer nodes unmounted, finishing shutdown')

    // report back that we're safe to unload now
    ipcRenderer.sendSync(IPCMessageNames.AllowShutdown)
  })

  // watch the dom
  obs.observe(topLevelNode, {childList: true, subtree: true})

  // issue the changes
  ReactDOM.unmountComponentAtNode(topLevelNode)
})