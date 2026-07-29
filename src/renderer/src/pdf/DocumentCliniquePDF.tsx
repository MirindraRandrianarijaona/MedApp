import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { calculerAge } from '../utils/date'

type TypeDocument = 'CERTIFICAT_APTITUDE' | 'ARRET_TRAVAIL' | 'CERTIFICAT_HOSPITALISATION' | 'DEMANDE_EXAMEN'

const TITRES: Record<TypeDocument, string> = {
    CERTIFICAT_APTITUDE: "Certificat d'aptitude",
    ARRET_TRAVAIL: 'Certificat médical — Arrêt de travail',
    CERTIFICAT_HOSPITALISATION: "Certificat d'hospitalisation",
    DEMANDE_EXAMEN: "Demande d'examen"
}

interface Props {
    medecin: {
        nom: string
        specialite: string | null
        adresseCabinet: string | null
        numeroOrdre: string | null
        contact: string | null
    }
    patient: { nom: string; prenom: string; dateNaissance: string }
    typeDocument: TypeDocument
    dateEmission: string
    contenu: string
}

const styles = StyleSheet.create({
    page: { padding: 40, fontSize: 11, fontFamily: 'Helvetica' },
    headerRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 24, borderBottomWidth: 1, borderBottomColor: '#A87F4F', borderBottomStyle: 'solid', paddingBottom: 12
    },
    medecinBloc: { maxWidth: '55%' },
    medecinNom: { fontSize: 16, fontFamily: 'Helvetica-Bold' },
    petiteInfo: { fontSize: 9, color: '#5B6472', marginTop: 2 },
    patientBloc: { alignItems: 'flex-end' },
    date: { fontSize: 9, color: '#5B6472', marginBottom: 6 },
    patientNom: { fontSize: 12, fontFamily: 'Helvetica-Bold' },
    patientAge: { fontSize: 9, color: '#5B6472', marginTop: 2 },
    titre: { fontSize: 14, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 24, color: '#161E2E' },
    corps: { fontSize: 11, color: '#161E2E', lineHeight: 1.6, marginBottom: 40 },
    signatureZone: { marginTop: 60, alignItems: 'flex-end' },
    signatureLigne: { fontSize: 9, color: '#5B6472', marginBottom: 30 },
    signatureLabel: { fontSize: 8, color: '#5B6472', borderTopWidth: 1, borderTopColor: '#CCCCCC', borderTopStyle: 'solid', paddingTop: 4, width: 180, textAlign: 'center' },
    footer: {
        position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, color: '#5B6472', textAlign: 'center',
        borderTopWidth: 1, borderTopColor: '#CCCCCC', borderTopStyle: 'solid', paddingTop: 8
    }
})

export function DocumentCliniquePDF({ medecin, patient, typeDocument, dateEmission, contenu }: Props): React.JSX.Element {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.headerRow}>
                    <View style={styles.medecinBloc}>
                        <Text style={styles.medecinNom}>Dr {medecin.nom}</Text>
                        {medecin.specialite && <Text style={styles.petiteInfo}>{medecin.specialite}</Text>}
                        {medecin.numeroOrdre && <Text style={styles.petiteInfo}>N° d&apos;ordre : {medecin.numeroOrdre}</Text>}
                        {medecin.adresseCabinet && <Text style={styles.petiteInfo}>{medecin.adresseCabinet}</Text>}
                        {medecin.contact && <Text style={styles.petiteInfo}>{medecin.contact}</Text>}
                    </View>
                    <View style={styles.patientBloc}>
                        <Text style={styles.date}>
                            {new Date(dateEmission).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </Text>
                        <Text style={styles.patientNom}>{patient.nom} {patient.prenom}</Text>
                        <Text style={styles.patientAge}>{calculerAge(patient.dateNaissance)} ans</Text>
                    </View>
                </View>

                <Text style={styles.titre}>{TITRES[typeDocument]}</Text>
                <Text style={styles.corps}>{contenu}</Text>

                <View style={styles.signatureZone}>
                    <Text style={styles.signatureLigne}>
                        Fait le {new Date(dateEmission).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </Text>
                    <Text style={styles.signatureLabel}>Signature et cachet du médecin</Text>
                </View>

                <Text style={styles.footer}>Document généré par MedApp — usage médical uniquement</Text>
            </Page>
        </Document>
    )
}