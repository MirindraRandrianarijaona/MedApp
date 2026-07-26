import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { calculerAge } from '../../utils/date'

interface Patient {
    id: number
    numeroDossier: string
    nom: string
    prenom: string
    telephone: string | null
    dateNaissance: string
    archive: number
}

export function PatientsListPage(): React.JSX.Element {
    const [patients, setPatients] = useState<Patient[]>([])
    const [query, setQuery] = useState('')
    const [inclureArchives, setInclureArchives] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim() === '') {
                window.api.patients.lister(inclureArchives).then(setPatients)
            } else {
                window.api.patients.rechercher(query, inclureArchives).then(setPatients)
            }
        }, 200)
        return () => clearTimeout(timer)
    }, [query, inclureArchives])

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-2xl text-ink">Patients</h2>
                <Link
                    to="/patients/nouveau"
                    className="bg-ink text-paper px-4 py-2 rounded-md text-sm font-medium hover:bg-brass transition-colors"
                >
                    + Nouveau patient
                </Link>
            </div>

            <div className="flex items-center gap-3 mb-4">
                <input
                    placeholder="Rechercher par nom, prénom, ou téléphone..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 border border-slate/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brass"
                />
                <label className="flex items-center gap-2 text-sm text-slate whitespace-nowrap">
                    <input
                        type="checkbox"
                        checked={inclureArchives}
                        onChange={(e) => setInclureArchives(e.target.checked)}
                    />
                    Afficher les archivés
                </label>
            </div>

            {patients.length === 0 ? (
                <p className="text-slate text-center text-sm">Aucun patient pour l'instant.</p>
            ) : (
                <div className="bg-white rounded-lg border border-slate/15 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate/15 text-slate text-left">
                                <th className="px-4 py-3 font-mono text-xs">Dossier</th>
                                <th className="px-4 py-3">Nom</th>
                                <th className="px-4 py-3">Âge</th>
                                <th className="px-4 py-3">Téléphone</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.map((p) => (
                                <tr
                                    key={p.id}
                                    className={`border-b border-slate/10 last:border-0 hover:bg-brass/5 cursor-pointer ${p.archive ? 'opacity-50' : ''}`}
                                    onClick={() => (window.location.hash = `#/patients/${p.id}`)}
                                >
                                    <td className="px-4 py-3 font-mono text-xs text-slate">{p.numeroDossier}</td>
                                    <td className="px-4 py-3 text-ink">{p.nom} {p.prenom}</td>
                                    <td className="px-4 py-3 text-slate">{calculerAge(p.dateNaissance)} ans</td>
                                    <td className="px-4 py-3 text-slate">{p.telephone ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}