import CForm from '@overlayed-app/contributes-form'
import { ipcRenderer, remote } from 'electron'
import merge from 'merge'
import path from 'path'
import React, { FocusEvent, KeyboardEvent } from 'react'
import { IPCMessageNames } from '../../ipc/IPCMessageNames'
import { getPlugins } from '../helpers/serialization'

const settings = remote.require('electron-settings')

export class SettingsForm extends React.Component<any, {
  sources: string[],
  originalData: any
}> {
  
  constructor(props: any) {
    super(props)

    this.state = {
      originalData: {},
      sources: [],
    }
  }

  public componentDidMount() {
    this.setState({
      originalData: settings.getAll(),
      sources: this.getSources(),
    })
  }

  public render() {
    // tslint:disable-next-line:no-console
    console.log(this.state.sources)
    
    return <CForm sources={this.state.sources} complete={this.handleData} data={this.state.originalData} />
  }

  private handleData = (data : any) => {
    // tslint:disable-next-line:no-console
    console.log(data)

    const settingsData = data.formData

    Object.keys(settingsData).forEach((key) => {
      const existing = settings.get(key)
      const merged = merge(existing, settingsData[key])

      settings.set(key, merged)
    })

    // request a reload of the compositor
    ipcRenderer.sendSync(IPCMessageNames.RequestCompositorReload)
  }

  private getSources() {
    return getPlugins().map(p => path.join(p.diskPath, 'package.json'))
  }
}