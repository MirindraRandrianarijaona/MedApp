import { useEffect, useState } from 'react'

function IconeOeil({ barre }: { barre: boolean }) {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {barre ? (
                <>
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" y1="2" x2="22" y2="22" />
                </>
            ) : (
                <>
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                </>
            )}
        </svg>
    )
}

export function VerrouDeBase({ children }: { children: React.ReactNode }): React.JSX.Element {
    const [chargement, setChargement] = useState(true)
    const [existe, setExiste] = useState(false)
    const [debloque, setDebloque] = useState(false)

    const [motDePasse, setMotDePasse] = useState('')
    const [confirmation, setConfirmation] = useState('')
    const [erreur, setErreur] = useState<string | null>(null)

    const [voirMdp, setVoirMdp] = useState(false)
    const [voirConf, setVoirConf] = useState(false)

    useEffect(() => {
        window.api.coffre.etat().then(({ existe }) => {
            setExiste(existe)
            setChargement(false)
        })
    }, [])

    async function handleCreer(e: React.FormEvent): Promise<void> {
        e.preventDefault()
        setErreur(null)
        if (motDePasse.length < 8) { setErreur('Le mot de passe doit contenir au moins 8 caractères.'); return }
        if (motDePasse !== confirmation) { setErreur('Les mots de passe ne correspondent pas.'); return }
        const ok = await window.api.coffre.creer(motDePasse)
        if (ok) setDebloque(true)
        else setErreur('Impossible de créer la base de données.')
    }

    async function handleDeverrouiller(e: React.FormEvent): Promise<void> {
        e.preventDefault()
        setErreur(null)
        const ok = await window.api.coffre.deverrouiller(motDePasse)
        if (ok) setDebloque(true)
        else setErreur('Mot de passe incorrect.')
    }

    if (chargement) return <div className="h-screen w-screen bg-paper" />
    if (debloque) return <>{children}</>

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-ink">
            <div className="w-full max-w-sm bg-paper rounded-lg p-8">
                <p className="font-mono text-xs uppercase tracking-wide text-slate mb-1">Coffre chiffré</p>
                <h2 className="font-display text-2xl text-ink mb-6">
                    {existe ? 'Déverrouiller la base de données' : 'Protéger la base de données'}
                </h2>

                {existe ? (
                    <form onSubmit={handleDeverrouiller} className="space-y-4">
                        <div className="relative">
                            <input
                                type={voirMdp ? "text" : "password"}
                                autoFocus
                                placeholder="Mot de passe de chiffrement"
                                value={motDePasse}
                                onChange={(e) => setMotDePasse(e.target.value)}
                                className="w-full border border-slate/30 rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-brass"
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => setVoirMdp(!voirMdp)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-ink transition-colors"
                            >
                                <IconeOeil barre={!voirMdp} />
                            </button>
                        </div>

                        {erreur && <p className="text-rust text-sm">{erreur}</p>}

                        <button type="submit" className="w-full bg-ink text-paper rounded-md py-2 font-medium hover:bg-brass transition-colors">
                            Déverrouiller →
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleCreer} className="space-y-4">
                        <p className="text-slate text-sm">
                            Ce mot de passe chiffre l&apos;ensemble de la base de données. Il est distinct du mot de passe de connexion
                            et ne peut pas être récupéré s&apos;il est oublié — conservez-le en lieu sûr.
                        </p>

                        <div className="relative">
                            <input
                                type={voirMdp ? "text" : "password"}
                                placeholder="Mot de passe de chiffrement"
                                value={motDePasse}
                                onChange={(e) => setMotDePasse(e.target.value)}
                                className="w-full border border-slate/30 rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-brass"
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => setVoirMdp(!voirMdp)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-ink transition-colors"
                            >
                                <IconeOeil barre={!voirMdp} />
                            </button>
                        </div>

                        <div className="relative">
                            <input
                                type={voirConf ? "text" : "password"}
                                placeholder="Confirmer le mot de passe"
                                value={confirmation}
                                onChange={(e) => setConfirmation(e.target.value)}
                                className="w-full border border-slate/30 rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-brass"
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => setVoirConf(!voirConf)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-ink transition-colors"
                            >
                                <IconeOeil barre={!voirConf} />
                            </button>
                        </div>

                        {erreur && <p className="text-rust text-sm">{erreur}</p>}

                        <button type="submit" className="w-full bg-ink text-paper rounded-md py-2 font-medium hover:bg-brass transition-colors">
                            Créer le coffre →
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}