import { useEffect, useRef, useState } from 'react'

interface Medicament {
    id: number
    nomCommercial: string
    nomGenerique: string | null
    dosageDisponible: string | null
}

export function MedicamentCombobox({
    onSelect
}: {
    onSelect: (medicament: Medicament) => void
}): React.JSX.Element {
    const [query, setQuery] = useState('')
    const [resultats, setResultats] = useState<Medicament[]>([])
    const [ouvert, setOuvert] = useState(false)
    const [creationOuverte, setCreationOuverte] = useState(false)
    const [forme, setForme] = useState('')
    const [dosage, setDosage] = useState('')
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (query.trim() === '') {
            setResultats([])
            return
        }
        const timer = setTimeout(() => {
            window.api.medicaments.rechercher(query).then(setResultats)
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

    function choisir(m: Medicament): void {
        onSelect(m)
        setQuery('')
        setResultats([])
        setOuvert(false)
    }

    async function creerEtChoisir(): Promise<void> {
        const m = await window.api.medicaments.creerRapide({
            nomCommercial: query,
            forme: forme || undefined,
            dosageDisponible: dosage || undefined
        })
        choisir(m)
        setCreationOuverte(false)
        setForme('')
        setDosage('')
    }

    return (
        <div ref={ref} className="relative">
            <input
                placeholder="Rechercher un médicament..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOuvert(true) }}
                onFocus={() => setOuvert(true)}
                className="w-full border border-slate/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass"
            />

            {ouvert && query.trim() !== '' && (
                <div className="absolute z-10 w-full bg-white border border-slate/20 rounded-md mt-1 shadow-lg max-h-64 overflow-auto">
                    {resultats.map((m) => (
                        <button
                            key={m.id}
                            type="button"
                            onClick={() => choisir(m)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-brass/10 border-b border-slate/10 last:border-0"
                        >
                            <span className="text-ink">{m.nomCommercial}</span>
                            {m.nomGenerique && <span className="text-slate text-xs ml-2">({m.nomGenerique})</span>}
                            {m.dosageDisponible && <span className="text-slate text-xs ml-2">{m.dosageDisponible}</span>}
                        </button>
                    ))}

                    {!creationOuverte ? (
                        <button
                            type="button"
                            onClick={() => setCreationOuverte(true)}
                            className="w-full text-left px-3 py-2 text-sm text-brass font-medium hover:bg-brass/10"
                        >
                            + Ajouter "{query}" comme nouveau médicament
                        </button>
                    ) : (
                        <div className="p-3 space-y-2 bg-paper">
                            <p className="text-xs text-slate">Nouveau médicament : <strong>{query}</strong></p>
                            <input placeholder="Forme (ex: Comprimé)" value={forme} onChange={(e) => setForme(e.target.value)}
                                className="w-full border border-slate/30 rounded-md px-2 py-1.5 text-sm" />
                            <input placeholder="Dosage (ex: 500mg)" value={dosage} onChange={(e) => setDosage(e.target.value)}
                                className="w-full border border-slate/30 rounded-md px-2 py-1.5 text-sm" />
                            <button type="button" onClick={creerEtChoisir}
                                className="bg-ink text-paper px-3 py-1.5 rounded-md text-xs font-medium hover:bg-brass transition-colors">
                                Créer et utiliser
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}