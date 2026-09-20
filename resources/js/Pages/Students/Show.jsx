import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

function StatBadge({ label, value }) {
    return (
        <div className="border border-admin-border bg-admin-bg p-4 text-center">
            <p className="text-2xl font-semibold text-admin-text-primary">{value}</p>
            <p className="text-sm text-admin-text-secondary mt-1">{label}</p>
        </div>
    );
}

export default function StudentShow({ student, absences, stats }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2">
                    <button onClick={() => window.history.back()} className="text-admin-text-secondary hover:text-admin-text-primary text-sm font-medium mr-2">
                        ← Back
                    </button>
                    <div>
                        <h2 className="text-xl font-medium text-admin-text-primary">{student.full_name}</h2>
                        <p className="text-sm text-admin-text-secondary">
                            {student.student_number || 'No Student Number'}
                            {student.birth_date && ` • Born: ${student.birth_date}`}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={student.full_name} />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <StatBadge label="Total Absences" value={stats.total} />
                <StatBadge label="Justified" value={stats.justified} />
                <StatBadge label="Unjustified" value={stats.unjustified} />
            </div>

            {/* Enrolled Groups */}
            {student.enrollments && student.enrollments.length > 0 && (
                <div className="mb-8 border border-admin-border bg-admin-bg">
                    <div className="px-4 py-3 border-b border-admin-border">
                        <h3 className="text-base font-medium text-admin-text-primary">Enrolled Groups</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-admin-sidebar border-b border-admin-border">
                                <tr>
                                    <th className="px-4 py-2 font-medium text-admin-text-primary">Group</th>
                                    <th className="px-4 py-2 font-medium text-admin-text-primary">Academic Year</th>
                                    <th className="px-4 py-2 font-medium text-admin-text-primary">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E5E5]">
                                {student.enrollments.map((enrollment) => (
                                    <tr key={enrollment.id} className="hover:bg-admin-sidebar">
                                        <td className="px-4 py-2">
                                            <Link href={route('groups.show', enrollment.group.id)} className="text-admin-accent hover:underline font-medium">
                                                {enrollment.group.name}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-2 text-admin-text-secondary">{enrollment.group.academic_year?.name}</td>
                                        <td className="px-4 py-2 text-admin-text-secondary">{enrollment.joined_at}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Absence History */}
            <div className="border border-admin-border bg-admin-bg">
                <div className="px-4 py-3 border-b border-admin-border">
                    <h3 className="text-base font-medium text-admin-text-primary">Absence History</h3>
                </div>

                {absences && absences.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-admin-sidebar border-b border-admin-border">
                                <tr>
                                    <th className="px-4 py-2 font-medium text-admin-text-primary">Date</th>
                                    <th className="px-4 py-2 font-medium text-admin-text-primary">Subject</th>
                                    <th className="px-4 py-2 font-medium text-admin-text-primary">Group</th>
                                    <th className="px-4 py-2 font-medium text-admin-text-primary">Status</th>
                                    <th className="px-4 py-2 font-medium text-admin-text-primary">Note</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E5E5]">
                                {absences.map((absence) => (
                                    <tr key={absence.id} className="hover:bg-admin-sidebar">
                                        <td className="px-4 py-2 text-admin-text-secondary">
                                            {absence.session?.date} {absence.session?.start_time}
                                        </td>
                                        <td className="px-4 py-2 text-admin-text-primary font-medium">{absence.session?.subject}</td>
                                        <td className="px-4 py-2 text-admin-text-secondary">{absence.session?.group?.name}</td>
                                        <td className="px-4 py-2">
                                            {absence.justified ? (
                                                <span className="text-admin-amber flex items-center gap-1.5">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-admin-amber"></span>
                                                    Justified
                                                </span>
                                            ) : (
                                                <span className="text-admin-red flex items-center gap-1.5">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-admin-red"></span>
                                                    Unjustified
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 text-admin-text-secondary max-w-xs truncate">
                                            {absence.justification_note || '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="px-4 py-8 text-center border-t border-admin-border">
                        <p className="text-sm text-admin-text-secondary">No absences recorded.</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
