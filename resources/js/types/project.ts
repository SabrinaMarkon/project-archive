export interface Project {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    tags?: string[];
}
