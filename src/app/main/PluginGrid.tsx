import enpeem from 'enpeem'
import { existsSync, lstatSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import moment from 'moment'
import { join } from 'path'
import React from 'react'
import ReactGridLayout, { WidthProvider } from 'react-grid-layout'
import { getPlugins } from '../helpers/serialization'
import { IInstalledPlugin, IInstallNeededPlugin, IPluginProperties } from '../plugin/IPlugin'
import { Plugin, pluginStyles } from './Plugin'

const isDirectory = (source : string) => lstatSync(source).isDirectory()
const getDirectories = (source : string)  =>
  readdirSync(source).map((name : string) => join(source, name)).filter(isDirectory)

// makes the RGL responsive-ish
const RGL = WidthProvider(ReactGridLayout)

// the constant for the name of the install lockfile
const pluginInstalledLockFileName = 'overlayed-install.lock'

interface IState {
  /**
   * The installed plugins that we're currently showing
   */
  plugins: IInstalledPlugin[]
}

export interface IPluginGridProps {
  /**
   * Directory where user stores plugins
   */
  userPluginDir ?: string
}

export class PluginGrid extends React.Component<IPluginGridProps, IState> {
  constructor(props : IPluginGridProps) {
    super(props)

    this.state = {
      plugins: []
    }
  }

  public componentDidMount() {
    this.loadPlugins()
  }

  public render() {
    // we need to wrap plugin in a div for RGL to work properly :(
    // see https://github.com/STRML/react-grid-layout/issues/397
    return (
      <RGL
        compactType={null}
        useCSSTransforms={true}
      >
        {this.generatePluginComponents()}
      </RGL>
    )
  }

  private generatePluginComponents() {
    return this.state.plugins
      .filter(p => !p.settings.hidden)
      .map(p => <div style={pluginStyles} key={`${p.name}@${p.version}`}><Plugin plugin={p}/></div>)
  }

  /**
   * Load all plugins, internal and user async
   */
  private loadPlugins() {
    // splits out install required and !install required plugins
    const plugins = getPlugins()
    const noInstallNeeded = plugins.filter(p => !p.requiresInstall) as IInstalledPlugin[]
    const installNeeded = plugins.filter(p => p.requiresInstall) as IInstallNeededPlugin[]
    
    // load installed plugins
    this.setState({
      plugins: noInstallNeeded
    })

    // install the uninstalled plugins
    Promise.all(this.installPlugins(installNeeded)).then((installedPlugins) => {
      // when these load, merge them in
      this.setState({
        plugins: this.state.plugins.concat(installedPlugins)
      })
    })
  }

  private installPlugins(plugins : IInstallNeededPlugin[]) : Array<PromiseLike<IInstalledPlugin>> {
    // map all the plugins to install promises
    return plugins.map((plugin) => {
      // take the plugin data
      const jsonData = readFileSync(join(plugin.diskPath, 'package.json')).toString()
      const pkg = JSON.parse(jsonData)

      // convert the deps to an array
      const deps = Object.keys(pkg.dependencies).map(k => `${k}@${pkg.dependencies[k]}`)

      // install the plugin deps in the plugin's directory
      return new Promise<IInstalledPlugin>((resolve, reject) => {
        enpeem.install({
          dependencies: deps,
          dir: plugin.diskPath,
        }, (err) => {
          // if we error, fail out, otherwise resolve to an IInstalledPlugin
          if (err) { reject(err) }
          resolve({...plugin, ...{
            component: require(plugin.component).default as React.ComponentType<any>
          }} as IInstalledPlugin)
        })
      }).then((installedPlugin) => {

        // mark the plugin as installed @ this time
        writeFileSync(join(installedPlugin.diskPath, pluginInstalledLockFileName), moment().toISOString())

        return installedPlugin
      })
    })
  }
}