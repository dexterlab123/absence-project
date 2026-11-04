import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function SessionsIndex({ sessions }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-medium text-admin-text-primary">Absences (Historique des séances)</h2>
                        <p className="text-sm text-admin-text-secondary mt-1">Vos séances passées et leurs absences.</p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={route('sessions.create')}
                            className="px-4 py-2 text-sm font-medium text-white bg-admin-accent rounded hover:bg-blue-700 transition-colors"
                        >
                            Créer séance
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Absences" />

            {sessions.length > 0 ? (
                <div className="border border-admin-border bg-admin-bg overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-admin-sidebar border-b border-admin-border">
                            <tr>
                                <th className="px-4 py-3 font-medium text-admin-text-primary">Date et Heure</th>
                                <th className="px-4 py-3 font-medium text-admin-text-primary">Module</th>
                                <th className="px-4 py-3 font-medium text-admin-text-primary">Groupe</th>
                                <th className="px-4 py-3 font-medium text-admin-text-primary text-center">Absences</th>
                                <th className="px-4 py-3 font-medium text-admin-text-primary text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E5E5]">
                            {sessions.map((session) => (
                                <tr key={session.id} className="hover:bg-admin-sidebar">
                                    <td className="px-4 py-3 text-admin-text-secondary">
                                        <div className="font-medium">{session.date}</div>
                                        <div className="text-xs">{session.start_time} - {session.end_time}</div>
                                    </td>
                                    <td className="px-4 py-3 text-admin-text-primary font-medium">
                                        <Link href={route('sessions.show', session.id)} className="text-admin-accent hover:underline">
                                            {session.subject}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-admin-text-secondary">
                                        {session.group?.name}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {session.absences_count > 0 ? (
                                            <span className="inline-flex items-center justify-center bg-red-50 text-admin-red px-2 py-0.5 rounded-full text-xs font-bold border border-red-200">
                                                {session.absences_count}
                                            </span>
                                        ) : (
                                            <span className="text-admin-text-secondary text-xs">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            href={route('sessions.show', session.id)}
                                            className="text-xs bg-admin-accent text-white px-3 py-1.5 rounded hover:opacity-90 transition-opacity"
                                        >
                                            Gérer présences
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="border border-admin-border bg-admin-bg p-8 text-center">
                    <p className="text-sm text-admin-text-secondary mb-4">Aucune séance n'a été créée pour le moment.</p>
                    <Link
                        href={route('sessions.create')}
                        className="px-4 py-2 text-sm font-medium text-admin-accent border border-admin-accent rounded hover:bg-admin-accent hover:text-white transition-colors"
                    >
                        Créer votre première séance
                    </Link>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
