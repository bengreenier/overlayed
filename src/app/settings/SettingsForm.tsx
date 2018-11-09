import CForm from '@overlayed-app/contributes-form'
import { remote } from 'electron'
import merge from 'merge'
import path from 'path'
import React, { FocusEvent, KeyboardEvent } from 'react'
import { getPlugins } from '../helpers/serialization'

const settings = remote.require('electron-settings')

export class SettingsForm extends React.Component {
  
  public render() {
    return <CForm sources={this.getSources()} complete={this.handleData} />
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
  }

  private getSources() {
    return getPlugins().map(p => path.join(p.diskPath, 'package.json'))
  }
}