import { ButtonHTMLAttributes } from 'react';

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-md border border-transparent px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition-all duration-300 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            style={{ backgroundColor: '#7a9d7a', borderRadius: 'inherit' }}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
