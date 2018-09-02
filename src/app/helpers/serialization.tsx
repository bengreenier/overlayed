import { remote } from 'electron'
import React from 'react'

// need to use the remote require because electron-settings asks us to (see wiki)
const settings = remote.require('electron-settings')

interface IWithSettingsProps {
  settingsKey : string
}

// HOC that creates a component that injects settings via props
// 
// TODO(bengreenier): the typing on the return isn't coming through :(
export const withSettings = <P extends object>(Comp : React.ComponentType<P>) => {
  return class WithSettings extends React.Component<P & IWithSettingsProps, any> {
    public render() {
      const { settingsKey, ...props } = this.props as IWithSettingsProps

      // extend props with settings
      const data = {...props, ...settings.get(settingsKey)}

      // render the component with data as it's given props (so it contains settings)
      return <Comp {...data} />
    }
  }
}