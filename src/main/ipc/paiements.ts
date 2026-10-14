import { ipcMain } from 'electron'
import { getDatabase } from '../db/db_index'

interface PaiementInput {
  montant: number
  modePaiement?: string
  statut?: 'PAYE' | 'EN_ATTENTE'
}

export function registerPaiementsHandlers(): void {
  ipcMain.handle('paiements:enregistrer', (_event, idConsultation: number, data: PaiementInput) => {
    const db = getDatabase()
    db.prepare(
      `INSERT INTO paiement (idConsultation, montant, modePaiement, statut)
       VALUES (@idConsultation, @montant, @modePaiement, @statut)
       ON CONFLICT(idConsultation) DO UPDATE SET
         montant = @montant, modePaiement = @modePaiement, statut = @statut, datePaiement = datetime('now')`
    ).run({
      idConsultation,
      montant: data.montant,
      modePaiement: data.modePaiement ?? null,
      statut: data.statut ?? 'EN_ATTENTE'
    })
    return db.prepare('SELECT * FROM paiement WHERE idConsultation = ?').get(idConsultation)
  })

  ipcMain.handle('paiements:get', (_event, idConsultation: number) => {
    const db = getDatabase()
    return db.prepare('SELECT * FROM paiement WHERE idConsultation = ?').get(idConsultation) ?? null
  })

  ipcMain.handle('paiements:modifierStatut', (_event, idPaiement: number, statut: string) => {
    const db = getDatabase()
    db.prepare('UPDATE paiement SET statut = ? WHERE id = ?').run(statut, idPaiement)
    return true
  })

  ipcMain.handle('paiements:getRecettesPeriode', (_event, dateDebut: string, dateFin: string) => {
    const db = getDatabase()
    const result = db
      .prepare(
        `SELECT COALESCE(SUM(montant), 0) as total FROM paiement
         WHERE statut = 'PAYE' AND date(datePaiement) BETWEEN ? AND ?`
      )
      .get(dateDebut, dateFin) as { total: number }
    return result.total
  })

  ipcMain.handle('paiements:listerEnAttente', () => {
    const db = getDatabase()
    return db
      .prepare(
        `SELECT c.id as idConsultation, c.idPatient, c.dateConsultation, c.motif,
              p.nom as patientNom, p.prenom as patientPrenom,
              pa.id as idPaiement, pa.montant, pa.modePaiement, pa.statut
       FROM consultation c
       JOIN patient p ON p.id = c.idPatient
       LEFT JOIN paiement pa ON pa.idConsultation = c.id
       WHERE pa.id IS NULL OR pa.statut = 'EN_ATTENTE'
       ORDER BY c.dateConsultation ASC`
      )
      .all()
  })
}
