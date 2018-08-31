import React, { CSSProperties } from 'react'
import ReactGridLayout, { WidthProvider } from 'react-grid-layout'
import { lstatSync, readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { IReactPlugin } from '../plugin/IPlugin'

const isDirectory = (source : string) => lstatSync(source).isDirectory()
const getDirectories = (source : string)  =>
  readdirSync(source).map((name : string) => join(source, name)).filter(isDirectory)

const RGL = WidthProvider(ReactGridLayout)

const pluginElementStyles = {
  backgroundColor: 'green'
} as CSSProperties

interface IState {
  plugins: IReactPlugin[]
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
        <div key={`${plugin.name}@${plugin.version}`} style={pluginElementStyles}>{React.createElement(plugin as any, null)}</div>)}
    </RGL>)
  }

  private loadPlugins() {
    const intPlugins = this.getInternalPlugins()
    this.setState({
      plugins: intPlugins
    })
  }

  private getInternalPlugins() {
    return getDirectories(`${__dirname}/../plugin`).map((pluginDir) => {
      const jsonData = readFileSync(join(pluginDir, 'package.json')).toString()
      const pkg = JSON.parse(jsonData)
      return join(pluginDir, pkg['main'] as string)
    }).map((pluginPath) => {
      return require(pluginPath).default as IReactPlugin
    })
  }
}