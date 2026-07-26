export const SCHEMA = `
CREATE TABLE IF NOT EXISTS medecin (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  specialite TEXT,
  adresseCabinet TEXT,
  numeroOrdre TEXT,
  contact TEXT,
  motDePasseHash TEXT NOT NULL,
  cleActivation TEXT
);

CREATE TABLE IF NOT EXISTS patient (
id INTEGER PRIMARY KEY AUTOINCREMENT,
  numeroDossier TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  sexe TEXT NOT NULL CHECK (sexe IN ('M','F')),
  dateNaissance TEXT NOT NULL,
  adresse TEXT,
  telephone TEXT,
  antecedentsMedicaux TEXT,
  allergies TEXT,
  observations TEXT,
  archive INTEGER NOT NULL DEFAULT 0,
  dateCreation TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_patient_nom ON patient(nom, prenom);

CREATE TABLE IF NOT EXISTS consultation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idPatient INTEGER NOT NULL REFERENCES patient(id) ON DELETE RESTRICT,
  dateConsultation TEXT NOT NULL DEFAULT (datetime('now')),
  motif TEXT NOT NULL,
  symptomes TEXT,
  diagnostic TEXT
);
CREATE INDEX IF NOT EXISTS idx_consultation_patient ON consultation(idPatient);

CREATE TABLE IF NOT EXISTS parametreMedical (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idConsultation INTEGER NOT NULL UNIQUE REFERENCES consultation(id) ON DELETE CASCADE,
  poids REAL,
  taille INTEGER,
  tensionArterielleSystolique INTEGER,
  tensionArterielleDiastolique INTEGER,
  temperature REAL,
  saturationOxygene INTEGER
);

CREATE TABLE IF NOT EXISTS complementConsultation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idConsultation INTEGER NOT NULL REFERENCES consultation(id) ON DELETE CASCADE,
  contenu TEXT NOT NULL,
  dateAjout TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_complement_consultation ON complementConsultation(idConsultation);

CREATE TABLE IF NOT EXISTS medicament (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nomCommercial TEXT NOT NULL,
  nomGenerique TEXT,
  forme TEXT,
  dosageDisponible TEXT,
  classeTherapeutique TEXT
);
CREATE INDEX IF NOT EXISTS idx_medicament_nom ON medicament(nomCommercial);


CREATE TABLE IF NOT EXISTS ligneOrdonnance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idOrdonnance INTEGER NOT NULL REFERENCES ordonnance(id) ON DELETE CASCADE,
  idMedicament INTEGER NOT NULL REFERENCES medicament(id) ON DELETE RESTRICT,
  posologie TEXT NOT NULL,
  momentPrise TEXT,
  dureeTraitement TEXT
);
CREATE INDEX IF NOT EXISTS idx_ligne_ordonnance ON ligneOrdonnance(idOrdonnance);

CREATE TABLE IF NOT EXISTS documentMedical (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idConsultation INTEGER NOT NULL REFERENCES consultation(id) ON DELETE CASCADE,
  typeDocument TEXT NOT NULL CHECK (typeDocument IN ('ORDONNANCE','FACTURE','CERTIFICAT_APTITUDE','ARRET_TRAVAIL')),
  dateGeneration TEXT NOT NULL DEFAULT (datetime('now')),
  cheminFichier TEXT
);

CREATE TABLE IF NOT EXISTS ordonnance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idConsultation INTEGER NOT NULL UNIQUE REFERENCES consultation(id) ON DELETE CASCADE,
  dateOrdonnance TEXT NOT NULL DEFAULT (datetime('now')),
  notes TEXT
);
`
