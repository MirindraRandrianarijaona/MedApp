import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { calculerAge } from '../utils/date'

interface Props {
    medecin: {
        nom: string
        specialite: string | null
        adresseCabinet: string | null
        numeroOrdre: string | null
        contact: string | null
    }
    patient: { nom: string; prenom: string; dateNaissance: string }
    consultation: { motif: string; diagnostic: string | null }
    dateOrdonnance: string
    notes: string | null
    prochainRdv: { dateRdv: string; heureDebut: string } | null
    lignes: {
        nomCommercial: string
        dosageDisponible: string | null
        posologie: string
        momentPrise: string | null
        dureeTraitement: string | null
    }[]
}

const styles = StyleSheet.create({
    page: { padding: 40, fontSize: 11, fontFamily: 'Helvetica' },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#A87F4F',
        borderBottomStyle: 'solid',
        paddingBottom: 12
    },
    medecinBloc: { maxWidth: '55%' },
    medecinNom: { fontSize: 16, fontFamily: 'Helvetica-Bold' },
    petiteInfo: { fontSize: 9, color: '#5B6472', marginTop: 2 },
    patientBloc: { alignItems: 'flex-end' },
    date: { fontSize: 9, color: '#5B6472', marginBottom: 6 },
    patientNom: { fontSize: 12, fontFamily: 'Helvetica-Bold' },
    patientAge: { fontSize: 9, color: '#5B6472', marginTop: 2 },
    motifRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    motifBloc: { flex: 1, backgroundColor: '#F7F4EC', padding: 10, borderRadius: 4 },
    rdvBloc: { width: 140, backgroundColor: '#F7F4EC', padding: 10, borderRadius: 4 },
    rdvDate: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#161E2E' },
    rdvHeure: { fontSize: 9, color: '#5B6472', marginTop: 2 },
    motifLabel: { fontSize: 8, color: '#5B6472', textTransform: 'uppercase', marginBottom: 2 },
    motifTexte: { fontSize: 10, color: '#161E2E' },
    ligne: { marginBottom: 14 },
    medicamentNom: { fontSize: 12, fontFamily: 'Helvetica-Bold' },
    detail: { fontSize: 10, color: '#333333', marginTop: 2 },
    notesBloc: {
        marginTop: 20,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#CCCCCC',
        borderTopStyle: 'solid'
    },
    notesLabel: { fontSize: 8, color: '#5B6472', textTransform: 'uppercase', marginBottom: 4 },
    notesTexte: { fontSize: 10, color: '#161E2E' },
    signatureZone: { marginTop: 40, alignItems: 'flex-end' },
    signatureLigne: { fontSize: 9, color: '#5B6472', marginBottom: 30 },
    signatureLabel: {
        fontSize: 8,
        color: '#5B6472',
        borderTopWidth: 1,
        borderTopColor: '#CCCCCC',
        borderTopStyle: 'solid',
        paddingTop: 4,
        width: 180,
        textAlign: 'center'
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        fontSize: 8,
        color: '#5B6472',
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: '#CCCCCC',
        borderTopStyle: 'solid',
        paddingTop: 8
    }
})

export function OrdonnancePDF({
    medecin,
    patient,
    consultation,
    dateOrdonnance,
    notes,
    prochainRdv,
    lignes
}: Props): React.JSX.Element {
    return (
        <Document>
            <Page size="A5" style={styles.page}>
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
                            {new Date(dateOrdonnance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </Text>
                        <Text style={styles.patientNom}>{patient.nom} {patient.prenom}</Text>
                        <Text style={styles.patientAge}>{calculerAge(patient.dateNaissance)} ans</Text>
                    </View>
                </View>

                <View style={styles.motifRow}>
                    <View style={styles.motifBloc}>
                        <Text style={styles.motifLabel}>Motif de consultation</Text>
                        <Text style={styles.motifTexte}>{consultation.motif}</Text>
                        {consultation.diagnostic && (
                            <>
                                <Text style={[styles.motifLabel, { marginTop: 6 }]}>Diagnostic</Text>
                                <Text style={styles.motifTexte}>{consultation.diagnostic}</Text>
                            </>
                        )}
                    </View>

                    {prochainRdv && (
                        <View style={styles.rdvBloc}>
                            <Text style={styles.motifLabel}>Prochain rendez-vous</Text>
                            <Text style={styles.rdvDate}>
                                {new Date(prochainRdv.dateRdv).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </Text>
                            <Text style={styles.rdvHeure}>{prochainRdv.heureDebut}</Text>
                        </View>
                    )}
                </View>

                {lignes.map((l, i) => (
                    <View key={i} style={styles.ligne}>
                        <Text style={styles.medicamentNom}>
                            {i + 1}. {l.nomCommercial}{l.dosageDisponible ? ` — ${l.dosageDisponible}` : ''}
                        </Text>
                        <Text style={styles.detail}>
                            {l.posologie}{l.momentPrise ? ` · ${l.momentPrise}` : ''}{l.dureeTraitement ? ` · ${l.dureeTraitement}` : ''}
                        </Text>
                    </View>
                ))}

                {notes && (
                    <View style={styles.notesBloc}>
                        <Text style={styles.notesLabel}>Notes</Text>
                        <Text style={styles.notesTexte}>{notes}</Text>
                    </View>
                )}

                <View style={styles.signatureZone}>
                    <Text style={styles.signatureLigne}>
                        Fait le {new Date(dateOrdonnance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </Text>
                    <Text style={styles.signatureLabel}>Signature et cachet du médecin</Text>
                </View>

                <Text style={styles.footer}>Document généré par MedApp — usage médical uniquement</Text>
            </Page>
        </Document>
    )
}