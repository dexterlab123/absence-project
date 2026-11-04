import NavLink from '@/Components/NavLink';
import { Link, usePage } from '@inertiajs/react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const userRole = user.roles && user.roles.length > 0 ? user.roles[0] : '';
    const displayRole = userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'Utilisateur';

    return (
        <div className="min-h-screen bg-admin-bg flex flex-col">
            {/* Green identity bar */}
            <header className="bg-[#0a4d2c] text-white flex items-center justify-between px-6 py-3 flex-shrink-0">
                {/* Logo / Brand */}
                <Link href={route('dashboard')} className="flex items-center gap-4">
                    <img src="/ofppt.png" alt="OFPPT" className="h-10 w-auto bg-white rounded-md p-1 object-contain" />
                    <div className="leading-tight">
                        <div className="text-base font-medium text-white tracking-wide">ISTA Nador</div>
                        <div className="text-xs text-white/70 tracking-wide mt-0.5">Gestion des Absences</div>
                    </div>
                </Link>

                {/* Right: user info */}
                <div className="flex flex-col items-end leading-tight">
                    <div className="text-sm font-medium text-white">{user.name}</div>
                    <div className="text-xs text-white/70 mt-0.5 mb-1.5">{displayRole}</div>
                    <div className="flex items-center gap-2 text-[11px] text-white/70 font-medium tracking-wide">
                        <Link href={route('profile.edit')} className="hover:text-white transition-colors">Profil</Link>
                        <span>&middot;</span>
                        <Link href={route('logout')} method="post" as="button" className="hover:text-white transition-colors">Déconnexion</Link>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 min-h-0">
                {/* Sidebar */}
                <aside className="w-56 bg-admin-sidebar border-r border-admin-border flex-shrink-0 hidden md:flex md:flex-col">
                    <nav className="flex-1 py-4 space-y-1">
                        <NavLink href={route('dashboard')} active={route().current('dashboard')}>
                            Tableau de bord
                        </NavLink>
                        {user.roles && (user.roles.includes('formateur') || user.roles.includes('admin')) && (
                            <NavLink href={route('absences.index')} active={route().current('absences.*') || route().current('sessions.*')}>
                                Absences
                            </NavLink>
                        )}
                        {user.roles && user.roles.includes('admin') && (
                            <NavLink href={route('admin.accounts')} active={route().current('admin.accounts')}>
                                Gestion des comptes
                            </NavLink>
                        )}
                        {user.roles && (user.roles.includes('admin') || user.roles.includes('surveillant')) && (
                            <NavLink href={route('statistics.index')} active={route().current('statistics.index')}>
                                Statistiques
                            </NavLink>
                        )}
                        {user.roles && (user.roles.includes('admin') || user.roles.includes('surveillant')) && (
                            <NavLink href={route('statistics.topAbsences')} active={route().current('statistics.topAbsences')}>
                                Classement des absences
                            </NavLink>
                        )}
                        <NavLink href={route('groups.index')} active={route().current('groups.*')}>
                            Groupes
                        </NavLink>
                    </nav>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0">
                    <main className="flex-1 overflow-auto p-6">
                        {header && (
                            <div className="mb-6">
                                {header}
                            </div>
                        )}
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
