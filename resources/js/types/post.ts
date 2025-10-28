export interface Post {
    id: number;
    title: string;
    slug: string;
    description: string;
    format: "html" | "markdown" | "plaintext";
    excerpt?: string;
    status: "draft" | "published" | "archived";
    publishedAt?: string;
    authorId: number;
    coverImage?: string;
    tags?: string[];
    metaTitle?: string;
    metaDescription?: string;
    viewCount?: number;
    isFeatured?: boolean;
}
