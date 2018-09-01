import { app, Menu, MenuItem, nativeImage, Tray } from 'electron'
import settings from 'electron-settings'
import { CompositeWindow } from './electron/CompositeWindow'

let mainWindow : CompositeWindow
let mainTray : Tray

// our tray icon
const mainIcon = nativeImage.createFromDataURL('data:image/png;base64,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sWiGCbwB59wZ59xlY8wzVVVlsyC/bVtp27aqqiqb74ze+zsi8lJd1781xnybejzaYQL3ICLnvfcv13V9UJa4dENq27YQkd+XZXmpaZo/px5PLnAXbiGcj3RU1zX2gR4AM39SFMXFxWLxYeqx5AYTeEve+1pELhhjrlRVld2CfA2cc3/x3j9njHnDGONTjydHmMCnJCJnvfdX6rq+UJal+gX5GnjvRUReM8b8qq7rb1KPJ2eYwANh5r22bY+aptlPPRbNmPm9siwvNk3zp9RjmQJM4IHlmp1iQxaKAxM4glyzUwzIQnFhAkckIuedcy83TTO77IQsNI553VWJENF+WZav1HU9i50iROSTtm2RhWA6vPe1tTa7s536wGohmDwROWutzW610zrOOSaiI+ccVgvBPBDRHhHdSD35TouI3sVqIZgtIjpk5uw22RORz4no0dTXDyC5sND+xRw22XPO3SaiZ7GJHMAKZt611qrcZK/bRE5EsIkcwDpEtM/Mn6WetB1m/piIstoQACApDdkJWQjglETk3NjZCVkIYGBEtMfM0bMTshBARLGyE7IQwEiGzE7IQgCJMPPutmc7IQsBKNE3OzHzR8hCAIqEs52eXJedkIUAlAvZ6dpyduqyEM4WAshEl52Qhabt/wGOmiUe8iZLWQAAAABJRU5ErkJggg==')

// our window dimensions settings key path
const windowDimsSettingsKey = 'overlayed.window'

const allocMainWindow = () => {

  // see if we have window settings, if so, use them
  const windowDims = settings.get(windowDimsSettingsKey, {
    height: 480,
    width: 680,
    x: 0,
    y: 0,
  }) as {x: number, y: number, width: number, height: number}

  // create our window
  mainWindow = new CompositeWindow(windowDims)
  
  // tell the window to load the entry point
  mainWindow.loadFile(`${__dirname}/app/main/main.html`)

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
  mainTray = new Tray(mainIcon)
  mainTray.setTitle('Overlayed')
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