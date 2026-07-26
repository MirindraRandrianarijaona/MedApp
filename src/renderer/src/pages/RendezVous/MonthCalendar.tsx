import { formatDateISO } from '../../utils/date'

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export function MonthCalendar({
    mois,
    compteParJour,
    selectedDate,
    onSelectDate,
    onChangeMois
}: {
    mois: Date
    compteParJour: Record<string, number>
    selectedDate: string | null
    onSelectDate: (date: string) => void
    onChangeMois: (delta: number) => void
}): React.JSX.Element {
    const annee = mois.getFullYear()
    const moisIndex = mois.getMonth()
    const premierJour = new Date(annee, moisIndex, 1)
    const nbJours = new Date(annee, moisIndex + 1, 0).getDate()
    // Lundi = 0 ... Dimanche = 6
    const decalage = (premierJour.getDay() + 6) % 7

    const cellules: (number | null)[] = [...Array(decalage).fill(null), ...Array.from({ length: nbJours }, (_, i) => i + 1)]
    const aujourdHui = formatDateISO(new Date())

    return (
        <div className="bg-white rounded-lg border border-slate/15 p-4">
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => onChangeMois(-1)} className="text-slate hover:text-ink px-2">←</button>
                <p className="font-display text-lg text-ink capitalize">
                    {mois.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </p>
                <button onClick={() => onChangeMois(1)} className="text-slate hover:text-ink px-2">→</button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
                {JOURS.map((j) => (
                    <p key={j} className="text-center text-xs text-slate font-mono">{j}</p>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {cellules.map((jour, i) => {
                    if (jour === null) return <div key={`vide-${i}`} />
                    const dateStr = formatDateISO(new Date(annee, moisIndex, jour))
                    const count = compteParJour[dateStr] ?? 0
                    const estAujourdhui = dateStr === aujourdHui
                    const estSelectionne = dateStr === selectedDate

                    return (
                        <button
                            key={dateStr}
                            onClick={() => onSelectDate(dateStr)}
                            className={`aspect-square rounded-md text-sm flex flex-col items-center justify-center transition-colors relative
                ${estSelectionne ? 'bg-ink text-paper' : estAujourdhui ? 'bg-brass/10 text-ink' : 'text-ink hover:bg-brass/5'}`}
                        >
                            <span>{jour}</span>
                            {count > 0 && (
                                <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${estSelectionne ? 'bg-brass' : 'bg-brass'}`} />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}