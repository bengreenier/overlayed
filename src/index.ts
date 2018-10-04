import { app, ipcMain, Menu, MenuItem, nativeImage, screen, Tray } from 'electron'
import settings from 'electron-settings'
import { platform } from 'os'
import path from 'path'
import { CompositeWindow } from './electron/CompositeWindow'
import { IPCMessageNames } from './ipc/IPCMessageNames';
import { isUndefined } from 'util';

let mainWindow : CompositeWindow
let mainTray : Tray

/**
 * Gets the correct icon for the system tray depending on the current platform.
 */
const getTrayIcon = () => {
  const getNativeImage = (filename: string) =>
    nativeImage.createFromPath(path.join(__dirname, 'electron/assets/images', filename))

  // Load correct icon depending on the current platform.
  switch (platform()) {

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


// our window dimensions settings key path
const windowDimsSettingsKey = 'overlayed.window'

const allocMainWindow = () => {
  
  // create our window
  mainWindow = new CompositeWindow()

  // see if we have window settings, if so, use them
  // if there is no window settings available 
  // we read the size of primary display and then adjusting the window size to it
  const windowDims = settings.get(
    windowDimsSettingsKey, 
    screen.getPrimaryDisplay().workArea
  ) as {x: number, y: number, width: number, height: number}  

  mainWindow.setSize( windowDims.width, windowDims.height, false)
  mainWindow.setPosition(windowDims.x, windowDims.y, false)

  // tell the window to load the entry point
  mainWindow.loadFile(`${__dirname}/app/main/main.html`)

  let isShuttingDown = false
  mainWindow.on('close', (e) => {
    if (!isShuttingDown) {
      e.preventDefault()
  
      isShuttingDown = true
      
      // if we aren't shutdown in 5s, force it
      setTimeout(() => {
        mainWindow.close()
      }, 5000)

      // listen for react to complete
      ipcMain.on(IPCMessageNames.AllowShutdown, () => {
        mainWindow.close()
      })

      // ask react to shutdown
      mainWindow.webContents.send(IPCMessageNames.RequestShutdown)
    }
  })

  // save state when we're closing
  mainWindow.on('close', () => {
    // save out window settings
    settings.set(windowDimsSettingsKey,
      mainWindow.getBounds() as any,
      { prettify: true });
  })

  // cleanup when we're closed
  mainWindow.on('closed', () => {
    // nuke the window
    (mainWindow as any) = null
  })

  // create our tray system
  mainTray = new Tray(getTrayIcon())
  mainTray.setToolTip('Overlayed')

  mainTray.on('click', () => {
    mainTray.popUpContextMenu()
  })

  // create the menus we'll add to the tray system
  const mainTrayMenu = new Menu()
  const devTrayMenu = new Menu()

  mainTrayMenu.append(new MenuItem({
    click: () => {
      mainWindow.toggleWindowInteractivity()
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
      mainWindow.toggleDevTools()
    },
    label: 'Toggle Tools'
  }))

  devTrayMenu.append(new MenuItem({
    click: () => {
      mainWindow.reload()
    },
    label: 'Force Reload'
  }))

  // setup the tray menus
  mainTray.setContextMenu(mainTrayMenu)
}

// app handlers to get things going when electron starts
app.on('ready', allocMainWindow)
app.on('activate', () => {
  if (mainWindow === null) {
    allocMainWindow()
  }
})

// app handlers to shut things down when electron stops
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
