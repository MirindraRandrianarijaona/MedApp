import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { calculerAge } from '../../utils/date'

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
    archive: number
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

export function PatientDetailPage(): React.JSX.Element {
    const { id } = useParams()
    const navigate = useNavigate()
    const [patient, setPatient] = useState<Patient | null>(null)
    const [consultations, setConsultations] = useState<Consultation[]>([])

    useEffect(() => {
        window.api.patients.get(Number(id)).then(setPatient)
    }, [id])

    useEffect(() => {
        window.api.consultations.listerParPatient(Number(id)).then(setConsultations)
    }, [id])

    async function handleSupprimer(): Promise<void> {
        if (!patient) return
        if (!confirm('Confirmer cette action ?')) return
        const { action } = await window.api.patients.supprimer(Number(id))
        if (action === 'supprime') {
            navigate('/')
        } else {
            alert('Ce patient a un historique de consultations : son dossier a été archivé plutôt que supprimé.')
            setPatient({ ...patient, archive: 1 })
        }
    }

    async function handleDesarchiver(): Promise<void> {
        if (!patient) return
        await window.api.patients.desarchiver(Number(id))
        setPatient({ ...patient, archive: 0 })
    }

    if (!patient) return <p className="text-slate">Chargement...</p>

    return (
        <div className="w-full max-w-6xl">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center border border-slate/30 px-4 py-2 rounded-md text-slate hover:border-brass hover:text-ink mb-6 transition-colors font-medium text-sm group"
            >
                <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour à la liste
            </button>

            {patient.archive === 1 && (
                <div className="bg-brass/10 border border-brass/30 rounded-md px-4 py-2 mb-4 flex items-center justify-between text-sm">
                    <span className="text-ink">Ce dossier est archivé.</span>
                    <button onClick={handleDesarchiver} className="text-brass font-medium hover:underline">
                        Restaurer
                    </button>
                </div>
            )}

            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="font-mono text-xs text-slate">{patient.numeroDossier}</p>
                    <h2 className="font-display text-2xl text-ink">{patient.nom} {patient.prenom}</h2>
                </div>
                <div className="flex gap-2">
                    <Link
                        to={`/patients/${patient.id}/modifier`}
                        className="border border-slate/30 text-ink px-4 py-2 rounded-md text-sm hover:border-brass transition-colors"
                    >
                        Modifier
                    </Link>
                    <button
                        onClick={handleSupprimer}
                        className="border border-rust/40 text-rust px-4 py-2 rounded-md text-sm hover:bg-rust hover:text-paper transition-colors"
                    >
                        Supprimer
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-slate/15 p-6 space-y-4">
                <div>
                    <p className="font-mono text-xs uppercase tracking-wide text-slate mb-2">Informations administratives</p>
                    <dl className="grid grid-cols-2 gap-y-2 text-sm">
                        <dt className="text-slate">Âge</dt><dd className="text-ink">{calculerAge(patient.dateNaissance)} ans</dd>
                        <dt className="text-slate">Sexe</dt><dd className="text-ink">{patient.sexe === 'M' ? 'Masculin' : 'Féminin'}</dd>
                        <dt className="text-slate">Adresse</dt><dd className="text-ink">{patient.adresse ?? '—'}</dd>
                        <dt className="text-slate">Téléphone</dt><dd className="text-ink">{patient.telephone ?? '—'}</dd>
                    </dl>
                </div>
                <div className="border-t border-slate/10 pt-4">
                    <p className="font-mono text-xs uppercase tracking-wide text-slate mb-2">Informations médicales</p>
                    <dl className="space-y-2 text-sm">
                        <div><dt className="text-slate">Antécédents</dt><dd className="text-ink">{patient.antecedentsMedicaux ?? '—'}</dd></div>
                        <div><dt className="text-slate">Allergies</dt><dd className="text-ink">{patient.allergies ?? '—'}</dd></div>
                        <div><dt className="text-slate">Observations</dt><dd className="text-ink">{patient.observations ?? '—'}</dd></div>
                    </dl>
                </div>
            </div>

            <div className="flex items-center justify-between mt-8 mb-3">
                <p className="font-mono text-xs uppercase tracking-wide text-slate">Historique des consultations</p>
                <Link
                    to={`/patients/${patient.id}/consultations/nouveau`}
                    className="bg-ink text-paper px-3 py-1.5 rounded-md text-xs font-medium hover:bg-brass transition-colors"
                >
                    + Nouvelle consultation
                </Link>
            </div>

            {consultations.length === 0 ? (
                <p className="text-slate text-sm">Aucune consultation enregistrée.</p>
            ) : (
                <div className="space-y-2">
                    {consultations.map((c) => (
                        <div
                            key={c.id}
                            onClick={() => navigate(`/patients/${patient.id}/consultations/${c.id}`)}
                            className="bg-white rounded-md border border-slate/15 p-3 text-sm cursor-pointer hover:border-brass transition-colors"
                        >
                            <p className="font-mono text-xs text-slate">{new Date(c.dateConsultation).toLocaleDateString('fr-FR')}</p>
                            <p className="text-ink">{c.motif}</p>
                            {c.diagnostic && <p className="text-slate text-xs mt-1">Diagnostic : {c.diagnostic}</p>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}