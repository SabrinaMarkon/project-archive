interface CharacterCountProps {
    value: string | undefined;
    max: number;
}

export default function CharacterCount({ value, max }: CharacterCountProps) {
    const length = (value || '').length;
    const overLimit = length > max;

    return (
        <p className={`text-sm mt-1 ${overLimit ? 'text-red-500' : 'text-gray-500'}`}>
            {length} / {max} characters
        </p>
    );
}
