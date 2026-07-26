export function QuickChips({
    options,
    onSelect
}: {
    options: string[]
    onSelect: (value: string) => void
}): React.JSX.Element {
    return (
        <div className="flex flex-wrap gap-1.5 mt-1.5">
            {options.map((option) => (
                <button
                    key={option}
                    type="button"
                    onClick={() => onSelect(option)}
                    className="text-xs px-2.5 py-1 rounded-full border border-slate/25 text-slate hover:border-brass hover:text-brass transition-colors"
                >
                    {option}
                </button>
            ))}
        </div>
    )
}