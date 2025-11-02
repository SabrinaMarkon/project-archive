import { LabelHTMLAttributes } from 'react';

export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { value?: string }) {
    return (
        <label
            {...props}
            className={
                `block text-sm font-semibold ` +
                className
            }
            style={{ color: '#3d3d3d' }}
        >
            {value ? value : children}
        </label>
    );
}
