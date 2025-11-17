import { Post } from '@/types/post';
import ContentCard from '@/Components/ContentCard';

interface WritingSectionProps {
    posts: Post[];
    limit?: number;
}

export default function WritingSection({ posts = [] }: WritingSectionProps) {
    return (
        <section id="writing" className="py-24 px-6" style={{ backgroundColor: '#d8e5b8' }}>
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-5xl font-bold mb-4" style={{ color: '#2d2d2d' }}>Latest Writing</h2>
                    <p className="text-lg max-w-2xl mx-auto" style={{ color: '#4a4a4a' }}>
                        Thoughts on development, technology, and building for the web.
                    </p>
                </div>

                <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                    {posts.map((post) => (
                        <ContentCard
                            key={post.slug}
                            title={post.title}
                            slug={post.slug}
                            description={post.excerpt || post.description}
                            format={post.format}
                            href={`/posts/${post.slug}`}
                            linkText="Read More"
                            tags={post.tags}
                            readTime={post.readTime}
                            publishedAt={post.publishedAt}
                            coverImage={post.coverImage}
                            isFeatured={post.isFeatured}
                            tagFilterPath="/posts"
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
