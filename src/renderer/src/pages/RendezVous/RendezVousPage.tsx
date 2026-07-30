import { useEffect, useState } from 'react'
import { MonthCalendar } from './MonthCalendar'
import { NouveauRendezVousForm } from './NouveauRendezVousForm'
import { formatDateISO } from '../../utils/date'

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

const STATUT_STYLE: Record<string, string> = {
    PREVU: 'bg-slate/10 text-slate',
    EFFECTUE: 'bg-sage/10 text-sage',
    ANNULE: 'bg-rust/10 text-rust'
}

export function RendezVousPage(): React.JSX.Element {
    const [mois, setMois] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
    const [rdvs, setRdvs] = useState<RendezVous[]>([])
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [formOuvert, setFormOuvert] = useState(false)

    function chargerMois(): void {
        const annee = mois.getFullYear()
        const m = mois.getMonth()
        const debut = formatDateISO(new Date(annee, m, 1))
        const fin = formatDateISO(new Date(annee, m + 1, 0))
        window.api.rendezvous.listerParPeriode(debut, fin).then(setRdvs)
    }

    useEffect(() => {
        chargerMois()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mois])

    const compteParJour: Record<string, number> = {}
    for (const r of rdvs) {
        compteParJour[r.dateRdv] = (compteParJour[r.dateRdv] ?? 0) + 1
    }

    async function handleChangerStatut(id: number, statut: string): Promise<void> {
        await window.api.rendezvous.modifierStatut(id, statut)
        chargerMois()
    }

    async function handleSupprimer(id: number): Promise<void> {
        if (!confirm('Supprimer ce rendez-vous ?')) return
        await window.api.rendezvous.supprimer(id)
        chargerMois()
    }

    return (
        <div className="w-full h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl text-ink">Rendez-vous</h2>
                <button
                    onClick={() => setFormOuvert(!formOuvert)}
                    className="bg-ink text-paper px-4 py-2 rounded-md text-sm font-medium hover:bg-brass transition-colors"
                >
                    + Nouveau rendez-vous
                </button>
            </div>

            {formOuvert && (
                <div className="mb-6">
                    <NouveauRendezVousForm
                        dateInitiale={selectedDate ?? formatDateISO(new Date())}
                        onCree={() => { setFormOuvert(false); chargerMois() }}
                        onFermer={() => setFormOuvert(false)}
                    />
                </div>
            )}

            <div className="grid grid-cols-[minmax(320px,1fr)_1.2fr] gap-6 items-start">
                <MonthCalendar
                    mois={mois}
                    compteParJour={compteParJour}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    onChangeMois={(delta) => setMois(new Date(mois.getFullYear(), mois.getMonth() + delta, 1))}
                />

                <div>
                    <p className="font-mono text-xs uppercase tracking-wide text-slate mb-3">
                        Rendez-vous du mois ({rdvs.length})
                    </p>
                    {rdvs.length === 0 ? (
                        <p className="text-slate text-sm">Aucun rendez-vous ce mois-ci.</p>
                    ) : (
                        <div className="space-y-2 max-h-120 overflow-auto pr-1">
                            {rdvs.map((r) => (
                                <div
                                    key={r.id}
                                    className={`bg-white rounded-md border p-3 text-sm ${r.dateRdv === selectedDate ? 'border-brass' : 'border-slate/15'}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-mono text-xs text-slate">
                                                {new Date(r.dateRdv).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} · {r.heureDebut}
                                            </p>
                                            <p className="text-ink font-medium mt-1">
                                                {r.idPatient ? `${r.patientNom} ${r.patientPrenom}` : `${r.nomPatientTemporaire} (nouveau contact)`}
                                            </p>
                                            {r.motif && <p className="text-slate text-xs mt-0.5">{r.motif}</p>}
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${STATUT_STYLE[r.statut]}`}>{r.statut}</span>
                                    </div>

                                    <div className="flex gap-3 mt-2 text-xs">
                                        {r.statut !== 'EFFECTUE' && (
                                            <button onClick={() => handleChangerStatut(r.id, 'EFFECTUE')} className="text-sage hover:underline">
                                                Marquer effectué
                                            </button>
                                        )}
                                        {r.statut !== 'ANNULE' && (
                                            <button onClick={() => handleChangerStatut(r.id, 'ANNULE')} className="text-rust hover:underline">
                                                Annuler
                                            </button>
                                        )}
                                        <button onClick={() => handleSupprimer(r.id)} className="text-slate hover:underline">
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}