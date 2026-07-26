import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export function PatientFormPage(): React.JSX.Element {
    const { id } = useParams()
    const navigate = useNavigate()
    const api = window.api as any
    const modeEdition = Boolean(id)

    const [numeroDossier, setNumeroDossier] = useState('')
    const [nom, setNom] = useState('')
    const [prenom, setPrenom] = useState('')
    const [sexe, setSexe] = useState<'M' | 'F'>('M')
    const [dateNaissance, setDateNaissance] = useState('')
    const [adresse, setAdresse] = useState('')
    const [telephone, setTelephone] = useState('')
    const [antecedentsMedicaux, setAntecedentsMedicaux] = useState('')
    const [allergies, setAllergies] = useState('')
    const [observations, setObservations] = useState('')
    const [chargement, setChargement] = useState(true)

    useEffect(() => {
        if (modeEdition) {
            api.patients.get(Number(id)).then((p: any) => {
                setNumeroDossier(p.numeroDossier)
                setNom(p.nom)
                setPrenom(p.prenom)
                setSexe(p.sexe)
                setDateNaissance(p.dateNaissance)
                setAdresse(p.adresse ?? '')
                setTelephone(p.telephone ?? '')
                setAntecedentsMedicaux(p.antecedentsMedicaux ?? '')
                setAllergies(p.allergies ?? '')
                setObservations(p.observations ?? '')
                setChargement(false)
            })
        } else {
            api.patients.genererNumeroDossier().then((n: any) => {
                setNumeroDossier(String(n))
                setChargement(false)
            })
        }
    }, [id, modeEdition])

    async function handleSubmit(e: React.FormEvent): Promise<void> {
        e.preventDefault()
        const data = {
            numeroDossier,
            nom,
            prenom,
            sexe,
            dateNaissance,
            adresse: adresse || undefined,
            telephone: telephone || undefined,
            antecedentsMedicaux: antecedentsMedicaux || undefined,
            allergies: allergies || undefined,
            observations: observations || undefined
        }

        if (modeEdition) {
            await window.api.patients.modifier(Number(id), data)
            navigate(`/patients/${id}`)
        } else {
            const patient = await window.api.patients.ajouter(data)
            navigate(`/patients/${patient.id}`)
        }
    }

    if (chargement) return <p className="text-slate">Chargement...</p>

    return (
        <div>
            {/* BOUTON RETOUR AJOUTÉ ICI */}
            <button
                onClick={() => navigate(-1)}
                className="flex border border-slate-800/30 px-4 py-2 rounded-md items-center text-slate hover:text-ink mb-6 transition-colors font-medium text-sm group"
            >
                <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour à la liste
            </button>

            <div className="w-full max-w-4xl m-auto items-center">
                <h2 className="font-display text-2xl text-ink mb-6">
                    {modeEdition ? 'Modifier le patient' : 'Nouveau patient'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                        <p className="font-mono text-xs uppercase tracking-wide text-slate">Dossier</p>
                        <div>
                            <label className="text-sm text-slate">Numéro de dossier</label>
                            <input
                                value={numeroDossier}
                                onChange={(e) => setNumeroDossier(e.target.value)}
                                className="mt-1 w-full border border-slate/30 rounded-md px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brass"
                            />
                            <p className="text-xs text-slate mt-1">Généré automatiquement — modifiable si besoin (reprise d'un dossier papier).</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="font-mono text-xs uppercase tracking-wide text-slate">Informations administratives</p>
                        <div className="grid grid-cols-2 gap-3">
                            <input placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} required
                                className="border border-slate/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brass" />
                            <input placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required
                                className="border border-slate/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brass" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <select value={sexe} onChange={(e) => setSexe(e.target.value as 'M' | 'F')}
                                className="border border-slate/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brass">
                                <option value="M">Masculin</option>
                                <option value="F">Féminin</option>
                            </select>
                            <input type="date" value={dateNaissance} onChange={(e) => setDateNaissance(e.target.value)} required
                                className="border border-slate/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brass" />
                        </div>
                        <input placeholder="Adresse" value={adresse} onChange={(e) => setAdresse(e.target.value)}
                            className="w-full border border-slate/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brass" />
                        <input placeholder="Téléphone" value={telephone} onChange={(e) => setTelephone(e.target.value)}
                            className="w-full border border-slate/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brass" />
                    </div>

                    <div className="space-y-3">
                        <p className="font-mono text-xs uppercase tracking-wide text-slate">Informations médicales générales</p>
                        <textarea placeholder="Antécédents médicaux" value={antecedentsMedicaux}
                            onChange={(e) => setAntecedentsMedicaux(e.target.value)} rows={2}
                            className="w-full border border-slate/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brass" />
                        <textarea placeholder="Allergies connues" value={allergies}
                            onChange={(e) => setAllergies(e.target.value)} rows={2}
                            className="w-full border border-slate/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brass" />
                        <textarea placeholder="Observations importantes" value={observations}
                            onChange={(e) => setObservations(e.target.value)} rows={2}
                            className="w-full border border-slate/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brass" />
                    </div>

                    <button type="submit" className="bg-ink text-paper px-5 py-2 rounded-md text-sm font-medium hover:bg-brass transition-colors">
                        {modeEdition ? 'Enregistrer les modifications' : 'Créer le dossier'}
                    </button>
                </form>
            </div>
        </div>
    )
}