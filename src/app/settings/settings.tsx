import { ipcRenderer } from "electron"
import React from "react"
import ReactDOM from "react-dom"
import { IPCMessageNames } from "../../ipc/IPCMessageNames"
import { SettingsForm } from "./SettingsForm";

class SettingsApp extends React.Component<any, any> {
  public render() {
    return <SettingsForm/>
  }
}

const topLevelNode = document.getElementById('react-dom-bind') as HTMLElement

// take MainApp online 🚀
ReactDOM.render(React.createElement(SettingsApp, null), topLevelNode)

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