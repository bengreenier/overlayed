import { remote } from 'electron'
import React from 'react'

// need to use the remote require because electron-settings asks us to (see wiki)
const settings = remote.require('electron-settings')

const visiblityToggleKeyName = 'hidden'

interface IProps {
  hidden: boolean
}

// HOC that creates a component that can toggle visiblity based on settings
// 
// TODO(bengreenier): the typing on the return isn't coming through :(
export const withVisibilityToggle = <P extends object>(Comp : React.ComponentType<P>) => {
  return class WithSettings extends React.Component<P & IProps, any> {
    public static defaultProps : IProps = {
      hidden: false
    }

    public render() {
      const { hidden, ...props } = this.props as IProps

      // render the component with data as it's given props (so it contains settings)
      return hidden ? <></> : <Comp {...props} />
    }
  }
}