import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function GroupsIndex({ groups, currentYear }) {
    const [search, setSearch] = useState('');

    const filteredGroups = groups.filter(g =>
        g.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-medium text-admin-text-primary">Groups</h2>
                        {currentYear && (
                            <p className="text-sm text-admin-text-secondary mt-1">{currentYear.name}</p>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Groups" />

            {/* Search */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search groups..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-80 rounded border-admin-border focus:border-admin-accent focus:ring-admin-accent text-sm"
                />
            </div>

            {/* Groups Table */}
            {filteredGroups.length > 0 ? (
                <div className="border border-admin-border bg-admin-bg overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-admin-border bg-admin-sidebar">
                            <tr>
                                <th className="px-4 py-2 font-medium text-admin-text-primary">Name</th>
                                <th className="px-4 py-2 font-medium text-admin-text-primary">Students</th>
                                <th className="px-4 py-2 font-medium text-admin-text-primary">Sessions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E5E5]">
                            {filteredGroups.map((group) => (
                                <tr key={group.id} className="hover:bg-admin-sidebar">
                                    <td className="px-4 py-2">
                                        <Link href={route('groups.show', group.id)} className="text-admin-accent hover:underline font-medium">
                                            {group.name}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-2 text-admin-text-secondary">
                                        {group.enrollments_count}
                                    </td>
                                    <td className="px-4 py-2 text-admin-text-secondary">
                                        {group.sessions_count}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="border border-admin-border bg-admin-bg p-8 text-center">
                    <p className="text-sm text-admin-text-secondary">
                        {search ? 'No groups match your search.' : 'No groups yet.'}
                    </p>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
