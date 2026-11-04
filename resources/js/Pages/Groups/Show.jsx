import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

function AddStudentModal({ show, onClose, groupId }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        full_name: '',
        full_name_ar: '',
        student_number: '',
        birth_date: '',
        birth_place: '',
        cin: '',
        phone: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('groups.addStudent', groupId), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
            <div className="w-full max-w-md border border-admin-border bg-admin-bg p-6" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-medium text-admin-text-primary mb-4">Ajouter un stagiaire</h3>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-admin-text-primary mb-1">Nom complet *</label>
                        <input
                            type="text"
                            value={data.full_name}
                            onChange={e => setData('full_name', e.target.value)}
                            className="w-full rounded border-admin-border text-sm focus:border-admin-accent focus:ring-admin-accent"
                            required
                        />
                        {errors.full_name && <p className="text-admin-red text-xs mt-1">{errors.full_name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-admin-text-primary mb-1">Nom Complet (Arabe)</label>
                        <input
                            type="text"
                            dir="rtl"
                            value={data.full_name_ar}
                            onChange={e => setData('full_name_ar', e.target.value)}
                            className="w-full rounded border-admin-border text-sm focus:border-admin-accent focus:ring-admin-accent"
                        />
                        {errors.full_name_ar && <p className="text-admin-red text-xs mt-1">{errors.full_name_ar}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-admin-text-primary mb-1">Matricule</label>
                        <input
                            type="text"
                            value={data.student_number}
                            onChange={e => setData('student_number', e.target.value)}
                            className="w-full rounded border-admin-border text-sm focus:border-admin-accent focus:ring-admin-accent"
                        />
                        {errors.student_number && <p className="text-admin-red text-xs mt-1">{errors.student_number}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-admin-text-primary mb-1">CIN</label>
                        <input
                            type="text"
                            value={data.cin}
                            onChange={e => setData('cin', e.target.value)}
                            className="w-full rounded border-admin-border text-sm focus:border-admin-accent focus:ring-admin-accent"
                        />
                        {errors.cin && <p className="text-admin-red text-xs mt-1">{errors.cin}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-admin-text-primary mb-1">Téléphone</label>
                        <input
                            type="tel"
                            value={data.phone}
                            onChange={e => setData('phone', e.target.value)}
                            placeholder="06XXXXXXXX"
                            className="w-full rounded border-admin-border text-sm focus:border-admin-accent focus:ring-admin-accent"
                        />
                        {errors.phone && <p className="text-admin-red text-xs mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-admin-text-primary mb-1">Date de naissance</label>
                        <input
                            type="date"
                            value={data.birth_date}
                            onChange={e => setData('birth_date', e.target.value)}
                            className="w-full rounded border-admin-border text-sm focus:border-admin-accent focus:ring-admin-accent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-admin-text-primary mb-1">Lieu de naissance</label>
                        <input
                            type="text"
                            value={data.birth_place}
                            onChange={e => setData('birth_place', e.target.value)}
                            className="w-full rounded border-admin-border text-sm focus:border-admin-accent focus:ring-admin-accent"
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-admin-text-secondary hover:text-admin-text-primary">
                            Annuler
                        </button>
                        <button type="submit" disabled={processing} className="px-4 py-2 text-sm font-medium text-white bg-admin-accent rounded hover:bg-blue-700 disabled:opacity-50">
                            {processing ? 'Ajout...' : 'Ajouter un stagiaire'}
                        </button>
                    </div>
                </form>
                {errors.error && (
                    <div className="mt-4 p-3 border border-admin-red bg-white text-admin-red text-sm">
                        {errors.error}
                    </div>
                )}
            </div>
        </div>
    );
}

function ImportModal({ show, onClose, groupId }) {
    const { data, setData, post, processing, errors } = useForm({ file: null });

    const submit = (e) => {
        e.preventDefault();
        post(route('groups.import', groupId), {
            forceFormData: true,
            onSuccess: () => onClose(),
        });
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
            <div className="w-full max-w-md border border-admin-border bg-admin-bg p-6 rounded" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-medium text-admin-text-primary mb-4">Importer les stagiaires</h3>
                <p className="text-sm text-admin-text-secondary mb-2">
                    Téléversez un fichier OFPPT (.xlsx, .xls, .csv, .xml) avec les colonnes :
                </p>
                <div className="bg-gray-50 border border-admin-border rounded p-3 mb-4 text-xs font-mono space-y-1">
                    <div><code className="bg-gray-200 px-1 rounded">MatriculeEtudiant</code> → Code stagiaire</div>
                    <div><code className="bg-gray-200 px-1 rounded">Nom</code> + <code className="bg-gray-200 px-1 rounded">Prenom</code> → Nom complet</div>
                    <div><code className="bg-gray-200 px-1 rounded">NTelelephone</code> → Téléphone (optionnel)</div>
                    <div className="text-gray-400"><code className="bg-gray-200 px-1 rounded">LibelleLong</code>, <code className="bg-gray-200 px-1 rounded">anneeEtude</code> → ignorés</div>
                </div>
                <form onSubmit={submit}>
                    <input
                        type="file"
                        accept=".xlsx,.xls,.csv,.xml"
                        className="block w-full text-sm text-admin-text-primary border border-admin-border p-2 rounded focus:outline-none focus:border-admin-accent focus:ring-admin-accent"
                        onChange={e => setData('file', e.target.files[0])}
                    />
                    {errors.file && <p className="text-admin-red text-xs mt-2">{errors.file}</p>}
                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-admin-text-secondary hover:text-admin-text-primary">
                            Annuler
                        </button>
                        <button type="submit" disabled={processing || !data.file} className="px-4 py-2 text-sm font-medium text-white bg-admin-accent rounded hover:bg-blue-700 disabled:opacity-50">
                            {processing ? 'Import en cours...' : 'Importer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ImportSummary({ summary }) {
    if (!summary) return null;

    return (
        <div className="mb-4 border border-admin-border bg-admin-bg p-4">
            <h4 className="text-sm font-medium text-admin-text-primary mb-2">Résultats de l'importation</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                    <span className="font-semibold text-admin-text-primary">{summary.created}</span> <span className="text-admin-text-secondary">Créés</span>
                </div>
                <div>
                    <span className="font-semibold text-admin-text-primary">{summary.matched}</span> <span className="text-admin-text-secondary">Mis à jour</span>
                </div>
                <div>
                    <span className="font-semibold text-admin-text-primary">{summary.skipped?.length || 0}</span> <span className="text-admin-text-secondary">Ignorés</span>
                </div>
            </div>
            {summary.skipped?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-admin-border space-y-1">
                    {summary.skipped.map((s, i) => (
                        <p key={i} className="text-xs text-admin-text-secondary">
                            Ligne {s.row}: {s.reason}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function GroupShow({ group, students, sessions }) {
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [studentSearch, setStudentSearch] = useState('');
    const { flash } = usePage().props;

    const filteredStudents = students.filter(s =>
        s.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        (s.student_number && s.student_number.toLowerCase().includes(studentSearch.toLowerCase()))
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href={route('groups.index')} className="text-admin-text-secondary hover:text-admin-text-primary text-sm font-medium mr-2">
                            ← Retour
                        </Link>
                        <div>
                            <h2 className="text-xl font-medium text-admin-text-primary">{group.name}</h2>
                            <p className="text-sm text-admin-text-secondary">{group.academic_year?.name}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={route('sessions.create', group.id)}
                            className="px-4 py-2 text-sm font-medium text-white bg-admin-accent rounded hover:bg-blue-700 transition-colors"
                        >
                            Créer séance
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={group.name} />

            {flash?.importSummary && <ImportSummary summary={flash.importSummary} />}
            {flash?.success && (
                <div className="mb-4 border border-admin-green text-admin-green bg-white p-3 text-sm">
                    {flash.success}
                </div>
            )}

            {/* Sessions Table */}
            {sessions && sessions.length > 0 && (
                <div className="mb-8 border border-admin-border bg-admin-bg">
                    <div className="px-4 py-3 border-b border-admin-border">
                        <h3 className="text-base font-medium text-admin-text-primary">Séances</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-admin-sidebar border-b border-admin-border">
                                <tr>
                                    <th className="px-4 py-2 font-medium text-admin-text-primary">Module</th>
                                    <th className="px-4 py-2 font-medium text-admin-text-primary">Formateur</th>
                                    <th className="px-4 py-2 font-medium text-admin-text-primary text-right">Date et Heure</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E5E5]">
                                {sessions.map((session) => (
                                    <tr key={session.id} className="hover:bg-admin-sidebar">
                                        <td className="px-4 py-2">
                                            <Link href={route('sessions.show', session.id)} className="text-admin-accent hover:underline font-medium">
                                                {session.subject}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-2 text-admin-text-secondary">{session.professor?.name}</td>
                                        <td className="px-4 py-2 text-admin-text-secondary text-right">
                                            {String(session.date).split('T')[0]} ({String(session.start_time).slice(0,5)} - {String(session.end_time).slice(0,5)})
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Student Roster Table */}
            <div className="border border-admin-border bg-admin-bg">
                <div className="px-4 py-3 border-b border-admin-border flex items-center justify-between">
                    <h3 className="text-base font-medium text-admin-text-primary">
                        Stagiaires ({students.length})
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowImport(true)}
                            className="px-3 py-1.5 text-xs font-medium text-admin-text-primary bg-white border border-admin-border rounded hover:bg-gray-50 transition-colors"
                        >
                            Importer
                        </button>
                        <button
                            onClick={() => setShowAddStudent(true)}
                            className="px-3 py-1.5 text-xs font-medium text-admin-accent bg-white border border-admin-border rounded hover:bg-gray-50 transition-colors"
                        >
                            Ajouter un stagiaire
                        </button>
                    </div>
                </div>

                <div className="px-4 py-3 border-b border-admin-border">
                    <input
                        type="text"
                        placeholder="Rechercher des stagiaires..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="block w-full sm:w-80 rounded-md py-1.5 px-3 border-0 ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-admin-accent focus:text-gray-800 text-sm placeholder-gray-500"
                    />
                </div>

                {filteredStudents.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-admin-sidebar border-b border-admin-border">
                                <tr>
                                    <th className="px-4 py-2 font-medium text-admin-text-primary">Nom</th>
                                    <th className="px-4 py-2 font-medium text-admin-text-primary">Matricule</th>
                                    <th className="px-4 py-2 font-medium text-admin-text-primary">Absences</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E5E5]">
                                {filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-admin-sidebar">
                                        <td className="px-4 py-2">
                                            <Link href={route('students.show', student.id)} className="text-admin-accent hover:underline font-medium">
                                                {student.full_name}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-2 text-admin-text-secondary">
                                            {student.student_number || '-'}
                                        </td>
                                        <td className="px-4 py-2 text-admin-text-secondary">
                                            {student.absences_count > 0 ? (
                                                <span className="text-admin-red">
                                                    {student.absences_count}
                                                </span>
                                            ) : (
                                                <span>0</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="px-4 py-8 text-center border-t border-admin-border">
                        <p className="text-sm text-admin-text-secondary">Aucun stagiaire inscrit pour le moment.</p>
                    </div>
                )}
            </div>

            <AddStudentModal show={showAddStudent} onClose={() => setShowAddStudent(false)} groupId={group.id} />
            <ImportModal show={showImport} onClose={() => setShowImport(false)} groupId={group.id} />
        </AuthenticatedLayout>
    );
}
