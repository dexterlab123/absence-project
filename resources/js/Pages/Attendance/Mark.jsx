import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';

export default function MarkAttendance({ groups }) {
    const { auth, flash } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        group_id: groups.length > 0 ? groups[0].id : '',
        subject: '',
        date: new Date().toISOString().split('T')[0],
        start_time: '08:30',
        end_time: '11:00',
        category: 'Absence',
        comment: '',
        student_ids: [],
    });

    const [search, setSearch] = useState('');

    const selectedGroup = useMemo(() => {
        return groups.find(g => g.id === parseInt(data.group_id)) || null;
    }, [groups, data.group_id]);

    const filteredStudents = useMemo(() => {
        if (!selectedGroup) return [];
        let students = selectedGroup.students || [];
        if (search.trim()) {
            const term = search.toLowerCase();
            students = students.filter(s => 
                s.full_name.toLowerCase().includes(term) || 
                (s.student_number && s.student_number.toLowerCase().includes(term))
            );
        }
        return students;
    }, [selectedGroup, search]);

    const toggleStudent = (id) => {
        if (data.student_ids.includes(id)) {
            setData('student_ids', data.student_ids.filter(sid => sid !== id));
        } else {
            setData('student_ids', [...data.student_ids, id]);
        }
    };

    const selectAll = () => {
        const ids = filteredStudents.map(s => s.id);
        const unique = [...new Set([...data.student_ids, ...ids])];
        setData('student_ids', unique);
    };

    const deselectAll = () => {
        const idsToRemove = filteredStudents.map(s => s.id);
        const remaining = data.student_ids.filter(id => !idsToRemove.includes(id));
        setData('student_ids', remaining);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('attendance.storeBulk'));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-medium text-admin-text-primary">Cocher les absences</h2>}
        >
            <Head title="Cocher les absences" />

            {flash?.success && (
                <div className="mb-4 border border-admin-green text-admin-green bg-white p-3 text-sm">
                    {flash.success}
                </div>
            )}

            <div className="bg-white border border-admin-border rounded overflow-hidden">
                <div className="p-4 border-b border-admin-border bg-[#fbfcfe] flex justify-between items-center">
                    <div>
                        <h2 className="text-base font-semibold text-admin-text-primary m-0">Cocher les absences</h2>
                        <p className="text-sm text-admin-text-secondary mt-1">Le formateur filtre le groupe, puis coche seulement les absents.</p>
                    </div>
                    <button 
                        onClick={handleSubmit} 
                        disabled={processing}
                        className="px-4 py-2 bg-admin-green text-white font-medium rounded hover:opacity-90 disabled:opacity-50"
                    >
                        {processing ? 'Enregistrement...' : 'Enregistrer les absences'}
                    </button>
                </div>

                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-bold text-[#344054] mb-1">Groupe</label>
                            <select 
                                value={data.group_id} 
                                onChange={e => {
                                    setData('group_id', e.target.value);
                                    // Clear selection when changing groups
                                    setData('student_ids', []);
                                }}
                                className="block w-full rounded-md py-1.5 px-3 border-0 ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-admin-accent text-sm"
                            >
                                {groups.map(g => (
                                    <option key={g.id} value={g.id}>{g.name} ({g.academic_year?.name})</option>
                                ))}
                            </select>
                            {errors.group_id && <p className="text-admin-red text-xs mt-1">{errors.group_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#344054] mb-1">Date</label>
                            <input 
                                type="date" 
                                value={data.date} 
                                onChange={e => setData('date', e.target.value)}
                                className="block w-full rounded-md py-1.5 px-3 border-0 ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-admin-accent text-sm"
                            />
                            {errors.date && <p className="text-admin-red text-xs mt-1">{errors.date}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#344054] mb-1">Heure de début</label>
                            <input 
                                type="time" 
                                value={data.start_time} 
                                onChange={e => setData('start_time', e.target.value)}
                                className="block w-full rounded-md py-1.5 px-3 border-0 ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-admin-accent text-sm"
                            />
                            {errors.start_time && <p className="text-admin-red text-xs mt-1">{errors.start_time}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#344054] mb-1">Heure de fin</label>
                            <input 
                                type="time" 
                                value={data.end_time} 
                                onChange={e => setData('end_time', e.target.value)}
                                className="block w-full rounded-md py-1.5 px-3 border-0 ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-admin-accent text-sm"
                            />
                            {errors.end_time && <p className="text-admin-red text-xs mt-1">{errors.end_time}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-[#344054] mb-1">Module</label>
                            <input 
                                type="text" 
                                placeholder="Module du cours" 
                                value={data.subject} 
                                onChange={e => setData('subject', e.target.value)}
                                className="block w-full rounded-md py-1.5 px-3 border-0 ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-admin-accent text-sm placeholder-gray-500"
                            />
                            {errors.subject && <p className="text-admin-red text-xs mt-1">{errors.subject}</p>}
                        </div>
                        
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-[#344054] mb-1">Catégorie</label>
                            <select 
                                value={data.category} 
                                onChange={e => setData('category', e.target.value)}
                                className="block w-full rounded-md py-1.5 px-3 border-0 ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-admin-accent text-sm"
                            >
                                <option value="Absence">Absence</option>
                                <option value="Retard">Retard</option>
                            </select>
                            {errors.category && <p className="text-admin-red text-xs mt-1">{errors.category}</p>}
                        </div>

                        <div className="md:col-span-4">
                            <label className="block text-sm font-bold text-[#344054] mb-1">Commentaire partagé</label>
                            <textarea 
                                placeholder="Exemple: absent au cours du matin" 
                                value={data.comment} 
                                onChange={e => setData('comment', e.target.value)}
                                className="block w-full rounded-md py-2 px-3 border-0 ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-admin-accent text-sm placeholder-gray-500"
                            />
                            {errors.comment && <p className="text-admin-red text-xs mt-1">{errors.comment}</p>}
                        </div>
                    </div>

                    <hr className="my-6 border-admin-border" />

                    <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={selectAll} 
                                type="button"
                                className="px-3 py-2 bg-white text-admin-text-primary border border-admin-border rounded hover:bg-gray-50 text-sm font-medium"
                            >
                                Tout cocher
                            </button>
                            <button 
                                onClick={deselectAll} 
                                type="button"
                                className="px-3 py-2 bg-white text-admin-text-primary border border-admin-border rounded hover:bg-gray-50 text-sm font-medium"
                            >
                                Tout décocher
                            </button>
                            <span className="px-3 py-1 bg-amber-50 text-admin-amber rounded-full text-xs font-bold border border-amber-200">
                                {data.student_ids.length} sélectionné(s)
                            </span>
                            {errors.student_ids && <span className="text-admin-red text-xs ml-2">{errors.student_ids}</span>}
                        </div>
                        
                        <div className="w-full md:w-1/3">
                            <input 
                                type="text" 
                                placeholder="Recherche nom ou code stagiaire" 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="block w-full rounded-md py-1.5 px-3 border-0 ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-admin-accent text-sm placeholder-gray-500"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto border border-admin-border rounded bg-white">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-[#edf4fb] text-[#173b59] border-b border-admin-border">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-center w-16">Absent</th>
                                    <th className="px-4 py-3 font-semibold">Code stagiaire</th>
                                    <th className="px-4 py-3 font-semibold">Nom & Prénom</th>
                                    <th className="px-4 py-3 font-semibold">Groupe</th>
                                    <th className="px-4 py-3 font-semibold">Sans billet</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E5E5]">
                                {filteredStudents.map(student => (
                                    <tr 
                                        key={student.id} 
                                        className={`hover:bg-admin-sidebar cursor-pointer ${data.student_ids.includes(student.id) ? 'bg-[#f0fbf5]' : ''}`}
                                        onClick={() => toggleStudent(student.id)}
                                    >
                                        <td className="px-4 py-3 text-center">
                                            <input 
                                                type="checkbox" 
                                                checked={data.student_ids.includes(student.id)}
                                                onChange={() => {}} 
                                                className="w-[18px] h-[18px] rounded border-admin-border text-admin-accent focus:ring-admin-accent"
                                            />
                                        </td>
                                        <td className="px-4 py-3">{student.student_number || '—'}</td>
                                        <td className="px-4 py-3 font-medium text-admin-text-primary">{student.full_name}</td>
                                        <td className="px-4 py-3 text-admin-text-secondary">{selectedGroup?.name}</td>
                                        <td className="px-4 py-3">
                                            {student.unresolved_absences_count > 0 ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold bg-red-50 text-admin-red">
                                                    {student.unresolved_absences_count} non régularisée(s)
                                                </span>
                                            ) : (
                                                <span className="text-admin-text-secondary text-xs">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-admin-text-secondary">
                                            {selectedGroup ? 'Aucun stagiaire trouvé.' : 'Sélectionnez un groupe pour voir les stagiaires.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
