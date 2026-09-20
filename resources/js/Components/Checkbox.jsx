export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-admin-border text-admin-accent focus:ring-admin-accent ' +
                className
            }
        />
    );
}
