import { app } from 'electron'
import log from 'electron-log'
import { Bootstrap } from './electron/Bootstrap'

let bs : Bootstrap

// set the level to verbose if not production
if (process.env.NODE_ENV !== 'production') {
  log.transports.file.level = 'verbose'
}

const allocMainWindow = () => {
  bs = new Bootstrap()

  // cleanup when we're closed
  bs.compositor.on('closed', () => {
    // nuke the window
    (bs as any) = null
  })
}

// app handlers to get things going when electron starts
app.on('ready', allocMainWindow)
app.on('activate', () => {
  if (bs === null) {
    allocMainWindow()
  }
})

// app handlers to shut things down when electron stops
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})