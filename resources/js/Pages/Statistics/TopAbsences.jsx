import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';

export default function TopAbsences({ topStudents, groups, filters, currentYear }) {
    const { flash } = usePage().props;
    const [groupId, setGroupId] = useState(filters?.group_id || '');

    const handleGroupChange = (value) => {
        setGroupId(value);
        router.get(route('statistics.topAbsences'), { group_id: value }, { preserveState: true, replace: true });
    };

    // Group students by their group name for sectioned display
    const grouped = {};
    topStudents.forEach(student => {
        const groupName = student.enrollments?.[0]?.group?.name || 'Sans groupe';
        if (!grouped[groupName]) grouped[groupName] = [];
        grouped[groupName].push(student);
    });

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-xl font-medium text-admin-text-primary">Classement des absences</h2>
                    {currentYear && <p className="text-sm text-admin-text-secondary mt-1">Année : {currentYear.name}</p>}
                </div>
            }
        >
            <Head title="Classement des absences" />

            {flash?.success && (
                <div className="mb-4 border border-admin-green text-admin-green bg-white p-3 text-sm">{flash.success}</div>
            )}

            {/* Filter */}
            <div className="flex items-center gap-4 mb-6">
                <select
                    value={groupId}
                    onChange={e => handleGroupChange(e.target.value)}
                    className="block rounded-md py-1.5 px-3 border-0 ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-admin-accent focus:text-gray-800 text-sm"
                >
                    <option value="">Tous les groupes</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
            </div>

            {/* Ranked List */}
            {Object.entries(grouped).length > 0 ? (
                Object.entries(grouped).map(([groupName, students]) => (
                    <section key={groupName} className="bg-white border border-admin-border rounded overflow-hidden mb-6">
                        <div className="p-4 border-b border-admin-border bg-[#fbfcfe]">
                            <h3 className="text-base font-semibold text-admin-text-primary">{groupName}</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="bg-[#edf4fb] text-[#173b59] border-b border-admin-border">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold w-16 text-center">Rang</th>
                                        <th className="px-4 py-3 font-semibold">Code</th>
                                        <th className="px-4 py-3 font-semibold">Nom & Prénom</th>
                                        <th className="px-4 py-3 font-semibold text-center">Total des absences</th>
                                        <th className="px-4 py-3 font-semibold text-center">Sans billet</th>
                                        <th className="px-4 py-3 font-semibold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E5E5]">
                                    {students.map((student, index) => {
                                        const hasUnresolved = student.sans_billet_count > 0;
                                        return (
                                            <tr
                                                key={student.id}
                                                className={`hover:bg-admin-sidebar ${hasUnresolved ? 'bg-red-50 border-l-4 border-l-admin-red' : 'border-l-4 border-l-transparent'}`}
                                            >
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                                                        index === 0 ? 'bg-[#ffecb3] text-[#e65100]' :
                                                        index === 1 ? 'bg-[#e0e0e0] text-[#424242]' :
                                                        index === 2 ? 'bg-[#ffe0b2] text-[#bf360c]' :
                                                        'bg-gray-100 text-gray-500'
                                                    }`}>
                                                        {index + 1}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-admin-text-secondary">{student.student_number || '—'}</td>
                                                <td className="px-4 py-3 font-bold text-admin-text-primary">{student.full_name}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="text-lg font-bold text-admin-text-primary">{student.total_absences_count}</span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {hasUnresolved ? (
                                                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-bold bg-red-50 text-admin-red min-w-[32px]">{student.sans_billet_count}</span>
                                                    ) : (
                                                        <span className="text-gray-400">0</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Link href={route('students.show', student.id)} className="text-admin-accent hover:underline text-sm font-medium">Détails</Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>
                ))
            ) : (
                <div className="bg-white border border-admin-border rounded p-12 text-center">
                    <p className="text-admin-text-secondary">Aucune donnée d'absence disponible.</p>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
