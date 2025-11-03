export interface Project {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    format: "html" | "markdown" | "plaintext";
    excerpt?: string | null;
    status: "draft" | "published" | "archived";
    published_at?: string;
    author_id?: number;
    cover_image?: string;
    tags?: string[];
    meta_title?: string;
    meta_description?: string;
    view_count?: number;
    is_featured?: boolean;
    readTime?: string;
}
