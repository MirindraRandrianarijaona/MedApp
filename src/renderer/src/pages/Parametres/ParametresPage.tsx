import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export function ParametresPage(): React.JSX.Element {
    const { medecin, updateMedecin } = useAuth()
    const [nom, setNom] = useState('')
    const [specialite, setSpecialite] = useState('')
    const [adresseCabinet, setAdresseCabinet] = useState('')
    const [numeroOrdre, setNumeroOrdre] = useState('')
    const [contact, setContact] = useState('')
    const [nouveauMotDePasse, setNouveauMotDePasse] = useState('')
    const [confirmation, setConfirmation] = useState('')
    const [message, setMessage] = useState<string | null>(null)
    const [erreur, setErreur] = useState<string | null>(null)
    const [exportEnCours, setExportEnCours] = useState(false)
    const [restaurationEnCours, setRestaurationEnCours] = useState(false)

    useEffect(() => {
        if (medecin) {
            setNom(medecin.nom)
            setSpecialite(medecin.specialite ?? '')
            setAdresseCabinet(medecin.adresseCabinet ?? '')
            setNumeroOrdre(medecin.numeroOrdre ?? '')
            setContact(medecin.contact ?? '')
        }
    }, [medecin])

    async function handleEnregistrer(e: React.FormEvent): Promise<void> {
        e.preventDefault()
        setErreur(null)
        setMessage(null)
        if (nouveauMotDePasse && nouveauMotDePasse !== confirmation) {
            setErreur('Les mots de passe ne correspondent pas.')
            return
        }
        if (nouveauMotDePasse && nouveauMotDePasse.length < 8) {
            setErreur('Le mot de passe doit contenir au moins 8 caractères.')
            return
        }
        const profil = await window.api.auth.modifierProfil({
            nom,
            specialite: specialite || undefined,
            adresseCabinet: adresseCabinet || undefined,
            numeroOrdre: numeroOrdre || undefined,
            contact: contact || undefined,
            motDePasse: nouveauMotDePasse || undefined
        })
        updateMedecin(profil)
        setNouveauMotDePasse('')
        setConfirmation('')
        setMessage('Profil mis à jour.')
    }

    async function handleExporter(): Promise<void> {
        setExportEnCours(true)
        try {
            const chemin = await window.api.backup.exporter()
            if (chemin) setMessage(`Sauvegarde enregistrée : ${chemin}`)
        } finally {
            setExportEnCours(false)
        }
    }

    async function handleRestaurer(): Promise<void> {
        if (!confirm("Restaurer une sauvegarde va remplacer toutes les données actuelles et relancer l'application. Continuer ?")) return
        setRestaurationEnCours(true)
        await window.api.backup.restaurer()
        setRestaurationEnCours(false)
    }

    return (
        <div className="max-w-2xl space-y-6">
            <h2 className="font-display text-2xl text-ink">Paramètres du cabinet</h2>

            {message && <p className="text-sage text-sm bg-sage/10 border border-sage/20 rounded-md px-3 py-2">{message}</p>}
            {erreur && <p className="text-rust text-sm bg-rust/10 border border-rust/20 rounded-md px-3 py-2">{erreur}</p>}

            <form onSubmit={handleEnregistrer} className="bg-white rounded-lg border border-slate/15 p-4 space-y-4">
                <div className="space-y-3">
                    <p className="font-mono text-xs uppercase tracking-wide text-slate">Identité</p>
                    <input placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} required
                        className="w-full border border-slate/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass" />
                    <input placeholder="Spécialité" value={specialite} onChange={(e) => setSpecialite(e.target.value)}
                        className="w-full border border-slate/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass" />
                </div>

                <div className="space-y-3">
                    <p className="font-mono text-xs uppercase tracking-wide text-slate">Coordonnées du cabinet</p>
                    <input placeholder="Adresse du cabinet" value={adresseCabinet} onChange={(e) => setAdresseCabinet(e.target.value)}
                        className="w-full border border-slate/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass" />
                    <input placeholder="Numéro d'ordre" value={numeroOrdre} onChange={(e) => setNumeroOrdre(e.target.value)}
                        className="w-full border border-slate/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass" />
                    <input placeholder="Téléphone / Contact" value={contact} onChange={(e) => setContact(e.target.value)}
                        className="w-full border border-slate/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass" />
                </div>

                <div className="space-y-3">
                    <p className="font-mono text-xs uppercase tracking-wide text-slate">Changer le mot de passe (optionnel)</p>
                    <input type="password" placeholder="Nouveau mot de passe" value={nouveauMotDePasse}
                        onChange={(e) => setNouveauMotDePasse(e.target.value)}
                        className="w-full border border-slate/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass" />
                    <input type="password" placeholder="Confirmer le nouveau mot de passe" value={confirmation}
                        onChange={(e) => setConfirmation(e.target.value)}
                        className="w-full border border-slate/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass" />
                </div>

                <button type="submit" className="bg-ink text-paper px-4 py-2 rounded-md text-sm font-medium hover:bg-brass transition-colors">
                    Enregistrer
                </button>
            </form>

            <div className="bg-white rounded-lg border border-slate/15 p-4 space-y-3">
                <p className="font-mono text-xs uppercase tracking-wide text-slate">Sauvegarde des données</p>
                <p className="text-slate text-sm">
                    Toutes les données (patients, consultations, ordonnances...) sont stockées dans un seul fichier sur cet ordinateur.
                    Exportez régulièrement une copie sur une clé USB ou un disque externe.
                </p>
                <div className="flex gap-3">
                    <button onClick={handleExporter} disabled={exportEnCours}
                        className="bg-ink text-paper px-4 py-2 rounded-md text-sm font-medium hover:bg-brass transition-colors disabled:opacity-40">
                        {exportEnCours ? 'Export...' : 'Exporter une sauvegarde'}
                    </button>
                    <button onClick={handleRestaurer} disabled={restaurationEnCours}
                        className="border border-rust/40 text-rust px-4 py-2 rounded-md text-sm hover:bg-rust hover:text-paper transition-colors disabled:opacity-40">
                        {restaurationEnCours ? 'Restauration...' : 'Restaurer une sauvegarde'}
                    </button>
                </div>
            </div>
        </div>
    )
}