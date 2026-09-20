import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

function StatCard({ title, value }) {
    return (
        <div className="border border-admin-border bg-admin-bg p-4">
            <p className="text-sm font-medium text-admin-text-secondary">{title}</p>
            <p className="mt-2 text-2xl font-semibold text-admin-text-primary">{value}</p>
        </div>
    );
}

export default function Dashboard({ stats, recentSessions, currentYear }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-medium text-admin-text-primary">
                            Dashboard
                        </h2>
                        {currentYear && (
                            <p className="text-sm text-admin-text-secondary mt-1">
                                Academic Year: {currentYear.name}
                            </p>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <StatCard
                    title="Total Students"
                    value={stats.totalStudents}
                />
                <StatCard
                    title="Groups"
                    value={stats.totalGroups}
                />
                <StatCard
                    title="Today's Sessions"
                    value={stats.todaySessions}
                />
                <StatCard
                    title="Total Absences"
                    value={stats.totalAbsences}
                />
            </div>

            {/* Recent Sessions */}
            <div className="border border-admin-border bg-admin-bg">
                <div className="px-4 py-3 border-b border-admin-border">
                    <h3 className="text-base font-medium text-admin-text-primary">Recent Sessions</h3>
                </div>
                {recentSessions && recentSessions.length > 0 ? (
                    <div className="divide-y divide-admin-border">
                        {recentSessions.map((session) => (
                            <div
                                key={session.id}
                                className="flex items-center justify-between px-4 py-3 hover:bg-admin-sidebar transition-colors"
                            >
                                <div>
                                    <Link href={route('sessions.show', session.id)} className="text-admin-accent hover:underline font-medium text-sm">
                                        {session.subject}
                                    </Link>
                                    <p className="text-xs text-admin-text-secondary mt-1">
                                        {session.group?.name} - {session.professor?.name}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-admin-text-primary">{session.date}</p>
                                    <p className="text-xs text-admin-text-secondary mt-1">
                                        {session.start_time} - {session.end_time}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="px-4 py-8 text-center">
                        <p className="text-sm text-admin-text-secondary">No sessions yet.</p>
                        <Link href={route('groups.index')} className="text-admin-accent hover:underline text-sm mt-2 inline-block">
                            Go to Groups to create one
                        </Link>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
