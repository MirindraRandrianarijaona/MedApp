import { ipcMain } from 'electron'
import { getDatabase } from '../db'

interface ParametresInput {
  poids?: number
  taille?: number
  tensionArterielleSystolique?: number
  tensionArterielleDiastolique?: number
  temperature?: number
  saturationOxygene?: number
}

interface ConsultationInput {
  idPatient: number
  motif: string
  symptomes?: string
  diagnostic?: string
  parametres?: ParametresInput
}

const SELECT_JOINT = `
  SELECT c.id, c.idPatient, c.dateConsultation, c.motif, c.symptomes, c.diagnostic,
         p.poids, p.taille, p.tensionArterielleSystolique, p.tensionArterielleDiastolique,
         p.temperature, p.saturationOxygene
  FROM consultation c
  LEFT JOIN parametreMedical p ON p.idConsultation = c.id
`

export function registerConsultationsHandlers(): void {
  ipcMain.handle('consultations:creer', (_event, data: ConsultationInput) => {
    const db = getDatabase()

    const inserer = db.transaction((data: ConsultationInput) => {
      const resultConsult = db
        .prepare(
          'INSERT INTO consultation (idPatient, motif, symptomes, diagnostic) VALUES (@idPatient, @motif, @symptomes, @diagnostic)'
        )
        .run({
          idPatient: data.idPatient,
          motif: data.motif,
          symptomes: data.symptomes ?? null,
          diagnostic: data.diagnostic ?? null
        })
      const idConsultation = resultConsult.lastInsertRowid as number

      if (data.parametres) {
        db.prepare(
          `INSERT INTO parametreMedical
           (idConsultation, poids, taille, tensionArterielleSystolique, tensionArterielleDiastolique, temperature, saturationOxygene)
           VALUES (@idConsultation, @poids, @taille, @tas, @tad, @temperature, @spo2)`
        ).run({
          idConsultation,
          poids: data.parametres.poids ?? null,
          taille: data.parametres.taille ?? null,
          tas: data.parametres.tensionArterielleSystolique ?? null,
          tad: data.parametres.tensionArterielleDiastolique ?? null,
          temperature: data.parametres.temperature ?? null,
          spo2: data.parametres.saturationOxygene ?? null
        })
      }
      return idConsultation
    })

    const idConsultation = inserer(data)
    return db.prepare(`${SELECT_JOINT} WHERE c.id = ?`).get(idConsultation)
  })

  ipcMain.handle('consultations:get', (_event, id: number) => {
    const db = getDatabase()
    const consult = db.prepare(`${SELECT_JOINT} WHERE c.id = ?`).get(id)
    if (!consult) throw new Error(`Consultation ${id} introuvable.`)
    return consult
  })

  ipcMain.handle('consultations:listerParPatient', (_event, idPatient: number) => {
    const db = getDatabase()
    return db
      .prepare(`${SELECT_JOINT} WHERE c.idPatient = ? ORDER BY c.dateConsultation DESC`)
      .all(idPatient)
  })

  ipcMain.handle(
    'consultations:enregistrerParametres',
    (_event, idConsultation: number, params: ParametresInput) => {
      const db = getDatabase()
      const existant = db
        .prepare('SELECT id FROM parametreMedical WHERE idConsultation = ?')
        .get(idConsultation)
      const valeurs = {
        idConsultation,
        poids: params.poids ?? null,
        taille: params.taille ?? null,
        tas: params.tensionArterielleSystolique ?? null,
        tad: params.tensionArterielleDiastolique ?? null,
        temperature: params.temperature ?? null,
        spo2: params.saturationOxygene ?? null
      }
      if (existant) {
        db.prepare(
          `UPDATE parametreMedical SET poids=@poids, taille=@taille, tensionArterielleSystolique=@tas,
         tensionArterielleDiastolique=@tad, temperature=@temperature, saturationOxygene=@spo2
         WHERE idConsultation=@idConsultation`
        ).run(valeurs)
      } else {
        db.prepare(
          `INSERT INTO parametreMedical (idConsultation, poids, taille, tensionArterielleSystolique, tensionArterielleDiastolique, temperature, saturationOxygene)
         VALUES (@idConsultation, @poids, @taille, @tas, @tad, @temperature, @spo2)`
        ).run(valeurs)
      }
      return true
    }
  )

  ipcMain.handle(
    'consultations:ajouterComplement',
    (_event, idConsultation: number, contenu: string) => {
      const db = getDatabase()
      const result = db
        .prepare('INSERT INTO complementConsultation (idConsultation, contenu) VALUES (?, ?)')
        .run(idConsultation, contenu)
      return db
        .prepare('SELECT * FROM complementConsultation WHERE id = ?')
        .get(result.lastInsertRowid)
    }
  )

  ipcMain.handle('consultations:listerComplements', (_event, idConsultation: number) => {
    const db = getDatabase()
    return db
      .prepare(
        'SELECT * FROM complementConsultation WHERE idConsultation = ? ORDER BY dateAjout ASC'
      )
      .all(idConsultation)
  })
}
