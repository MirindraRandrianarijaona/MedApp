import { useEffect, useRef, useState } from 'react'

interface Patient {
    id: number
    nom: string
    prenom: string
}

export function PatientQuickSearch({ onSelect }: { onSelect: (p: Patient) => void }): React.JSX.Element {
    const [query, setQuery] = useState('')
    const [resultats, setResultats] = useState<Patient[]>([])
    const [ouvert, setOuvert] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (query.trim() === '') { setResultats([]); return }
        const timer = setTimeout(() => {
            window.api.patients.rechercher(query).then(setResultats)
        }, 200)
        return () => clearTimeout(timer)
    }, [query])

    useEffect(() => {
        function handleClickOutside(e: MouseEvent): void {
            if (ref.current && !ref.current.contains(e.target as Node)) setOuvert(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div ref={ref} className="relative">
            <input
                placeholder="Rechercher un patient existant..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOuvert(true) }}
                onFocus={() => setOuvert(true)}
                className="w-full border border-slate/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass"
            />
            {ouvert && resultats.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-slate/20 rounded-md mt-1 shadow-lg max-h-48 overflow-auto">
                    {resultats.map((p) => (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => { onSelect(p); setQuery(''); setResultats([]); setOuvert(false) }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-brass/10 border-b border-slate/10 last:border-0"
                        >
                            {p.nom} {p.prenom}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}