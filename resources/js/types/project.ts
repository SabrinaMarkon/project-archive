export interface Project {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    excerpt?: string | null;
    tags?: string[];
    readTime?: string;
}
