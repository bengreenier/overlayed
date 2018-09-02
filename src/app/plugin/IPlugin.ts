import React from "react";

export interface IPluginProperties {
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
 * Interface for a plugin
 * 
 * Note: Plugins should each have their own folder
 */
export interface IInstalledPlugin extends IPluginProperties{
  /**
   * The actual react component
   */
  component: React.ComponentType<any>
}

export interface IInstallNeededPlugin extends IPluginProperties {
  /**
   * The path to the component
   */
  component: string
}