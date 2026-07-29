import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { pdf } from '@react-pdf/renderer'
import { DocumentCliniquePDF } from '../../pdf/DocumentCliniquePDF'

type TypeDocument = 'CERTIFICAT_APTITUDE' | 'ARRET_TRAVAIL' | 'CERTIFICAT_HOSPITALISATION' | 'DEMANDE_EXAMEN'

const ONGLETS: { type: TypeDocument; label: string }[] = [
    { type: 'CERTIFICAT_APTITUDE', label: 'Aptitude' },
    { type: 'ARRET_TRAVAIL', label: 'Arrêt de travail' },
    { type: 'CERTIFICAT_HOSPITALISATION', label: 'Hospitalisation' },
    { type: 'DEMANDE_EXAMEN', label: "Demande d'examen" }
]

function modeleTexte(type: TypeDocument, medecinNom: string, patientNomComplet: string, dateDebut: string, dateFin: string, etablissement: string): string {
    switch (type) {
        case 'CERTIFICAT_APTITUDE':
            return `Je soussigné(e) Dr ${medecinNom}, certifie avoir examiné ce jour ${patientNomComplet} et atteste qu'il/elle ne présente pas de contre-indication apparente à la pratique de ...`
        case 'ARRET_TRAVAIL':
            return `Je soussigné(e) Dr ${medecinNom}, certifie que l'état de santé de ${patientNomComplet} nécessite un arrêt de travail${dateDebut ? ` du ${new Date(dateDebut).toLocaleDateString('fr-FR')}` : ''}${dateFin ? ` au ${new Date(dateFin).toLocaleDateString('fr-FR')} inclus` : ''}.`
        case 'CERTIFICAT_HOSPITALISATION':
            return `Je soussigné(e) Dr ${medecinNom}, certifie que ${patientNomComplet} doit être hospitalisé(e)${etablissement ? ` à ${etablissement}` : ''}${dateDebut ? ` à compter du ${new Date(dateDebut).toLocaleDateString('fr-FR')}` : ''}.`
        case 'DEMANDE_EXAMEN':
            return `Je soussigné(e) Dr ${medecinNom}, demande la réalisation de l'examen suivant pour ${patientNomComplet} : ...`
    }
}

export function DocumentCliniqueFormPage(): React.JSX.Element {
    const { id, consultId } = useParams()
    const navigate = useNavigate()
    const [typeActif, setTypeActif] = useState<TypeDocument>('CERTIFICAT_APTITUDE')
    const [dateDebut, setDateDebut] = useState('')
    const [dateFin, setDateFin] = useState('')
    const [etablissement, setEtablissement] = useState('')
    const [contenu, setContenu] = useState('')
    const [generation, setGeneration] = useState(false)
    const [patientNomComplet, setPatientNomComplet] = useState('')

    useEffect(() => {
        window.api.patients.get(Number(id)).then((p) => setPatientNomComplet(`${p.nom} ${p.prenom}`))
    }, [id])

    useEffect(() => {
        window.api.auth.verifierSession().then((medecin) => {
            if (medecin) {
                setContenu(modeleTexte(typeActif, medecin.nom, patientNomComplet, dateDebut, dateFin, etablissement))
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [typeActif, patientNomComplet])

    async function handleGenererEtEnregistrer(): Promise<void> {
        setGeneration(true)
        try {
            const [medecin, patient] = await Promise.all([
                window.api.auth.verifierSession(),
                window.api.patients.get(Number(id))
            ])
            if (!medecin || !patient) return

            const dateEmission = new Date().toISOString()

            await window.api.documentsCliniques.creer({
                idConsultation: Number(consultId),
                typeDocument: typeActif,
                dateDebut: dateDebut || undefined,
                dateFin: dateFin || undefined,
                etablissement: etablissement || undefined,
                contenu
            })

            const blob = await pdf(
                <DocumentCliniquePDF
                    medecin={medecin}
                    patient={patient}
                    typeDocument={typeActif}
                    dateEmission={dateEmission}
                    contenu={contenu}
                />
            ).toBlob()

            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onloadend = () => resolve((reader.result as string).split(',')[1])
                reader.onerror = reject
                reader.readAsDataURL(blob)
            })

            const nomFichier = `${ONGLETS.find((o) => o.type === typeActif)?.label.replace(/\s/g, '_')}_${patient.nom}_${dateEmission.slice(0, 10)}.pdf`
            const chemin = await window.api.documents.ouvrirPDF(base64, nomFichier)
            await window.api.documents.enregistrer(Number(consultId), typeActif, chemin)
        } finally {
            setGeneration(false)
        }
    }

    return (
        <div className="w-100% ">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center border border-slate/30 px-4 py-2 rounded-md text-slate hover:border-brass hover:text-ink mb-6 transition-colors font-medium text-sm"
            >
                ← Retour à la consultation
            </button>

            <h2 className="font-display text-2xl text-ink mb-4">Certificats & documents</h2>

            <div className="flex gap-2 mb-6 flex-wrap">
                {ONGLETS.map((o) => (
                    <button
                        key={o.type}
                        onClick={() => setTypeActif(o.type)}
                        className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${typeActif === o.type ? 'bg-ink text-paper border-ink' : 'border-slate/30 text-slate hover:border-brass'
                            }`}
                    >
                        {o.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-lg border border-slate/15 p-4 space-y-4">
                {(typeActif === 'ARRET_TRAVAIL' || typeActif === 'CERTIFICAT_HOSPITALISATION') && (
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-slate">Date de début</label>
                            <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)}
                                className="w-full border border-slate/30 rounded-md px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-brass" />
                        </div>
                        {typeActif === 'ARRET_TRAVAIL' && (
                            <div>
                                <label className="text-xs text-slate">Date de fin</label>
                                <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)}
                                    className="w-full border border-slate/30 rounded-md px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-brass" />
                            </div>
                        )}
                    </div>
                )}

                {typeActif === 'CERTIFICAT_HOSPITALISATION' && (
                    <div>
                        <label className="text-xs text-slate">Établissement</label>
                        <input value={etablissement} onChange={(e) => setEtablissement(e.target.value)}
                            className="w-full border border-slate/30 rounded-md px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-brass" />
                    </div>
                )}

                <div>
                    <label className="text-xs text-slate">Contenu du document (modifiable)</label>
                    <textarea
                        value={contenu}
                        onChange={(e) => setContenu(e.target.value)}
                        rows={6}
                        className="w-full border border-slate/30 rounded-md px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-brass"
                    />
                </div>

                <button
                    onClick={handleGenererEtEnregistrer}
                    disabled={generation || !contenu.trim()}
                    className="bg-ink text-paper px-4 py-2 rounded-md text-sm font-medium hover:bg-brass transition-colors disabled:opacity-40"
                >
                    {generation ? 'Génération...' : 'Générer le PDF'}
                </button>
            </div>
        </div>
    )
}