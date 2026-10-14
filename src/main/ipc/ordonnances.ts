import { ipcMain } from 'electron'
import { getDatabase } from '../db/db_index'

interface MedicamentInput {
  nomCommercial: string
  nomGenerique?: string
  forme?: string
  dosageDisponible?: string
  classeTherapeutique?: string
}

interface LigneInput {
  idMedicament: number
  posologie: string
  momentPrise?: string
  dureeTraitement?: string
}

const SELECT_LIGNES = `
  SELECT l.id, l.idOrdonnance, l.idMedicament, l.posologie, l.momentPrise, l.dureeTraitement,
         m.nomCommercial, m.nomGenerique, m.forme, m.dosageDisponible
  FROM ligneOrdonnance l
  JOIN medicament m ON m.id = l.idMedicament
  WHERE l.idOrdonnance = ?
  ORDER BY l.id ASC
`

export function registerOrdonnancesHandlers(): void {
  ipcMain.handle('medicaments:rechercher', (_event, query: string) => {
    const db = getDatabase()
    const like = `%${query}%`
    return db
      .prepare(
        'SELECT * FROM medicament WHERE nomCommercial LIKE ? OR nomGenerique LIKE ? ORDER BY nomCommercial LIMIT 20'
      )
      .all(like, like)
  })

  ipcMain.handle('medicaments:creerRapide', (_event, data: MedicamentInput) => {
    const db = getDatabase()
    const result = db
      .prepare(
        `INSERT INTO medicament (nomCommercial, nomGenerique, forme, dosageDisponible, classeTherapeutique)
        VALUES (@nomCommercial, @nomGenerique, @forme, @dosageDisponible, @classeTherapeutique)`
      )
      .run({
        nomCommercial: data.nomCommercial,
        nomGenerique: data.nomGenerique ?? null,
        forme: data.forme ?? null,
        dosageDisponible: data.dosageDisponible ?? null,
        classeTherapeutique: data.classeTherapeutique ?? null
      })
    return db.prepare('SELECT * FROM medicament WHERE id = ?').get(result.lastInsertRowid)
  })

  ipcMain.handle('ordonnances:get', (_event, idConsultation: number) => {
    const db = getDatabase()
    let ordonnance = db
      .prepare('SELECT * FROM ordonnance WHERE idConsultation = ?')
      .get(idConsultation) as
      { id: number; idConsultation: number; dateOrdonnance: string } | undefined

    if (!ordonnance) {
      const result = db
        .prepare('INSERT INTO ordonnance (idConsultation) VALUES (?)')
        .run(idConsultation)
      ordonnance = db
        .prepare('SELECT * FROM ordonnance WHERE id = ?')
        .get(result.lastInsertRowid) as typeof ordonnance
    }

    const lignes = db.prepare(SELECT_LIGNES).all(ordonnance!.id)
    return { ...ordonnance, lignes }
  })

  ipcMain.handle('ordonnances:ajouterLigne', (_event, idOrdonnance: number, data: LigneInput) => {
    const db = getDatabase()
    const result = db
      .prepare(
        `INSERT INTO ligneOrdonnance (idOrdonnance, idMedicament, posologie, momentPrise, dureeTraitement)
        VALUES (@idOrdonnance, @idMedicament, @posologie, @momentPrise, @dureeTraitement)`
      )
      .run({
        idOrdonnance,
        idMedicament: data.idMedicament,
        posologie: data.posologie,
        momentPrise: data.momentPrise ?? null,
        dureeTraitement: data.dureeTraitement ?? null
      })
    return db
      .prepare(SELECT_LIGNES.replace('WHERE l.idOrdonnance = ?', 'WHERE l.id = ?'))
      .get(result.lastInsertRowid)
  })

  ipcMain.handle('ordonnances:modifierNotes', (_event, idOrdonnance: number, notes: string) => {
    const db = getDatabase()
    db.prepare('UPDATE ordonnance SET notes = ? WHERE id = ?').run(notes, idOrdonnance)
    return true
  })

  ipcMain.handle('ordonnances:supprimerLigne', (_event, idLigne: number) => {
    const db = getDatabase()
    db.prepare('DELETE FROM ligneOrdonnance WHERE id = ?').run(idLigne)
    return true
  })
}
