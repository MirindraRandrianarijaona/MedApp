import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export function ConsultationFormPage(): React.JSX.Element {
    const { id } = useParams() // id du patient
    const navigate = useNavigate()

    const [motif, setMotif] = useState('')
    const [symptomes, setSymptomes] = useState('')
    const [diagnostic, setDiagnostic] = useState('')
    const [poids, setPoids] = useState('')
    const [taille, setTaille] = useState('')
    const [tas, setTas] = useState('')
    const [tad, setTad] = useState('')
    const [temperature, setTemperature] = useState('')
    const [spo2, setSpo2] = useState('')

    async function handleSubmit(e: React.FormEvent): Promise<void> {
        e.preventDefault()
        await window.api.consultations.creer({
            idPatient: Number(id),
            motif,
            symptomes: symptomes || undefined,
            diagnostic: diagnostic || undefined,
            parametres: {
                poids: poids ? Number(poids) : undefined,
                taille: taille ? Number(taille) : undefined,
                tensionArterielleSystolique: tas ? Number(tas) : undefined,
                tensionArterielleDiastolique: tad ? Number(tad) : undefined,
                temperature: temperature ? Number(temperature) : undefined,
                saturationOxygene: spo2 ? Number(spo2) : undefined
            }
        })
        navigate(`/patients/${id}`)
    }

    return (
        <div>
            <button
                onClick={() => navigate(-1)}
                className="flex items-center border border-slate/30 px-4 py-2 rounded-md text-slate hover:border-brass hover:text-ink mb-6 transition-colors font-medium text-sm group"
            >
                <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour
            </button>

            <div className="max-w-2xl">
                <h2 className="font-display text-2xl text-ink mb-6">Nouvelle consultation</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                        <p className="font-mono text-xs uppercase tracking-wide text-slate">Motif et observations</p>
                        <input placeholder="Motif de consultation" value={motif} onChange={(e) => setMotif(e.target.value)} required
                            className="w-full border border-slate/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brass" />
                        <textarea placeholder="Symptômes" value={symptomes} onChange={(e) => setSymptomes(e.target.value)} rows={2}
                            className="w-full border border-slate/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brass" />
                        <textarea placeholder="Diagnostic" value={diagnostic} onChange={(e) => setDiagnostic(e.target.value)} rows={2}
                            className="w-full border border-slate/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brass" />
                    </div>

                    <div className="space-y-3">
                        <p className="font-mono text-xs uppercase tracking-wide text-slate">Paramètres médicaux</p>
                        <div className="grid grid-cols-3 gap-3">
                            <input placeholder="Poids (kg)" value={poids} onChange={(e) => setPoids(e.target.value)}
                                className="border border-slate/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brass" />
                            <input placeholder="Taille (cm)" value={taille} onChange={(e) => setTaille(e.target.value)}
                                className="border border-slate/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brass" />
                            <input placeholder="Température (°C)" value={temperature} onChange={(e) => setTemperature(e.target.value)}
                                className="border border-slate/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brass" />
                            <input placeholder="TA systolique" value={tas} onChange={(e) => setTas(e.target.value)}
                                className="border border-slate/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brass" />
                            <input placeholder="TA diastolique" value={tad} onChange={(e) => setTad(e.target.value)}
                                className="border border-slate/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brass" />
                            <input placeholder="SpO2 (%)" value={spo2} onChange={(e) => setSpo2(e.target.value)}
                                className="border border-slate/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brass" />
                        </div>
                    </div>

                    <button type="submit" className="bg-ink text-paper px-5 py-2 rounded-md text-sm font-medium hover:bg-brass transition-colors">
                        Enregistrer la consultation
                    </button>
                </form>
            </div>
        </div>

    )
}