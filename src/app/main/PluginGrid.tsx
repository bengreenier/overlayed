import { remote } from 'electron'
import enpeem from 'enpeem'
import { existsSync, lstatSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import moment from 'moment'
import { join } from 'path'
import React from 'react'
import ReactGridLayout, { Layout, WidthProvider } from 'react-grid-layout'
import { pluginInstalledLockFileName } from '../helpers/constants'
import { getPlugins, IManipulateSettingsProps } from '../helpers/serialization'
import { IInstalledPlugin, IInstallNeededPlugin } from '../plugin/IPlugin'
import { Plugin, pluginStyles } from './Plugin'

// makes the RGL responsive-ish
const RGL = WidthProvider(ReactGridLayout)

interface IState {
  /**
   * The installed plugins that we're currently showing
   */
  plugins: IInstalledPlugin[]
}

interface ISettings {
  layout: Layout[]
}

export interface IPluginGridProps extends IManipulateSettingsProps<ISettings>, ISettings {
}

export class PluginGrid extends React.Component<IPluginGridProps, IState> {
  constructor(props : IPluginGridProps) {
    super(props)

    this.state = {
      plugins: []
    }

    this.onLayoutChanged = this.onLayoutChanged.bind(this)
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
        onLayoutChange={this.onLayoutChanged}
      >
        {this.generatePluginComponents()}
      </RGL>
    )
  }

  private generatePluginComponents() {
    const layoutMap = this.preprocessLayoutData()

    return this.state.plugins
      .filter(p => !p.settings.hidden)
      .map(p => <div style={pluginStyles} key={`${p.name}@${p.version}`} data-grid={layoutMap[`${p.name}@${p.version}`]}><Plugin plugin={p}/></div>)
  }

  private preprocessLayoutData() {
    const layoutIndexMap : {[key : string] : any} = {}
    this.props.layout.forEach((elem : any) => {
      layoutIndexMap[elem.i] = elem
    })

    return layoutIndexMap
  }

  private onLayoutChanged(layout: Layout[]) {
    // RGL bug - fires with empty array sometimes
    if (layout.length > 0) {
      this.props.updateSettings({
        layout
      })
    }
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