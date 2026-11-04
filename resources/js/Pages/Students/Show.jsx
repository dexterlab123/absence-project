import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

function StatBadge({ label, value }) {
    return (
        <div className="border border-admin-border bg-admin-bg p-4 text-center">
            <p className="text-2xl font-semibold text-admin-text-primary">{value}</p>
            <p className="text-sm text-admin-text-secondary mt-1">{label}</p>
        </div>
    );
}

export default function StudentShow({ student, absences, stats }) {
    const { auth } = usePage().props;
    const { patch } = useForm();
    const issueBillet = (id) => {
        if(confirm('Émettre un billet pour cette absence ?')) {
            patch(route('absences.issueBillet', id), { preserveScroll: true });
        }
    };
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2">
                    <button onClick={() => window.history.back()} className="text-admin-text-secondary hover:text-admin-text-primary text-sm font-medium mr-2">
                        ← Retour
                    </button>
                    <div>
                        <h2 className="text-xl font-medium text-admin-text-primary">
                            {student.full_name}
                            {student.full_name_ar && (
                                <span dir="rtl" className="ml-3 text-lg text-admin-text-secondary">{student.full_name_ar}</span>
                            )}
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title={student.full_name} />

            {/* Student Information Card */}
            <div className="mb-6 border border-admin-border bg-admin-bg p-6">
                <h3 className="text-sm font-semibold text-admin-text-primary uppercase tracking-wider mb-4">Informations du Stagiaire</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <p className="text-xs text-admin-text-secondary mb-1">Code / Matricule</p>
                        <p className="font-medium text-admin-text-primary">{student.student_number || '—'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-admin-text-secondary mb-1">CIN</p>
                        <p className="font-medium text-admin-text-primary">{student.cin || '—'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-admin-text-secondary mb-1">Date de naissance</p>
                        <p className="font-medium text-admin-text-primary">
                            {student.birth_date ? new Date(student.birth_date).toLocaleDateString('fr-FR') : '—'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-admin-text-secondary mb-1">Lieu de naissance</p>
                        <p className="font-medium text-admin-text-primary">{student.birth_place || '—'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-admin-text-secondary mb-1">Téléphone</p>
                        <p className="font-medium text-admin-text-primary">
                            {student.phone ? (student.phone.toString().startsWith('0') ? student.phone : `0${student.phone}`) : '—'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <StatBadge label="Total des absences" value={stats.total} />
                <StatBadge label="Avec Billet" value={stats.withBillet} />
                <StatBadge label="Sans Billet" value={stats.withoutBillet} />
            </div>

            {/* Enrolled Groups */}
            {student.enrollments && student.enrollments.length > 0 && (
                <div className="mb-8 border border-admin-border bg-admin-bg">
                    <div className="px-4 py-3 border-b border-admin-border">
                        <h3 className="text-base font-medium text-admin-text-primary">Groupes inscrits</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-admin-sidebar border-b border-admin-border">
                                <tr>
                                    <th className="px-4 py-2 font-medium text-admin-text-primary">Groupe</th>
                                    <th className="px-4 py-2 font-medium text-admin-text-primary">Année scolaire</th>
                                    <th className="px-4 py-2 font-medium text-admin-text-primary">Date d'inscription</th>
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
                    <h3 className="text-base font-medium text-admin-text-primary">Historique des absences</h3>
                </div>

                {absences && absences.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-admin-sidebar border-b border-admin-border">
                                <tr>
                                    <th className="px-4 py-2 font-medium text-admin-text-primary">Date</th>
                                    <th className="px-4 py-2 font-medium text-admin-text-primary">Sujet</th>
                                    <th className="px-4 py-2 font-medium text-admin-text-primary">Groupe</th>
                                    <th className="px-4 py-2 font-medium text-admin-text-primary">Catégorie</th>
                                    <th className="px-4 py-2 font-medium text-admin-text-primary">Statut</th>
                                    <th className="px-4 py-2 font-medium text-admin-text-primary">Remarque</th>
                                    <th className="px-4 py-2 font-medium text-admin-text-primary text-right">Actions</th>
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
                                        <td className="px-4 py-2 text-admin-text-secondary">{absence.category}</td>
                                        <td className="px-4 py-2">
                                            {absence.billet_id && absence.billet ? (
                                                <div>
                                                    <span className="text-admin-green flex items-center gap-1.5">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-admin-green"></span>
                                                        Billet Justifié
                                                    </span>
                                                    {absence.billet.issued_by && (
                                                        <span className="text-xs text-admin-text-secondary mt-1 block">
                                                            par {absence.billet.issued_by.name} le {new Date(absence.billet.date).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-admin-red flex items-center gap-1.5">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-admin-red"></span>
                                                    Sans Billet
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 text-admin-text-secondary max-w-xs truncate">
                                            {absence.billet_id && absence.billet ? (
                                                <span className="text-admin-text-primary italic">Motif du billet : {absence.billet.motif}</span>
                                            ) : (
                                                absence.justification_note || '—'
                                            )}
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            {!absence.billet_id && (auth.user.roles.includes('surveillant') || auth.user.roles.includes('admin')) && (
                                                <button
                                                    onClick={() => issueBillet(absence.id)}
                                                    className="text-xs bg-admin-accent text-white px-2 py-1 rounded hover:opacity-90 transition-opacity"
                                                >
                                                    Émettre un Billet
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="px-4 py-8 text-center border-t border-admin-border">
                        <p className="text-sm text-admin-text-secondary">Aucune absence enregistrée.</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
