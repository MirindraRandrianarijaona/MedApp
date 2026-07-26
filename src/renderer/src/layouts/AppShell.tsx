import { NavLink, Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
    { to: '/', label: 'Patients' },
    { to: '/rendez-vous', label: 'Rendez-vous' },
    { to: '/finance', label: 'Finance' }
]

export function AppShell(): React.JSX.Element {
    const { isAuthenticated, medecin } = useAuth()

    if (!isAuthenticated) return <Navigate to="/login" replace />

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