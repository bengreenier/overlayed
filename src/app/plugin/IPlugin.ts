import React from "react";

/**
 * Interface for a plugin
 * 
 * Note: Plugins should each have their own folder
 */
export interface IPlugin {
  /**
   * Absolute path on disk to the plugin directory
   */
  diskPath: string
  
  /**
   * Name of the plugin
   */
  name: string

  /**
   * Version of the plugin
   */
  version: string

  /**
   * Does the plugin require an `npm install`
   */
  requiresInstall: boolean
}

/**
 * Interface for a plugin that is also a react component
 */
export interface IReactPlugin extends React.Component<any, any>, IPlugin {}