import NavLink from '@/Components/NavLink';
import { Link, usePage } from '@inertiajs/react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    return (
        <div className="min-h-screen bg-admin-bg flex">
            {/* Sidebar */}
            <aside className="w-64 bg-admin-sidebar border-r border-admin-border flex-shrink-0 hidden md:flex md:flex-col">
                <div className="h-16 flex items-center px-6 border-b border-admin-border">
                    <Link href={route('dashboard')} className="text-admin-text-primary font-bold text-lg">
                        ISTA Nador
                    </Link>
                </div>

                <nav className="flex-1 py-4 space-y-1">
                    <NavLink href={route('dashboard')} active={route().current('dashboard')}>
                        Dashboard
                    </NavLink>
                    <NavLink href={route('groups.index')} active={route().current('groups.*')}>
                        Groups
                    </NavLink>
                </nav>

                <div className="p-4 border-t border-admin-border">
                    <div className="text-sm font-medium text-admin-text-primary mb-1">
                        {user.name}
                    </div>
                    <Link href={route('profile.edit')} className="text-xs text-admin-text-secondary hover:text-admin-accent block mb-2">
                        Profile
                    </Link>
                    <Link href={route('logout')} method="post" as="button" className="text-xs text-admin-text-secondary hover:text-admin-accent block text-left">
                        Log Out
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {header && (
                    <header className="h-16 border-b border-admin-border bg-admin-bg flex items-center px-6">
                        <div className="text-xl font-medium text-admin-text-primary">
                            {header}
                        </div>
                    </header>
                )}

                <main className="flex-1 overflow-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
