import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

function AddStudentModal({ show, onClose, groupId }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        full_name: '',
        student_number: '',
        birth_date: '',
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
                <h3 className="text-lg font-medium text-admin-text-primary mb-4">Add Student</h3>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-admin-text-primary mb-1">Full Name *</label>
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
                        <label className="block text-sm font-medium text-admin-text-primary mb-1">Student Number</label>
                        <input
                            type="text"
                            value={data.student_number}
                            onChange={e => setData('student_number', e.target.value)}
                            className="w-full rounded border-admin-border text-sm focus:border-admin-accent focus:ring-admin-accent"
                        />
                        {errors.student_number && <p className="text-admin-red text-xs mt-1">{errors.student_number}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-admin-text-primary mb-1">Birth Date</label>
                        <input
                            type="date"
                            value={data.birth_date}
                            onChange={e => setData('birth_date', e.target.value)}
                            className="w-full rounded border-admin-border text-sm focus:border-admin-accent focus:ring-admin-accent"
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-admin-text-secondary hover:text-admin-text-primary">
                            Cancel
                        </button>
                        <button type="submit" disabled={processing} className="px-4 py-2 text-sm font-medium text-white bg-admin-accent rounded hover:bg-blue-700 disabled:opacity-50">
                            {processing ? 'Adding...' : 'Add Student'}
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
            <div className="w-full max-w-md border border-admin-border bg-admin-bg p-6" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-medium text-admin-text-primary mb-4">Import Students</h3>
                <p className="text-sm text-admin-text-secondary mb-4">
                    Upload an Excel/CSV file with columns: <code className="bg-gray-100 px-1">full_name</code>, <code className="bg-gray-100 px-1">student_number</code>
                </p>
                <form onSubmit={submit}>
                    <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="block w-full text-sm text-admin-text-primary border border-admin-border p-2 rounded focus:outline-none focus:border-admin-accent focus:ring-admin-accent"
                        onChange={e => setData('file', e.target.files[0])}
                    />
                    {errors.file && <p className="text-admin-red text-xs mt-2">{errors.file}</p>}
                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-admin-text-secondary hover:text-admin-text-primary">
                            Cancel
                        </button>
                        <button type="submit" disabled={processing || !data.file} className="px-4 py-2 text-sm font-medium text-white bg-admin-accent rounded hover:bg-blue-700 disabled:opacity-50">
                            {processing ? 'Importing...' : 'Import'}
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
            <h4 className="text-sm font-medium text-admin-text-primary mb-2">Import Results</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                    <span className="font-semibold text-admin-text-primary">{summary.created}</span> <span className="text-admin-text-secondary">Created</span>
                </div>
                <div>
                    <span className="font-semibold text-admin-text-primary">{summary.matched}</span> <span className="text-admin-text-secondary">Matched</span>
                </div>
                <div>
                    <span className="font-semibold text-admin-text-primary">{summary.skipped?.length || 0}</span> <span className="text-admin-text-secondary">Skipped</span>
                </div>
            </div>
            {summary.skipped?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-admin-border space-y-1">
                    {summary.skipped.map((s, i) => (
                        <p key={i} className="text-xs text-admin-text-secondary">
                            Row {s.row}: {s.reason}
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
                            ← Back
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
                            Create Session
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
                        <h3 className="text-base font-medium text-admin-text-primary">Sessions</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-admin-sidebar border-b border-admin-border">
                                <tr>
                                    <th className="px-4 py-2 font-medium text-admin-text-primary">Subject</th>
                                    <th className="px-4 py-2 font-medium text-admin-text-primary">Professor</th>
                                    <th className="px-4 py-2 font-medium text-admin-text-primary text-right">Date & Time</th>
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
                                            {session.date} ({session.start_time} - {session.end_time})
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
                        Students ({students.length})
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowImport(true)}
                            className="px-3 py-1.5 text-xs font-medium text-admin-text-primary bg-white border border-admin-border rounded hover:bg-gray-50 transition-colors"
                        >
                            Import
                        </button>
                        <button
                            onClick={() => setShowAddStudent(true)}
                            className="px-3 py-1.5 text-xs font-medium text-admin-accent bg-white border border-admin-border rounded hover:bg-gray-50 transition-colors"
                        >
                            Add Student
                        </button>
                    </div>
                </div>

                <div className="px-4 py-3 border-b border-admin-border">
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="w-full sm:w-80 rounded border-admin-border text-sm focus:border-admin-accent focus:ring-admin-accent"
                    />
                </div>

                {filteredStudents.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-admin-sidebar border-b border-admin-border">
                                <tr>
                                    <th className="px-4 py-2 font-medium text-admin-text-primary">Name</th>
                                    <th className="px-4 py-2 font-medium text-admin-text-primary">Student ID</th>
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
                        <p className="text-sm text-admin-text-secondary">No students enrolled yet.</p>
                    </div>
                )}
            </div>

            <AddStudentModal show={showAddStudent} onClose={() => setShowAddStudent(false)} groupId={group.id} />
            <ImportModal show={showImport} onClose={() => setShowImport(false)} groupId={group.id} />
        </AuthenticatedLayout>
    );
}
