import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDateISO } from '../../utils/date'

interface PaiementEnAttente {
    idConsultation: number
    idPatient: number
    dateConsultation: string
    motif: string
    patientNom: string
    patientPrenom: string
    idPaiement: number | null
    montant: number | null
    modePaiement: string | null
    statut: string | null
}


export function FinancePage(): React.JSX.Element {
    const navigate = useNavigate()
    const aujourdHui = new Date()
    const premierJourMois = new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), 1)

    const [periodeDebut, setPeriodeDebut] = useState(formatDateISO(premierJourMois))
    const [periodeFin, setPeriodeFin] = useState(formatDateISO(aujourdHui))
    const [recettes, setRecettes] = useState(0)
    const [enAttente, setEnAttente] = useState<PaiementEnAttente[]>([])

    useEffect(() => {
        window.api.paiements.getRecettesPeriode(periodeDebut, periodeFin).then(setRecettes)
    }, [periodeDebut, periodeFin])

    useEffect(() => {
        window.api.paiements.listerEnAttente().then(setEnAttente)
    }, [])

    return (
        <div className="max-w-3xl">
            <h2 className="font-display text-2xl text-ink mb-6">Finance</h2>

            <div className="bg-white rounded-lg border border-slate/15 p-6 mb-6">
                <p className="font-mono text-xs uppercase tracking-wide text-slate mb-2">Recettes sur la période</p>
                <p className="font-display text-3xl text-ink mb-4">{recettes.toLocaleString('fr-FR')} Ar</p>
                <div className="flex gap-3 items-center">
                    <input type="date" value={periodeDebut} onChange={(e) => setPeriodeDebut(e.target.value)}
                        className="border border-slate/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass" />
                    <span className="text-slate text-sm">à</span>
                    <input type="date" value={periodeFin} onChange={(e) => setPeriodeFin(e.target.value)}
                        className="border border-slate/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass" />
                </div>
            </div>

            <p className="font-mono text-xs uppercase tracking-wide text-slate mb-3">
                Paiements en attente ({enAttente.length})
            </p>
            {enAttente.length === 0 ? (
                <p className="text-slate text-sm">Aucun paiement en attente.</p>
            ) : (
                <div className="space-y-2">
                    {enAttente.map((p) => (
                        <div
                            key={p.idConsultation}
                            className="bg-white rounded-md border border-slate/15 p-3 text-sm flex items-center justify-between"
                        >
                            <div>
                                <p className="text-ink font-medium">{p.patientNom} {p.patientPrenom}</p>
                                <p className="text-slate text-xs mt-0.5">
                                    {new Date(p.dateConsultation).toLocaleDateString('fr-FR')} · {p.motif}
                                    {p.montant && ` · ${p.montant.toLocaleString('fr-FR')} Ar`}
                                </p>
                            </div>
                            <button
                                onClick={() => navigate(`/patients/${p.idPatient}`)}
                                className="text-brass text-xs font-medium hover:underline"
                            >
                                Voir →
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}