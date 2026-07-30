import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'

const NAV_ITEMS = [
    { to: '/', label: 'Patients' },
    { to: '/rendez-vous', label: 'Rendez-vous' },
    { to: '/finance', label: 'Finance' },
    { to: '/parametres', label: 'Paramètres' }
]

export function AppShell(): React.JSX.Element {
    const { isAuthenticated, medecin, logout } = useAuth()
    const navigate = useNavigate()

    if (!isAuthenticated) return <Navigate to="/login" replace />

    function handleDeconnexion(): void {
        logout()
        navigate('/login')
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-paper">
            <aside className="w-56 bg-ink text-paper flex flex-col p-6">
                <h1 className="font-display text-xl mb-8">MedApp</h1>
                <nav className="flex flex-col gap-1">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end
                            className={({ isActive }) =>
                                `px-3 py-2 rounded-md text-sm transition-colors ${isActive ? 'bg-brass text-ink' : 'text-paper/80 hover:bg-paper/10'
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
                <motion.button
                    onClick={handleDeconnexion}
                    whileHover="hover"
                    initial="rest"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-paper/70 border-t border-paper/10 pt-4 mt-auto group"
                >
                    <motion.svg
                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round"
                        variants={{ rest: { x: 0 }, hover: { x: -3 } }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </motion.svg>
                    <motion.span
                        variants={{ rest: { color: 'rgba(247,244,236,0.7)' }, hover: { color: '#A87F4F' } }}
                    >
                        Se déconnecter
                    </motion.span>
                </motion.button>
            </aside>

            <div className="flex-1 h-full overflow-y-auto p-8 w-full">
                <header className="h-14 flex items-center justify-between px-6 border-b border-slate/15">
                    <p className="font-mono text-xs text-slate">
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <p className="text-sm text-ink">Dr {medecin?.nom}</p>
                </header>
                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}