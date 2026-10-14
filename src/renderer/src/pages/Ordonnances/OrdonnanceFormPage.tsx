import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { pdf } from '@react-pdf/renderer'
import { MedicamentCombobox } from './MedicamentCombobox'
import { QuickChips } from './QuickChips'
import { OrdonnancePDF } from '../../pdf/OrdonnancePDF'

interface LigneOrdonnance {
    id: number
    idMedicament: number
    posologie: string
    momentPrise: string | null
    dureeTraitement: string | null
    nomCommercial: string
    dosageDisponible: string | null
}

const MOMENTS_COURANTS = ['Avant les repas', 'Pendant les repas', 'Après les repas', 'Avant de dormir', 'Au réveil']
const DUREES_COURANTES = ['3 jours', '5 jours', '7 jours', '10 jours', '1 mois']

type CategoriePosologie = 'oral_solide' | 'sirop' | 'injection' | 'topique' | 'suppositoire' | 'gouttes'

function categoriePosologie(forme: string | null): CategoriePosologie | null {
    if (!forme) return null
    const f = forme.toLowerCase()
    // "sachet" d'abord, avant "poudre"/"suspension" en général : une poudre pour
    // suspension EN SACHET se dose en sachets, une poudre pour suspension buvable
    // (sans "sachet") se reconstitue en flacon et se dose en ml, comme un sirop.
    if (f.includes('sachet')) return 'oral_solide'
    if (f.includes('comprim') || f.includes('gélule') || f.includes('gelule')) return 'oral_solide'
    if (f.includes('sirop') || f.includes('solution buvable') || f.includes('suspension')) return 'sirop'
    if (f.includes('injectable') || f.includes('perfusion') || f.includes('ampoule')) return 'injection'
    if (f.includes('crème') || f.includes('creme') || f.includes('pommade') || f.includes('gel')) return 'topique'
    if (f.includes('suppositoire') || f.includes('ovule')) return 'suppositoire'
    if (f.includes('collyre') || f.includes('goutte')) return 'gouttes'
    return null
}

// Catégories où la grille matin/midi/soir a du sens (dose numérique par créneau)
const CATEGORIES_AVEC_GRILLE: CategoriePosologie[] = ['oral_solide', 'sirop']

// Pour oral_solide, l'unité réelle dépend du texte de la forme (comprimé, gélule
// ou sachet) plutôt que d'être figée — sinon un sachet afficherait "comprimé".
function uniteGrille(categorie: CategoriePosologie | null, forme: string | null): string | undefined {
    if (categorie === 'sirop') return 'ml'
    if (categorie === 'oral_solide') {
        const f = (forme ?? '').toLowerCase()
        if (f.includes('sachet')) return 'sachet'
        if (f.includes('gélule') || f.includes('gelule')) return 'gélule'
        return 'comprimé'
    }
    return undefined
}

// Pour les catégories hors grille : chips contextuels selon la forme réelle du médicament.
// Rien n'est affiché si la forme n'est pas reconnue (mieux vaut aucune suggestion qu'une fausse).
const POSOLOGIES_PAR_CATEGORIE: Partial<Record<CategoriePosologie, string[]>> = {
    injection: ['1 ampoule IM par jour', '1 ampoule IV lente', '1 flacon en perfusion', '1 injection SC par jour'],
    topique: ['Application locale 2 fois par jour', 'Application locale matin et soir', 'Fine couche 1 fois par jour'],
    suppositoire: ['1 suppositoire matin et soir', '1 suppositoire le soir'],
    gouttes: ['1 goutte dans chaque œil 3 fois par jour', '2 gouttes matin et soir']
}

