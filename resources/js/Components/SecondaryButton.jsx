export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center rounded border border-admin-border bg-white px-4 py-2 text-sm font-medium text-admin-text-primary transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:ring-offset-2 disabled:opacity-25 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
