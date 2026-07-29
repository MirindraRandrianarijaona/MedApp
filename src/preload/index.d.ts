import { ElectronAPI } from '@electron-toolkit/preload'

interface Medecin {
  id: number
  nom: string
  specialite: string | null
  adresseCabinet: string | null
  numeroOrdre: string | null
  contact: string | null
}

interface CreerProfilInput {
  nom: string
  specialite?: string
  adresseCabinet?: string
  numeroOrdre?: string
  contact?: string
  motDePasse: string
}

interface Patient {
  id: number
  numeroDossier: string
  nom: string
  prenom: string
  sexe: 'M' | 'F'
  dateNaissance: string
  adresse: string | null
  telephone: string | null
  antecedentsMedicaux: string | null
  allergies: string | null
  observations: string | null
  dateCreation: string
  archive: number
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

interface Consultation {
  id: number
  idPatient: number
  dateConsultation: string
  motif: string
  symptomes: string | null
  diagnostic: string | null
  poids: number | null
  taille: number | null
  tensionArterielleSystolique: number | null
  tensionArterielleDiastolique: number | null
  temperature: number | null
  saturationOxygene: number | null
}

interface Complement {
  id: number
  idConsultation: number
  contenu: string
  dateAjout: string
}

interface Medicament {
  id: number
  nomCommercial: string
  nomGenerique: string | null
  forme: string | null
  dosageDisponible: string | null
  classeTherapeutique: string | null
}

interface MedicamentInput {
  nomCommercial: string
  nomGenerique?: string
  forme?: string
  dosageDisponible?: string
  classeTherapeutique?: string
}

interface LigneOrdonnance {
  id: number
  idOrdonnance: number
  idMedicament: number
  posologie: string
  momentPrise: string | null
  dureeTraitement: string | null
  nomCommercial: string
  nomGenerique: string | null
  forme: string | null
  dosageDisponible: string | null
}

interface LigneInput {
  idMedicament: number
  posologie: string
  momentPrise?: string
  dureeTraitement?: string
}

interface Ordonnance {
  id: number
  idConsultation: number
  dateOrdonnance: string
  notes: string | null
  lignes: LigneOrdonnance[]
}
interface RendezVousInput {
  idPatient?: number
  nomPatientTemporaire?: string
  telephoneTemporaire?: string
  dateRdv: string
  heureDebut: string
  motif?: string
}

interface RendezVous {
  id: number
  idPatient: number | null
  nomPatientTemporaire: string | null
  telephoneTemporaire: string | null
  dateRdv: string
  heureDebut: string
  motif: string | null
  statut: 'PREVU' | 'EFFECTUE' | 'ANNULE'
  patientNom: string | null
  patientPrenom: string | null
}
type TypeDocumentClinique =
  'CERTIFICAT_APTITUDE' | 'ARRET_TRAVAIL' | 'CERTIFICAT_HOSPITALISATION' | 'DEMANDE_EXAMEN'

interface DocumentCliniqueInput {
  idConsultation: number
  typeDocument: TypeDocumentClinique
  dateDebut?: string
  dateFin?: string
  etablissement?: string
  contenu: string
}

interface DocumentClinique {
  id: number
  idConsultation: number
  typeDocument: TypeDocumentClinique
  dateDebut: string | null
  dateFin: string | null
  etablissement: string | null
  contenu: string
  dateEmission: string
}

interface API {
  auth: {
    verifierSession: () => Promise<Medecin | null>
    creerProfil: (data: CreerProfilInput) => Promise<Medecin>
    seConnecter: (motDePasse: string) => Promise<boolean>
    modifierProfil: (data: Partial<CreerProfilInput>) => Promise<Medecin>
  }
  patients: {
    lister: (inclureArchives?: boolean) => Promise<Patient[]>
    rechercher: (query: string, inclureArchives?: boolean) => Promise<Patient[]>
    get: (id: number) => Promise<Patient>
    ajouter: (data: PatientInput) => Promise<Patient>
    modifier: (id: number, data: Partial<PatientInput>) => Promise<Patient>
    supprimer: (id: number) => Promise<{ action: 'archive' | 'supprime' }>
    desarchiver: (id: number) => Promise<boolean>
    genererNumeroDossier: () => Promise<string>
  }
  consultations: {
    creer: (data: ConsultationInput) => Promise<Consultation>
    get: (id: number) => Promise<Consultation>
    listerParPatient: (idPatient: number) => Promise<Consultation[]>
    enregistrerParametres: (idConsultation: number, params: ParametresInput) => Promise<boolean>
    ajouterComplement: (idConsultation: number, contenu: string) => Promise<Complement>
    listerComplements: (idConsultation: number) => Promise<Complement[]>
  }
  medicaments: {
    rechercher: (query: string) => Promise<Medicament[]>
    creerRapide: (data: MedicamentInput) => Promise<Medicament>
  }
  ordonnances: {
    get: (idConsultation: number) => Promise<Ordonnance>
    ajouterLigne: (idOrdonnance: number, data: LigneInput) => Promise<LigneOrdonnance>
    modifierNotes: (idOrdonnance: number, notes: string) => Promise<boolean>
    supprimerLigne: (idLigne: number) => Promise<boolean>
  }
  documents: {
    ouvrirPDF: (base64: string, nomFichier: string) => Promise<string>
    enregistrer: (
      idConsultation: number,
      typeDocument: string,
      cheminFichier: string
    ) => Promise<boolean>
  }
  rendezvous: {
    creer: (data: RendezVousInput) => Promise<RendezVous>
    listerParJour: (date: string) => Promise<RendezVous[]>
    listerParPeriode: (dateDebut: string, dateFin: string) => Promise<RendezVous[]>
    listerAvenir: () => Promise<RendezVous[]>
    modifierStatut: (idRdv: number, statut: string) => Promise<boolean>
    supprimer: (idRdv: number) => Promise<boolean>
    prochainPourPatient: (idPatient: number) => Promise<RendezVous | undefined>
  }
  documentsCliniques: {
    creer: (data: DocumentCliniqueInput) => Promise<DocumentClinique>
    listerParConsultation: (idConsultation: number) => Promise<DocumentClinique[]>
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
