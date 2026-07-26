import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { SignatureLine } from './SignatureLine'

// Composants d'icônes SVG intégrés pour l'œil
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
)

const EyeSlashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
)

export function LoginPage(): React.JSX.Element {
    const { medecin, loading, setAuthenticated } = useAuth()
    const navigate = useNavigate()
    const [error, setError] = useState<string | null>(null)

    // États pour afficher/masquer les mots de passe
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmation, setShowConfirmation] = useState(false)

    // -- Formulaire de connexion (profil déjà créé) --
    const [motDePasse, setMotDePasse] = useState('')

    async function handleConnexion(e: React.FormEvent): Promise<void> {
        e.preventDefault()
        setError(null)
        const ok = await window.api.auth.seConnecter(motDePasse)
        if (!ok) {
            setError('Mot de passe incorrect.')
            return
        }
        setAuthenticated(medecin!)
        navigate('/')
    }

    // -- Formulaire de première configuration --
    const [nom, setNom] = useState('')
    const [specialite, setSpecialite] = useState('')
    const [adresseCabinet, setAdresseCabinet] = useState('')
    const [numeroOrdre, setNumeroOrdre] = useState('')
    const [contact, setContact] = useState('')
    const [nouveauMotDePasse, setNouveauMotDePasse] = useState('')
    const [confirmation, setConfirmation] = useState('')

    async function handleCreation(e: React.FormEvent): Promise<void> {
        e.preventDefault()
        setError(null)
        if (nouveauMotDePasse !== confirmation) {
            setError('Les mots de passe ne correspondent pas.')
            return
        }
        if (nouveauMotDePasse.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères.')
            return
        }
        const profil = await window.api.auth.creerProfil({
            nom,
            specialite: specialite || undefined,
            adresseCabinet: adresseCabinet || undefined,
            numeroOrdre: numeroOrdre || undefined,
            contact: contact || undefined,
            motDePasse: nouveauMotDePasse
        })
        setAuthenticated(profil)
        navigate('/')
    }

    if (loading) return <div className="h-screen bg-paper" />

    return (
        <div className="h-screen w-screen flex bg-paper">
            {/* Panneau identité */}
            <div className="w-[38%] bg-ink flex flex-col justify-between p-10 text-paper">
                <div>
                    <p className="font-mono text-xs tracking-widest text-brass uppercase">Cabinet médical</p>
                    <h1 className="font-display text-4xl mt-2">MedApp</h1>
                </div>
                <SignatureLine />
                <p className="font-mono text-xs text-slate">Application locale — vos données restent sur cet ordinateur</p>
            </div>

            {/* Formulaire */}
            <div className="flex-1 flex items-center justify-center p-10">
                <div className="w-full max-w-sm">
                    {medecin ? (
                        <form onSubmit={handleConnexion} className="space-y-5">
                            <div>
                                <p className="text-slate text-sm">Bon retour,</p>
                                <h2 className="font-display text-2xl text-ink">Dr {medecin.nom}</h2>
                            </div>
                            <div>
                                <label className="text-sm text-slate">Mot de passe</label>
                                <div className="relative mt-1">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        autoFocus
                                        value={motDePasse}
                                        onChange={(e) => setMotDePasse(e.target.value)}
                                        className="w-full border border-slate/30 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-brass"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate hover:text-ink transition-colors"
                                    >
                                        {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                                    </button>
                                </div>
                            </div>
                            {error && <p className="text-rust text-sm">{error}</p>}
                            <button
                                type="submit"
                                className="w-full bg-ink text-paper rounded-md py-2 font-medium hover:bg-brass transition-colors"
                            >
                                Se connecter →
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleCreation} className="space-y-6">
                            <div>
                                <p className="text-slate text-sm">Bienvenue Docteur,</p>
                                <h2 className="font-display text-2xl text-ink">Configuration du cabinet</h2>
                            </div>

                            <div className="space-y-3">
                                <p className="font-mono text-xs uppercase tracking-wide text-slate">Identité</p>
                                <input placeholder="Nom (ex: Jean R.)" value={nom} onChange={(e) => setNom(e.target.value)}
                                    className="w-full border border-slate/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brass" required />
                                <input placeholder="Spécialité" value={specialite} onChange={(e) => setSpecialite(e.target.value)}
                                    className="w-full border border-slate/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brass" />
                            </div>

                            <div className="space-y-3">
                                <p className="font-mono text-xs uppercase tracking-wide text-slate">Coordonnées du cabinet</p>
                                <input placeholder="Adresse du cabinet" value={adresseCabinet} onChange={(e) => setAdresseCabinet(e.target.value)}
                                    className="w-full border border-slate/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brass" />
                                <input placeholder="Numéro d'ordre" value={numeroOrdre} onChange={(e) => setNumeroOrdre(e.target.value)}
                                    className="w-full border border-slate/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brass" />
                                <input placeholder="Téléphone / Contact" value={contact} onChange={(e) => setContact(e.target.value)}
                                    className="w-full border border-slate/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brass" />
                            </div>

                            <div className="space-y-3">
                                <p className="font-mono text-xs uppercase tracking-wide text-slate">Sécurité</p>

                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Mot de passe (8 caractères minimum)"
                                        value={nouveauMotDePasse}
                                        onChange={(e) => setNouveauMotDePasse(e.target.value)}
                                        className="w-full border border-slate/30 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-brass" required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate hover:text-ink transition-colors"
                                    >
                                        {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                                    </button>
                                </div>

                                <div className="relative">
                                    <input
                                        type={showConfirmation ? "text" : "password"}
                                        placeholder="Confirmer le mot de passe"
                                        value={confirmation}
                                        onChange={(e) => setConfirmation(e.target.value)}
                                        className="w-full border border-slate/30 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-brass" required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmation(!showConfirmation)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate hover:text-ink transition-colors"
                                    >
                                        {showConfirmation ? <EyeSlashIcon /> : <EyeIcon />}
                                    </button>
                                </div>
                            </div>

                            {error && <p className="text-rust text-sm">{error}</p>}
                            <button
                                type="submit"
                                className="w-full bg-ink text-paper rounded-md py-2 font-medium hover:bg-brass transition-colors"
                            >
                                Créer le profil →
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}