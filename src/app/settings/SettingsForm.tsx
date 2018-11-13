import CForm from '@overlayed-app/contributes-form'
import { ipcRenderer, remote } from 'electron'
import merge from 'merge'
import path from 'path'
import React, { FocusEvent, KeyboardEvent } from 'react'
import { IPCMessageNames } from '../../ipc/IPCMessageNames'
import { getPlugins } from '../helpers/serialization'

const settings = remote.require('electron-settings')

/**
 * TODO(bengreenier): make this more advanced - there's still some settings that are json-only
 */
const systemBuiltInsRaw = [
  {
    name: 'overlayed',
    properties: {
      grid: {
        properties: {
          editStyles: {
            properties: {
              backgroundColor: {type: 'string', default: 'rgba(51, 138, 46, 0.6)', description: 'edit-mode plugin background color'}
            },
            type: 'object'
          },
        },
        type: 'object'
      },
      window: {
        properties: {
          height: {type: 'number', description: 'Compositor height'},
          width: {type: 'number', description: 'Compositor width'},
          x: {type: 'number', description: 'Compositor top left x coordinate'},
          y: {type: 'number', description: 'Compositor top left y coordinate'},
        },
        type: 'object'
      }
    },
    title: 'Compositor settings',
    type: 'object'
  }
]

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
    return (
      <CForm
        rawSources={systemBuiltInsRaw}
        sources={this.state.sources}
        complete={this.handleData}
        data={this.state.originalData}
      />
    )
  }

  private handleData = (data : any) => {
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