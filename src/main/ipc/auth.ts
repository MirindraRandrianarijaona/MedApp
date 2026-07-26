import { ipcMain } from 'electron'
import * as argon2 from 'argon2'
import { getDatabase } from '../db'

interface Medecin {
  id: number
  nom: string
  specialite: string | null
  adresseCabinet: string | null
  numeroOrdre: string | null
  contact: string | null
  motDePasseHash: string
  cleActivation: string | null
}

interface CreerProfilInput {
  nom: string
  specialite?: string
  adresseCabinet?: string
  numeroOrdre?: string
  contact?: string
  motDePasse: string
}

export function registerAuthHandlers(): void {
  ipcMain.handle('auth:verifierSession', () => {
    const db = getDatabase()
    const medecin = db.prepare('SELECT * FROM medecin LIMIT 1').get() as Medecin | undefined
    if (!medecin) return null
    const { motDePasseHash, ...profil } = medecin
    return profil
  })

  ipcMain.handle('auth:creerProfil', async (_event, data: CreerProfilInput) => {
    const db = getDatabase()
    const existant = db.prepare('SELECT id FROM medecin LIMIT 1').get()
    if (existant) throw new Error('Un profil médecin existe déjà.')

    const hash = await argon2.hash(data.motDePasse)
    const result = db
      .prepare(
        `INSERT INTO medecin (nom, specialite, adresseCabinet, numeroOrdre, contact, motDePasseHash)
        VALUES (@nom, @specialite, @adresseCabinet, @numeroOrdre, @contact, @motDePasseHash)`
      )
      .run({
        nom: data.nom,
        specialite: data.specialite ?? null,
        adresseCabinet: data.adresseCabinet ?? null,
        numeroOrdre: data.numeroOrdre ?? null,
        contact: data.contact ?? null,
        motDePasseHash: hash
      })

    return db
      .prepare(
        'SELECT id, nom, specialite, adresseCabinet, numeroOrdre, contact FROM medecin WHERE id = ?'
      )
      .get(result.lastInsertRowid)
  })

  ipcMain.handle('auth:seConnecter', async (_event, motDePasse: string) => {
    const db = getDatabase()
    const medecin = db.prepare('SELECT * FROM medecin LIMIT 1').get() as Medecin | undefined
    if (!medecin) return false
    return argon2.verify(medecin.motDePasseHash, motDePasse)
  })

  ipcMain.handle('auth:modifierProfil', async (_event, data: Partial<CreerProfilInput>) => {
    const db = getDatabase()
    const medecin = db.prepare('SELECT * FROM medecin LIMIT 1').get() as Medecin | undefined
    if (!medecin) throw new Error('Aucun profil à modifier.')

    const fusion = {
      nom: data.nom ?? medecin.nom,
      specialite: data.specialite ?? medecin.specialite,
      adresseCabinet: data.adresseCabinet ?? medecin.adresseCabinet,
      numeroOrdre: data.numeroOrdre ?? medecin.numeroOrdre,
      contact: data.contact ?? medecin.contact,
      motDePasseHash: data.motDePasse ? await argon2.hash(data.motDePasse) : medecin.motDePasseHash
    }

    db.prepare(
      `UPDATE medecin SET nom=@nom, specialite=@specialite, adresseCabinet=@adresseCabinet,
         numeroOrdre=@numeroOrdre, contact=@contact, motDePasseHash=@motDePasseHash WHERE id=@id`
    ).run({ ...fusion, id: medecin.id })

    return { id: medecin.id, ...fusion, motDePasseHash: undefined }
  })
}
