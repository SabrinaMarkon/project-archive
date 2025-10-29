import { Head } from "@inertiajs/react";
import { Post } from "@/types/post";
import PortfolioLayout from '@/Layouts/PortfolioLayout';
import ContactSection from '@/Components/Portfolio/ContactSection';
import ContentCard from '@/Components/ContentCard';

export default function Index({ posts }: { posts: Post[] }) {
    return (
        <PortfolioLayout>
            <Head title="Posts - Sabrina Markon" />

            {/* Posts Header */}
            <section className="pt-32 pb-12 px-6 bg-white">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: '#2d2d2d' }}>
                        All Posts
                    </h1>
                    <p className="text-xl max-w-2xl mx-auto" style={{ color: '#5a5a5a' }}>
                        Tutorials, lessons learned, and deep dives into the tools and techniques behind my full-stack development journey!
                    </p>
                </div>
            </section>

            {/* Posts Grid */}
            <section className="py-12 pb-24 px-6" style={{ backgroundColor: '#d4e5c8' }}>
                <div className="max-w-6xl mx-auto">
                    <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                        {posts.map((post) => (
                            <ContentCard
                                key={post.slug}
                                title={post.title}
                                slug={post.slug}
                                description={post.description}
                                href={`/posts/${post.slug}`}
                                linkText="View Post"
                                tags={post.tags}
                                readTime={post.readTime}
                            />
                        ))}
                    </div>

                    {posts.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-xl" style={{ color: '#5a5a5a' }}>No posts available yet.</p>
                        </div>
                    )}
                </div>
            </section>

            <ContactSection />
        </PortfolioLayout>
    );
}
