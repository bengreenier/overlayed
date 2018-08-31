import React from 'react'
import ReactDOM from 'react-dom'
import { PluginGrid } from '../helpers/PluginGrid';


/**
 * Top Level react component
 */
class MainApp extends React.Component<any, any> {
  public render() {
    return <PluginGrid/>
  }
}

// take MainApp online 🚀
ReactDOM.render(React.createElement(MainApp, null),
  document.getElementById('react-dom-bind'))
