import { remote } from 'electron'
import { existsSync, lstatSync, readdirSync, readFileSync } from 'fs'
import moment from 'moment'
import os from 'os'
import { join } from 'path'
import React from 'react'
import { IInstalledPlugin, IInstallNeededPlugin, IPluginProperties } from '../plugin/IPlugin'
import { pluginInstalledLockFileName } from './constants'

// need to use the remote require because electron-settings asks us to (see wiki)
const settings = remote.require('electron-settings')

interface IWithSettingsProps {
  settingsKey : string
}

export interface IManipulateSettingsProps<TSettings = {}> {
  updateSettings : (data : TSettings) => void
}

// HOC that creates a component that injects settings via props
// 
// TODO(bengreenier): the typing on the return isn't coming through :(
export const withSettings = <Q extends object, P extends IManipulateSettingsProps<Q>>(Comp : React.ComponentType<P>, compSettings ?: any) => {
  return class WithSettings extends React.Component<P & IWithSettingsProps, any> {

    constructor(props : P & IWithSettingsProps) {
      super(props)
      
      this.updateSettings = this.updateSettings.bind(this)
    }

    public render() {
      const { settingsKey, ...props } = this.props as IWithSettingsProps

      // extend props with settings
      const data = {...props, ...(compSettings || settings.get(settingsKey))}

      // render the component with data as it's given props (so it contains settings)
      return <Comp updateSettings={this.updateSettings} {...data} />
    }

    private updateSettings(data : IManipulateSettingsProps<Q>) {
      settings.set(this.props.settingsKey, data, { prettify: true })
    }
  }
}

// Gets all plugins
export const getPlugins = () => {
  const rootSettings = settings.getAll()

  // load internals
  const internalPlugins = loadPlugins(`${__dirname}/../plugin`, rootSettings)

  // load user
  const userPlugins = loadPlugins(join(os.homedir(), '.overlayed'), rootSettings)

  return internalPlugins.concat(userPlugins)
}

const isDirectory = (source : string) => lstatSync(source).isDirectory()
const getDirectories = (source : string)  =>
  readdirSync(source).map((name : string) => join(source, name)).filter(isDirectory)

const loadPlugins = (dir : string, rootSettings : any) => {
  // if the dir is no good, gtfo
  if (!existsSync(dir)) {
    return []
  }

  // enumerating internal plugin directories
  return getDirectories(dir).map((pluginDir) => {
    const jsonData = readFileSync(join(pluginDir, 'package.json')).toString()
    const pkg = JSON.parse(jsonData)
    const componentPath = join(pluginDir, pkg.main as string)

    // by default we install if there's deps
    // (we allow react as a dep)
    let needsInstall = pkg.dependencies && Object.keys(pkg.dependencies).filter(k => k.toLowerCase() !== 'react').length > 0 ? true : false

    // however, if there's an install lockfile
    const installLockFilePath = join(pluginDir, pluginInstalledLockFileName)
    if (existsSync(installLockFilePath)) {
      const installLockFile = readFileSync(installLockFilePath).toString()

      // we check if it's been installed in the last day
      // if it has we don't install again
      if (installLockFile) {
        const installDate = moment(installLockFile)

        // TODO(begreenier): support force install
        if (installDate.add(1, 'day').isBefore(moment())) {
          needsInstall = true
        } else {
          needsInstall = false
        }
      }
    }

    // generate plugin structure
    const plugin : IPluginProperties = {
      diskPath: pluginDir,
      name: pkg.name,
      requiresInstall: needsInstall,
      settings: rootSettings[pkg.name] || {},
      version: pkg.version,
    }

    // if we need deps installed, we can't load the plugin yet, so we don't
    // we return a variant of IPluginProperties
    if (plugin.requiresInstall) {
      return {...plugin, ...{
        component: componentPath
      }} as IInstallNeededPlugin
    } else {
      return {...plugin, ...{
        component: require(componentPath).default as React.ComponentType<any>
      }} as IInstalledPlugin
    }
  })
}