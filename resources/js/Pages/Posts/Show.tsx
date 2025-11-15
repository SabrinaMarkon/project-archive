import { Head, Link } from '@inertiajs/react';
import { Post } from '@/types/post';
import PortfolioLayout from '@/Layouts/PortfolioLayout';
import ContactSection from '@/Components/Portfolio/ContactSection';
import DescriptionRenderer from '@/Components/DescriptionRenderer';
import { ArrowLeft, Code2 } from 'lucide-react';

export default function Show({ post }: { post: Post }) {
    const metaTitle = post.metaTitle || `${post.title} - Sabrina Markon`;
    const metaDescription = post.metaDescription || post.excerpt || `Read ${post.title} by Sabrina Markon`;

    return (
        <PortfolioLayout>
            <Head title={metaTitle}>
                <meta name="description" content={metaDescription} />
                <meta property="og:title" content={metaTitle} />
                <meta property="og:description" content={metaDescription} />
                {post.coverImage && (
                    <meta property="og:image" content={post.coverImage} />
                )}
            </Head>

            {/* Post Header */}
            <section className="pt-32 pb-12 px-6 bg-white">
                <div className="max-w-4xl mx-auto">
                    <Link
                        href="/posts"
                        className="inline-flex items-center gap-2 mb-6 font-medium transition hover:opacity-70"
                        style={{ color: '#658965' }}
                    >
                        <ArrowLeft size={20} />
                        Back to All Writing
                    </Link>

                    <div className="flex items-start gap-4 mb-6">
                        <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#7a9d7a' }}>
                            <Code2 className="text-white" size={24} aria-hidden="true" />
                        </div>
                        <div className="flex-1">
                            <h1 className="font-bold leading-tight text-2xl sm:text-3xl md:text-4xl" style={{ color: '#2d2d2d' }}>
                                {post.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm" style={{ color: '#7a7a7a' }}>
                                {post.authorName && (
                                    <span>By {post.authorName}</span>
                                )}
                                {post.publishedAt && (
                                    <>
                                        {post.authorName && <span>•</span>}
                                        <span>
                                            {new Date(post.publishedAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </>
                                )}
                                {post.readTime && (
                                    <>
                                        {(post.authorName || post.publishedAt) && <span>•</span>}
                                        <span>{post.readTime}</span>
                                    </>
                                )}
                                {post.viewCount !== undefined && post.viewCount > 0 && (
                                    <>
                                        {(post.authorName || post.publishedAt || post.readTime) && <span>•</span>}
                                        <span>{post.viewCount.toLocaleString()} {post.viewCount === 1 ? 'view' : 'views'}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Post Content */}
            <section className="py-12 pb-24 px-6" style={{ backgroundColor: '#d4e5c8' }}>
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg" style={{ borderColor: '#c0d8b4', borderWidth: '1px' }}>
                        {post.excerpt && (
                            <div className="mb-6 pb-6 border-b" style={{ borderColor: '#e5e3df' }}>
                                <p className="text-xl italic" style={{ color: '#7a7a7a' }}>
                                    {post.excerpt}
                                </p>
                            </div>
                        )}
                        <DescriptionRenderer
                            content={post.description || ''}
                            format={post.format}
                        />
                    </div>
                </div>
            </section>

            <ContactSection />
        </PortfolioLayout>
    );
}
