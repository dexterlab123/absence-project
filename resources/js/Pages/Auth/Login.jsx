import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";

const ROLES = [
    { key: "surveillant", label: "Surveillant" },
    { key: "formateur", label: "Formateur" },
    { key: "admin", label: "Administrateur" },
];

const ROLE_HINTS = {
    surveillant:
        "Les surveillants importent les stagiaires et donnent les billets d'absence.",
    formateur: "Le formateur coche les absences de ses groupes assignés.",
    admin: "L'administrateur crée les comptes et supervise tout.",
};

export default function Login({ status }) {
    const [activeRole, setActiveRole] = useState("surveillant");

    const { data, setData, post, processing, errors, reset } = useForm({
        login: "",
        password: "",
        role: "surveillant",
    });

    const switchRole = (roleKey) => {
        setActiveRole(roleKey);
        setData("role", roleKey);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <div className="login-shell">
            <Head title="Connexion — ISTA Nador" />

            {/* ── Login stage ── */}
            <section className="login-stage">
                <div className="login-panel">
                    {/* Panel header */}
                    <div className="login-head">
                        <img src="/ofppt.png" alt="OFPPT" />
                        <div>
                            <h1>Connexion ISTA NADOR</h1>
                            <p>
                                Choisir la partie surveillant, formateur ou
                                administrateur.
                            </p>
                        </div>
                    </div>

                    {/* Role tabs */}
                    <div className="login-role-tabs">
                        {ROLES.map((r) => (
                            <button
                                key={r.key}
                                type="button"
                                className={activeRole === r.key ? "active" : ""}
                                onClick={() => switchRole(r.key)}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>

                    {/* Form */}
                    <div className="login-form-area">
                        <div className="login-notice">
                            {ROLE_HINTS[activeRole]}
                        </div>

                        {status && (
                            <div
                                className="login-notice"
                                style={{
                                    background: "#eaf7ee",
                                    borderColor: "#b6e2c7",
                                    color: "#0b8f55",
                                    marginBottom: 14,
                                }}
                            >
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit}>
                            <div className="login-grid">
                                <div className="login-span-6">
                                    <label htmlFor="loginId">
                                        Nom ou matricule
                                    </label>
                                    <input
                                        id="loginId"
                                        type="text"
                                        autoComplete="username"
                                        value={data.login}
                                        onChange={(e) =>
                                            setData("login", e.target.value)
                                        }
                                    />
                                    {errors.login && (
                                        <div className="login-error">
                                            {errors.login}
                                        </div>
                                    )}
                                </div>

                                <div className="login-span-6">
                                    <label htmlFor="loginPassword">
                                        Mot de passe
                                    </label>
                                    <input
                                        id="loginPassword"
                                        type="password"
                                        autoComplete="current-password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                    />
                                    {errors.password && (
                                        <div className="login-error">
                                            {errors.password}
                                        </div>
                                    )}
                                </div>

                                <div className="login-span-12">
                                    <button
                                        type="submit"
                                        className="login-submit-btn"
                                        disabled={processing}
                                    >
                                        Entrer
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Creator credit */}
                    <div className="login-creator-credit">
                        Créateurs : ILIASSE ELATCHI (0699279597) &amp; MOHAMED ABDELMOUMNI (0684656057)
                    </div>
                </div>
            </section>
        </div>
    );
}
