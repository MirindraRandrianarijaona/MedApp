import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface Medecin {
    id: number
    nom: string
    specialite: string | null
    adresseCabinet: string | null
    numeroOrdre: string | null
    contact: string | null
}

interface AuthContextValue {
    medecin: Medecin | null
    isAuthenticated: boolean
    loading: boolean
    setAuthenticated: (medecin: Medecin) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }): React.JSX.Element {
    const [medecin, setMedecin] = useState<Medecin | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        window.api.auth.verifierSession().then((profil) => {
            setMedecin(profil)
            setLoading(false)
        })
    }, [])

    function setAuthenticated(profil: Medecin): void {
        setMedecin(profil)
        setIsAuthenticated(true)
    }

    return (
        <AuthContext.Provider value={{ medecin, isAuthenticated, loading, setAuthenticated }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider')
    return ctx
}