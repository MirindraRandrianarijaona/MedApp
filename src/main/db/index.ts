import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { SCHEMA } from './schema'

let db: Database.Database | null = null
let cheminDb = ''

export function initDatabase(): Database.Database {
  cheminDb = join(app.getPath('userData'), 'medicapp.db')
  db = new Database(cheminDb)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.exec(SCHEMA)
  return db
}

export function getDatabase(): Database.Database {
  if (!db) throw new Error('Database non initialisée — appelle initDatabase() au démarrage.')
  return db
}

export function getDbPath(): string {
  return cheminDb
}

export function closeDatabase(): void {
  db?.close()
  db = null
}
