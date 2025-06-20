export const formatSlug = (value: string): string => {
    return value
        .toLowerCase()
        .replace(/\s+/g, '-')       // spaces → dash
        .replace(/[^a-z0-9-]/g, '') // remove anything else
        .replace(/-+/g, '-');       // collapse dashes
};
