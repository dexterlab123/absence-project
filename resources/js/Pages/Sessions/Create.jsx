import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function SessionCreate({ group, groups, professors }) {
    const user = usePage().props.auth.user;

    const { data, setData, post, processing, errors } = useForm({
        group_id: group ? group.id : (groups.length > 0 ? groups[0].id : ''),
        subject: '',
        professor_id: user.id,
        date: new Date().toISOString().split('T')[0],
        start_time: '08:30',
        end_time: '10:30',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('sessions.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2">
                    {group ? (
                        <Link href={route('groups.show', group.id)} className="text-admin-text-secondary hover:text-admin-text-primary text-sm font-medium mr-2">
                            ← Retour
                        </Link>
                    ) : (
                        <Link href={route('absences.index')} className="text-admin-text-secondary hover:text-admin-text-primary text-sm font-medium mr-2">
                            ← Retour
                        </Link>
                    )}
                    <div>
                        <h2 className="text-xl font-medium text-admin-text-primary">Nouvelle Séance</h2>
                        {group && <p className="text-sm text-admin-text-secondary">{group.name} • {group.academic_year?.name}</p>}
                    </div>
                </div>
            }
        >
            <Head title={`Nouvelle Séance${group ? ` - ${group.name}` : ''}`} />

            <div className="max-w-xl">
                <div className="border border-admin-border bg-admin-bg p-6">
                    <form onSubmit={submit} className="space-y-4">
                        {!group && (
                            <div>
                                <label className="block text-sm font-medium text-admin-text-primary mb-1">Groupe *</label>
                                <select
                                    value={data.group_id}
                                    onChange={e => setData('group_id', e.target.value)}
                                    className="block w-full rounded-md py-1.5 px-3 border-0 ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-admin-accent focus:text-gray-800 text-sm"
                                    required
                                >
                                    {groups.map(g => (
                                        <option key={g.id} value={g.id}>{g.name} {g.academic_year?.name ? `(${g.academic_year.name})` : ''}</option>
                                    ))}
                                </select>
                                {errors.group_id && <p className="text-admin-red text-xs mt-1">{errors.group_id}</p>}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-admin-text-primary mb-1">Sujet *</label>
                            <input
                                type="text"
                                value={data.subject}
                                onChange={e => setData('subject', e.target.value)}
                                className="block w-full rounded-md py-1.5 px-3 border-0 ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-admin-accent focus:text-gray-800 text-sm placeholder-gray-500"
                                placeholder="par ex. Développement Web, Algorithmique..."
                                required
                            />
                            {errors.subject && <p className="text-admin-red text-xs mt-1">{errors.subject}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-admin-text-primary mb-1">Formateur *</label>
                            <select
                                value={data.professor_id}
                                onChange={e => setData('professor_id', e.target.value)}
                                className="block w-full rounded-md py-1.5 px-3 border-0 ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-admin-accent focus:text-gray-800 text-sm"
                            >
                                {professors.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
                                ))}
                            </select>
                            {errors.professor_id && <p className="text-admin-red text-xs mt-1">{errors.professor_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-admin-text-primary mb-1">Date *</label>
                            <input
                                type="date"
                                value={data.date}
                                onChange={e => setData('date', e.target.value)}
                                className="block w-full rounded-md py-1.5 px-3 border-0 ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-admin-accent focus:text-gray-800 text-sm"
                                required
                            />
                            {errors.date && <p className="text-admin-red text-xs mt-1">{errors.date}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-admin-text-primary mb-1">Heure de début *</label>
                                <input
                                    type="time"
                                    value={data.start_time}
                                    onChange={e => setData('start_time', e.target.value)}
                                    className="block w-full rounded-md py-1.5 px-3 border-0 ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-admin-accent focus:text-gray-800 text-sm"
                                    required
                                />
                                {errors.start_time && <p className="text-admin-red text-xs mt-1">{errors.start_time}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-admin-text-primary mb-1">Heure de fin *</label>
                                <input
                                    type="time"
                                    value={data.end_time}
                                    onChange={e => setData('end_time', e.target.value)}
                                    className="block w-full rounded-md py-1.5 px-3 border-0 ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-admin-accent focus:text-gray-800 text-sm"
                                    required
                                />
                                {errors.end_time && <p className="text-admin-red text-xs mt-1">{errors.end_time}</p>}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            {group ? (
                                <Link
                                    href={route('groups.show', group.id)}
                                    className="px-4 py-2 text-sm text-admin-text-secondary hover:text-admin-text-primary"
                                >
                                    Annuler
                                </Link>
                            ) : (
                                <Link
                                    href={route('absences.index')}
                                    className="px-4 py-2 text-sm text-admin-text-secondary hover:text-admin-text-primary"
                                >
                                    Annuler
                                </Link>
                            )}
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 text-sm font-medium text-white bg-admin-accent rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {processing ? 'Création...' : 'Créer la séance'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
