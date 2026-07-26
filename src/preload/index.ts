import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

interface CreerProfilInput {
  nom: string
  specialite?: string
  adresseCabinet?: string
  numeroOrdre?: string
  contact?: string
  motDePasse: string
}

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

interface MedicamentInput {
  nomCommercial: string
  nomGenerique?: string
  forme?: string
  dosageDisponible?: string
  classeTherapeutique?: string
}

interface LigneInput {
  idMedicament: number
  posologie: string
  momentPrise?: string
  dureeTraitement?: string
}

interface RendezVousInput {
  idPatient?: number
  nomPatientTemporaire?: string
  telephoneTemporaire?: string
  dateRdv: string
  heureDebut: string
  motif?: string
}

// Custom APIs for renderer
const api = {
  auth: {
    verifierSession: () => ipcRenderer.invoke('auth:verifierSession'),
    creerProfil: (data: CreerProfilInput) => ipcRenderer.invoke('auth:creerProfil', data),
    seConnecter: (motDePasse: string) => ipcRenderer.invoke('auth:seConnecter', motDePasse),
    modifierProfil: (data: Partial<CreerProfilInput>) =>
      ipcRenderer.invoke('auth:modifierProfil', data)
  },
  patients: {
    lister: (inclureArchives?: boolean) => ipcRenderer.invoke('patients:lister', inclureArchives),
    rechercher: (query: string, inclureArchives?: boolean) =>
      ipcRenderer.invoke('patients:rechercher', query, inclureArchives),
    get: (id: number) => ipcRenderer.invoke('patients:get', id),
    ajouter: (data: PatientInput) => ipcRenderer.invoke('patients:ajouter', data),
    modifier: (id: number, data: Partial<PatientInput>) =>
      ipcRenderer.invoke('patients:modifier', id, data),
    supprimer: (id: number) => ipcRenderer.invoke('patients:supprimer', id),
    desarchiver: (id: number) => ipcRenderer.invoke('patients:desarchiver', id),
    genererNumeroDossier: () => ipcRenderer.invoke('patients:genererNumeroDossier')
  },
  consultations: {
    creer: (data: ConsultationInput) => ipcRenderer.invoke('consultations:creer', data),
    get: (id: number) => ipcRenderer.invoke('consultations:get', id),
    listerParPatient: (idPatient: number) =>
      ipcRenderer.invoke('consultations:listerParPatient', idPatient),
    enregistrerParametres: (idConsultation: number, params: ParametresInput) =>
      ipcRenderer.invoke('consultations:enregistrerParametres', idConsultation, params),
    ajouterComplement: (idConsultation: number, contenu: string) =>
      ipcRenderer.invoke('consultations:ajouterComplement', idConsultation, contenu),
    listerComplements: (idConsultation: number) =>
      ipcRenderer.invoke('consultations:listerComplements', idConsultation)
  },
  medicaments: {
    rechercher: (query: string) => ipcRenderer.invoke('medicaments:rechercher', query),
    creerRapide: (data: MedicamentInput) => ipcRenderer.invoke('medicaments:creerRapide', data)
  },
  ordonnances: {
    get: (idConsultation: number) => ipcRenderer.invoke('ordonnances:get', idConsultation),
    ajouterLigne: (idOrdonnance: number, data: LigneInput) =>
      ipcRenderer.invoke('ordonnances:ajouterLigne', idOrdonnance, data),
    modifierNotes: (idOrdonnance: number, notes: string) =>
      ipcRenderer.invoke('ordonnances:modifierNotes', idOrdonnance, notes),
    supprimerLigne: (idLigne: number) => ipcRenderer.invoke('ordonnances:supprimerLigne', idLigne)
  },
  documents: {
    ouvrirPDF: (base64: string, nomFichier: string) =>
      ipcRenderer.invoke('documents:ouvrirPDF', base64, nomFichier),
    enregistrer: (idConsultation: number, typeDocument: string, cheminFichier: string) =>
      ipcRenderer.invoke('documents:enregistrer', idConsultation, typeDocument, cheminFichier)
  },
  rendezvous: {
    creer: (data: RendezVousInput) => ipcRenderer.invoke('rendezvous:creer', data),
    listerParJour: (date: string) => ipcRenderer.invoke('rendezvous:listerParJour', date),
    listerParPeriode: (dateDebut: string, dateFin: string) =>
      ipcRenderer.invoke('rendezvous:listerParPeriode', dateDebut, dateFin),
    listerAvenir: () => ipcRenderer.invoke('rendezvous:listerAvenir'),
    modifierStatut: (idRdv: number, statut: string) =>
      ipcRenderer.invoke('rendezvous:modifierStatut', idRdv, statut),
    supprimer: (idRdv: number) => ipcRenderer.invoke('rendezvous:supprimer', idRdv)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
