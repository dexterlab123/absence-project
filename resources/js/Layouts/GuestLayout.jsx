import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-admin-bg pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/" className="font-bold text-2xl text-admin-text-primary">
                    ISTA Nador
                </Link>
            </div>

            <div className="mt-6 w-full bg-admin-bg px-6 py-4 sm:max-w-md border border-admin-border">
                {children}
            </div>
        </div>
    );
}
