import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { pdf } from '@react-pdf/renderer'
import { MedicamentCombobox } from './MedicamentCombobox'
import { QuickChips } from './QuickChips'
import { OrdonnancePDF } from '../../pdf/OrdonnancePDF'

interface LigneOrdonnance {
    id: number
    idMedicament: number
    posologie: string
    momentPrise: string | null
    dureeTraitement: string | null
    nomCommercial: string
    dosageDisponible: string | null
}

const POSOLOGIES_COURANTES = [
    '1 comprimé matin',
    '1 comprimé matin et soir',
    '1 comprimé 3 fois par jour',
    '2 comprimés par jour',
    '1 sachet par jour'
]
const MOMENTS_COURANTS = ['Avant les repas', 'Pendant les repas', 'Après les repas', 'Avant de dormir', 'Au réveil']
const DUREES_COURANTES = ['3 jours', '5 jours', '7 jours', '10 jours', '1 mois']

export function OrdonnanceFormPage(): React.JSX.Element {
    const { id, consultId } = useParams()
    const navigate = useNavigate()
    const [idOrdonnance, setIdOrdonnance] = useState<number | null>(null)
    const [dateOrdonnance, setDateOrdonnance] = useState('')
    const [lignes, setLignes] = useState<LigneOrdonnance[]>([])
    const [generation, setGeneration] = useState(false)

    const [medicamentChoisi, setMedicamentChoisi] = useState<{ id: number; nomCommercial: string } | null>(null)
    const [posologie, setPosologie] = useState('')
    const [momentPrise, setMomentPrise] = useState('')
    const [dureeTraitement, setDureeTraitement] = useState('')
    const [consultation, setConsultation] = useState<{ motif: string; diagnostic: string | null } | null>(null)
    const [notes, setNotes] = useState('')

    useEffect(() => {
        window.api.ordonnances.get(Number(consultId)).then((o) => {
            setIdOrdonnance(o.id)
            setDateOrdonnance(o.dateOrdonnance)
            setLignes(o.lignes)
        })
    }, [consultId])
    useEffect(() => {
        window.api.consultations.get(Number(consultId)).then((c) => setConsultation(c))
    }, [consultId])

    useEffect(() => {
        window.api.ordonnances.get(Number(consultId)).then((o) => {
            setIdOrdonnance(o.id)
            setDateOrdonnance(o.dateOrdonnance)
            setNotes(o.notes ?? '')
            setLignes(o.lignes)
        })
    }, [consultId])

    async function handleAjouterLigne(e: React.FormEvent): Promise<void> {
        e.preventDefault()
        if (!medicamentChoisi || !idOrdonnance) return
        const ligne = await window.api.ordonnances.ajouterLigne(idOrdonnance, {
            idMedicament: medicamentChoisi.id,
            posologie,
            momentPrise: momentPrise || undefined,
            dureeTraitement: dureeTraitement || undefined
        })
        setLignes([...lignes, ligne])
        setMedicamentChoisi(null)
        setPosologie('')
        setMomentPrise('')
        setDureeTraitement('')
    }
    async function handleNotesBlur(): Promise<void> {
        if (idOrdonnance) await window.api.ordonnances.modifierNotes(idOrdonnance, notes)
    }

    async function handleSupprimerLigne(idLigne: number): Promise<void> {
        await window.api.ordonnances.supprimerLigne(idLigne)
        setLignes(lignes.filter((l) => l.id !== idLigne))
    }

    async function handleGenererPDF(): Promise<void> {
        setGeneration(true)
        try {
            const [medecin, patient] = await Promise.all([
                window.api.auth.verifierSession(),
                window.api.patients.get(Number(id))
            ])
            if (!medecin || !patient || !consultation) return

            const blob = await pdf(
                <OrdonnancePDF
                    medecin={medecin}
                    patient={patient}
                    consultation={consultation}
                    dateOrdonnance={dateOrdonnance}
                    notes={notes || null}
                    lignes={lignes}
                />
            ).toBlob()

            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onloadend = () => resolve((reader.result as string).split(',')[1])
                reader.onerror = reject
                reader.readAsDataURL(blob)
            })

            const nomFichier = `Ordonnance_${patient.nom}_${patient.prenom}_${dateOrdonnance.slice(0, 10)}.pdf`
            const chemin = await window.api.documents.ouvrirPDF(base64, nomFichier)
            await window.api.documents.enregistrer(Number(consultId), 'ORDONNANCE', chemin)
        } finally {
            setGeneration(false)
        }
    }

    return (
        <div className="max-w-2xl">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center border border-slate/30 px-4 py-2 rounded-md text-slate hover:border-brass hover:text-ink mb-6 transition-colors font-medium text-sm"
            >
                ← Retour à la consultation
            </button>

            <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl text-ink">Ordonnance</h2>
                <button
                    onClick={handleGenererPDF}
                    disabled={lignes.length === 0 || generation}
                    className="bg-ink text-paper px-4 py-2 rounded-md text-sm font-medium hover:bg-brass transition-colors disabled:opacity-40"
                >
                    {generation ? 'Génération...' : 'Générer le PDF'}
                </button>
            </div>

            {lignes.length > 0 && (
                <div className="space-y-2 mb-6">
                    {lignes.map((l) => (
                        <div key={l.id} className="bg-white rounded-md border border-slate/15 p-3 text-sm flex justify-between items-start">
                            <div>
                                <p className="text-ink font-medium">{l.nomCommercial} {l.dosageDisponible && `— ${l.dosageDisponible}`}</p>
                                <p className="text-slate text-xs mt-1">{l.posologie}{l.momentPrise && ` · ${l.momentPrise}`}{l.dureeTraitement && ` · ${l.dureeTraitement}`}</p>
                            </div>
                            <button onClick={() => handleSupprimerLigne(l.id)} className="text-rust text-xs hover:underline">
                                Retirer
                            </button>
                        </div>
                    ))}
                </div>
            )}


            <form onSubmit={handleAjouterLigne} className="bg-white rounded-lg border border-slate/15 p-4 space-y-4">
                <p className="font-mono text-xs uppercase tracking-wide text-slate">Ajouter un médicament</p>

                {medicamentChoisi ? (
                    <div className="flex items-center justify-between bg-brass/5 border border-brass/20 rounded-md px-3 py-2 text-sm">
                        <span className="text-ink">{medicamentChoisi.nomCommercial}</span>
                        <button type="button" onClick={() => setMedicamentChoisi(null)} className="text-slate text-xs hover:underline">
                            Changer
                        </button>
                    </div>
                ) : (
                    <MedicamentCombobox onSelect={(m) => setMedicamentChoisi(m)} />
                )}

                <div>
                    <input placeholder="Posologie (ex: 1 comprimé 3 fois par jour)" value={posologie}
                        onChange={(e) => setPosologie(e.target.value)} required
                        className="w-full border border-slate/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass" />
                    <QuickChips options={POSOLOGIES_COURANTES} onSelect={setPosologie} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <input placeholder="Moment" value={momentPrise}
                            onChange={(e) => setMomentPrise(e.target.value)}
                            className="w-full border border-slate/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass" />
                        <QuickChips options={MOMENTS_COURANTS} onSelect={setMomentPrise} />
                    </div>
                    <div>
                        <input placeholder="Durée" value={dureeTraitement}
                            onChange={(e) => setDureeTraitement(e.target.value)}
                            className="w-full border border-slate/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass" />
                        <QuickChips options={DUREES_COURANTES} onSelect={setDureeTraitement} />
                    </div>
                </div>

                <button type="submit" disabled={!medicamentChoisi}
                    className="bg-ink text-paper px-4 py-2 rounded-md text-sm font-medium hover:bg-brass transition-colors disabled:opacity-40">
                    Ajouter à l'ordonnance
                </button>
            </form>
            <div className="bg-white rounded-lg border border-slate/15 p-4 mb-6">
                <label className="font-mono text-xs uppercase tracking-wide text-slate">Notes (optionnel)</label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    onBlur={handleNotesBlur}
                    placeholder="Instructions complémentaires, précisions pour le patient ou le pharmacien..."
                    rows={2}
                    className="w-full border border-slate/30 rounded-md px-3 py-2 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-brass"
                />
            </div>
        </div>
    )
}