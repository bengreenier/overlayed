import log from 'electron-log'
import enpeem from 'enpeem'
import { readFileSync, writeFileSync } from 'fs'
import moment from 'moment'
import { join } from 'path'
import React, { CSSProperties } from 'react'
import ReactGridLayout, { Layout, WidthProvider } from 'react-grid-layout'
import { pluginInstalledLockFileName } from '../helpers/constants'
import { getPlugins, IManipulateSettingsProps } from '../helpers/serialization'
import { IInstalledPlugin, IInstallNeededPlugin } from '../plugin/IPlugin'
import { Plugin } from './Plugin'

// makes the RGL responsive-ish
const RGL = WidthProvider(ReactGridLayout)

interface ISettings {
  layout: Layout[]
  editStyles: CSSProperties
}

interface IState extends ISettings {
  /**
   * The installed plugins that we're currently showing
   */
  plugins: IInstalledPlugin[]
}

export interface IPluginGridProps extends IManipulateSettingsProps<ISettings>, ISettings {
  isEditMode : boolean
}

export class PluginGrid extends React.Component<IPluginGridProps, IState> {
  constructor(props : IPluginGridProps) {
    super(props)

    this.state = {
      editStyles: this.props.editStyles || {
        backgroundColor: 'rgba(51, 138, 46, 0.6)'
      },
      layout: this.props.layout,
      plugins: []
    }

    this.onLayoutChanged = this.onLayoutChanged.bind(this)
  }

  public componentDidMount() {
    this.loadPlugins()
  }

  public componentWillUnmount() {
    // persist layout to disk
    this.props.updateSettings({
      editStyles: this.state.editStyles,
      layout: this.state.layout,
    })
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
      .map(p => (
        <div
          style={this.props.isEditMode ? this.state.editStyles : {}}
          key={`${p.name}@${p.version}`}
          data-grid={layoutMap[`${p.name}@${p.version}`]}
        >
          <Plugin plugin={p} isEditMode={this.props.isEditMode}/>
        </div>))
  }

  private preprocessLayoutData() {
    const layoutIndexMap : {[key : string] : any} = {}
    this.state.layout.forEach((elem : any) => {
      layoutIndexMap[elem.i] = elem
    })

    return layoutIndexMap
  }

  private onLayoutChanged(layout: Layout[]) {
    // RGL bug - fires with empty array sometimes
    if (layout.length > 0) {
      this.setState({
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
    
    log.info(`starting load for [${noInstallNeeded.map(e => e.name).join(',')}]`)

    // load installed plugins
    this.setState({
      plugins: noInstallNeeded
    })

    log.info(`starting install for [${installNeeded.map(e => e.name).join(',')}]`)

    // install the uninstalled plugins
    Promise.all(this.installPlugins(installNeeded)).then((installedPlugins) => {
      // when these load, merge them in
      this.setState({
        plugins: this.state.plugins.concat(installedPlugins)
      })
    }, (error) => {
      log.error(`failed installation: ${error}`)
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