import { BrowserWindow, BrowserWindowConstructorOptions } from "electron"
import { IPCMessageNames } from "../ipc/IPCMessageNames";

/**
 * Overlay style electron window
 */
export class CompositeWindow extends BrowserWindow {
  private isInteractive = false

  constructor(opts ?: BrowserWindowConstructorOptions) {
    super({...opts, ...{
      alwaysOnTop: true,
      focusable: false,
      frame: false,
      skipTaskbar: true,
      transparent: true
    }})

    this.setIgnoreMouseEvents(true)
  }

  /**
   * Toggles window interactivity - making it clickable and whatnot
   */
  public toggleWindowInteractivity() {
    this.isInteractive = !this.isInteractive

    this.setFocusable(this.isInteractive)
    this.setIgnoreMouseEvents(!this.isInteractive)

    // notify react side
    this.webContents.send(IPCMessageNames.ToggleEditMode, this.isInteractive)
  }

  /**
   * Toggles dev tools overlay - showing chrome dev tools in the electron window
   */
  public toggleDevTools() {
    this.webContents.toggleDevTools()
  }
}