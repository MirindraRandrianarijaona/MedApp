import { useState } from 'react'
import { PatientQuickSearch } from './PatientQuickSearch'

export function NouveauRendezVousForm({
    dateInitiale,
    onCree,
    onFermer
}: {
    dateInitiale: string
    onCree: () => void
    onFermer: () => void
}): React.JSX.Element {
    const [modePatient, setModePatient] = useState<'existant' | 'nouveau'>('existant')
    const [patientChoisi, setPatientChoisi] = useState<{ id: number; nom: string; prenom: string } | null>(null)
    const [nomTemporaire, setNomTemporaire] = useState('')
    const [telephoneTemporaire, setTelephoneTemporaire] = useState('')
    const [dateRdv, setDateRdv] = useState(dateInitiale)
    const [heureDebut, setHeureDebut] = useState('09:00')
    const [motif, setMotif] = useState('')

    async function handleSubmit(e: React.FormEvent): Promise<void> {
        e.preventDefault()
        await window.api.rendezvous.creer({
            idPatient: modePatient === 'existant' ? patientChoisi?.id : undefined,
            nomPatientTemporaire: modePatient === 'nouveau' ? nomTemporaire : undefined,
            telephoneTemporaire: modePatient === 'nouveau' ? telephoneTemporaire || undefined : undefined,
            dateRdv,
            heureDebut,
            motif: motif || undefined
        })
        onCree()
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate/15 p-4 space-y-3">
            <div className="flex items-center justify-between">
                <p className="font-mono text-xs uppercase tracking-wide text-slate">Nouveau rendez-vous</p>
                <button type="button" onClick={onFermer} className="text-slate text-xs hover:underline">Annuler</button>
            </div>

            <div className="flex gap-2 text-xs">
                <button type="button" onClick={() => setModePatient('existant')}
                    className={`px-3 py-1.5 rounded-full border ${modePatient === 'existant' ? 'bg-ink text-paper border-ink' : 'border-slate/30 text-slate'}`}>
                    Patient existant
                </button>
                <button type="button" onClick={() => setModePatient('nouveau')}
                    className={`px-3 py-1.5 rounded-full border ${modePatient === 'nouveau' ? 'bg-ink text-paper border-ink' : 'border-slate/30 text-slate'}`}>
                    Nouveau contact
                </button>
            </div>

            {modePatient === 'existant' ? (
                patientChoisi ? (
                    <div className="flex items-center justify-between bg-brass/5 border border-brass/20 rounded-md px-3 py-2 text-sm">
                        <span className="text-ink">{patientChoisi.nom} {patientChoisi.prenom}</span>
                        <button type="button" onClick={() => setPatientChoisi(null)} className="text-slate text-xs hover:underline">Changer</button>
                    </div>
                ) : (
                    <PatientQuickSearch onSelect={setPatientChoisi} />
                )
            ) : (
                <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Nom" value={nomTemporaire} onChange={(e) => setNomTemporaire(e.target.value)} required
                        className="border border-slate/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass" />
                    <input placeholder="Téléphone" value={telephoneTemporaire} onChange={(e) => setTelephoneTemporaire(e.target.value)}
                        className="border border-slate/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass" />
                </div>
            )}

            <div className="grid grid-cols-2 gap-2">
                <input type="date" value={dateRdv} onChange={(e) => setDateRdv(e.target.value)} required
                    className="border border-slate/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass" />
                <input type="time" value={heureDebut} onChange={(e) => setHeureDebut(e.target.value)} required
                    className="border border-slate/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass" />
            </div>

            <input placeholder="Motif (optionnel)" value={motif} onChange={(e) => setMotif(e.target.value)}
                className="w-full border border-slate/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass" />

            <button type="submit" disabled={modePatient === 'existant' && !patientChoisi}
                className="bg-ink text-paper px-4 py-2 rounded-md text-sm font-medium hover:bg-brass transition-colors disabled:opacity-40">
                Planifier
            </button>
        </form>
    )
}