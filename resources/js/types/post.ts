export interface Post {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    format: "html" | "markdown" | "plaintext";
    excerpt?: string;
    status: "draft" | "published" | "archived";
    publishedAt?: string;
    authorId?: number;
    authorName?: string;
    coverImage?: string;
    tags?: string[];
    metaTitle?: string;
    metaDescription?: string;
    viewCount?: number;
    isFeatured?: boolean;
    readTime?: string; // Server-computed reading time via Eloquent accessor, e.g., "5 min read"
}
