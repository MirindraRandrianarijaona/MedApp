import { app, dialog, ipcMain } from 'electron'
import { copyFileSync } from 'fs'
import { getDatabase, getDbPath, closeDatabase } from '../db'

export function registerBackupHandlers(): void {
  ipcMain.handle('backup:exporter', async () => {
    const db = getDatabase()
    db.pragma('wal_checkpoint(TRUNCATE)')

    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Exporter une sauvegarde',
      defaultPath: `medicapp_sauvegarde_${new Date().toISOString().slice(0, 10)}.db`,
      filters: [{ name: 'Base de données', extensions: ['db'] }]
    })
    if (canceled || !filePath) return null

    copyFileSync(getDbPath(), filePath)
    return filePath
  })

  ipcMain.handle('backup:restaurer', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Restaurer une sauvegarde',
      filters: [{ name: 'Base de données', extensions: ['db'] }],
      properties: ['openFile']
    })
    if (canceled || filePaths.length === 0) return false

    closeDatabase()
    copyFileSync(filePaths[0], getDbPath())
    app.relaunch()
    app.exit()
    return true
  })
}