export function OrdonnanceFormPage(): React.JSX.Element {
    const { id, consultId } = useParams()
    const navigate = useNavigate()
    const [idOrdonnance, setIdOrdonnance] = useState<number | null>(null)
    const [dateOrdonnance, setDateOrdonnance] = useState('')
    const [lignes, setLignes] = useState<LigneOrdonnance[]>([])
    const [generation, setGeneration] = useState(false)

    const [medicamentChoisi, setMedicamentChoisi] = useState<{ id: number; nomCommercial: string; forme: string | null } | null>(null)
    const [posologie, setPosologie] = useState('')
    const [momentPrise, setMomentPrise] = useState('')
    const [dureeTraitement, setDureeTraitement] = useState('')
    const [modeTexteLibre, setModeTexteLibre] = useState(false)
    const [grilleMatin, setGrilleMatin] = useState('')
    const [grilleMidi, setGrilleMidi] = useState('')
    const [grilleSoir, setGrilleSoir] = useState('')

    const categorie = categoriePosologie(medicamentChoisi?.forme ?? null)
    const grilleDisponible = categorie !== null && CATEGORIES_AVEC_GRILLE.includes(categorie)
    const afficherGrille = grilleDisponible && !modeTexteLibre

    // Nouveau médicament choisi : on repart sur le mode par défaut (grille si disponible) et on vide les champs.
    useEffect(() => {
        setModeTexteLibre(false)
        setGrilleMatin('')
        setGrilleMidi('')
        setGrilleSoir('')
        // Si la grille est le mode par défaut pour cette forme, on initialise posologie à "0-0-0"
        // plutôt que vide, pour ne jamais soumettre une posologie blanche sans y toucher.
        if (grilleDisponible) {
            const unite = uniteGrille(categorie, medicamentChoisi?.forme ?? null)
            setPosologie(`0-0-0 ${unite ?? ''} (matin-midi-soir)`.replace(/\s+/g, ' ').trim())
        } else {
            setPosologie('')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [medicamentChoisi?.id])

    function majGrille(matin: string, midi: string, soir: string): void {
        setGrilleMatin(matin)
        setGrilleMidi(midi)
        setGrilleSoir(soir)
        const unite = uniteGrille(categorie, medicamentChoisi?.forme ?? null)
        const m = matin || '0'
        const mi = midi || '0'
        const s = soir || '0'
        setPosologie(`${m}-${mi}-${s} ${unite ?? ''} (matin-midi-soir)`.replace(/\s+/g, ' ').trim())
    }
    const [consultation, setConsultation] = useState<{ motif: string; diagnostic: string | null } | null>(null)
    const [notes, setNotes] = useState('')

    const [prochainRdv, setProchainRdv] = useState<{ dateRdv: string; heureDebut: string } | null>(null)
    const [formRdvOuvert, setFormRdvOuvert] = useState(false)
    const [dateRdv, setDateRdv] = useState('')
    const [heureRdv, setHeureRdv] = useState('09:00')


    useEffect(() => {
        window.api.ordonnances.get(Number(consultId)).then((o) => {
            setIdOrdonnance(o.id)
            setDateOrdonnance(o.dateOrdonnance)
            setLignes(o.lignes)
        })
    }, [consultId])
    useEffect(() => {
        window.api.consultations.get(Number(consultId)).then((c) => setConsultation(c))
    }, [consultId])
    useEffect(() => {
        window.api.rendezvous.prochainPourPatient(Number(id)).then((r) => setProchainRdv(r ?? null))
    }, [id])

    useEffect(() => {
        window.api.ordonnances.get(Number(consultId)).then((o) => {
            setIdOrdonnance(o.id)
            setDateOrdonnance(o.dateOrdonnance)
            setNotes(o.notes ?? '')
            setLignes(o.lignes)
        })
    }, [consultId])

    async function handlePlanifierRdv(e: React.FormEvent): Promise<void> {
        e.preventDefault()
        await window.api.rendezvous.creer({
            idPatient: Number(id),
            dateRdv,
            heureDebut: heureRdv,
            motif: 'Suivi ordonnance'
        })
        setProchainRdv({ dateRdv, heureDebut: heureRdv })
        setFormRdvOuvert(false)
    }

    async function handleAjouterLigne(e: React.FormEvent): Promise<void> {
        e.preventDefault()
        if (!medicamentChoisi || !idOrdonnance) return
        const ligne = await window.api.ordonnances.ajouterLigne(idOrdonnance, {
            idMedicament: medicamentChoisi.id,
            posologie,
            momentPrise: momentPrise || undefined,
            dureeTraitement: dureeTraitement || undefined
        })
        setLignes([...lignes, ligne])
        setMedicamentChoisi(null)
        setPosologie('')
        setMomentPrise('')
        setDureeTraitement('')
    }
    async function handleNotesBlur(): Promise<void> {
        if (idOrdonnance) await window.api.ordonnances.modifierNotes(idOrdonnance, notes)
    }

    async function handleSupprimerLigne(idLigne: number): Promise<void> {
        await window.api.ordonnances.supprimerLigne(idLigne)
        setLignes(lignes.filter((l) => l.id !== idLigne))
    }

    async function handleGenererPDF(): Promise<void> {
        setGeneration(true)
        try {
            const [medecin, patient] = await Promise.all([
                window.api.auth.verifierSession(),
                window.api.patients.get(Number(id))
            ])
            if (!medecin || !patient || !consultation) return

            const blob = await pdf(
                <OrdonnancePDF
                    medecin={medecin}
                    patient={patient}
                    consultation={consultation}
                    dateOrdonnance={dateOrdonnance}
                    notes={notes || null}
                    prochainRdv={prochainRdv}
                    lignes={lignes}
                />
            ).toBlob()

            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onloadend = () => resolve((reader.result as string).split(',')[1])
                reader.onerror = reject
                reader.readAsDataURL(blob)
            })

            const nomFichier = `Ordonnance_${patient.nom}_${patient.prenom}_${dateOrdonnance.slice(0, 10)}.pdf`
            const dossierPatient = `${patient.nom}_${patient.prenom}_${id}`
            const chemin = await window.api.documents.ouvrirPDF(base64, nomFichier, dossierPatient)
            await window.api.documents.enregistrer(Number(consultId), 'ORDONNANCE', chemin)
        } finally {
            setGeneration(false)
        }
    }

    return (
        <div className="max-w-2xl">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center border border-slate/30 px-4 py-2 rounded-md text-slate hover:border-brass hover:text-ink mb-6 transition-colors font-medium text-sm"
            >
                ← Retour à la consultation
            </button>

            <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl text-ink">Ordonnance</h2>
                <button
                    onClick={handleGenererPDF}
                    disabled={lignes.length === 0 || generation}
                    className="bg-ink text-paper px-4 py-2 rounded-md text-sm font-medium hover:bg-brass transition-colors disabled:opacity-40"
                >
                    {generation ? 'Génération...' : 'Générer le PDF'}
                </button>
            </div>

            {lignes.length > 0 && (
                <div className="space-y-2 mb-6">
                    {lignes.map((l) => (
                        <div key={l.id} className="bg-white rounded-md border border-slate/15 p-3 text-sm flex justify-between items-start">
                            <div>
                                <p className="text-ink font-medium">{l.nomCommercial} {l.dosageDisponible && `— ${l.dosageDisponible}`}</p>
                                <p className="text-slate text-xs mt-1">{l.posologie}{l.momentPrise && ` · ${l.momentPrise}`}{l.dureeTraitement && ` · ${l.dureeTraitement}`}</p>
                            </div>
                            <button onClick={() => handleSupprimerLigne(l.id)} className="text-rust text-xs hover:underline">
                                Retirer
                            </button>
                        </div>
                    ))}
                </div>
            )}


            <form onSubmit={handleAjouterLigne} className="bg-white rounded-lg border border-slate/15 p-4 space-y-4">
                <p className="font-mono text-xs uppercase tracking-wide text-slate">Ajouter un médicament</p>

                {medicamentChoisi ? (
                    <div className="flex items-center justify-between bg-brass/5 border border-brass/20 rounded-md px-3 py-2 text-sm">
                        <span className="text-ink">{medicamentChoisi.nomCommercial}</span>
                        <button type="button" onClick={() => setMedicamentChoisi(null)} className="text-slate text-xs hover:underline">
                            Changer
                        </button>
                    </div>
                ) : (
                    <MedicamentCombobox onSelect={(m) => setMedicamentChoisi(m)} />
                )}

                <div>
                    {afficherGrille ? (
                        <div className="space-y-1.5">
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="text-xs text-slate block mb-1">Matin</label>
                                    <input type="number" min="0" placeholder="0" value={grilleMatin}
                                        onChange={(e) => majGrille(e.target.value, grilleMidi, grilleSoir)}
                                        className="w-full border border-slate/30 rounded-md px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brass" />
                                </div>
                                <div>
                                    <label className="text-xs text-slate block mb-1">Midi</label>
                                    <input type="number" min="0" placeholder="0" value={grilleMidi}
                                        onChange={(e) => majGrille(grilleMatin, e.target.value, grilleSoir)}
                                        className="w-full border border-slate/30 rounded-md px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brass" />
                                </div>
                                <div>
                                    <label className="text-xs text-slate block mb-1">Soir</label>
                                    <input type="number" min="0" placeholder="0" value={grilleSoir}
                                        onChange={(e) => majGrille(grilleMatin, grilleMidi, e.target.value)}
                                        className="w-full border border-slate/30 rounded-md px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brass" />
                                </div>
                            </div>
                            {uniteGrille(categorie, medicamentChoisi?.forme ?? null) && (
                                <p className="text-xs text-slate">Unité : {uniteGrille(categorie, medicamentChoisi?.forme ?? null)}</p>
                            )}
                            <button type="button" onClick={() => { setModeTexteLibre(true); setPosologie('') }}
                                className="text-xs text-brass hover:underline">
                                Passer en texte libre
                            </button>
                        </div>
                    ) : (
                        <div>
                            <input placeholder="Posologie" value={posologie}
                                onChange={(e) => setPosologie(e.target.value)} required
                                className="w-full border border-slate/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass" />
                            {categorie && POSOLOGIES_PAR_CATEGORIE[categorie] && (
                                <QuickChips options={POSOLOGIES_PAR_CATEGORIE[categorie]!} onSelect={setPosologie} />
                            )}
                            {grilleDisponible && (
                                <button type="button" onClick={() => { setModeTexteLibre(false); setPosologie('') }}
                                    className="text-xs text-brass hover:underline mt-1.5 block">
                                    Revenir à la grille rapide
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <input placeholder="Moment" value={momentPrise}
                            onChange={(e) => setMomentPrise(e.target.value)}
                            className="w-full border border-slate/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass" />
                        <QuickChips options={MOMENTS_COURANTS} onSelect={setMomentPrise} />
                    </div>
                    <div>
                        <input placeholder="Durée" value={dureeTraitement}
                            onChange={(e) => setDureeTraitement(e.target.value)}
                            className="w-full border border-slate/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass" />
                        <QuickChips options={DUREES_COURANTES} onSelect={setDureeTraitement} />
                    </div>
                </div>

                <button type="submit" disabled={!medicamentChoisi}
                    className="bg-ink text-paper px-4 py-2 rounded-md text-sm font-medium hover:bg-brass transition-colors disabled:opacity-40">
                    Ajouter à l'ordonnance
                </button>
            </form>
            <div className="bg-white rounded-lg border border-slate/15 p-4 mb-6 mt-6">
                <label className="font-mono text-xs uppercase tracking-wide text-slate">Notes (optionnel)</label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    onBlur={handleNotesBlur}
                    placeholder="Instructions complémentaires, précisions pour le patient ou le pharmacien..."
                    rows={2}
                    className="w-full border border-slate/30 rounded-md px-3 py-2 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-brass"
                />
            </div>

            <div className="bg-white rounded-lg border border-slate/15 p-4 mb-6">
                <p className="font-mono text-xs uppercase tracking-wide text-slate mb-2">Rendez-vous de suivi (optionnel)</p>

                {prochainRdv && !formRdvOuvert ? (
                    <div className="flex items-center justify-between bg-brass/5 border border-brass/20 rounded-md px-3 py-2 text-sm">
                        <span className="text-ink">
                            {new Date(prochainRdv.dateRdv).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} à {prochainRdv.heureDebut}
                        </span>
                        <button type="button" onClick={() => setFormRdvOuvert(true)} className="text-slate text-xs hover:underline">
                            Changer
                        </button>
                    </div>
                ) : formRdvOuvert ? (
                    <form onSubmit={handlePlanifierRdv} className="flex gap-2 items-end">
                        <input type="date" value={dateRdv} onChange={(e) => setDateRdv(e.target.value)} required
                            className="border border-slate/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass" />
                        <input type="time" value={heureRdv} onChange={(e) => setHeureRdv(e.target.value)} required
                            className="border border-slate/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass" />
                        <button type="submit" className="bg-ink text-paper px-4 py-2 rounded-md text-sm font-medium hover:bg-brass transition-colors">
                            Planifier
                        </button>
                    </form>
                ) : (
                    <button type="button" onClick={() => setFormRdvOuvert(true)} className="text-brass text-sm font-medium hover:underline">
                        + Planifier un rendez-vous de suivi
                    </button>
                )}
            </div>
        </div>
    )
}
