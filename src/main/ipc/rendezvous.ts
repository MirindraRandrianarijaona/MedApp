import { ipcMain } from 'electron'
import { getDatabase } from '../db/db_index'

interface RendezVousInput {
  idPatient?: number
  nomPatientTemporaire?: string
  telephoneTemporaire?: string
  dateRdv: string
  heureDebut: string
  motif?: string
}

const SELECT_JOINT = `
  SELECT r.*, p.nom as patientNom, p.prenom as patientPrenom
  FROM rendezVous r
  LEFT JOIN patient p ON p.id = r.idPatient
`

export function registerRendezVousHandlers(): void {
  ipcMain.handle('rendezvous:creer', (_event, data: RendezVousInput) => {
    const db = getDatabase()
    const result = db
      .prepare(
        `INSERT INTO rendezVous (idPatient, nomPatientTemporaire, telephoneTemporaire, dateRdv, heureDebut, motif)
         VALUES (@idPatient, @nomPatientTemporaire, @telephoneTemporaire, @dateRdv, @heureDebut, @motif)`
      )
      .run({
        idPatient: data.idPatient ?? null,
        nomPatientTemporaire: data.nomPatientTemporaire ?? null,
        telephoneTemporaire: data.telephoneTemporaire ?? null,
        dateRdv: data.dateRdv,
        heureDebut: data.heureDebut,
        motif: data.motif ?? null
      })
    return db.prepare(`${SELECT_JOINT} WHERE r.id = ?`).get(result.lastInsertRowid)
  })

  ipcMain.handle('rendezvous:listerParJour', (_event, date: string) => {
    const db = getDatabase()
    return db.prepare(`${SELECT_JOINT} WHERE r.dateRdv = ? ORDER BY r.heureDebut ASC`).all(date)
  })

  ipcMain.handle('rendezvous:listerParPeriode', (_event, dateDebut: string, dateFin: string) => {
    const db = getDatabase()
    return db
      .prepare(
        `${SELECT_JOINT} WHERE r.dateRdv BETWEEN ? AND ? ORDER BY r.dateRdv ASC, r.heureDebut ASC`
      )
      .all(dateDebut, dateFin)
  })

  ipcMain.handle('rendezvous:listerAvenir', () => {
    const db = getDatabase()
    return db
      .prepare(
        `${SELECT_JOINT} WHERE r.dateRdv >= date('now') ORDER BY r.dateRdv ASC, r.heureDebut ASC`
      )
      .all()
  })

  ipcMain.handle('rendezvous:modifierStatut', (_event, idRdv: number, statut: string) => {
    const db = getDatabase()
    db.prepare('UPDATE rendezVous SET statut = ? WHERE id = ?').run(statut, idRdv)
    return true
  })

  ipcMain.handle('rendezvous:prochainPourPatient', (_event, idPatient: number) => {
    const db = getDatabase()
    return db
      .prepare(
        `${SELECT_JOINT} WHERE r.idPatient = ? AND r.dateRdv >= date('now') AND r.statut != 'ANNULE'
       ORDER BY r.dateRdv ASC, r.heureDebut ASC LIMIT 1`
      )
      .get(idPatient)
  })

  ipcMain.handle('rendezvous:supprimer', (_event, idRdv: number) => {
    const db = getDatabase()
    db.prepare('DELETE FROM rendezVous WHERE id = ?').run(idRdv)
    return true
  })
}
