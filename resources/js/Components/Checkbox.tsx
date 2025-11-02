import { InputHTMLAttributes } from 'react';

export default function Checkbox({
    className = '',
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded shadow-sm focus:ring-2 focus:outline-none transition-all ' +
                className
            }
            style={{
                accentColor: '#7a9d7a',
                borderColor: '#e5e3df',
                borderWidth: '1px'
            }}
        />
    );
}
