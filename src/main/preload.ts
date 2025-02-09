import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

export type Channels = 'ipc-example'

const electronHandler = {
  ipcRenderer: {
    sendMessage (channel: Channels, ...args: unknown[]) { /* ... */ },
    on (channel: Channels, func: (...args: unknown[]) => void) { /* ... */ },
    once (channel: Channels, func: (...args: unknown[]) => void) { /* ... */ }
  }
}

contextBridge.exposeInMainWorld('electron', electronHandler)

export type ElectronHandler = typeof electronHandler
