import { ipcMain } from 'electron'
import { baseExiste, ouvrirBase } from '../db/db_index'

export function registerCoffreHandlers(): void {
  ipcMain.handle('coffre:etat', () => ({ existe: baseExiste() }))
  ipcMain.handle('coffre:creer', (_event, motDePasse: string) => ouvrirBase(motDePasse))
  ipcMain.handle('coffre:deverrouiller', (_event, motDePasse: string) => ouvrirBase(motDePasse))
}
