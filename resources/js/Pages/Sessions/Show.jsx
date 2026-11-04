import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';

export default function SessionShow({ session, students }) {
    const { flash } = usePage().props;

    const [attendance, setAttendance] = useState(() => {
        const initial = {};
        students.forEach(s => {
            initial[s.id] = {
                absent: s.is_absent || false,
                category: s.absence?.category || 'Absence',
                justification_note: s.absence?.justification_note || '',
            };
        });
        return initial;
    });

    const [processing, setProcessing] = useState(false);
    const [savedSuccessfully, setSavedSuccessfully] = useState(false);

    const handleChange = (studentId, data) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], ...data },
        }));
    };

    const handleSave = () => {
        const payload = Object.entries(attendance).map(([studentId, data]) => ({
            student_id: parseInt(studentId),
            absent: data.absent,
            category: data.category,
            justification_note: data.justification_note,
        }));

        router.post(route('attendance.store', session.id), { attendance: payload }, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
            onSuccess: () => {
                setSavedSuccessfully(true);
                setTimeout(() => setSavedSuccessfully(false), 3000);
            }
        });
    };

    const handleBulkCheck = (isAbsent) => {
        setAttendance(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(id => {
                next[id] = { ...next[id], absent: isAbsent };
            });
            return next;
        });
    };

    const absentCount = Object.values(attendance).filter(a => a.absent).length;
    const presentCount = students.length - absentCount;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href={route('groups.show', session.group.id)} className="text-admin-text-secondary hover:text-admin-text-primary text-sm font-medium mr-2">
                            ← Retour
                        </Link>
                        <div>
                            <h2 className="text-xl font-medium text-admin-text-primary">{session.subject}</h2>
                            <p className="text-sm text-admin-text-secondary">
                                {session.group.name} • {session.professor?.name} • {String(session.date).split('T')[0]} ({String(session.start_time).slice(0,5)} - {String(session.end_time).slice(0,5)})
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`Présences - ${session.subject}`} />

            {flash?.success && (
                <div className="mb-4 border border-admin-green text-admin-green bg-white p-3 text-sm">
                    {flash.success}
                </div>
            )}

            {/* Summary Bar */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between border border-admin-border bg-admin-bg p-4">
                <div className="flex items-center gap-6 mb-4 sm:mb-0 text-sm">
                    <div>
                        <span className="font-medium text-admin-text-primary">Total :</span> <span className="text-admin-text-secondary">{students.length}</span>
                    </div>
                    <div>
                        <span className="font-medium text-admin-text-primary">Présent(s) :</span> <span className="text-admin-text-secondary">{presentCount}</span>
                    </div>
                    <div>
                        <span className="font-medium text-admin-text-primary">Absent(s) :</span> <span className="text-admin-text-secondary">{absentCount}</span>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-4">
                        <div className="flex gap-2 text-sm">
                            <button type="button" onClick={() => handleBulkCheck(true)} className="text-admin-text-secondary hover:text-admin-accent underline">Tout cocher</button>
                            <span className="text-gray-300">|</span>
                            <button type="button" onClick={() => handleBulkCheck(false)} className="text-admin-text-secondary hover:text-admin-accent underline">Tout décocher</button>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={processing}
                            className="px-4 py-2 text-sm font-medium text-white bg-admin-accent rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {processing ? 'Enregistrement...' : 'Enregistrer les présences'}
                        </button>
                    </div>
                    {savedSuccessfully && (
                        <span className="text-xs font-medium text-admin-green transition-opacity duration-300">
                            Sauvegardé avec succès
                        </span>
                    )}
                </div>
            </div>

            {/* Student Table */}
            <div className="border border-admin-border bg-admin-bg overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-admin-sidebar border-b border-admin-border">
                        <tr>
                            <th className="px-4 py-2 font-medium text-admin-text-primary">Stagiaire</th>
                            <th className="px-4 py-2 font-medium text-admin-text-primary w-24">Absent</th>
                            <th className="px-4 py-2 font-medium text-admin-text-primary w-40">Catégorie</th>
                            <th className="px-4 py-2 font-medium text-admin-text-primary w-64">Remarque</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5E5]">
                        {students.map((student) => {
                            const isAbsent = attendance[student.id]?.absent || false;
                            const category = attendance[student.id]?.category || 'Absence';
                            const note = attendance[student.id]?.justification_note || '';

                            return (
                                <tr key={student.id} className="hover:bg-admin-sidebar">
                                    <td className="px-4 py-2">
                                        <p className="font-medium text-admin-text-primary">{student.full_name}</p>
                                        <p className="text-xs text-admin-text-secondary">{student.student_number || 'Pas de matricule'}</p>
                                    </td>
                                    <td 
                                        className="px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => handleChange(student.id, { absent: !isAbsent })}
                                    >
                                        <div className="flex items-center h-full">
                                            <input
                                                type="checkbox"
                                                checked={isAbsent}
                                                onChange={(e) => handleChange(student.id, { absent: e.target.checked })}
                                                onClick={(e) => e.stopPropagation()}
                                                className="h-4 w-4 rounded border-gray-300 text-admin-accent focus:ring-admin-accent cursor-pointer"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className={`flex rounded-md shadow-sm ${!isAbsent ? 'opacity-50 pointer-events-none' : ''}`}>
                                            <button
                                                type="button"
                                                onClick={() => handleChange(student.id, { category: 'Absence' })}
                                                className={`flex-1 px-2 py-1 text-xs font-medium border border-gray-300 rounded-l-md focus:z-10 focus:ring-2 focus:ring-admin-accent ${
                                                    category === 'Absence'
                                                        ? 'bg-admin-accent text-white border-admin-accent z-10'
                                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                Absence
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleChange(student.id, { category: 'Retard' })}
                                                className={`flex-1 px-2 py-1 text-xs font-medium border border-l-0 border-gray-300 rounded-r-md focus:z-10 focus:ring-2 focus:ring-admin-accent ${
                                                    category === 'Retard'
                                                        ? 'bg-admin-accent text-white border-admin-accent z-10 border-l-admin-accent -ml-px'
                                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                Retard
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">
                                        <input
                                            type="text"
                                            value={note}
                                            disabled={!isAbsent}
                                            onChange={(e) => handleChange(student.id, { justification_note: e.target.value })}
                                            placeholder={isAbsent ? "Motif..." : ""}
                                            className="w-full rounded border-admin-border text-sm py-1 focus:border-admin-accent focus:ring-admin-accent disabled:bg-gray-100 disabled:opacity-50"
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                        {students.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-4 py-8 text-center text-admin-text-secondary">
                                    Aucun stagiaire inscrit dans ce groupe.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AuthenticatedLayout>
    );
}
