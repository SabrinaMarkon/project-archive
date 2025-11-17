import { Head, Link } from "@inertiajs/react";
import { Post } from "@/types/post";
import PortfolioLayout from '@/Layouts/PortfolioLayout';
import ContactSection from '@/Components/Portfolio/ContactSection';
import ContentCard from '@/Components/ContentCard';

export default function Index({ posts, selectedTag }: { posts: Post[]; selectedTag?: string | null }) {
    return (
        <PortfolioLayout>
            <Head title="Writing - Sabrina Markon" />

            {/* Posts Header */}
            <section className="pt-32 pb-12 px-6 bg-white">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: '#2d2d2d' }}>
                        All Writing
                    </h1>
                    <p className="text-xl max-w-2xl mx-auto" style={{ color: '#5a5a5a' }}>
                        Tutorials, lessons learned, and deep dives into the tools and techniques behind my full-stack development journey!
                    </p>

                    {selectedTag && (
                        <div className="mt-6">
                            <p className="text-lg" style={{ color: '#5a5a5a' }}>
                                Showing posts tagged: <span className="font-semibold">{selectedTag}</span>
                            </p>
                            <Link
                                href="/posts"
                                className="inline-block mt-2 text-sm underline hover:no-underline"
                                style={{ color: '#658965' }}
                            >
                                View All Posts
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Posts Grid */}
            <section className="py-12 pb-24 px-6" style={{ backgroundColor: '#d8e5b8' }}>
                <div className="max-w-6xl mx-auto">
                    <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                        {posts.map((post) => (
                            <ContentCard
                                key={post.slug}
                                title={post.title}
                                slug={post.slug}
                                description={post.excerpt || post.description}
                                format={post.format}
                                href={`/posts/${post.slug}`}
                                linkText="Read Post"
                                tags={post.tags}
                                readTime={post.readTime}
                                publishedAt={post.publishedAt}
                                coverImage={post.coverImage}
                                isFeatured={post.isFeatured}
                                tagFilterPath="/posts"
                            />
                        ))}
                    </div>

                    {posts.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-xl" style={{ color: '#5a5a5a' }}>
                                {selectedTag ? `No posts found with tag "${selectedTag}".` : 'No posts available yet.'}
                            </p>
                        </div>
                    )}
                </div>
            </section>

            <ContactSection />
        </PortfolioLayout>
    );
}
