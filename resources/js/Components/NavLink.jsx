import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'block px-4 py-2 text-sm font-medium transition-colors focus:outline-none ' +
                (active
                    ? 'text-admin-accent bg-white'
                    : 'text-admin-text-primary hover:text-admin-accent hover:bg-white') +
                ' ' + className
            }
        >
            {children}
        </Link>
    );
}
