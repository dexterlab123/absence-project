import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function StatisticsIndex({ groupStats, students, groups, filters, currentYear }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters?.search || '');
    const [groupId, setGroupId] = useState(filters?.group_id || '');

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            router.get(
                route('statistics.index'),
                { search, group_id: groupId },
                { preserveState: true, replace: true }
            );
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search, groupId]);

    // Totals for group stats
    const totals = groupStats.reduce((acc, g) => ({
        students_count: acc.students_count + g.students_count,
        absences_count: acc.absences_count + g.absences_count,
        retards_count: acc.retards_count + g.retards_count,
        sans_billet_count: acc.sans_billet_count + g.sans_billet_count,
    }), { students_count: 0, absences_count: 0, retards_count: 0, sans_billet_count: 0 });

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-xl font-medium text-admin-text-primary">Statistiques</h2>
                    {currentYear && <p className="text-sm text-admin-text-secondary mt-1">Année: {currentYear.name}</p>}
                </div>
            }
        >
            <Head title="Statistiques" />

            {flash?.success && (
                <div className="mb-4 border border-admin-green text-admin-green bg-white p-3 text-sm">{flash.success}</div>
            )}

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
                <select
                    value={groupId}
                    onChange={e => setGroupId(e.target.value)}
                    className="block rounded-md py-1.5 px-3 border-0 ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-admin-accent focus:text-gray-800 text-sm"
                >
                    <option value="">Tous les groupes</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                <input
                    type="text"
                    placeholder="Recherche stagiaire..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="block w-56 rounded-md py-1.5 px-3 border-0 ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-admin-accent focus:text-gray-800 text-sm placeholder-gray-500"
                />
            </div>

            {/* Group Summary */}
            <section className="bg-white border border-admin-border rounded overflow-hidden mb-8">
                <div className="p-4 border-b border-admin-border bg-[#fbfcfe]">
                    <h3 className="text-base font-semibold text-admin-text-primary">Résumé par groupe</h3>
                    <p className="text-sm text-admin-text-secondary mt-1">Vue d'ensemble des absences et retards par groupe.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-[#edf4fb] text-[#173b59] border-b border-admin-border">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Groupe</th>
                                <th className="px-4 py-3 font-semibold text-center">Stagiaires</th>
                                <th className="px-4 py-3 font-semibold text-center">Absences</th>
                                <th className="px-4 py-3 font-semibold text-center">Retards</th>
                                <th className="px-4 py-3 font-semibold text-center">Sans billet</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E5E5]">
                            {groupStats.map(group => (
                                <tr key={group.id} className="hover:bg-admin-sidebar">
                                    <td className="px-4 py-3 font-medium text-admin-text-primary">{group.name}</td>
                                    <td className="px-4 py-3 text-center">{group.students_count}</td>
                                    <td className="px-4 py-3 text-center font-bold">{group.absences_count}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-block bg-amber-50 text-admin-amber px-2 py-0.5 rounded-full text-xs font-bold">{group.retards_count}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {group.sans_billet_count > 0 ? (
                                            <span className="inline-block bg-red-50 text-admin-red px-2 py-0.5 rounded-full text-xs font-bold">{group.sans_billet_count}</span>
                                        ) : (
                                            <span className="text-gray-400">0</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {groupStats.length === 0 && (
                                <tr><td colSpan="5" className="px-4 py-6 text-center text-gray-500">Aucun groupe trouvé.</td></tr>
                            )}
                        </tbody>
                        {groupStats.length > 1 && (
                            <tfoot className="bg-[#f0f4f8] font-semibold border-t-2 border-admin-border">
                                <tr>
                                    <td className="px-4 py-3 text-admin-text-primary">Total</td>
                                    <td className="px-4 py-3 text-center">{totals.students_count}</td>
                                    <td className="px-4 py-3 text-center">{totals.absences_count}</td>
                                    <td className="px-4 py-3 text-center">{totals.retards_count}</td>
                                    <td className="px-4 py-3 text-center">{totals.sans_billet_count}</td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </section>

            {/* Individual Student Stats */}
            <section className="bg-white border border-admin-border rounded overflow-hidden">
                <div className="p-4 border-b border-admin-border bg-[#fbfcfe]">
                    <h3 className="text-base font-semibold text-admin-text-primary">Détails par stagiaire</h3>
                    <p className="text-sm text-admin-text-secondary mt-1">Répartition individuelle des absences et retards.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-[#edf4fb] text-[#173b59] border-b border-admin-border">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Code</th>
                                <th className="px-4 py-3 font-semibold">Nom complet</th>
                                <th className="px-4 py-3 font-semibold">Groupe</th>
                                <th className="px-4 py-3 font-semibold text-center">Total</th>
                                <th className="px-4 py-3 font-semibold text-center">Absences</th>
                                <th className="px-4 py-3 font-semibold text-center">Retards</th>
                                <th className="px-4 py-3 font-semibold text-center">Sans billet</th>
                                <th className="px-4 py-3 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E5E5]">
                            {students.data.map(student => (
                                <tr key={student.id} className={`hover:bg-admin-sidebar ${student.sans_billet_count > 0 ? 'bg-red-50 border-l-4 border-l-admin-red' : 'border-l-4 border-l-transparent'}`}>
                                    <td className="px-4 py-3 text-admin-text-secondary">{student.student_number || '—'}</td>
                                    <td className="px-4 py-3 font-bold text-admin-text-primary">{student.full_name}</td>
                                    <td className="px-4 py-3 text-admin-text-secondary">{student.enrollments?.[0]?.group?.name || '—'}</td>
                                    <td className="px-4 py-3 text-center font-bold">{student.total_absences_count}</td>
                                    <td className="px-4 py-3 text-center">{student.absences_count}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-block bg-amber-50 text-admin-amber px-2 py-0.5 rounded-full text-xs font-bold">{student.retards_count}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {student.sans_billet_count > 0 ? (
                                            <span className="inline-block bg-red-50 text-admin-red px-2 py-0.5 rounded-full text-xs font-bold">{student.sans_billet_count}</span>
                                        ) : (
                                            <span className="text-gray-400">0</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link href={route('students.show', student.id)} className="text-admin-accent hover:underline text-sm font-medium">Détails</Link>
                                    </td>
                                </tr>
                            ))}
                            {students.data.length === 0 && (
                                <tr><td colSpan="9" className="px-4 py-8 text-center text-gray-500">Aucun stagiaire trouvé.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {students.links && students.data.length > 0 && (
                    <div className="p-4 border-t border-admin-border flex justify-center">
                        <div className="flex gap-1">
                            {students.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={`px-3 py-1 border rounded text-sm ${
                                        link.active
                                            ? 'bg-admin-accent text-white border-admin-accent'
                                            : 'bg-white text-admin-text-secondary hover:bg-gray-50 border-admin-border'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </AuthenticatedLayout>
    );
}
