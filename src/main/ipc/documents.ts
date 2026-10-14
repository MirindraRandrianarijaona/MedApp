import { app, shell, ipcMain } from 'electron'
import { join } from 'path'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { getDatabase } from '../db/db_index'

function nettoyer(texte: string): string {
  return texte.replace(/[\\/:*?"<>|]/g, '_').trim()
}

export function registerDocumentsHandlers(): void {
  ipcMain.handle(
    'documents:ouvrirPDF',
    async (_event, base64: string, nomFichier: string, dossierPatient: string) => {
      const buffer = Buffer.from(base64, 'base64')
      const dossierComplet = join(app.getPath('userData'), 'documents', nettoyer(dossierPatient))
      if (!existsSync(dossierComplet)) mkdirSync(dossierComplet, { recursive: true })
      const chemin = join(dossierComplet, nettoyer(nomFichier))
      writeFileSync(chemin, buffer)
      await shell.openPath(chemin)
      return chemin
    }
  )

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
