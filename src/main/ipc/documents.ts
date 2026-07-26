import { app, shell, ipcMain } from 'electron'
import { join } from 'path'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { getDatabase } from '../db'

export function registerDocumentsHandlers(): void {
  ipcMain.handle('documents:ouvrirPDF', async (_event, base64: string, nomFichier: string) => {
    const buffer = Buffer.from(base64, 'base64')
    const dossierDocs = join(app.getPath('userData'), 'documents')
    if (!existsSync(dossierDocs)) mkdirSync(dossierDocs, { recursive: true })
    const chemin = join(dossierDocs, nomFichier)
    writeFileSync(chemin, buffer)
    await shell.openPath(chemin)
    return chemin
  })

  ipcMain.handle(
    'documents:enregistrer',
    (_event, idConsultation: number, typeDocument: string, cheminFichier: string) => {
      const db = getDatabase()
      db.prepare(
        'INSERT INTO documentMedical (idConsultation, typeDocument, cheminFichier) VALUES (?, ?, ?)'
      ).run(idConsultation, typeDocument, cheminFichier)
      return true
    }
  )
}
