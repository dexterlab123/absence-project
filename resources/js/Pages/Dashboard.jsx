import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

function StatCard({ title, value }) {
    return (
        <div className="border border-admin-border bg-admin-bg p-4">
            <p className="text-sm font-medium text-admin-text-secondary">{title}</p>
            <p className="mt-2 text-2xl font-semibold text-admin-text-primary">{value}</p>
        </div>
    );
}

export default function Dashboard({ stats, students, groups, filters, currentYear }) {
    const { flash, auth } = usePage().props;
    
    // Search & Filter state
    const [search, setSearch] = useState(filters?.search || '');
    const [groupId, setGroupId] = useState(filters?.group_id || '');

    // Multi-select state
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);

    // Update URL on search/filter
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            router.get(
                route('dashboard'),
                { search, group_id: groupId },
                { preserveState: true, replace: true }
            );
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search, groupId]);

    const toggleStudent = (id) => {
        if (selectedStudentIds.includes(id)) {
            setSelectedStudentIds(selectedStudentIds.filter(sid => sid !== id));
        } else {
            setSelectedStudentIds([...selectedStudentIds, id]);
        }
    };

    const selectAll = () => {
        const allIds = students.data.map(s => s.id);
        const unique = [...new Set([...selectedStudentIds, ...allIds])];
        setSelectedStudentIds(unique);
    };

    const deselectAll = () => {
        const idsToRemove = students.data.map(s => s.id);
        const remaining = selectedStudentIds.filter(id => !idsToRemove.includes(id));
        setSelectedStudentIds(remaining);
    };

    // Billet logic shifted to modal and raw form submit for PDF


    const exportStudentDetails = () => {
        if (selectedStudentIds.length === 0) {
            alert('Sélectionnez au moins un stagiaire pour imprimer les détails.');
            return;
        }
        
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = route('export.studentDetails');
        
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value = document.querySelector('meta[name="csrf-token"]').content;
        form.appendChild(csrfInput);

        selectedStudentIds.forEach(id => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'student_ids[]';
            input.value = id;
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    };

    const exportAbsenceList = () => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = route('export.absenceList');
        
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value = document.querySelector('meta[name="csrf-token"]').content;
        form.appendChild(csrfInput);

        if (selectedStudentIds.length > 0) {
            selectedStudentIds.forEach(id => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'student_ids[]';
                input.value = id;
                form.appendChild(input);
            });
        } else {
            if (search) {
                const searchInput = document.createElement('input');
                searchInput.type = 'hidden';
                searchInput.name = 'search';
                searchInput.value = search;
                form.appendChild(searchInput);
            }
            if (groupId) {
                const groupIdInput = document.createElement('input');
                groupIdInput.type = 'hidden';
                groupIdInput.name = 'group_id';
                groupIdInput.value = groupId;
                form.appendChild(groupIdInput);
            }
        }

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    };

    // Helper to format date
    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('fr-FR');
    };

    // Find the latest absence date for a student
    const getLastAbsenceDate = (student) => {
        if (!student.absences || student.absences.length === 0) return '—';
        const dates = student.absences
            .map(a => a.session?.date)
            .filter(d => d)
            .sort((a, b) => new Date(b) - new Date(a));
        
        return dates.length > 0 ? formatDate(dates[0]) : '—';
    };

    const [showBilletModal, setShowBilletModal] = useState(false);
    const [billetCategory, setBilletCategory] = useState('');
    const [billetDate, setBilletDate] = useState(new Date().toISOString().split('T')[0]);
    const [billetMotif, setBilletMotif] = useState('');

    const openBilletModal = (category) => {
        if (selectedStudentIds.length === 0) return;
        setBilletCategory(category);
        setBilletDate(new Date().toISOString().split('T')[0]);
        setBilletMotif('');
        setShowBilletModal(true);
    };

    const submitBillet = async (e) => {
        e.preventDefault();

        const payload = new FormData();
        payload.append('category', billetCategory);
        payload.append('date', billetDate);
        payload.append('motif', billetMotif);
        selectedStudentIds.forEach(id => payload.append('student_ids[]', id));

        try {
            const response = await window.axios.post(route('absences.issueBilletBulk'), payload, {
                responseType: 'blob',
                headers: {
                    'Accept': 'application/pdf',
                },
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');

            setShowBilletModal(false);
            setSelectedStudentIds([]);
            router.reload({ only: ['students', 'stats'] });
        } catch (err) {
            const status = err.response?.status;
            if (status === 403) {
                alert('Vous n\'avez pas la permission d\'émettre des billets.');
            } else {
                alert('Erreur lors de la génération du billet: ' + (err.message || 'Erreur inconnue'));
            }
        }
    };

    const selectedStudentsInfo = students?.data?.filter(s => selectedStudentIds.includes(s.id)) || [];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-medium text-admin-text-primary">
                            Tableau de bord
                        </h2>
                        {currentYear && (
                            <p className="text-sm text-admin-text-secondary mt-1">
                                Année scolaire : {currentYear.name}
                            </p>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Tableau de bord" />

            {flash?.success && (
                <div className="mb-4 border border-admin-green text-admin-green bg-white p-3 text-sm">
                    {flash.success}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <StatCard title="Total stagiaires" value={stats.totalStudents} />
                <StatCard title="Groupes" value={stats.totalGroups} />
                <StatCard title="Séances d'aujourd'hui" value={stats.todaySessions} />
                <StatCard title="Total des absences" value={stats.totalAbsences} />
            </div>

            {/* Main Student List */}
            <div className="bg-white border border-admin-border rounded overflow-hidden mb-8">
                <div className="p-4 border-b border-admin-border bg-[#fbfcfe] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-base font-semibold text-admin-text-primary m-0">Liste principale</h2>
                        <p className="text-sm text-admin-text-secondary mt-1">Vue d'ensemble des stagiaires et régularisation des absences.</p>
                    </div>
                    
                    <div className="flex gap-2">
                        <select 
                            value={groupId} 
                            onChange={e => setGroupId(e.target.value)}
                            className="block rounded-md py-1.5 px-3 border-0 ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-admin-accent focus:text-gray-800 text-sm"
                        >
                            <option value="">Tous les groupes</option>
                            {groups && groups.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                        <input 
                            type="text" 
                            placeholder="Recherche..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="block w-48 rounded-md py-1.5 px-3 border-0 ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-admin-accent focus:text-gray-800 text-sm placeholder-gray-500"
                        />
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-b border-admin-border flex flex-wrap items-center gap-4">
                    <button 
                        onClick={selectAll} 
                        className="px-3 py-1.5 bg-white text-admin-text-primary border border-admin-border rounded hover:bg-gray-50 text-sm font-medium"
                    >
                        Tout cocher
                    </button>
                    <button 
                        onClick={deselectAll} 
                        className="px-3 py-1.5 bg-white text-admin-text-primary border border-admin-border rounded hover:bg-gray-50 text-sm font-medium"
                    >
                        Tout décocher
                    </button>
                    
                    <span className="px-3 py-1 bg-amber-50 text-admin-amber rounded-full text-xs font-bold border border-amber-200">
                        {selectedStudentIds.length} choisi(s)
                    </span>

                    <div className="flex-1"></div>

                    <button 
                        onClick={exportAbsenceList}
                        className="px-3 py-1.5 bg-white text-[#173b59] border border-admin-border rounded hover:bg-gray-50 text-sm font-medium flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        Exporter PDF
                    </button>

                    <button 
                        onClick={exportStudentDetails}
                        disabled={selectedStudentIds.length === 0}
                        className="px-3 py-1.5 bg-white text-[#173b59] border border-admin-border rounded hover:bg-gray-50 text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                        Imprimer détails
                    </button>

                    <div className="w-px h-6 bg-admin-border mx-2"></div>

                    <button 
                        onClick={() => openBilletModal('Absence')}
                        disabled={selectedStudentIds.length === 0}
                        className="px-3 py-1.5 bg-admin-accent text-white rounded text-sm font-medium hover:opacity-90 disabled:opacity-50"
                    >
                        Billet absence
                    </button>
                    <button 
                        onClick={() => openBilletModal('Retard')}
                        disabled={selectedStudentIds.length === 0}
                        className="px-3 py-1.5 bg-admin-amber text-white rounded text-sm font-medium hover:opacity-90 disabled:opacity-50"
                    >
                        Billet retard
                    </button>
                </div>

                <div className="overflow-x-auto">
                    {students && students.data && students.data.length > 0 ? (
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-[#edf4fb] text-[#173b59] border-b border-admin-border">
                                <tr>
                                    <th className="px-4 py-3 font-semibold w-12 text-center">✓</th>
                                    <th className="px-4 py-3 font-semibold">Code</th>
                                    <th className="px-4 py-3 font-semibold">Nom complet</th>
                                    <th className="px-4 py-3 font-semibold">Groupe</th>
                                    <th className="px-4 py-3 font-semibold text-center">Absences</th>
                                    <th className="px-4 py-3 font-semibold text-center">Sans billet</th>
                                    <th className="px-4 py-3 font-semibold">Dernière abs.</th>
                                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E5E5]">
                                {students.data.map((student) => {
                                    const hasUnresolved = student.unresolved_absences_count > 0;
                                    const isSelected = selectedStudentIds.includes(student.id);
                                    
                                    return (
                                        <tr 
                                            key={student.id} 
                                            className={`
                                                cursor-pointer hover:bg-admin-sidebar transition-colors
                                                ${hasUnresolved ? 'bg-red-50 border-l-4 border-l-admin-red' : 'border-l-4 border-l-transparent'}
                                                ${isSelected ? '!bg-[#f0fbf5]' : ''}
                                            `}
                                            onClick={(e) => {
                                                if (e.target.tagName !== 'A' && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
                                                    toggleStudent(student.id);
                                                }
                                            }}
                                        >
                                            <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={isSelected}
                                                    onChange={() => toggleStudent(student.id)} 
                                                    className="w-[18px] h-[18px] rounded border-admin-border text-admin-accent focus:ring-admin-accent"
                                                />
                                            </td>
                                            <td className="px-4 py-3 font-medium text-admin-text-secondary">{student.student_number || '—'}</td>
                                            <td className="px-4 py-3 font-bold text-admin-text-primary">{student.full_name}</td>
                                            <td className="px-4 py-3 text-admin-text-secondary">
                                                {student.enrollments?.map(e => e.group?.name).filter(Boolean).join(', ') || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-center font-bold">
                                                {student.total_absences_count}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {hasUnresolved ? (
                                                    <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-bold bg-red-50 text-admin-red min-w-[32px]">
                                                        {student.unresolved_absences_count}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">0</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-admin-text-secondary">
                                                {getLastAbsenceDate(student)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Link 
                                                    href={route('students.show', student.id)} 
                                                    className="text-admin-accent hover:underline text-sm font-medium"
                                                >
                                                    Détails
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="px-4 py-12 text-center">
                            <p className="text-admin-text-secondary">Aucun stagiaire trouvé.</p>
                        </div>
                    )}
                </div>
                
                {/* Pagination */}
                {students && students.links && students.data.length > 0 && (
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
            </div>

            {/* Billet Modal */}
            {showBilletModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowBilletModal(false)}>
                    <div className="w-full max-w-md border border-admin-border bg-admin-bg p-6 rounded shadow-xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-medium text-admin-text-primary mb-4">
                            Émission de Billet {billetCategory === 'Retard' ? 'de Retard' : "d'Absence"}
                        </h3>
                        
                        <div className="mb-4">
                            <h4 className="text-sm font-medium text-admin-text-secondary mb-2">Stagiaires sélectionnés ({selectedStudentsInfo.length})</h4>
                            <div className="max-h-32 overflow-y-auto bg-gray-50 border border-admin-border rounded p-2 text-sm">
                                <ul className="space-y-1">
                                    {selectedStudentsInfo.map(s => (
                                        <li key={s.id} className="text-admin-text-primary">
                                            <span className="font-medium">{s.full_name}</span>
                                            <span className="text-admin-text-secondary ml-2 text-xs">
                                                {s.enrollments?.map(e => e.group?.name).filter(Boolean).join(', ')}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <form onSubmit={submitBillet}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-admin-text-primary mb-1">Date du billet</label>
                                    <input 
                                        type="date" 
                                        value={billetDate}
                                        onChange={e => setBilletDate(e.target.value)}
                                        required
                                        className="w-full rounded border-admin-border text-sm focus:border-admin-accent focus:ring-admin-accent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-admin-text-primary mb-1">Motif</label>
                                    <textarea 
                                        value={billetMotif}
                                        onChange={e => setBilletMotif(e.target.value)}
                                        required
                                        rows="2"
                                        className="w-full rounded border-admin-border text-sm focus:border-admin-accent focus:ring-admin-accent"
                                        placeholder="Ex: Certificat médical fourni..."
                                    ></textarea>
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-2 mt-6">
                                <button 
                                    type="button" 
                                    onClick={() => setShowBilletModal(false)} 
                                    className="px-4 py-2 text-sm text-admin-text-secondary hover:text-admin-text-primary"
                                >
                                    Annuler
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-4 py-2 text-sm font-medium text-white bg-admin-accent rounded hover:bg-blue-700 transition-colors"
                                >
                                    Générer le(s) billet(s)
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
