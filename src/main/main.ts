import path from 'path'
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import MenuBuilder from './menu'
import { resolveHtmlPath } from './util'
import fs from 'fs'
import { spawn, ChildProcess, exec } from 'child_process' // Import exec from child_process

class AppUpdater {
  constructor () {
    log.transports.file.level = 'info'
    autoUpdater.logger = log
    autoUpdater.checkForUpdatesAndNotify()
  }
}

// Start backend code
const controller = new AbortController()
const signal = controller.signal

const BACKEND_API_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'src', 'backend', 'dist', 'api.exe')
  : path.join(__dirname, '..', 'backend', 'dist', 'api.exe')

let mainWindow: BrowserWindow | null = null

// Set up log file path
const logFilePath = app.isPackaged
  ? path.join(process.resourcesPath, 'logs', 'api.log')
  : path.join(__dirname, '..', 'logs', 'api.log')

// Ensure the log directory exists
fs.mkdirSync(path.dirname(logFilePath), { recursive: true })

const logFile = fs.createWriteStream(logFilePath, { flags: 'a' })

const exeProcess: ChildProcess = spawn(BACKEND_API_PATH, [], { stdio: 'pipe' })

// Pipe stdout and stderr to the log file
exeProcess.stdout.on('data', (data) => {
  logFile.write(`stdout: ${data}\n`)
})

exeProcess.stderr.on('data', (data) => {
  logFile.write(`stderr: ${data}\n`)
})

exeProcess.on('close', (code) => {
  logFile.write(`Child process exited with code ${code}\n`)
})

// End backend code

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`
  console.log(msgTemplate(arg))
  event.reply('ipc-example', msgTemplate('pong'))
})

const isDebug = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true'

if (isDebug) {
  require('electron-debug')()
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer')
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS
  const extensions = ['REACT_DEVELOPER_TOOLS']

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log)
}

const createWindow = async () => {
  // if (isDebug) {
  //   await installExtensions()
  // }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets')

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths)
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.svg'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js')
    }
  })

  mainWindow.loadURL(resolveHtmlPath('index.html'))

  mainWindow.on('ready-to-show', () => {
    if (mainWindow == null) {
      throw new Error('"mainWindow" is not defined')
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize()
    } else {
      mainWindow.removeMenu()
      mainWindow.show()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  const menuBuilder = new MenuBuilder(mainWindow)
  menuBuilder.buildMenu()

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url)
    return { action: 'deny' }
  })

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
}

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  killAllApiProcesses() // Kill all "api.exe" processes
})

app
  .whenReady()
  .then(() => {
    createWindow()
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow()
    })
  })
  .catch(console.log)

// Function to kill all "api.exe" processes
function killAllApiProcesses () {
  exec('taskkill /IM api.exe /F', (err, stdout, stderr) => {
    if (err != null) {
      console.error(`Error killing api.exe processes: ${stderr}`)
    } else {
      console.log(`Killed all api.exe processes: ${stdout}`)
    }
  })
}
