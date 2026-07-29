import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

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
    contenu: string
    dateAjout: string
}

export function ConsultationDetailPage(): React.JSX.Element {
    const { consultId } = useParams()
    const navigate = useNavigate()
    const [consultation, setConsultation] = useState<Consultation | null>(null)
    const [complements, setComplements] = useState<Complement[]>([])
    const [nouveauComplement, setNouveauComplement] = useState('')

    useEffect(() => {
        window.api.consultations.get(Number(consultId)).then(setConsultation)
        window.api.consultations.listerComplements(Number(consultId)).then(setComplements)
    }, [consultId])

    async function handleAjouterComplement(e: React.FormEvent): Promise<void> {
        e.preventDefault()
        if (!nouveauComplement.trim()) return
        const complement = await window.api.consultations.ajouterComplement(Number(consultId), nouveauComplement)
        setComplements([...complements, complement])
        setNouveauComplement('')
    }

    if (!consultation) return <p className="text-slate">Chargement...</p>

    return (
        <div className="max-w-2xl">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center border border-slate/30 px-4 py-2 rounded-md text-slate hover:border-brass hover:text-ink mb-6 transition-colors font-medium text-sm"
            >
                ← Retour au dossier patient
            </button>

            <p className="font-mono text-xs text-slate">
                {new Date(consultation.dateConsultation).toLocaleDateString('fr-FR', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                })}
            </p>
            <h2 className="font-display text-2xl text-ink mb-6">{consultation.motif}</h2>

            <div className="bg-white rounded-lg border border-slate/15 p-6 space-y-4">
                {consultation.symptomes && (
                    <div><p className="font-mono text-xs uppercase tracking-wide text-slate mb-1">Symptômes</p>
                        <p className="text-ink text-sm">{consultation.symptomes}</p></div>
                )}
                {consultation.diagnostic && (
                    <div><p className="font-mono text-xs uppercase tracking-wide text-slate mb-1">Diagnostic</p>
                        <p className="text-ink text-sm">{consultation.diagnostic}</p></div>
                )}

                {(consultation.poids || consultation.taille || consultation.temperature ||
                    consultation.tensionArterielleSystolique || consultation.saturationOxygene) && (
                        <div className="border-t border-slate/10 pt-4">
                            <p className="font-mono text-xs uppercase tracking-wide text-slate mb-2">Paramètres médicaux</p>
                            <dl className="grid grid-cols-3 gap-y-2 text-sm">
                                {consultation.poids && <><dt className="text-slate">Poids</dt><dd className="text-ink col-span-2">{consultation.poids} kg</dd></>}
                                {consultation.taille && <><dt className="text-slate">Taille</dt><dd className="text-ink col-span-2">{consultation.taille} cm</dd></>}
                                {consultation.temperature && <><dt className="text-slate">Température</dt><dd className="text-ink col-span-2">{consultation.temperature} °C</dd></>}
                                {(consultation.tensionArterielleSystolique && consultation.tensionArterielleDiastolique) && (
                                    <><dt className="text-slate">Tension</dt><dd className="text-ink col-span-2">{consultation.tensionArterielleSystolique}/{consultation.tensionArterielleDiastolique}</dd></>
                                )}
                                {consultation.saturationOxygene && <><dt className="text-slate">SpO2</dt><dd className="text-ink col-span-2">{consultation.saturationOxygene}%</dd></>}
                            </dl>
                        </div>
                    )}
            </div>
            <div className="border-t border-slate/10 pt-4">
                <button
                    onClick={() => navigate(`/patients/${consultation.idPatient}/consultations/${consultation.id}/ordonnance`)}
                    className="bg-ink text-paper px-4 py-2 rounded-md text-sm font-medium hover:bg-brass transition-colors"
                >
                    Ordonnance
                </button>
                <button
                    onClick={() => navigate(`/patients/${consultation.idPatient}/consultations/${consultation.id}/documents`)}
                    className="border border-slate/30 text-ink px-4 py-2 rounded-md text-sm hover:border-brass transition-colors ml-2"
                >
                    Certificats & documents
                </button>
            </div>
            <div className="mt-6">
                <p className="font-mono text-xs uppercase tracking-wide text-slate mb-3">Compléments</p>
                {complements.length === 0 ? (
                    <p className="text-slate text-sm mb-4">Aucun complément ajouté.</p>
                ) : (
                    <div className="space-y-2 mb-4">
                        {complements.map((c) => (
                            <div key={c.id} className="bg-brass/5 border border-brass/20 rounded-md p-3 text-sm">
                                <p className="font-mono text-xs text-slate">
                                    Ajouté le {new Date(c.dateAjout).toLocaleDateString('fr-FR')}
                                </p>
                                <p className="text-ink mt-1">{c.contenu}</p>
                            </div>
                        ))}
                    </div>
                )}

                <form onSubmit={handleAjouterComplement} className="flex gap-2">
                    <input
                        placeholder="Ajouter un complément (correction, précision...)"
                        value={nouveauComplement}
                        onChange={(e) => setNouveauComplement(e.target.value)}
                        className="flex-1 border border-slate/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass"
                    />
                    <button type="submit" className="bg-ink text-paper px-4 py-2 rounded-md text-sm font-medium hover:bg-brass transition-colors">
                        Ajouter
                    </button>
                </form>
            </div>
        </div>
    )
}