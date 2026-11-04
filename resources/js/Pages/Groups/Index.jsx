import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

function AddGroupModal({ show, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('groups.store'), {
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
                <h3 className="text-lg font-medium text-admin-text-primary mb-4">Ajouter un groupe</h3>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-admin-text-primary mb-1">Nom du groupe *</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="w-full rounded border-admin-border text-sm focus:border-admin-accent focus:ring-admin-accent"
                            required
                        />
                        {errors.name && <p className="text-admin-red text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-admin-text-secondary hover:text-admin-text-primary">
                            Annuler
                        </button>
                        <button type="submit" disabled={processing} className="px-4 py-2 text-sm font-medium text-white bg-admin-accent rounded hover:bg-blue-700 disabled:opacity-50">
                            {processing ? 'Ajout...' : 'Ajouter'}
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

function ImportFullRosterModal({ show, onClose }) {
    const { data, setData, post, processing, errors } = useForm({ file: null });

    const submit = (e) => {
        e.preventDefault();
        post(route('students.importAll'), {
            forceFormData: true,
            onSuccess: () => onClose(),
        });
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
            <div className="w-full max-w-md border border-admin-border bg-admin-bg p-6 rounded" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-medium text-admin-text-primary mb-4">Importer la liste complète</h3>
                <p className="text-sm text-admin-text-secondary mb-2">
                    Téléversez le fichier master de l'école (lister.xls). Ceci créera automatiquement les groupes manquants.
                </p>
                <div className="bg-gray-50 border border-admin-border rounded p-3 mb-4 text-xs font-mono space-y-1">
                    <div><code className="bg-gray-200 px-1 rounded">MatriculeEtudiant</code> → Code</div>
                    <div><code className="bg-gray-200 px-1 rounded">Nom</code> + <code className="bg-gray-200 px-1 rounded">Prenom</code> → Nom (FR)</div>
                    <div><code className="bg-gray-200 px-1 rounded">Nom_Arabe</code> + <code className="bg-gray-200 px-1 rounded">Prenom_arabe</code> → Nom (AR)</div>
                    <div><code className="bg-gray-200 px-1 rounded">DateNaissance</code> → Date de naissance</div>
                    <div><code className="bg-gray-200 px-1 rounded">LieuNaissance</code> → Lieu de naissance</div>
                    <div><code className="bg-gray-200 px-1 rounded">CIN</code> → CIN</div>
                    <div><code className="bg-gray-200 px-1 rounded">NTelelephone</code> → Téléphone</div>
                    <div><code className="bg-gray-200 px-1 rounded">LibelleLong</code> → Groupe (créé si inexistant)</div>
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
            <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                    <span className="font-semibold text-admin-text-primary">{summary.groups_created}</span> <span className="text-admin-text-secondary">Groupes créés</span>
                </div>
                <div>
                    <span className="font-semibold text-admin-text-primary">{summary.created}</span> <span className="text-admin-text-secondary">Stagiaires créés</span>
                </div>
                <div>
                    <span className="font-semibold text-admin-text-primary">{summary.matched}</span> <span className="text-admin-text-secondary">Stagiaires mis à jour</span>
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

export default function GroupsIndex({ groups, currentYear }) {
    const [search, setSearch] = useState('');
    const [showAddGroup, setShowAddGroup] = useState(false);
    const [showImportAll, setShowImportAll] = useState(false);
    const { auth, flash } = usePage().props;
    const isAdmin = auth.user.roles && auth.user.roles.includes('admin');

    const filteredGroups = groups.filter(g =>
        g.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-medium text-admin-text-primary">Groupes</h2>
                        {currentYear && (
                            <p className="text-sm text-admin-text-secondary mt-1">{currentYear.name}</p>
                        )}
                    </div>
                    {isAdmin && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowImportAll(true)}
                                className="px-4 py-2 text-sm font-medium text-admin-text-primary bg-white border border-admin-border rounded hover:bg-gray-50 transition-colors"
                            >
                                Importer la liste complète
                            </button>
                            <button
                                onClick={() => setShowAddGroup(true)}
                                className="px-4 py-2 text-sm font-medium text-white bg-admin-accent rounded hover:bg-blue-700 transition-colors"
                            >
                                Ajouter un groupe
                            </button>
                        </div>
                    )}
                </div>
            }
        >
            <Head title="Groupes" />

            {flash?.importSummary && <ImportSummary summary={flash.importSummary} />}
            {flash?.success && (
                <div className="mb-4 border border-admin-green text-admin-green bg-white p-3 text-sm">
                    {flash.success}
                </div>
            )}

            {/* Search */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Rechercher un groupe..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full sm:w-80 rounded-md py-1.5 px-3 border-0 ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-admin-accent focus:text-gray-800 text-sm placeholder-gray-500"
                />
            </div>

            {/* Groups Table */}
            {filteredGroups.length > 0 ? (
                <div className="border border-admin-border bg-admin-bg overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-admin-border bg-admin-sidebar">
                            <tr>
                                <th className="px-4 py-2 font-medium text-admin-text-primary">Nom</th>
                                <th className="px-4 py-2 font-medium text-admin-text-primary">Stagiaires</th>
                                <th className="px-4 py-2 font-medium text-admin-text-primary">Séances</th>
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
                        {search ? 'Aucun groupe ne correspond à votre recherche.' : 'Aucun groupe pour le moment.'}
                    </p>
                </div>
            )}

            <AddGroupModal show={showAddGroup} onClose={() => setShowAddGroup(false)} />
            <ImportFullRosterModal show={showImportAll} onClose={() => setShowImportAll(false)} />
        </AuthenticatedLayout>
    );
}
