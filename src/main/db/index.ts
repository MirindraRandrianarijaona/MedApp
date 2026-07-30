import Database from 'better-sqlite3-multiple-ciphers'
import { app } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs'
import { SCHEMA } from './schema'

let db: InstanceType<typeof Database> | null = null
let cheminDb = ''

export function getDbPath(): string {
  if (!cheminDb) cheminDb = join(app.getPath('userData'), 'medicapp.db')
  return cheminDb
}

export function baseExiste(): boolean {
  return existsSync(getDbPath())
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
