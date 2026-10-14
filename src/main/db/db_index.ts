import Database from 'better-sqlite3-multiple-ciphers'
import { app } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs'
import { SCHEMA } from './schema'
import { MEDICAMENTS_SEED } from './medicamentsSeed'

let db: InstanceType<typeof Database> | null = null
let cheminDb = ''

const CLE_SEED_MEDICAMENTS = 'medicamentsImportesV1'

export function getDbPath(): string {
  if (!cheminDb) cheminDb = join(app.getPath('userData'), 'medicapp.db')
  return cheminDb
}

export function baseExiste(): boolean {
  return existsSync(getDbPath())
}

function importerMedicamentsSiNecessaire(instance: InstanceType<typeof Database>): void {
  const dejaImporte = instance
    .prepare('SELECT valeur FROM metadonnee WHERE cle = ?')
    .get(CLE_SEED_MEDICAMENTS)

  if (dejaImporte) return

  const importer = instance.transaction(() => {
    instance.exec(MEDICAMENTS_SEED)
    instance
      .prepare('INSERT OR REPLACE INTO metadonnee (cle, valeur) VALUES (?, ?)')
      .run(CLE_SEED_MEDICAMENTS, new Date().toISOString())
  })

  importer()
}

export function ouvrirBase(motDePasse: string): boolean {
  const instance = new Database(getDbPath())
  instance.pragma("cipher='sqlcipher'")
  instance.pragma(`key='${motDePasse.replace(/'/g, "''")}'`)

  try {
    // Requête de validation : échoue si la clé est incorrecte sur un fichier déjà chiffré
    instance.prepare('SELECT count(*) FROM sqlite_master').get()
  } catch {
    instance.close()
    return false
  }

  instance.pragma('journal_mode = WAL')
  instance.pragma('foreign_keys = ON')
  instance.exec(SCHEMA)
  importerMedicamentsSiNecessaire(instance)
  db = instance
  return true
}

export function getDatabase(): InstanceType<typeof Database> {
  if (!db) throw new Error('Base de données verrouillée — mot de passe de chiffrement requis.')
  return db
}

export function fermerBase(): void {
  db?.close()
  db = null
}
