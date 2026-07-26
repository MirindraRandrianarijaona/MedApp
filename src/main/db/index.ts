import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { SCHEMA } from './schema'

let db: Database.Database | null = null

export function initDatabase(): Database.Database {
  const dbPath = join(app.getPath('userData'), 'medicapp.db')
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.exec(SCHEMA)
  return db
}

export function getDatabase(): Database.Database {
  if (!db) throw new Error('Database non initialisée — appelle initDatabase() au démarrage.')
  return db
}
