import { ipcMain } from 'electron'
import { getDatabase } from '../db/db_index'

interface DocumentCliniqueInput {
  idConsultation: number
  typeDocument:
    'CERTIFICAT_APTITUDE' | 'ARRET_TRAVAIL' | 'CERTIFICAT_HOSPITALISATION' | 'DEMANDE_EXAMEN'
  dateDebut?: string
  dateFin?: string
  etablissement?: string
  contenu: string
}

export function registerDocumentsCliniquesHandlers(): void {
  ipcMain.handle('documentsCliniques:creer', (_event, data: DocumentCliniqueInput) => {
    const db = getDatabase()
    const result = db
      .prepare(
        `INSERT INTO documentClinique (idConsultation, typeDocument, dateDebut, dateFin, etablissement, contenu)
         VALUES (@idConsultation, @typeDocument, @dateDebut, @dateFin, @etablissement, @contenu)`
      )
      .run({
        idConsultation: data.idConsultation,
        typeDocument: data.typeDocument,
        dateDebut: data.dateDebut ?? null,
        dateFin: data.dateFin ?? null,
        etablissement: data.etablissement ?? null,
        contenu: data.contenu
      })
    return db.prepare('SELECT * FROM documentClinique WHERE id = ?').get(result.lastInsertRowid)
  })

  ipcMain.handle('documentsCliniques:listerParConsultation', (_event, idConsultation: number) => {
    const db = getDatabase()
    return db
      .prepare('SELECT * FROM documentClinique WHERE idConsultation = ? ORDER BY dateEmission DESC')
      .all(idConsultation)
  })
}
