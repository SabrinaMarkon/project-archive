import {
    forwardRef,
    InputHTMLAttributes,
    useEffect,
    useImperativeHandle,
    useRef,
} from 'react';

export default forwardRef(function TextInput(
    {
        type = 'text',
        className = '',
        isFocused = false,
        ...props
    }: InputHTMLAttributes<HTMLInputElement> & { isFocused?: boolean },
    ref,
) {
    const localRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all custom-class ' +
                className
            }
            style={{
                borderColor: '#e5e3df',
                borderWidth: '1px'
            }}
            onFocus={(e) => {
                e.target.style.borderColor = '#7a9d7a';
                e.target.style.boxShadow = '0 0 0 3px rgba(122, 157, 122, 0.1)';
            }}
            onBlur={(e) => {
                e.target.style.borderColor = '#e5e3df';
                e.target.style.boxShadow = '';
            }}
            ref={localRef}
        />
    );
});
