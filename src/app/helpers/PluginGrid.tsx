import React, { CSSProperties } from 'react'
import ReactGridLayout, { WidthProvider } from 'react-grid-layout'
import { lstatSync, readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import enpeem from 'enpeem'
import { IInstalledPlugin, IPluginProperties, IInstallNeededPlugin } from '../plugin/IPlugin'

const isDirectory = (source : string) => lstatSync(source).isDirectory()
const getDirectories = (source : string)  =>
  readdirSync(source).map((name : string) => join(source, name)).filter(isDirectory)

const RGL = WidthProvider(ReactGridLayout)

const pluginElementStyles = {
  backgroundColor: 'green'
} as CSSProperties

interface IState {
  plugins: IInstalledPlugin[]
}

export class PluginGrid extends React.Component<any, IState> {
  constructor(props : any) {
    super(props)

    this.state = {
      plugins: []
    }
  }

  public componentDidMount() {
    this.loadPlugins()
  }

  public render() {
    return (<RGL
      compactType={null}
      useCSSTransforms={true}
    >
      {this.state.plugins.map(plugin =>
        <div key={`${plugin.name}@${plugin.version}`} style={pluginElementStyles}>{React.createElement(plugin.component as any, null)}</div>)}
    </RGL>)
  }

  private loadPlugins() {
    const noInstallNeeded = this.getInternalPlugins().filter(p => !p.requiresInstall) as IInstalledPlugin[]
    const installNeeded = this.getInternalPlugins().filter(p => p.requiresInstall) as IInstallNeededPlugin[]
    
    // load installed plugins
    this.setState({
      plugins: noInstallNeeded
    })

    // install the uninstalled plugins
    Promise.all(this.installPlugins(installNeeded)).then((plugins) => {
      // when these load, merge them in
      this.setState({
        plugins: this.state.plugins.concat(plugins)
      })
    })
  }

  private getInternalPlugins() {
    return getDirectories(`${__dirname}/../plugin`).map((pluginDir) => {
      const jsonData = readFileSync(join(pluginDir, 'package.json')).toString()
      const pkg = JSON.parse(jsonData)
      const componentPath = join(pluginDir, pkg['main'] as string)
      
      const plugin : IPluginProperties = {
        diskPath: pluginDir,
        name: pkg['name'],
        version: pkg['version'],
        requiresInstall: pkg['dependencies'] && Object.keys(pkg['dependencies']).length > 0 ? true : false
      }

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

  private installPlugins(plugins : IInstallNeededPlugin[]) : PromiseLike<IInstalledPlugin>[] {
    return plugins.map((plugin) => {
      const jsonData = readFileSync(join(plugin.diskPath, 'package.json')).toString()
      const pkg = JSON.parse(jsonData)

      const deps = Object.keys(pkg['dependencies']).map(k => `${k}@${pkg['dependencies'][k]}`)

      return new Promise<IInstalledPlugin>((resolve, reject) => {
        enpeem.install({
          dir: plugin.diskPath,
          dependencies: deps
        }, (err) => {
          if (err) reject(err)
          resolve({...plugin, ...{
            component: require(plugin.component).default as React.Component<any, any>
          }} as IInstalledPlugin)
        })
      })
    })
  }
}