import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function SessionShow({ session, students }) {
    const { flash } = usePage().props;

    const [attendance, setAttendance] = useState(() => {
        const initial = {};
        students.forEach(s => {
            initial[s.id] = {
                absent: s.is_absent || false,
                justified: s.absence?.justified || false,
                justification_note: s.absence?.justification_note || '',
            };
        });
        return initial;
    });

    const { post, processing } = useForm({});

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
            justified: data.justified,
            justification_note: data.justification_note,
        }));

        post(route('attendance.store', session.id), {
            data: { attendance: payload },
            preserveScroll: true,
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
                            ← Back
                        </Link>
                        <div>
                            <h2 className="text-xl font-medium text-admin-text-primary">{session.subject}</h2>
                            <p className="text-sm text-admin-text-secondary">
                                {session.group.name} • {session.professor?.name} • {session.date} ({session.start_time} - {session.end_time})
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`Attendance - ${session.subject}`} />

            {flash?.success && (
                <div className="mb-4 border border-admin-green text-admin-green bg-white p-3 text-sm">
                    {flash.success}
                </div>
            )}

            {/* Summary Bar */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between border border-admin-border bg-admin-bg p-4">
                <div className="flex items-center gap-6 mb-4 sm:mb-0 text-sm">
                    <div>
                        <span className="font-medium text-admin-text-primary">Total:</span> <span className="text-admin-text-secondary">{students.length}</span>
                    </div>
                    <div>
                        <span className="font-medium text-admin-text-primary">Present:</span> <span className="text-admin-text-secondary">{presentCount}</span>
                    </div>
                    <div>
                        <span className="font-medium text-admin-text-primary">Absent:</span> <span className="text-admin-text-secondary">{absentCount}</span>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={processing}
                    className="px-4 py-2 text-sm font-medium text-white bg-admin-accent rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    {processing ? 'Saving...' : 'Save Attendance'}
                </button>
            </div>

            {/* Student Table */}
            <div className="border border-admin-border bg-admin-bg overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-admin-sidebar border-b border-admin-border">
                        <tr>
                            <th className="px-4 py-2 font-medium text-admin-text-primary">Student</th>
                            <th className="px-4 py-2 font-medium text-admin-text-primary w-24">Status</th>
                            <th className="px-4 py-2 font-medium text-admin-text-primary w-24">Justified</th>
                            <th className="px-4 py-2 font-medium text-admin-text-primary w-64">Note</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5E5]">
                        {students.map((student) => {
                            const isAbsent = attendance[student.id]?.absent || false;
                            const isJustified = attendance[student.id]?.justified || false;
                            const note = attendance[student.id]?.justification_note || '';

                            return (
                                <tr key={student.id} className="hover:bg-admin-sidebar">
                                    <td className="px-4 py-2">
                                        <p className="font-medium text-admin-text-primary">{student.full_name}</p>
                                        <p className="text-xs text-admin-text-secondary">{student.student_number || 'No ID'}</p>
                                    </td>
                                    <td className="px-4 py-2">
                                        <select
                                            value={isAbsent ? 'absent' : 'present'}
                                            onChange={(e) => handleChange(student.id, { absent: e.target.value === 'absent' })}
                                            className="w-full text-sm border-admin-border rounded focus:border-admin-accent focus:ring-admin-accent py-1"
                                        >
                                            <option value="present">Present</option>
                                            <option value="absent">Absent</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <input
                                            type="checkbox"
                                            checked={isJustified}
                                            disabled={!isAbsent}
                                            onChange={(e) => handleChange(student.id, { justified: e.target.checked })}
                                            className="rounded border-admin-border text-admin-accent focus:ring-admin-accent disabled:opacity-50"
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <input
                                            type="text"
                                            value={note}
                                            disabled={!isAbsent}
                                            onChange={(e) => handleChange(student.id, { justification_note: e.target.value })}
                                            placeholder="Reason..."
                                            className="w-full rounded border-admin-border text-sm py-1 focus:border-admin-accent focus:ring-admin-accent disabled:bg-gray-100 disabled:opacity-50"
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                        {students.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-4 py-8 text-center text-admin-text-secondary">
                                    No students enrolled in this group.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AuthenticatedLayout>
    );
}
