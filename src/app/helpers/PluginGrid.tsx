import enpeem from 'enpeem'
import { existsSync, lstatSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import moment from 'moment'
import { join } from 'path'
import React, { CSSProperties } from 'react'
import ReactGridLayout, { WidthProvider } from 'react-grid-layout'
import { IInstalledPlugin, IInstallNeededPlugin, IPluginProperties } from '../plugin/IPlugin'

const isDirectory = (source : string) => lstatSync(source).isDirectory()
const getDirectories = (source : string)  =>
  readdirSync(source).map((name : string) => join(source, name)).filter(isDirectory)

// makes the RGL responsive-ish
const RGL = WidthProvider(ReactGridLayout)

// the constant for the name of the install lockfile
const pluginInstalledLockFileName = 'overlayed-install.lock'

// these styles get applied to plugins
const pluginElementStyles = {
  backgroundColor: 'green'
} as CSSProperties

interface IState {
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
    return (
      <RGL
        compactType={null}
        useCSSTransforms={true}
      >
        {this.state.plugins.map(plugin => <div key={`${plugin.name}@${plugin.version}`} style={pluginElementStyles}>{React.createElement(plugin.component as any, null)}</div>)}
      </RGL>
    )
  }

  /**
   * Load all plugins, internal and user async
   */
  private loadPlugins() {
    // splits out install required and !install required plugins
    const plugins = this.getInternalPlugins().concat(this.getUserPlugins())
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

  /**
   * Get user plugins from props.userPluginDir
   */
  private getUserPlugins() {
    if (!this.props.userPluginDir) {
      return [] as any
    }

    return this.getPlugins(this.props.userPluginDir)
  }

  /**
   * Get internally defined plugins
   */
  private getInternalPlugins() {
    return this.getPlugins(`${__dirname}/../plugin`)
  }

  /**
   * Get plugins from a given directory
   * @param dir the directory to search
   */
  private getPlugins(dir : string) {
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
      let needsInstall = pkg.dependencies && Object.keys(pkg.dependencies).length > 0 ? true : false

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
          component: require(componentPath).default as React.Component<any, any>
        }} as IInstalledPlugin
      }
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
            component: require(plugin.component).default as React.Component<any, any>
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