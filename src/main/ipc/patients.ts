import { ipcMain } from 'electron'
import { getDatabase } from '../db'

interface PatientInput {
  numeroDossier: string
  nom: string
  prenom: string
  sexe: 'M' | 'F'
  dateNaissance: string
  adresse?: string
  telephone?: string
  antecedentsMedicaux?: string
  allergies?: string
  observations?: string
}

export function registerPatientsHandlers(): void {
  ipcMain.handle('patients:lister', (_event, inclureArchives = false) => {
    const db = getDatabase()
    const clause = inclureArchives ? '' : 'WHERE archive = 0'
    return db.prepare(`SELECT * FROM patient ${clause} ORDER BY nom, prenom`).all()
  })

  ipcMain.handle('patients:rechercher', (_event, query: string, inclureArchives = false) => {
    const db = getDatabase()
    const like = `%${query}%`
    const clauseArchive = inclureArchives ? '' : 'AND archive = 0'
    return db
      .prepare(
        `SELECT * FROM patient WHERE (nom LIKE ? OR prenom LIKE ? OR telephone LIKE ?) ${clauseArchive} ORDER BY nom, prenom`
      )
      .all(like, like, like)
  })

  ipcMain.handle('patients:get', (_event, id: number) => {
    const db = getDatabase()
    const patient = db.prepare('SELECT * FROM patient WHERE id = ?').get(id)
    if (!patient) throw new Error(`Patient ${id} introuvable.`)
    return patient
  })

  ipcMain.handle('patients:ajouter', (_event, data: PatientInput) => {
    const db = getDatabase()
    const result = db
      .prepare(
        `INSERT INTO patient
        (numeroDossier, nom, prenom, sexe, dateNaissance, adresse, telephone, antecedentsMedicaux, allergies, observations)
        VALUES (@numeroDossier, @nom, @prenom, @sexe, @dateNaissance, @adresse, @telephone, @antecedentsMedicaux, @allergies, @observations)`
      )
      .run({
        adresse: null,
        telephone: null,
        antecedentsMedicaux: null,
        allergies: null,
        observations: null,
        ...data
      })
    return db.prepare('SELECT * FROM patient WHERE id = ?').get(result.lastInsertRowid)
  })

  ipcMain.handle('patients:modifier', (_event, id: number, data: Partial<PatientInput>) => {
    const db = getDatabase()
    const existant = db.prepare('SELECT * FROM patient WHERE id = ?').get(id) as
      PatientInput | undefined
    if (!existant) throw new Error(`Patient ${id} introuvable.`)
    const fusion = { ...existant, ...data }

    db.prepare(
      `UPDATE patient SET
        numeroDossier=@numeroDossier, nom=@nom, prenom=@prenom, sexe=@sexe, dateNaissance=@dateNaissance,
        adresse=@adresse, telephone=@telephone, antecedentsMedicaux=@antecedentsMedicaux,
        allergies=@allergies, observations=@observations
      WHERE id=@id`
    ).run({ ...fusion, id })

    return db.prepare('SELECT * FROM patient WHERE id = ?').get(id)
  })

  ipcMain.handle('patients:supprimer', (_event, id: number) => {
    const db = getDatabase()
    const nbConsultations = (
      db.prepare('SELECT COUNT(*) as n FROM consultation WHERE idPatient = ?').get(id) as {
        n: number
      }
    ).n

    if (nbConsultations > 0) {
      db.prepare('UPDATE patient SET archive = 1 WHERE id = ?').run(id)
      return { action: 'archive' as const }
    }

    db.prepare('DELETE FROM patient WHERE id = ?').run(id)
    return { action: 'supprime' as const }
  })

  ipcMain.handle('patients:desarchiver', (_event, id: number) => {
    const db = getDatabase()
    db.prepare('UPDATE patient SET archive = 0 WHERE id = ?').run(id)
    return true
  })

  ipcMain.handle('patients:genererNumeroDossier', () => {
    const db = getDatabase()
    const annee = new Date().getFullYear()
    const prefix = `FAC-${annee}-`
    const dernier = db
      .prepare(
        'SELECT numeroDossier FROM patient WHERE numeroDossier LIKE ? ORDER BY numeroDossier DESC LIMIT 1'
      )
      .get(`${prefix}%`) as { numeroDossier: string } | undefined

    let prochain = 1
    if (dernier) {
      const dernierNum = parseInt(dernier.numeroDossier.split('-')[2], 10)
      if (!Number.isNaN(dernierNum)) prochain = dernierNum + 1
    }
    return `${prefix}${String(prochain).padStart(4, '0')}`
  })
}
