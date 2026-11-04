import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AccountsIndex({ formateurs, surveillants, groups }) {
    const { flash } = usePage().props;

    // Formateur form
    const fForm = useForm({
        name: '',
        matricule: '',
        password: '',
        password_confirmation: '',
        group_ids: [],
    });

    const createFormateur = (e) => {
        e.preventDefault();
        fForm.post(route('admin.formateurs.store'), {
            onSuccess: () => fForm.reset(),
        });
    };

    // Surveillant form
    const sForm = useForm({
        name: '',
        matricule: '',
        password: '',
        password_confirmation: '',
    });

    const createSurveillant = (e) => {
        e.preventDefault();
        sForm.post(route('admin.surveillants.store'), {
            onSuccess: () => sForm.reset(),
        });
    };

    // Formateur Groups Modal
    const [editingFormateur, setEditingFormateur] = useState(null);
    const gForm = useForm({
        group_ids: [],
    });

    const openEditGroups = (formateur) => {
        setEditingFormateur(formateur);
        gForm.setData('group_ids', formateur.groups.map(g => g.id));
    };

    const updateGroups = (e) => {
        e.preventDefault();
        gForm.put(route('admin.formateurs.updateGroups', editingFormateur.id), {
            onSuccess: () => setEditingFormateur(null),
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-medium text-admin-text-primary">Administration</h2>}>
            <Head title="Administration" />

            {flash?.success && (
                <div className="mb-4 border border-admin-green text-admin-green bg-white p-3 text-sm">
                    {flash.success}
                </div>
            )}

            <div className="space-y-8">
                {/* FORMATEURS SECTION */}
                <section className="bg-white border border-admin-border rounded overflow-hidden">
                    <div className="p-4 border-b border-admin-border bg-[#fbfcfe]">
                        <h2 className="text-base font-semibold text-admin-text-primary m-0">Créer un formateur</h2>
                        <p className="text-sm text-admin-text-secondary mt-1">L'administrateur crée la liste des formateurs et assigne leurs groupes.</p>
                    </div>
                    <div className="p-4">
                        <form onSubmit={createFormateur} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-[#344054] mb-1">Nom formateur</label>
                                <input type="text" value={fForm.data.name} onChange={e => fForm.setData('name', e.target.value)} required className="block w-full rounded-md py-1.5 px-3 border-0 ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-admin-accent focus:text-gray-800 text-sm" />
                                {fForm.errors.name && <p className="text-admin-red text-xs mt-1">{fForm.errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#344054] mb-1">Matricule</label>
                                <input type="text" value={fForm.data.matricule} onChange={e => fForm.setData('matricule', e.target.value)} required className="block w-full rounded-md py-1.5 px-3 border-0 ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-admin-accent focus:text-gray-800 text-sm" />
                                {fForm.errors.matricule && <p className="text-admin-red text-xs mt-1">{fForm.errors.matricule}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#344054] mb-1">Mot de passe</label>
                                <input type="password" value={fForm.data.password} onChange={e => fForm.setData('password', e.target.value)} required className="block w-full rounded-md py-1.5 px-3 border-0 ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-admin-accent focus:text-gray-800 text-sm" />
                                {fForm.errors.password && <p className="text-admin-red text-xs mt-1">{fForm.errors.password}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#344054] mb-1">Confirmer MDP</label>
                                <input type="password" value={fForm.data.password_confirmation} onChange={e => fForm.setData('password_confirmation', e.target.value)} required className="block w-full rounded-md py-1.5 px-3 border-0 ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-admin-accent focus:text-gray-800 text-sm" />
                            </div>
                            <div className="md:col-span-4 mt-2">
                                <label className="block text-sm font-bold text-[#344054] mb-2">Groupes autorisés</label>
                                <div className="border border-dashed border-[#aeb9ca] rounded p-4 bg-[#fbfcfe] max-h-48 overflow-y-auto grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {groups.map(group => (
                                        <label key={group.id} className="flex items-center gap-2 text-sm">
                                            <input 
                                                type="checkbox" 
                                                checked={fForm.data.group_ids.includes(group.id)}
                                                onChange={e => {
                                                    const ids = fForm.data.group_ids;
                                                    fForm.setData('group_ids', e.target.checked ? [...ids, group.id] : ids.filter(i => i !== group.id));
                                                }}
                                                className="rounded border-admin-border text-admin-accent"
                                            />
                                            {group.name} ({group.academic_year?.name})
                                        </label>
                                    ))}
                                </div>
                                {fForm.errors.group_ids && <p className="text-admin-red text-xs mt-1">{fForm.errors.group_ids}</p>}
                            </div>
                            <div className="md:col-span-4 mt-2">
                                <button type="submit" disabled={fForm.processing} className="px-4 py-2 bg-admin-accent text-white font-medium rounded hover:opacity-90 disabled:opacity-50 text-sm">
                                    Créer le compte formateur
                                </button>
                            </div>
                        </form>

                        <div className="mt-8 border border-admin-border rounded overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="bg-[#edf4fb] text-[#173b59] border-b border-admin-border">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Nom</th>
                                        <th className="px-4 py-3 font-semibold">Matricule</th>
                                        <th className="px-4 py-3 font-semibold">Groupes autorisés</th>
                                        <th className="px-4 py-3 font-semibold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E5E5]">
                                    {formateurs.map(f => (
                                        <tr key={f.id} className="hover:bg-admin-sidebar">
                                            <td className="px-4 py-3 font-medium text-admin-text-primary">{f.name}</td>
                                            <td className="px-4 py-3">{f.matricule}</td>
                                            <td className="px-4 py-3">
                                                {f.groups.map(g => (
                                                    <span key={g.id} className="inline-block bg-[#eef2f7] px-2 py-1 rounded-full text-xs mr-1 mb-1 font-medium">{g.name}</span>
                                                ))}
                                                {f.groups.length === 0 && <span className="text-gray-400 text-xs">Aucun groupe</span>}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button onClick={() => openEditGroups(f)} className="text-admin-accent hover:underline mr-3 text-sm font-medium">Modifier</button>
                                                <Link href={route('admin.formateurs.destroy', f.id)} method="delete" as="button" className="text-admin-red hover:underline text-sm font-medium">Supprimer</Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {formateurs.length === 0 && <tr><td colSpan="4" className="px-4 py-4 text-center text-gray-500">Aucun formateur</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* SURVEILLANTS SECTION */}
                <section className="bg-white border border-admin-border rounded overflow-hidden">
                    <div className="p-4 border-b border-admin-border bg-[#fbfcfe]">
                        <h2 className="text-base font-semibold text-admin-text-primary m-0">Créer un surveillant</h2>
                        <p className="text-sm text-admin-text-secondary mt-1">Les surveillants ont accès à tous les groupes et peuvent émettre des billets.</p>
                    </div>
                    <div className="p-4">
                        <form onSubmit={createSurveillant} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-[#344054] mb-1">Nom surveillant</label>
                                <input type="text" value={sForm.data.name} onChange={e => sForm.setData('name', e.target.value)} required className="block w-full rounded-md py-1.5 px-3 border-0 ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-admin-accent focus:text-gray-800 text-sm" />
                                {sForm.errors.name && <p className="text-admin-red text-xs mt-1">{sForm.errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#344054] mb-1">Matricule</label>
                                <input type="text" value={sForm.data.matricule} onChange={e => sForm.setData('matricule', e.target.value)} required className="block w-full rounded-md py-1.5 px-3 border-0 ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-admin-accent focus:text-gray-800 text-sm" />
                                {sForm.errors.matricule && <p className="text-admin-red text-xs mt-1">{sForm.errors.matricule}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-bold text-[#344054] mb-1">Mot de passe</label>
                                    <input type="password" value={sForm.data.password} onChange={e => sForm.setData('password', e.target.value)} required className="block w-full rounded-md py-1.5 px-3 border-0 ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-admin-accent focus:text-gray-800 text-sm" />
                                    {sForm.errors.password && <p className="text-admin-red text-xs mt-1">{sForm.errors.password}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[#344054] mb-1">Confirmer</label>
                                    <input type="password" value={sForm.data.password_confirmation} onChange={e => sForm.setData('password_confirmation', e.target.value)} required className="block w-full rounded-md py-1.5 px-3 border-0 ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-admin-accent focus:text-gray-800 text-sm" />
                                </div>
                            </div>
                            <div className="md:col-span-3 mt-2">
                                <button type="submit" disabled={sForm.processing} className="px-4 py-2 bg-admin-accent text-white font-medium rounded hover:opacity-90 disabled:opacity-50 text-sm">
                                    Créer
                                </button>
                            </div>
                        </form>

                        <div className="mt-8 border border-admin-border rounded overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="bg-[#edf4fb] text-[#173b59] border-b border-admin-border">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Nom surveillant</th>
                                        <th className="px-4 py-3 font-semibold">Matricule</th>
                                        <th className="px-4 py-3 font-semibold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E5E5]">
                                    {surveillants.map(s => (
                                        <tr key={s.id} className="hover:bg-admin-sidebar">
                                            <td className="px-4 py-3 font-medium text-admin-text-primary">{s.name}</td>
                                            <td className="px-4 py-3">{s.matricule}</td>
                                            <td className="px-4 py-3 text-right">
                                                <Link href={route('admin.surveillants.destroy', s.id)} method="delete" as="button" className="text-admin-red hover:underline text-sm font-medium">Supprimer</Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {surveillants.length === 0 && <tr><td colSpan="3" className="px-4 py-4 text-center text-gray-500">Aucun surveillant</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>

            {/* EDIT MODAL */}
            {editingFormateur && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
                    <div className="bg-white rounded border border-admin-border shadow-2xl w-full max-w-lg overflow-hidden">
                        <header className="px-4 py-3 border-b border-admin-border flex justify-between items-center bg-[#fbfcfe]">
                            <h3 className="font-semibold text-admin-text-primary">Modifier Groupes - {editingFormateur.name}</h3>
                            <button onClick={() => setEditingFormateur(null)} className="text-gray-400 hover:text-gray-600">×</button>
                        </header>
                        <div className="p-4">
                            <form onSubmit={updateGroups}>
                                <div className="max-h-64 overflow-y-auto grid grid-cols-2 gap-2 mb-4">
                                    {groups.map(group => (
                                        <label key={group.id} className="flex items-center gap-2 text-sm">
                                            <input 
                                                type="checkbox" 
                                                checked={gForm.data.group_ids.includes(group.id)}
                                                onChange={e => {
                                                    const ids = gForm.data.group_ids;
                                                    gForm.setData('group_ids', e.target.checked ? [...ids, group.id] : ids.filter(i => i !== group.id));
                                                }}
                                                className="rounded border-admin-border text-admin-accent"
                                            />
                                            {group.name}
                                        </label>
                                    ))}
                                </div>
                                <div className="flex justify-end gap-2 border-t border-admin-border pt-4">
                                    <button type="button" onClick={() => setEditingFormateur(null)} className="px-3 py-1.5 border border-admin-border rounded text-sm font-medium hover:bg-gray-50">Annuler</button>
                                    <button type="submit" disabled={gForm.processing} className="px-3 py-1.5 bg-admin-accent text-white rounded text-sm font-medium hover:opacity-90 disabled:opacity-50">Enregistrer</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
