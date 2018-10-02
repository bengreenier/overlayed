import { app, ipcMain, Menu, MenuItem, nativeImage, Tray } from "electron"
import log from 'electron-log'
import settings from "electron-settings"
import os from "os"
import path from "path"
import { IPCMessageNames } from "../ipc/IPCMessageNames"
import { CompositeWindow } from "./CompositeWindow"

const windowSettingsKey = 'overlayed.window'

export class Bootstrap {
  public compositor : CompositeWindow
  public tray : Tray

  constructor() {
    // setup ipc commands

    // support showing tooltips
    ipcMain.on(IPCMessageNames.ShowTooltip, (e : Event, tooltipOpts : Electron.DisplayBalloonOptions) => {
      log.info(`showing tooltip ${tooltipOpts.title}`)

      this.tray.displayBalloon(tooltipOpts)
    })

    // setup the tray
    this.tray = new Tray(this.getTrayIcon())

    this.tray.setContextMenu(this.buildTrayMenu())
    this.tray.setToolTip('Overlayed')

    this.tray.on('click', () => {
      this.tray.popUpContextMenu()
    })

    // setup the compositor
    this.compositor = new CompositeWindow(this.getCompositorSettings())

    this.compositor.loadFile(`${__dirname}/../app/main/main.html`)

    let isShuttingDown = false
    this.compositor.on('close', (e) => {
      if (!isShuttingDown) {
        e.preventDefault()
    
        isShuttingDown = true
        
        // if we aren't shutdown in 5s, force it
        setTimeout(() => {
          this.compositor.close()
        }, 5000)
  
        // listen for react to complete
        ipcMain.on(IPCMessageNames.AllowShutdown, () => {
          this.compositor.close()
        })
  
        // ask react to shutdown
        this.compositor.webContents.send(IPCMessageNames.RequestShutdown)
      }
    })

    // save state when we're closing
    this.compositor.on('close', () => {
      // save out window settings
      settings.set(windowSettingsKey,
        this.compositor.getBounds() as any,
        { prettify: true })
    })

    log.info('completed electron bootstrapping')
  }

  private getCompositorSettings() {
    return settings.get(windowSettingsKey, {
      height: 480,
      width: 680,
      x: 0,
      y: 0,
    }) as {x: number, y: number, width: number, height: number}
  }

  private buildTrayMenu() {
    const mainTrayMenu = new Menu()
    const devTrayMenu = new Menu()

    mainTrayMenu.append(new MenuItem({
      click: () => {
        this.compositor.toggleWindowInteractivity()
      },
      label: 'Toggle Edit',
    }))

    mainTrayMenu.append(new MenuItem({
      label: 'Developer',
      submenu: devTrayMenu,
    }))

    mainTrayMenu.append(new MenuItem({
      click: () => {
        app.quit()
      },
      label: 'Close',
    }))

    devTrayMenu.append(new MenuItem({
      click: () => {
        this.compositor.toggleDevTools()
      },
      label: 'Toggle Tools',
    }))

    devTrayMenu.append(new MenuItem({
      click: () => {
        this.compositor.reload()
      },
      label: 'Force Reload',
    }))

    return mainTrayMenu
  }

  private getTrayIcon() {
    const getNativeImage = (filename: string) =>
      nativeImage.createFromPath(path.join(__dirname, 'assets/images', filename))
  
    // Load correct icon depending on the current platform.
    switch (os.platform()) {
  
      // Use the 16x16 (tray.png) and 32x32 (tray@2x.png) versions for macOS.
      // The system chosses the correct file automatically.
      // We also need to set it as a template image so macOS can colour it depending on the current system theme.
      case 'darwin':
        const image = getNativeImage('tray.png')
        image.setTemplateImage(true)
        return image
      
      // Use the ICO file for Windows.
      case 'win32':
        return getNativeImage('tray.ico')
  
      // Use the 'raw' PNG file for all other platforms.
      default:
        return getNativeImage('trayFull.png')
    }
  }
}