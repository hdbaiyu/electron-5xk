const { app, BrowserWindow, shell,screen, Menu, Tray} = require('electron')
const { release } = require('os')
const { join }= require('path')


// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}
let win = null

async function createWindow() {
  const {width,height} =  screen.getPrimaryDisplay().workAreaSize
  let appWidth = width
  if (width > 2560) {
    appWidth = 2560
  }
  win = new BrowserWindow({
    icon: join(__dirname,'./build/icon.ico'),
    titleBarStyle: 'hidden',
    width: appWidth,
    height: height,
    title: '星卡平台',
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      contextIsolation: false,
      // devTools: true
    },

  })
  
  win.loadURL('https://supplier.5xk.cn/')
    // win.webContents.openDevTools()

  // Test active push message to Renderer-process
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
}
const NOTIFICATION_TITLE = 'Basic Notification'
const NOTIFICATION_BODY = 'Notification from the Main process'

function showNotification () {
  new Notification({ title: NOTIFICATION_TITLE, body: NOTIFICATION_BODY }).show()
}


app.whenReady().then(()=> {
  if (process.platform === 'darwin') {
    // app.dock.setIcon('./assets/logo.png')
  }else{
    const icon = nativeImage.createFromPath(join(__dirname,'./assets/logo.png'))
    new Tray(icon)
  }
 
  app.setName('星卡平台')
  createWindow()
})

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})


const menu = Menu.buildFromTemplate([])
Menu.setApplicationMenu(menu)
