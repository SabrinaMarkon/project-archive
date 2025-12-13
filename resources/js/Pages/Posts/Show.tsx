import { Head, Link } from '@inertiajs/react';
import { Post } from '@/types/post';
import PortfolioLayout from '@/Layouts/PortfolioLayout';
import ContactSection from '@/Components/Portfolio/ContactSection';
import DescriptionRenderer from '@/Components/DescriptionRenderer';
import { ArrowLeft, Code2, Lock, Sparkles } from 'lucide-react';

interface Course {
    id: number;
    title: string;
    price: number;
}

interface Props {
    post: Post;
    isPremium: boolean;
    canAccess: boolean;
    premiumCourse?: Course | null;
}

export default function Show({ post, isPremium, canAccess, premiumCourse }: Props) {
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

                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                                <Link
                                    key={tag}
                                    href={`/posts?tag=${encodeURIComponent(tag)}`}
                                    className="px-4 py-1.5 rounded-full text-sm font-medium transition hover:opacity-80"
                                    style={{ backgroundColor: '#e8f0e8', color: '#5a7a5a' }}
                                >
                                    {tag}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Post Content */}
            <section className="py-12 pb-24 px-6" style={{ backgroundColor: '#d8e5b8' }}>
                <div className="max-w-4xl mx-auto">
                    {isPremium && !canAccess && premiumCourse ? (
                        /* Premium Content - Locked */
                        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg relative overflow-hidden" style={{ borderColor: '#c0d8b4', borderWidth: '1px' }}>
                            {/* Sparkles corner decoration */}
                            <div className="absolute top-4 right-4">
                                <Sparkles className="text-yellow-500" size={32} />
                            </div>

                            <div className="text-center py-12">
                                {/* Lock icon with gradient background */}
                                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6" style={{
                                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                    boxShadow: '0 8px 20px rgba(251, 191, 36, 0.3)'
                                }}>
                                    <Lock className="text-white" size={48} />
                                </div>

                                {/* Premium content message */}
                                <h2 className="text-3xl font-bold mb-4" style={{ color: '#2d2d2d' }}>
                                    Premium Content
                                </h2>
                                <p className="text-xl mb-6" style={{ color: '#7a7a7a' }}>
                                    This post is exclusive content from
                                </p>
                                <div className="inline-block px-6 py-3 rounded-xl mb-6" style={{
                                    backgroundColor: '#f0fdf4',
                                    borderColor: '#86efac',
                                    borderWidth: '2px'
                                }}>
                                    <p className="text-2xl font-bold" style={{ color: '#166534' }}>
                                        {premiumCourse.title}
                                    </p>
                                </div>

                                {/* Value proposition */}
                                <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: '#7a7a7a' }}>
                                    Get instant access to this post and all course content for only <span className="font-bold text-2xl" style={{ color: '#658965' }}>${premiumCourse.price}</span>
                                </p>

                                {/* CTA Button */}
                                <Link
                                    href={`/courses/${premiumCourse.id}`}
                                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-bold text-lg transition hover:opacity-90 shadow-lg"
                                    style={{
                                        background: 'linear-gradient(135deg, #658965 0%, #7a9d7a 100%)',
                                        boxShadow: '0 8px 20px rgba(101, 137, 101, 0.3)'
                                    }}
                                >
                                    <Sparkles size={24} />
                                    View Course & Unlock Content
                                </Link>

                                {/* Teaser */}
                                {post.excerpt && (
                                    <div className="mt-12 pt-8 border-t" style={{ borderColor: '#e5e3df' }}>
                                        <p className="text-sm font-semibold uppercase tracking-wide mb-4" style={{ color: '#7a7a7a' }}>
                                            Preview
                                        </p>
                                        <p className="text-lg italic opacity-75" style={{ color: '#7a7a7a' }}>
                                            {post.excerpt}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Regular or accessible content */
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
                    )}
                </div>
            </section>

            <ContactSection />
        </PortfolioLayout>
    );
}
